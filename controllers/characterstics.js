let smokeFrequencyModel = require("../models/smokeFrequencyModel")
let drinkFrequencyModel = require("../models/drinkFrequencyModel")
let workoutFrequencyModel = require("../models/workoutFrequencyModel")
let communicationStyleModel = require("../models/communicationStyleModel")
let loveReceiveModel = require("../models/loveReceiveModel")
let interestModel = require("../models/interestsModel")
let { successResponse, errorResponse } = require("../utils/responseHandler")
let messages = require("../utils/messages")






exports.get_all_communication_styles = async (req, res) => {
    try {
        let communicationStyles = await communicationStyleModel.find().select('_id style').lean()

        if (communicationStyles.length < 1) { return res.status(200).json(successResponse("Not a single communication style added yet")) }

        return res.status(200).json(successResponse("Data retrieved successfully", communicationStyles))
    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}






exports.get_all_love_receives = async (req, res) => {
    try {
        let loveReceives = await loveReceiveModel.find().select('_id love_type').lean()

        if (loveReceives.length < 1) {
            return res.status(200).json(successResponse("Not a single love recieves added yet"))
        }

        return res.status(200).json(successResponse("Data retrieved successfully", loveReceives))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}





exports.get_all_drink_frequency = async (req, res) => {
    try {

        let drinkFrequency = await drinkFrequencyModel.find().select('_id frequency').lean()

        if (drinkFrequency.length < 1) {
            return res.status(200).json(successResponse("Not a single drink frequency added yet"))
        }

        return res.status(200).json(successResponse("Data retrieved successfully", drinkFrequency))
    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}






exports.get_all_smoke_frequency = async (req, res) => {
    try {

        let smokeFrequency = await smokeFrequencyModel.find().select('_id frequency').lean()
        if (!smokeFrequency) { return res.status(200).json(successResponse("Not a single smoke frequency added yet")) }

        return res.status(200).json(successResponse("Data retieved successfully", smokeFrequency))

    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}





exports.get_all_workout_frequency = async (req, res) => {
    try {
        let workoutFrequency = await workoutFrequencyModel.find().select('_id frequency').lean()

        if (workoutFrequency.length < 1) {
            return res.status(200).json(successResponse("Not a single drink frequency added yet"))
        }

        return res.status(200).json(successResponse("Data retrieved successfully", workoutFrequency))

    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}







exports.get_all_interests = async (req, res) => {
    try {
        let allInterests = await interestModel.find().select('_id interest').lean()
        if (allInterests.length < 1) { return res.status(200).json(successResponse("Not a single interest added yet")) }

        return res.status(200).json(successResponse("Data retrieved successfully", allInterests))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}

