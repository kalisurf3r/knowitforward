const router = require("express").Router();
const { User, Service } = require("../../models");
const jwt = require("jsonwebtoken");
const { getTknFromHeader } = require("../../utils/util");

function getTimeLeftInHumanReadableForm(diff) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    if (days > 0) {
        return `${days} day(s) ${hours} hour(s)`;
    } else if (hours > 0) {
        return `${hours} hour(s) ${minutes} minute(s)`;
    } else if (minutes > 0) {
        return `${minutes} minute(s) ${seconds} second(s)`;
    } else {
        return `${seconds} second(s)`;
    }
}

function markExpiredResultsAsClosed(expiredServices) {
    try {
        for (let svc of expiredServices) {
            const data = Service.update({ status: "Closed" }, {
                where: {
                    id: svc.dataValues.id
                }
            });
        }

    } catch (err) {
        console.error("Error when trying to mark service record as closed");
        console.log(err);
        throw new Error("Error when updating services as closed");
    };
}

function pruneActiveAndNotBookedServices(entries) {
    const activeServices = [];
    const expiredServices = [];
    for (let svc of entries) {
        const offerEndDate = svc.dataValues.offerEndDate;
        const offerEndDatedtObj = new Date(offerEndDate);
        const diff = offerEndDatedtObj - Date.now();
        if (diff > 0 && svc.dataValues.status === 'Active') {
            const timeLeft = getTimeLeftInHumanReadableForm(diff);
            svc.dataValues.timeLeft = timeLeft;
            activeServices.push(svc)
        } else if (diff <= 0 && svc.dataValues.status === 'Active') {
            expiredServices.push(svc);
        } else {
            console.log("push into else");
            activeServices.push(svc);
        }
    }

    console.log("List of services that are active but have expired: ", expiredServices);
    markExpiredResultsAsClosed(expiredServices);
    console.log("Returning pruned list of active services as:  ", activeServices);

    return activeServices;
}

// get all active services after pruning the services that have expired and do not have a customerId associated to it
router.get("/", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);

        console.log("Get services with status as: Active");
        const svcData = await Service.findAll({
            where: {
                status: 'Active'
            }
        });

        const prunedResults = pruneActiveAndNotBookedServices(svcData);
        console.log("Returning active svcs as: ", prunedResults);
        res.status(200).json({ status: 200, data: prunedResults, err: "" })

    } catch (err) {
        console.log("Error when trying to get all active: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});

// get svc details by id
router.get("/:id", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);
        console.log("Get service with id as: ", req.params.id);
        const svcData = await Service.findByPk(req.params.id, {
            include: [
                { model: User, as: 'ServiceProvider' },
                { model: User, as: 'Customer' }
            ],
        })

        res.status(200).json({ status: 200, data: svcData, err: "" })

    } catch (err) {
        console.log("Error when trying to get a svc id: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});

// get service details by provider id
router.get("/serviceprovider/:id", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);
        console.log("Get all services for service provider with id as: ", req.params.id);
        const svcData = await Service.findAll({
            include: [{ model: User, as: 'ServiceProvider' }],
            where: {
                ServiceProviderId: req.params.id
            }
        })
        console.log("Returning active svcs before as: ", svcData);
        const prunedResults = pruneActiveAndNotBookedServices(svcData);
        console.log("Returning active svcs as: ", prunedResults);
        res.status(200).json({ status: 200, data: prunedResults, err: "" })

    } catch (err) {
        console.log("Error when trying to get services by service provider id ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});

// get service details by cutomer id
router.get("/customer/:id", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);

        console.log("Get all services for customer with id as: ", req.params.id);
        const svcData = await Service.findAll({
            include: [{ model: User, as: 'Customer' }],
            where: {
                CustomerId: req.params.id
            }
        })
        const prunedResults = pruneActiveAndNotBookedServices(svcData);
        console.log("Returning active svcs as: ", prunedResults);
        res.status(200).json({ status: 200, data: prunedResults, err: "" })

    } catch (err) {
        console.log("Error when trying to get services by customer id: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});


module.exports = router;