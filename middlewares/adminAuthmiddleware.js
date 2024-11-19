let jwt = require('jsonwebtoken')
const config = require('../config/config')


let verifyAdminToken = (req, res, next) => {
    try {

        let token = req.headers.authorization;

        if (token) {
            

            token = token.split(' ')[1];

            let user = jwt.verify(token, config.development.jwt_secret_key)

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
