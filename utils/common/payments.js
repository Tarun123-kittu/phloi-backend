let hotelPaymentsModel = require("../../models/hotelPaymentsModel")
let config = require("../../config/config")
let stripe = require('stripe')(config.development.stripe_secret_key)




const handleCheckoutSessionCompleted = async (session) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

        await hotelPaymentsModel.findOneAndUpdate(
            { transactionId: session.id },
            {
                paymentStatus: 'completed',
                subscriptionId: session.subscription,
                paymentDate: new Date(),
                subscriptionEndDate: subscriptionEndDate,
                receiptUrl: session.receipt_url
            }
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



module.exports = {
    handleCheckoutSessionCompleted,
    handleInvoicePaymentSucceeded,
    handleInvoicePaymentFailed,
    handleSubscriptionDeleted,
    handleSubscriptionUpdated,
    handleInvoiceCreated
}