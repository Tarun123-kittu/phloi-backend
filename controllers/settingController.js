let settingModel = require('../models/settingsModel')
let {errorResponse,successResponse}= require("../utils/responseHandler")
let messages = require('../utils/messages')


exports.get_settings_info = async(req, res) => {
    try {
        let getSettingsDetails = await settingModel.find()
            .select({
                section: 1,
                "pages._id": 1,
                "pages.title": 1
            });

        if (getSettingsDetails.length < 1) {
            return res.status(400).json(successResponse('No data added for settings', getSettingsDetails));
        }

        return res.status(200).json(successResponse("Data retrieved successfully", getSettingsDetails));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};