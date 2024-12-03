let jwt = require('jsonwebtoken')
const config = require('../../config/config')
let hoteAccountModel = require('../../models/hotelAccounts')
let {errorResponse} = require('../../utils/common/responseHandler')
let messages = require("../../utils/common/messages")

let verifyHotelToken = async(req, res, next) => {
    try {

        let token = req.headers.authorization;

        if (token) {
            
            token = token.split(' ')[1];

            let user = jwt.verify(token, config.development.jwt_secret_key)
         
            let isHotelExist =  await hoteAccountModel.findById(user.userId)
           
            if(!isHotelExist){
                return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Unauthorized user! Hotel account with this Id is not findable"))
            }
        
            req.result = user

        } else {
            return res.status(401).json(errorResponse('Token is required for authentication.'))
        }
        next();

    } catch (error) {

        console.log("ERROR::", error)

        return res.status(401).json(errorResponse('Unauthorized user'))
    }
}


module.exports = verifyHotelToken
