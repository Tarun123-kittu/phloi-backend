let jwt = require('jsonwebtoken')
const config = require('../config/config')
let adminModel = require('../models/adminModel')
let {errorResponse, successResponse} = require('../utils/common/responseHandler')
let messages = require("../utils/common/messages")

let verifyAdminToken = async(req, res, next) => {
    try {

        let token = req.headers.authorization;

        if (token) {
            
            token = token.split(' ')[1];

            let user = jwt.verify(token, config.development.jwt_secret_key)
            
            let isAdminExist =  await adminModel.findById(user.userId)
            if(!isAdminExist){
                return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Unauthorized user! Admin account with this Id is not findable"))
            }
        
            req.result = user

        } else {
            return res.status(401).json({ message: "Token is required for authentication." ,type:'error'})
        }
        next();

    } catch (error) {

        console.log("ERROR::", error)

        return res.status(401).json({ message: "Unauthorized user", type: "error", data: error.message })
    }
}


module.exports = verifyAdminToken
