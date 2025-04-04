let hotelPaymentsModel = require("../../models/hotelPaymentsModel")
let hotelModel = require("../../models/hotelModel")
let config = require("../../config/config")
let stripe = require('stripe')(config.development.stripe_secret_key)





const handleCheckoutSessionCompleted = async (session) => {
    try {
       console.log("handle checkout complete------")
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        const subscriptionEndDate = new Date(subscription.current_period_end * 1000);

        await hotelPaymentsModel.findOneAndUpdate(
            { transactionId: session.id },
            {
                paymentStatus: 'completed',
                subscriptionId: session.subscription,
                paymentDate: new Date(),
                subscriptionEndDate: subscriptionEndDate,
                receiptUrl: session.receipt_url,
                customerId: session.customer
            }
        );

        let hotelId = session.metadata.hotelId
        console.log("hotel id ----", hotelId)
        await hotelModel.findByIdAndUpdate(hotelId, {
            $set: {
                paymentStatus: "completed",
                subscriptionEndDate: subscriptionEndDate
            }
        })
        console.log(`Payment completed for session ${session.id}`);
    } catch (error) {
        console.error(`Error handling checkout session completion: ${error.message}`);
    }
};



const handleInvoicePaymentSucceeded = async (invoice) => {
    console.log("Invoice succeed------")
    await hotelPaymentsModel.findOneAndUpdate(
        { subscriptionId: invoice.subscription },
        { paymentStatus: 'completed', paymentDate: new Date() }
    );
};




const handleInvoicePaymentFailed = async (invoice) => {
    console.log("Invoice failed------")
    await hotelPaymentsModel.findOneAndUpdate(
        { subscriptionId: invoice.subscription },
        { paymentStatus: 'failed', paymentDate: new Date() }
    );
};



const handleSubscriptionDeleted = async (subscription) => {
    console.log("Subscription deleted------")
    let hotel = await hotelPaymentsModel.findOneAndUpdate(
        { subscriptionId: subscription.id },
        { paymentStatus: 'cancelled', subscriptionCancelDate: new Date() }
    );

    let hotelId = hotel.hotelId
    await hotelModel.findByIdAndUpdate(hotelId,{
        $set:{
            paymentStatus:'cancelled'
        }
    })

};


const handleSubscriptionUpdated = async (subscription) => {
    try {
        console.log("subscription updated------")
        if (subscription.status == 'active') {
            let updatedHotel = await hotelPaymentsModel.findOneAndUpdate(
                { subscriptionId: subscription.id },
                {
                    paymentStatus: "completed",
                    paymentDate: new Date(),
                    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                }
            );

            await hotelModel.findOneAndUpdate({ hotelId: updatedHotel.hotelId }, {
                $set: {
                    paymentStatus: "completed",
                    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                }
            })

        } else {
            await hotelPaymentsModel.findOneAndUpdate(
                { subscriptionId: subscription.id },
                {
                    paymentStatus: subscription.status,
                    paymentDate: new Date(),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                }
            );
        }

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