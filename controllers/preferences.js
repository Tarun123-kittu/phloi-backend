let relationshipPreferenceModel = require('../models/relationshipPreferencesModel')
let sexualOrientationModel = require("../models/sexualOrientationModel")
let { successResponse, errorResponse } = require("../utils/responseHandler")
let messages = require("../utils/messages")






exports.get_all_sexual_orientations = async (req, res) => {
    try {
        let allOrientations = await sexualOrientationModel.find().select('_id orientation_type').lean()

        if (allOrientations.length < 1) { return res.status(200).json(successResponse("Not a single orientation added yet")) }

        return res.status(200).json(successResponse("Data retrieved successfully", allOrientations))

    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}







exports.get_all_relationship_types = async (req, res) => {
    try {
        let relationshipTypes = await relationshipPreferenceModel.find().select('_id relationship_type').lean()

        if(relationshipTypes.length<1){
            return res.status(200).json(successResponse("Not a single relationship type added yet"))
        }

        return res.status(200).json(successResponse("Data retrieved successfully",relationshipTypes))
    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}



