const router = require("express").Router();
const { User, Service, Charity, Category } = require("../../models");
const jwt = require("jsonwebtoken");
const { getTknFromHeader } = require("../../utils/util");

//------ Helper methods ------
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


async function getCharityIdFromName(name, tkn) {


    console.log("Verifying token");
    jwt.verify(tkn, process.env.JWT_SECRET);
    console.log("Fetching charity details for charity with name: ", name);
    const data = await Charity.findOne({
        where: {
            charityName: name
        }
    })
    console.log("Got back charity record as: ", data);
    if (!data) {
        throw new Error("No charity found by the name: " + name + "!");
    }

    return data.dataValues.id;

}

async function getCategoryIdFromName(name, tkn) {

    console.log("Verifying token");
    jwt.verify(tkn, process.env.JWT_SECRET);
    console.log("Fetching category details for category with name: ", name);
    const data = await Category.findOne({
        where: {
            categoryName: name
        }
    })
    console.log("Got back charity record as: ", data);
    if (!data) {
        throw new Error("No category found by the name: " + name + "!");
    }

    return data.dataValues.id;

}


// ------ Routes ------
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
            },
            order: [
                ['serviceDate', 'ASC']
            ]
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
        });

        res.status(200).json({ status: 200, data: svcData, err: "" })

    } catch (err) {
        console.log("Error when trying to get a svc id: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status().json({ status: 403, data: [], error: err });
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
            include: [
                { model: User, as: 'ServiceProvider' },
                { model: User, as: 'Customer' }
            ],
            where: {
                ServiceProviderId: req.params.id
            },
            order: [
                ['serviceDate', 'ASC']
            ]
        });
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
            include: [
                { model: User, as: 'Customer' },
                { model: User, as: 'ServiceProvider' }],
            where: {
                CustomerId: req.params.id
            }
        });
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

// put call will be used when we need to change the status of the services 
// active -> booked -> ready for payment ->  closed
router.put("/:id", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);

        const action = req.body?.action;
        const userId = req.body?.userid;
        let fieldsToUpdate = {};

        if (action.toLowerCase() === "book") {
            fieldsToUpdate['status'] = 'Booked';
            fieldsToUpdate['CustomerId'] = userId;
        } else if (action.toLowerCase() === "done") {
            fieldsToUpdate['status'] = 'Ready for payment';
            // TODO: Generate the payment link for this service and update DB
        } else if (action.toLowerCase() === "cancel") {
            fieldsToUpdate['status'] = 'Closed';
        }
        let data = [];
        if (fieldsToUpdate) {
            console.log("Updating status for record with id: " + req.params.id + " with: ");
            console.log(fieldsToUpdate);
            data = await Service.update(fieldsToUpdate, {
                where: {
                    id: req.params.id
                }
            });
            console.log("Return data post update: " + JSON.stringify(data));
            if (!data[0]) {
                return res.status(404).json({ status: 404, data: [], error: "No service found with id: " + req.params.id + "!" });
            }
        }
        res.status(200).json({ status: 200, data: data, error: "" });
    }
    catch (err) {
        console.log("Error when trying to update services by svc id: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };
});

// post call to create a new service
router.post("/", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);
        console.log("Setting status to Active");
        req.body.status = 'Active';

        // get charity Id by charity name
        const charityid = await getCharityIdFromName(req.body.charity, tkn);
        req.body.CharityId = charityid;
        delete req.body.charity;


        // get Category id by category name
        const categoryId = await getCategoryIdFromName(req.body.category, tkn);
        req.body.CategoryId = categoryId;
        delete req.body.category;

        console.log("Creating a new service record with paylaod as: ", req.body);
        const svcObj = await Service.create(req.body);
        console.log("Got back newly created svc obj as: ", svcObj);
        res.json({ status: 200, data: svcObj, error: "" })

    } catch (err) {
        console.log("Error when trying to post a service: ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: JSON.stringify(err) });
        }

        console.log("again Error when trying to post a service: ", err); // rremove
        console.log(typeof (err));
        res.status(500).json({ status: 500, data: [], error: err.message });
    };
});

// get service based on different filter critieris 
router.post("/filter", async (req, res) => {
    const tkn = getTknFromHeader(req.headers)
    try {
        console.log("Verifying token");
        jwt.verify(tkn, process.env.JWT_SECRET);
        let catId;
        let charId;

        const queryFilter = req.body;

        if (queryFilter.category) {
            catId = await getCategoryIdFromName(req.body.category, tkn)
            queryFilter['CategoryId'] = catId;
            delete queryFilter.category
        }

        if (queryFilter.charity) {
            charId = await getCharityIdFromName(req.body.charity, tkn)
            queryFilter['CharityId'] = charId;
            delete queryFilter.charity
        }
        queryFilter['status'] = 'Active';

        console.log("Get all services with filter param as: ", queryFilter);
        const svcData = await Service.findAll({
            include: [
                { model: User, as: 'ServiceProvider' },
                { model: User, as: 'Customer' }
            ],
            where: queryFilter,
            order: [
                ['serviceDate', 'ASC']
            ]
        });
        const prunedResults = pruneActiveAndNotBookedServices(svcData);
        console.log("Returning active svcs based on filter as: ", prunedResults);
        res.status(200).json({ status: 200, data: prunedResults, err: "" })

    } catch (err) {
        console.log("Error when trying to get services by filter ", err);
        if (err?.message === "invalid token" || err?.message === "jwt expired") {
            return res.status(403).json({ status: 403, data: [], error: err });
        }

        res.status(500).json({ status: 500, data: [], error: err });
    };

});


module.exports = router;
