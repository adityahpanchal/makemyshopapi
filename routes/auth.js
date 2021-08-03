const express = require('express')
const router = express.Router()
const { isRegistered, signupOTPSender, signupOTPVerifier, signin } = require('../controllers/auth')
const { check } = require("express-validator")
const { fpOTPSender, changePassword, getUserByMobile } = require('../controllers/user')

//signup
router.post('/signup/send/otp', 
    [
      check("mobile", "mobile is required").isMobilePhone()
    ], 
    isRegistered, signupOTPSender
)
router.post('/signup/otp/verification',  
    [
        check("userOTP.otpID", "something wents wrong").not().isEmpty(),
        check("userOTP.otpNumber", "otp is required").not().isEmpty(),
        check("user.firstname", "first name is required").not().isEmpty(),
        check("user.lastname", "last name is required").not().isEmpty(),
        check("user.password", "password is required").not().isEmpty(),
        check("user.city", "city is required").not().isEmpty(),
        check("user.state", "state is required").not().isEmpty(),
    ],
    signupOTPVerifier
)

//signin
router.post('/signin', 
    [
        check("username", "username is required").not().isEmpty(),
        check("password", "password is required").not().isEmpty()
    ],
    signin
)

router.post('/forgotpassword/sentotp', 
    fpOTPSender
)

router.put('/forgotpassword/verify', 
    getUserByMobile,
    changePassword
)

module.exports = router
