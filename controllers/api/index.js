const router = require("express").Router();
const userRouter = require("./userController");
const servicerouter = require("./serviceController");
const charityRouter = require("./charityController");
const categoryRouter = require("./categoryController");
const stripeRouter = require("./stripeController");
const jwtVerifyRouter = require("./jwtverify");


router.use("/user", userRouter);
router.use("/services", servicerouter);
router.use("/charities", charityRouter);
router.use("/categories", categoryRouter);
router.use("/stripe", stripeRouter);
router.use("/verifyToken", jwtVerifyRouter);

module.exports = router;