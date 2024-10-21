let userModel = require('../models/userModel')
let secretDatingUserModel = require('../models/secretDatingUserModel')
let { successResponse, errorResponse } = require('../utils/responseHandler')
let messages = require('../utils/messages')



exports.switch_secretDating_mode = async (req, res) => {
    try {
    let 
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}