let hotelModel = require("../../models/headingsModel")
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
const messages = require('../../utils/common/messages')



exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body

        let isEmailExist = await hotelModel.findOne({email:email})
        if(isEmailExist){ return res.status(400).json(errorResponse("This email is already registered.")) }

        
        res.end()
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}