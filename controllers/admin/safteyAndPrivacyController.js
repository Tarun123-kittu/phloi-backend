let settingModel = require('../../models/settingsModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')



exports.add_section = async (req, res) => {
    try {
        const section = req.body?.new_section;

        if (!section) {
            return res.status(400).json(errorResponse("Please provide new section name"));
        }

        let newSection = await settingModel.create(section)
        console.log('new sectop-----',newSection)

        return res.status(201).json(successResponse("Section added successfully!", newSection));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





