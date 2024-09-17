const { param, check, body, validationResult } = require('express-validator');

const get_user_detail_validator = [
    param("id", "Id is required and should not be empty.")
        .exists().withMessage("Id is required.")
        .notEmpty().withMessage("Id should not be empty."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

const user_registration_steps_validator = [
    check("mobile_number", "Mobile number is required to perform this action").not().isEmpty(),
    check("current_step", "current_step is required to perform this action").not().isEmpty(),
    body("username").custom((value, { req }) => {
        if (req.body.current_step === 2) {
            if (!value || value.trim() === "") {
                throw new Error("username is required when current_step is 2");
            }
        }
        return true;
    }),
    body("dob").custom((value, { req }) => {
        if (req.body.current_step === 3) {
            if (!value || value.trim() === "") {
                throw new Error("date of birth is required when current_step is 3");
            }
        }
        return true;
    }),
    body("gender").custom((value, { req }) => {
        if (req.body.current_step === 4) {
            if (!value || value.trim() === "") {
                throw new Error("gender is required when current_step is 4");
            }
        }
        return true;
    }),
    body("intrested_to_see").custom((value, { req }) => {
        if (req.body.current_step === 5) {
            if (!value || value.trim() === "") {
                throw new Error("intrested_to_see is required when current_step is 5");
            }
        }
        return true;
    }),
    body("sexual_orientation_preference_id").custom((value, { req }) => {
        if (req.body.current_step === 6) {
            if (!value || value.trim() === "") {
                throw new Error("sexual_orientation_preference_id is required when current_step is 6");
            }
        }
        return true;
    }),
    body("relationship_type_preference_id").custom((value, { req }) => {
        if (req.body.current_step === 7) {
            if (!value || value.trim() === "") {
                throw new Error("relationship_type_preference_id is required when current_step is 7");
            }
        }
        return true;
    }),
    body("study").custom((value, { req }) => {
        if (req.body.current_step === 8) {
            if (!value || value.trim() === "") {
                throw new Error("study is required when current_step is 8");
            }
        }
        return true;
    }),
    body("distance_preference").custom((value, { req }) => {
        if (req.body.current_step === 9) {
            if (!value || value.trim() === "") {
                throw new Error("distance_preference is required when current_step is 9");
            }
        }
        return true;
    }),
    body("communication_style_id").custom((value, { req }) => {
        if (req.body.current_step === 10) {
            if (!value || value.trim() === "") {
                throw new Error("communication_style_id is required when current_step is 10");
            }
        }
        return true;
    }),
    body("love_receive_id").custom((value, { req }) => {
        if (req.body.current_step === 10) {
            if (!value || value.trim() === "") {
                throw new Error("love_receive_id is required when current_step is 10");
            }
        }
        return true;
    }),
    body("drink_frequency_id").custom((value, { req }) => {
        if (req.body.current_step === 11) {
            if (!value || value.trim() === "") {
                throw new Error("drink_frequency_id is required when current_step is 11");
            }
        }
        return true;
    }),
    body("smoke_frequency_id").custom((value, { req }) => {
        if (req.body.current_step === 11) {
            if (!value || value.trim() === "") {
                throw new Error("smoke_frequency_id is required when current_step is 11");
            }
        }
        return true;
    }),
    body("workout_frequency_id").custom((value, { req }) => {
        if (req.body.current_step === 11) {
            if (!value || value.trim() === "") {
                throw new Error("workout_frequency_id is required when current_step is 11");
            }
        }
        return true;
    }),
    body("interests_ids").custom((value, { req }) => {
        if (req.body.current_step === 12) {
            // Check if interests_ids is an array
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error("interests_ids must be a non-empty array when current_step is 12");
            }
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]

const validateLogin = [
    check('mobile_number', 'Please provide a valid mobile number.').not().isEmpty().isMobilePhone(),
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
  



module.exports = {
    get_user_detail_validator,
    user_registration_steps_validator,
    validateLogin,
    validateSocialLogin,
    validateVerifyOtp
};
