let userModel = require('../models/userModel')
let secretDatingUserModel = require('../models/secretDatingUserModel')
let { successResponse, errorResponse } = require('../utils/responseHandler')
let messages = require('../utils/messages')



exports.switch_secretDating_mode = async (req, res) => {
    try {
        let userId = req.result.userId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this id")) }

        await userModel.findByIdAndUpdate(userId, {
            $set: {
                secret_dating_mode: isUserExist.secret_dating_mode == true ? false : true
            }
        })


        return res.status(200).json(successResponse(`Secret dating mode is ${isUserExist.secret_dating_mode == true ? 'turned off' : 'turned on'}`))
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}






exports.secretDating_registration = async (req, res) => {
    try {
     let userId = req.result.userId

     let isUserExist = await userModel.findById(userId)
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}