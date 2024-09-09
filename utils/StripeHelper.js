
const { User, Service, Charity, Category } = require("../models");
const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);

// const { getSvcDetailsById } = require('../controllers/api/serviceController');

async function getServiceDetailsById(svcId) {

    try {
        const svcData = await Service.findByPk(svcId, {
            include: [
                { model: User, as: 'ServiceProvider' },
                { model: User, as: 'Customer' },
                { model: Category },
                { model: Charity },
            ]
        });

        return svcData;

    } catch (err) {
        console.log("Error from helper function while querying the db: ", err);
        throw new Error("Error from helper function while querying the db: " + JSON.stringify(err));
    };
}

class StripeHelper {
    constructor(serviceId) {
        this.serviceId = serviceId;
    }

    static updateCharityWallet(charityId, amt) {
        for (let i = 0; i < charities.length; i++) {
            console.log(charities[i]);
            if (charities[i].charityId === parseInt(charityId)) {
                console.log("match");
                charities[i].wallet = amt;
                return;
            }
        }
    }

    async createAndUpdatePaymentLink() {
        const svcId = this.serviceId;
        console.log("Get svc details for id: ", svcId);
        const svcDetails = await getServiceDetailsById(svcId);
        const svcName = svcDetails.title;
        const spName = svcDetails.ServiceProvider.firstName + " " + svcDetails.ServiceProvider.lastName;
        const charityId = svcDetails.Charity.id;
        const charityName = svcDetails.Charity.charityName;
        const customerName = svcDetails.Customer.firstName + "  " + svcDetails.Customer.lastName;
        const price = svcDetails.basePrice;
        console.log(`Creating payment link for svcName: ${svcName} and charity: ${charityName} with SP as: ${spName} and customer as: ${customerName} and having price as: ${price}`);

        console.log("creating product link");
        const product = await this.createProduct(price, svcId, svcName, spName, customerName);
        const stripeProductId = product.id;
        const stripePriceId = product.default_price;
        console.log(`created stripe product obj with id: ${stripeProductId} and price obj as: ${stripePriceId}`);
        const stripePaymentLink = await this.createPaymentLink(stripePriceId, charityId, svcId, charityName, customerName);
        console.log(`created payment link for service: ${svcName} as: ` + stripePaymentLink.url);
        return stripePaymentLink.url;
    }

    async createPaymentLink(stripePriceObjId, charityId, serviceId, charityName, customerName) {
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: `${stripePriceObjId}`,
                    quantity: 1,
                },
            ],
            metadata: {
                charity_id: `${charityId}`,
                service_id: `${serviceId}`
            },
            // after_completion: {
            //     hosted_confirmation: {
            //         "custom_message": "Thank you " + customerName + ", for you donation to charity: " + charityName
            //     },
            //     type: "hosted_confirmation"
            // },

            after_completion: {
                redirect: {
                    // "url": `http://localhost:3004/payment/${customerName}/charity/${charityName}`
                    "url": `https://knowitforward.netlify.app/payment/${encodeURIComponent(customerName)}/charity/${encodeURIComponent(charityName)}`
                },
                type: "redirect"
            },
            submit_type: "donate",
            custom_text: {
                submit: {
                    message: "The platform will charge 1% for maintainence."
                }
            },
            customer_creation: "if_required",
            inactive_message: "You can no longer pay using this payment link."
        });

        console.log("Got back stripe payment link obj as: ", paymentLink);
        return paymentLink;
    }

    async createProduct(o_price, p_id, p_name, spName, customerName) {
        const price = parseFloat(o_price) * 100;
        const fullProductName = p_name + " by " + spName + " for customer: " + customerName;
        console.log(`Creating stripe product for item: ${fullProductName} with price as: ${o_price} and id as: ${p_id}`);
        const product = await stripe.products.create({
            name: `${fullProductName}`,
            default_price_data: {
                currency: "usd",
                unit_amount: price,
            },
            metadata: {
                product_id: `${p_id}`
            }
        });
        console.log("Got back stripe product obj as: ", product);
        return product;
    }

};

module.exports = StripeHelper