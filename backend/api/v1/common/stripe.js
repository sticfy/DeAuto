// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_API_SECRET_KEY);


// not using now
let checkoutSessionCreate = async () => {

    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell

                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: "Football",
                    },
                    unit_amount: 200,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    return session;
}

// payment intent create
let paymentIntentCreate = async (amount, currency) => {

    let response = {};

    try {

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: currency,
            automatic_payment_methods: { enabled: true },
        });

        response.status = true;
        response.data = paymentIntent;

    } catch (error) {
        response.status = false;
        response.data = {};
    }

    return response;

}

let paymentIntentRetrieve = async (payment_intent_id) => {

    // 
    let paymentIntentGet;
    try {
        paymentIntentGet = await stripe.paymentIntents.retrieve(payment_intent_id);
    } catch (error) {
        paymentIntentGet = false;
        // console.log(error);
    }

    return paymentIntentGet;

}

module.exports = {
    checkoutSessionCreate,
    paymentIntentCreate,
    paymentIntentRetrieve,
}