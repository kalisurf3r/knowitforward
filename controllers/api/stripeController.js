const { Charity, Service } = require("../../models");

const router = require("express").Router();

async function getCharityDetails(chId) {
    try {
        console.log("Get all charities");
        const chData = await Charity.findByPk(chId);

        console.log("Get back charity data as: ", chData);
        return chData;

    } catch (err) {
        console.log("Error when trying to get all charities: ", err);
        throw new Error("Error while trying to get charities in stripecontoller: " + JSON.stringify(err));
    };
}

async function updateSvcAndCharityRecord(chId, chDonationAmt, svcId) {
    try {

        console.log("Updating the service's record and marking it closed.");
        const data = await Service.update({ status: 'Closed' }, {
            where: {
                id: svcId
            }
        });
        console.log("Return data post service record update: " + JSON.stringify(data));
        if (!data[0]) {
            throw new Error("Error while trying to update service record with id: ", svcId);
        }

        console.log("Updating the charities record with the new donation amount");
        const chdata = await Charity.update({ wallet: chDonationAmt }, {
            where: {
                id: chId
            }
        });
        console.log("Return data post charity donation update: " + JSON.stringify(data));
        if (!chdata[0]) {
            throw new Error("Error while trying to update the donation amount for the charity with id: ", svcId);
        }

    } catch (err) {
        console.log("Error when trying to  update the services and charities record ", err);
        throw new Error("Error when trying to  update the services and charities record " + JSON.stringify(err));
    };
}

router.post("/acceptpayment", async (req, res) => {
    const event = req.body;
    // console.log("Webhook Event object received: ", event);
    console.log("Stripe Event type received is: ", event.type);
    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                console.log("Event type: checkout.session.completed received");
                const checkoutSessionDataObj = event.data.object;
                console.log("checkoutSessionDataObj: ", checkoutSessionDataObj);
                const charityId = checkoutSessionDataObj.metadata.charity_id;
                const serviceId = checkoutSessionDataObj.metadata.service_id;
                const svcPrice = parseFloat(checkoutSessionDataObj.amount_total) / 100;
                console.log(`Got back charity id: ${charityId},  service id: ${serviceId} and amount total as: ${svcPrice} from the webhook call.`);
                const svcPriceAfterPtfrmFees = svcPrice - (0.01 * svcPrice);
                console.log("Amount that will be donated to the charity after platform fee deduction: ", svcPriceAfterPtfrmFees);
                // get Charity wallet amount
                const data = await getCharityDetails(charityId);
                console.log("Charity data: ", data);
                console.log("Charity details from get call: ", data.dataValues.wallet);
                const newCharityWalletAmt = data.wallet + svcPriceAfterPtfrmFees;
                console.log("new charity amount: ", newCharityWalletAmt);
                // update the charity record
                await updateSvcAndCharityRecord(charityId, newCharityWalletAmt, serviceId);
                res.status(200).json({ status: 200, data: [], error: "", message: "Payment successful" })
                break;
            case 'payment_intent.succeeded':
                console.log("Received event: payment_intent.succeeded")
                break;
            case 'payment_method.attached':
                console.log("Received event: payment_method.attached")
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

    } catch (err) {
        console.log("Error when trying to process stripe payment ", err);
        throw new Error("Error when trying to process stripe payment" + JSON.stringify(err));
    };


});


module.exports = router;