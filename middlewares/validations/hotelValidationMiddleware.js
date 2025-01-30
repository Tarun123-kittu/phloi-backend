const { check, validationResult, body } = require('express-validator');



const signUpValidator = [
    check("username", "Please provide username").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("phoneNumber","Please enter phone number").not().isEmpty(),
    check("password", "Please provide your password").not().isEmpty(),
    check("password", "Password must be at least 6 characters long, include 1 uppercase letter, 1 number, and 1 symbol")
        .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];



const signInValidator = [
    check("email", "Please enter your email").not().isEmpty(),
    check("password", "Please provide your password").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]




const forgetPasswordValidator = [
    check("email", "Please provide email").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]



const verifyOtpValidator = [
    check("email", "Please enter a email").not().isEmpty(),
    check("otp", "Please provide OTP").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]



const resetPasswordValidator = [
    check('hashed_token', 'Something went wrong. Please try again later (token not provided)').not().isEmpty(),
    check('confirmPassword', 'Please enter confirm password.').not().isEmpty(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Confirm password do not match with new password.');
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' })
        }
        next();
    }
]



const saveHotelDetailsValidator = [
    check("establishmentName").notEmpty().withMessage("Establishment Name is required"),
    // check("establishmentType").notEmpty().withMessage("Establishment Type is required"),
    check("streetAddress").notEmpty().withMessage("Street Address is required"),
    check("country").notEmpty().withMessage("Country is required"),
    check("state").notEmpty().withMessage("State is required"),
    check("pinCode").notEmpty().withMessage("Pin Code is required").isPostalCode('any').withMessage("Invalid Pin Code"),
    check("ownerName").notEmpty().withMessage("Owner Name is required"),
    check("ownerPhone").isMobilePhone('any').withMessage("Invalid phone number"),
    check("ownerEmail").isEmail().withMessage("Invalid email address"),
    check("why_want_phloi").notEmpty().withMessage("why you choose phloii please add reason"),
    check("inPersonVisitAvailability").notEmpty().withMessage("Please indicate whether you are open to an in-person visit"),

    check("customerServiceNumber").notEmpty().withMessage("Please provide a number on which customers can get help to know you more"),
    check("atmosphere_description").notEmpty().withMessage('Please provide the description of your atmosphere.'),
    // check("food")
    //     .customSanitizer(value => (Array.isArray(value) ? value : [value]))
    //     .isArray({ min: 1 }).withMessage("At least one food option is required"),
    // check("food.*").isString().withMessage("Each food option must be a string"),

    // check("atmosphere")
    //     .customSanitizer(value => (Array.isArray(value) ? value : [value]))
    //     .isArray({ min: 1 }).withMessage("At least one atmosphere type is required"),
    // check("atmosphere.*").isString().withMessage("Each atmosphere type must be a string"),

    // check("services")
    //     .customSanitizer(value => (Array.isArray(value) ? value : [value]))
    //     .isArray({ min: 1 }).withMessage("At least one service is required"),

    check("openTiming")
        .matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .withMessage("Opening time must be in military time format (HH:MM)"),

    check("closeTiming")
        .matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
        .withMessage("Closing time must be in military time format (HH:MM)"),


    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]



const changePasswordValidator = [
    check("password").notEmpty().withMessage("Please provide your recent password"),
    check("newPassword").notEmpty().withMessage("Please provide new password"),
    check("newPassword", "Password must be at least 6 characters long, include 1 uppercase letter, 1 number, and 1 symbol")
        .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }),
    check("confirmPassword").notEmpty().withMessage("Please provide confirm password"),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Confirm password do not match with new password.');
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]


const deleteHotelImageValidator = [
    check("hotelId").notEmpty().withMessage('Something went wrong. Please try again later(provide hotel Id)'),
    check("deleteImageIndex").notEmpty().withMessage("Something went wrong. Please try again later(provide deleted image index)"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]


module.exports = {
    signUpValidator,
    signInValidator,
    forgetPasswordValidator,
    verifyOtpValidator,
    resetPasswordValidator,
    saveHotelDetailsValidator,
    changePasswordValidator,
    deleteHotelImageValidator
}