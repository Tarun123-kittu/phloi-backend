let settingModel = require('../models/settingsModel')
let { errorResponse, successResponse } = require("../utils/responseHandler")
let messages = require('../utils/messages')


exports.get_settings_info = async (req, res) => {
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







exports.get_setting_page_details = async (req, res) => {
    try {
        let pageId = req.query.pageId

        if (!pageId) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide page Id')) }

        const settingDocument = await settingModel.findOne({ 'pages._id': pageId }, { 'pages.$': 1 });

        if (settingDocument && settingDocument.pages.length > 0) {
            const page = settingDocument.pages[0]; 
    
            return res.status(200).json(successResponse('Data retrieved successfully',page.content))
        } else {
            console.log('Page not found.');
        }

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}


