const router = require("express").Router();

const { Category } = require("../../models");
const jwt = require("jsonwebtoken");
const { getTknFromHeader } = require("../../utils/util");

router.get("/", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        // console.log("Verifying token");
        // jwt.verify(tkn, process.env.JWT_SECRET);
        console.log("Get all categories");
        const caData = await Category.findAll();

        console.log("Get back category data as: ", caData);
        res.status(200).json({ status: 200, data: caData, err: "" })

    } catch (err) {
        console.log("Error when trying to get all categories: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});


module.exports = router;