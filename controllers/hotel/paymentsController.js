let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
let config = require("../../config/config")
const stripe = require('stripe')(config.development.stripe_secret_key)
let hotelPaymentsModel = require("../../models/hotelPaymentsModel")
let notificationModel = require("../../models/notificationModel")
const hotelModel = require("../../models/hotelModel")






exports.subscribe = async (req, res) => {
    try {
        const { hotelId } = req.query;
        if(!hotelId){ return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Please provide hotel Id in params"))}

        let isHotelExist = await hotelModel.findById(hotelId)
        if(!isHotelExist){return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Hotel not exist with this hotel Id"))}
        const hotelSubscription = await hotelPaymentsModel.findOne({ hotelId }).sort({ updatedAt: -1 });
 
        if (hotelSubscription && hotelSubscription) {
            const { paymentStatus, subscriptionEndDate } = hotelSubscription;

            if (['completed'].includes(paymentStatus) && subscriptionEndDate > new Date()) {
                return res.status(400).json({ message: "You already have an active subscription. Please wait until your current subscription ends." });
            }
        }

        return res.render("subscribe.ejs",{ hotelId });
    } catch (error) {
        console.error("Error checking subscription status:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
};







exports.checkout = async (req, res) => {
    try {
        const { hotelId } = req.body;

        if (!hotelId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide a valid hotel ID in the request body."));
        }

        const priceId = config.development.stripe_product_price_id;
        if (!priceId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Price ID is missing in configuration."));
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
            metadata: { hotelId },
            success_url: `${config.development.stripe_return_url}api/v1/hotel/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.development.stripe_return_url}api/v1/hotel/cancel`,
        });


        const paymentAmount = 99; 

        const payment = new hotelPaymentsModel({
            hotelId,
            transactionId: session.id,
            subscriptionId:"",
            paymentAmount,
            currency: 'USD',
            paymentStatus: 'pending',
            paymentMethod: 'card',
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
    const sig = req.headers['stripe-signature'];
    let event;

    try {
       
        event = stripe.webhooks.constructEvent(req.body, sig, config.development.webhook_singing_key);
        console.log("event ------", event.type);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'invoice.created':
                await handleInvoiceCreated(event.data.object);
                break;
            case 'checkout.session.completed':
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
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
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
    try {
             
           const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
  
           const subscriptionEndDate = new Date(subscription.current_period_end * 1000); 
           
     
        await hotelPaymentsModel.findOneAndUpdate(
            { transactionId: session.id },
            { 
                paymentStatus: 'completed',
                subscriptionId:session.subscription,
                paymentDate: new Date(), 
                subscriptionEndDate:subscriptionEndDate,
                receiptUrl: session.receipt_url }
        );
        console.log(`Payment completed for session ${session.id}`);
    } catch (error) {
        console.error(`Error handling checkout session completion: ${error.message}`);
    }
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


const handleSubscriptionUpdated = async (subscription) => {
    try {
        console.log("subscription updated -----",subscription.status)
        await hotelPaymentsModel.findOneAndUpdate(
            { subscriptionId: subscription.id },
            {
                paymentStatus: subscription.status,
                paymentDate: new Date(),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        );
    } catch (error) {
        console.error(`Error updating subscription: ${error.message}`);
    }
};


const handleInvoiceCreated = async (invoice) => {
    try {
       
        await hotelPaymentsModel.findOneAndUpdate(
            { subscriptionId: invoice.subscription },
            { paymentStatus: 'created', paymentDate: new Date(invoice.created * 1000) }
        );
        console.log(`Invoice created for subscription ${invoice.subscription}`);
    } catch (error) {
        console.error(`Error handling invoice creation: ${error.message}`);
    }
};





