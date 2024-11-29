const { check, validationResult } = require('express-validator');



const signUpValidator = [
    check("username", "Please provide username").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please provide your password").not().isEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];




module.exports = {
    signUpValidator
}