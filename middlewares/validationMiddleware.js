const { param, check, body, validationResult } = require('express-validator');



const user_registration_steps_validator = [
    check("email", "Please enter a valid email").isEmail(),
  
    check("mobile_number", "Mobile number is required to perform this action").not().isEmpty(),

  
    check("current_step", "current_step is required to perform this action").not().isEmpty(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];


const validateLogin = [
    check('mobile_number', 'Please provide a valid mobile number.').not().isEmpty().isMobilePhone(),
    check('country_code','Country code missing').not().isEmpty(),
    check('number','Number(without country code) is missing').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];



const validateSocialLogin = [
    check('providerName', 'Provider name is required.').not().isEmpty(),
    check('providerId', 'Provider ID is required.').not().isEmpty(),
    check('email', 'Email is required.').not().isEmpty().isEmail(),
    check('email',"Please add a valid email address.").isEmail(),
    check('mobile_number', 'Please provide a valid mobile number.').not().isEmpty().isMobilePhone(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];




const validateVerifyOtp = [
    check('mobile_number', 'Please provide a valid mobile number.').not().isEmpty().isMobilePhone(),
    check('otp', 'Please provide OTP.').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];



const validateUpdateImagePositions = [
    
    check('fromPosition', 'fromPosition is required and must be a non-negative integer.')
      .not().isEmpty().isInt({ min: 0 }),
  
    check('toPosition', 'toPosition is required and must be a non-negative integer.')
      .not().isEmpty().isInt({ min: 0 }),
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
      }
      next();
    }
  ];
  




module.exports = {
    user_registration_steps_validator,
    validateLogin,
    validateSocialLogin,
    validateVerifyOtp,
    validateUpdateImagePositions
};
