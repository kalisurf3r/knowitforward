const router = require("express").Router();
const { Charity } = require("../../models");
const jwt = require("jsonwebtoken");
const { getTknFromHeader } = require("../../utils/util");

router.get("/", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);
        console.log("Get all charities");
        const chData = await Charity.findAll();

        console.log("Get back charity data as: ", chData);
        res.status(200).json({ status: 200, data: chData, err: "" })

    } catch (err) {
        console.log("Error when trying to get all charities: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status().json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});

module.exports = router;