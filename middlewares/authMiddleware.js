const jwt = require('jsonwebtoken')
const config = require('../config/config')
const {errorResponse,successResponse}= require("../utils/common/responseHandler")


let verifyToken = (req, res, next) => {
    try {

        let token = req.headers.authorization;

        if (token) {
            

            token = token.split(' ')[1];

            let user = jwt.verify(token, config.development.jwt_secret_key)

            req.result = user

        } else {
            return res.status(401).json(errorResponse('Token is required for authentication.'))
        }
        next();

    } catch (error) {

        console.log("ERROR::", error)

        return res.status(401).json(errorResponse("Unauthorized user"))
    }
}


module.exports = verifyToken
