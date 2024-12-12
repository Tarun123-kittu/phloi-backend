let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/responseHandler")
let config = require("../../config/config")
const stripe = require('stripe')(config.development.stripe_secret_key)







exports.checkout = async (req, res) => {
    try {
        const userId = req.result.userId
        const priceId = config.development.stripe_product_price_id
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            success_url: 'http://localhost:8000/success?success_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:8000/cancel'
        })
        console.log("checkout", session)
        res.redirect(session.url)
    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}