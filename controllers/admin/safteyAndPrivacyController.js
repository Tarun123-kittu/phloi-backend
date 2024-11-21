let settingModel = require('../../models/settingsModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')



exports.add_section = async (req, res) => {
    try {

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}