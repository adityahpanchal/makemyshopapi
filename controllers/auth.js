const User = require('../models/user')
const OTP = require('../models/otp')
const {validationResult} = require('express-validator')
const { otpSender, getRandomInt, otpIdgenerator } = require('./functions')
const jwt = require('jsonwebtoken')
 
//check mobile is already registered
exports.isRegistered = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
        error: errors.array()[0].msg
        });
    } 
    const {mobile} = req.body

    User.findOne({ mobile: mobile }, (err, user) =>{
        if(err){
            return res.status(400).json({
                error: "Something went wrong"
            })
        }
        if(user){
            return res.status(401).json({
                error: "This mobile is already exist"
            })
        }
        next() 
    })
}

//if mobile is not registered then send otp for new registration
exports.signupOTPSender = (req, res) =>{
    const {mobile} = req.body
    
    //random 6 digit number generator for otp
    const otpNumber = getRandomInt(1, 10)
    const otpID = otpIdgenerator()
    const otp = {
        otp: otpNumber,
        mobile: mobile,
        otpID: otpID
    }

    OTP.findOneAndUpdate({mobile: mobile}, otp, {upsert: true, new: true, setDefaultsOnInsert: true}, (err, otp) =>{
        if(err){
            return res.statusjioj (400).json({
                error: "Something went wrong"
            })
        }
        return res.json({
            otpID: otp.otpID
        })
    })
    otpSender(otpNumber, mobile)
}

//signup otp verification 
exports.signupOTPVerifier = (req, res) =>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
        error: errors.array()[0].msg
        });
    } 

    const {userOTP} = req.body
    
    OTP.findOne({otpID: userOTP.otpID}, (err, otpRecord) =>{
        if(err){
            return res.status(400).json({
                error: "Something went wrong"
            })
        }
        if(otpRecord){
            const currentTime = new Date()
            const expireTime = new Date(otpRecord.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 10)
            if(otpRecord.otp == userOTP.otpNumber && otpRecord.tryCount <= 2 && otpRecord.isUsed == false && currentTime < expireTime){
                
                otpRecord.tryCount = otpRecord.tryCount + 1
                otpRecord.isUsed = true
                otpRecord.save((err, updatedOTPRecord) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    req.body.user.mobile = otpRecord.mobile
                    const user = new User(req.body.user)
                    user.save((err, user) =>{
                        if(err){
                            return res.status(400).json({
                                error: err
                            }) 
                        }
                        const token = jwt.sign({_id: user._id}, user.salt)

                        user.encry_password = undefined
                        user.salt = undefined
                        user.__v = undefined
                        user.createdAt = undefined
                        user.updatedAt = undefined
                        
                        return res.json({
                            token,
                            user
                        })
                    })
                })
            }else if(otpRecord.tryCount <= 2 && otpRecord.isUsed == false && currentTime < expireTime){
                otpRecord.tryCount = otpRecord.tryCount + 1
                otpRecord.save((err, updatedOTP) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    return res.status(401).json({
                        error: "invalid otp please try again"
                    })
                })
            }else if(otpRecord.tryCount >= 2 && otpRecord.isUsed == false && currentTime < expireTime){
                return res.status(401).json({
                    error: "Sorry, you have exceeded the maximum number of attempts to verify your mobile"
                })
            }else if(currentTime > expireTime){
                return res.status(401).json({
                    error: "Timeout please try resend"
                })
            }else{
                return res.status(401).json({
                    error: "invalid otp"
                })
            }
        }else{
            return res.json({
                error: "invalid otp f"
            })
        }
    })
}

exports.signin = (req, res) =>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
        error: errors.array()[0].msg
        });
    } 
    
    let {username, password} = req.body

    let query = isNaN(username) === true ? { email: username } : { mobile: username } 
    User.findOne(query).populate('businessId').exec((err, user) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }

        if(!user){
            return res.status(401).json({
                error: 'User not found'
            })
        }
        console.log(user)
        if (!user.autheticate(password)) {
            if(user.mobile == username){
                return res.status(401).json({
                    error: 'mobile and password did not match'
                })
            }else{
                return res.status(401).json({
                    error: 'email and password did not match'
                })
            }
        }
    
        const token = jwt.sign({_id: user._id}, user.salt)
        user.encry_password = undefined
        user.salt = undefined
        user.__v = undefined
        user.createdAt = undefined
        user.updatedAt = undefined
        if(user.businessId){
            user.businessId.createdAt = undefined
            user.businessId.updatedAt = undefined
            user.businessId.__v = undefined
        }
        return res.json({
            token,
            user: user
        })  
    })
}

exports.isSignedIn = (req, res, next) =>{
    const {authorization} = req.headers
    if(!authorization){
        return res.status(401).json({
            error: 'you are not sign in'
        })
    }
    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, req.profile.salt, (err, payload) =>{
        if(err){
            return res.status(401).json({
                error: 'credentials not match'
            })
        }
        req.auth = payload
        next()
    })
}

exports.isAuthenticated = (req, res, next) =>{
    let checker = req.profile && req.auth && req.profile._id == req.auth._id
    if(!checker){
        return res.status(401).json({
            error: 'ACCESS DENIED'
        })
    }
    next()
}

exports.isAdmin = (req, res, next) =>{
    if(!req.profile.isAdmin){
        return res.status(400).json({
            error: "Access Denied, You are not admin"
        })
    }
    next()
}

exports.isSeller = (req, res, next) =>{
    if(!req.profile.role === 1){
        return res.status(400).json({
            error: "Access Denied, You are not Seller"
        })
    }
    next()
}