const router = require("express").Router();
const { User, Auth, Charity, CharityToUser } = require("../../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getTknFromHeader } = require("../../utils/util");

function generateRandomRating(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

async function getRandomCharities() {
    try {
        const charityDets = await Charity.findAll();
        console.log(charityDets);
        let i = 0;
        let visited = [];
        while (i < 3) {
            let randomint = parseInt(generateRandomRating(0, charityDets.length - 1));
            const curCharityId = charityDets[randomint].dataValues.id
            if (visited.includes(curCharityId)) {
                continue;
            }
            visited.push(curCharityId);
            i++;
        }
        console.log("Sending back charity ids as: ", visited);
        return visited;
    } catch (err) {
        console.log("Error while trying to associate charities to users: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(401).json({ status: 401, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };


}
// register
router.post("/", async (req, res) => {
    // User tbl:
    // firstName
    // lastName
    // aboutMe
    // email
    // ratings
    // profession
    // profileImgUrl
    // auth tbl
    // username
    // password
    // UserId

    try {
        req.body.ratings = generateRandomRating(4, 5);
        const charities = await getRandomCharities();
        const uname = req.body.username;
        const pwd = req.body.password;
        delete req.body.username;
        delete req.body.password;

        console.log("Verifying a recond does not exist with the same username");
        const foundUname = await Auth.findOne({
            where: {
                username: uname
            }
        });

        if (foundUname) {
            return res.status(500).json({ status: 500, data: [], error: "Username exists!" });
        }

        console.log("Create a record in user tbl with data: ", req.body);

        const userObj = await User.create(req.body);
        console.log("Got back newly user obj as: ", userObj);
        console.log("Updating the charity info");
        for (let id of charities) {
            await CharityToUser.create({
                UserId: userObj.id,
                CharityId: id
            });
        }
        console.log("Entering the auth details in the auth table for user: ", userObj.id);
        const authObj = await Auth.create({
            username: uname,
            password: pwd,
            UserId: userObj.id
        });
        console.log("Got back auth obj as: ", authObj);
        const tkn = jwt.sign(
            {
                id: userObj.id,
                username: authObj.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "6h"  //TODO: Increase
            }
        );
        userObj.dataValues.token = tkn;
        console.log("Returning userObj as: ", userObj);
        res.json({ status: 200, data: userObj, error: "" })

    } catch (err) {
        console.log("Unexpected error when registering a user: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(401).json({ status: 401, data: [], error: err });
        }
        res.status(500).json({ status: 500, data: [], error: err });
    };
});

// login 
router.post("/login", async (req, res) => {
    try {

        console.log("Querying for usr record from auth using params: ", req.body);
        const userObj = await Auth.findOne({
            where: {
                username: req.body.username
            }
        });
        if (!userObj) {
            return res.status(401).json({ status: 401, data: [], error: "Login failed" });
        }
        if (!bcrypt.compareSync(req.body.password, userObj.password)) {
            return res.status(401).json({ status: 401, data: [], error: "Login failed" });
        }

        console.log("generating token");
        const tkn = jwt.sign(
            {
                id: userObj.UserId,
                username: userObj.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "6h" //TODO: Increase
            }
        );

        delete userObj.dataValues.password;
        userObj.dataValues.token = tkn;
        res.status(200).json({ status: 200, data: userObj, error: "" })
    } catch (err) {
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(401).json({ status: 401, data: [], error: err });
        }

        console.log("Unexpected error during login: ", err);
        res.status(500).json({ status: 500, data: [], error: err });
    };

});

// get usr by id
router.get("/:id", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        jwt.verify(tkn, process.env.JWT_SECRET);
        const userData = await User.findByPk(req.params.id, {
            include: [Charity]
        })
        res.status(200).json({ status: 200, data: userData, err: "" })

    } catch (err) {
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(401).json({ status: 401, data: [], error: err });
        }

        console.log("Error when trying to get user by id: ", err);
        res.status(500).json({ status: 500, data: [], error: err });
    };

});

module.exports = router;