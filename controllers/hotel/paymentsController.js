let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
let config = require("../../config/config")
const stripe = require('stripe')(config.development.stripe_secret_key)
let hotelPaymentsModel = require("../../models/hotelPaymentsModel")


exports.subscribe = async (req, res) => {
    try {
        return res.render("subscribe.ejs")
    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}




// exports.checkout = async (req, res) => {
//     try {
//         let userId = req.result ? req.result.userId : null;
//         const priceId = config.development.stripe_product_price_id;

//         if (!priceId) {
//             return res.status(400).json({ error: 'Price ID is missing in configuration' });
//         }

//         const session = await stripe.checkout.sessions.create({
//             mode: "subscription",
//             line_items: [
//                 {
//                     price: priceId,
//                     quantity: 1
//                 }
//             ],
//             success_url: `http://localhost:8000/api/v1/hotel/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: 'http://localhost:8000/api/v1/hotel/cancel'
//         });

//         console.log("Checkout session created:", session);
//         res.redirect(session.url);
//     } catch (error) {
//         console.error("Error saving hotel details:", error);
//         return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
//     }
// };




exports.checkout = async (req, res) => {
    try {
        const { hotelId = "674ebabdb9dffb122c54a5ad"} = req.body 
        if(!hotelId){
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Please provide hotel Id in the query params"))
        }

        const priceId = config.development.stripe_product_price_id;
        if (!priceId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Price id is missing in configuration"));
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
    
            success_url: `${config.development.stripe_return_url}api/v1/hotel/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.development.stripe_return_url}api/v1/hotel/cancel`,
        });

        
        const payment = new hotelPaymentsModel({
            hotelId,
            transactionId: session.id,
            paymentAmount: 20, 
            currency: 'USD',
            paymentStatus: 'pending',
        });

        await payment.save();

        res.redirect(session.url);
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: 'Something went wrong during checkout' });
    }
};




exports.success = async (req, res) => {
    try {
         
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        
        // await hotelPaymentsModel.findOneAndUpdate({transactionId:session.id},{
        //     paymentStatus:"completed",
        //     paymentDate:new Date()
        // })
        // res.send(session)
        res.render("success.ejs")
    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}



exports.cancel = async (req, res) => {
    res.render('cancel.ejs')
}






exports.webhook = async (req, res) => {
    console.log("here in the webhook------")
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, config.development.webhook_singing_key);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case '  ':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error(`Error handling event: ${error}`);
        res.status(500).send('Webhook handler error');
    }
};

const handleCheckoutSessionCompleted = async (session) => {
    await hotelPaymentsModel.findOneAndUpdate(
        { transactionId: session.id },
        { paymentStatus: 'completed', paymentDate: new Date() }
    );
};

const handleInvoicePaymentSucceeded = async (invoice) => {
    await hotelPaymentsModel.findOneAndUpdate(
        { subscriptionId: invoice.subscription },
        { paymentStatus: 'completed', paymentDate: new Date() }
    );
};

const handleInvoicePaymentFailed = async (invoice) => {
    await hotelPaymentsModel.findOneAndUpdate(
        { subscriptionId: invoice.subscription },
        { paymentStatus: 'failed', paymentDate: new Date() }
    );
};

const handleSubscriptionDeleted = async (subscription) => {
    await hotelPaymentsModel.findOneAndUpdate(
        { subscriptionId: subscription.id },
        { paymentStatus: 'canceled', paymentDate: new Date() }
    );
};
