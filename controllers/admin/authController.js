let adminModel = require('../../models/adminModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')
let { compareHashedPassword, generateToken } = require("../../utils/common/commonFunctions")




exports.admin_login = async (req, res) => {
    try {
        let username = req.body.username
        let email = req.body.email
        let password = req.body.password
        let isAdminExist

        if (!username && !email) {
            return res.status(400).json(errorResponse('Please provide either username or password'))
        }
        if (username && email) {
            return res.status(400).json(errorResponse('You can only add one:  username or email'))
        }
        if (!password) {
            return res.status(400).json(errorResponse('Please provide your password'))
        }

        if (username) {
            isAdminExist = await adminModel.findOne({ username: username })
        } else {
            isAdminExist = await adminModel.findOne({ email: email })
        }

        if (!isAdminExist) {
            return res.status(400).json(errorResponse("Admin not exist"))
        }

        let comparePassword = await compareHashedPassword(password, isAdminExist.password)
        if (!comparePassword) {
            return res.status(400).json("Incorrect password", 'Entered password is incorrect')
        }
        let token = await generateToken(isAdminExist._id,isAdminExist.username,isAdminExist.email)

        let userObj = {
            username: isAdminExist.username,
            email: isAdminExist.email,
            token: token
        }

        return res.status(200).json(successResponse('Login successful', userObj))

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}





