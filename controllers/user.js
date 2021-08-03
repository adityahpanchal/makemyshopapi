const User = require('../models/user')
const AuthCredentials = require('../models/authCredentials')
const ForgotPassotp = require('../models/forgotPassword')
const { getRandomInt, otpIdgenerator, otpSender, encrypassword, emailSender } = require('./functions')
const user = require('../models/user')

exports.getUserById = (req, res, next, id) =>{
    User.findById(id).populate('businessId').exec((err, user) =>{
        if(err){
            return res.status(401).json({
                error: 'err'
            })
        }
        if(user){
            req.profile = user
            next()
        }else{
            return res.status(400).json({
                error: 'user not found'
            })
        }
    }) 
}

exports.getUser = (req, res) =>{
    const user = req.profile
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
        user: req.profile, 
        email: req.profile.email
    })
}

exports.updatePersonalDetails = (req, res) =>{
    const {firstname, lastname, state, city} = req.body
    const user = req.profile

    user.firstname = firstname
    user.lastname = lastname
    user.state = state
    user.city = city

    user.save((err, user) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            }) 
        }
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
            user: user
        })
            
    })
}

exports.authCredentialsFinder = (req, res, next) =>{
    const {_id, mobile} = req.profile
    AuthCredentials.findOneAndUpdate({userId: _id}, {userId: _id, mobile: mobile}, {upsert: true, new: true, setDefaultsOnInsert: true}, (err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: "something went wrong"
            })
        }
        req.authCredentials = authCred
        next()
    }) 
} 

exports.acFinderMobile = (req, res, next) =>{
    const {mobile} = req.body

    User.findOne({mobile: mobile}, (err, user) =>{
        if(err){
            return res.status(400).json({
                error: 'this mobile is not registered'
            }) 
        }
        AuthCredentials.findOneAndUpdate({mobile: mobile}, {mobile: mobile}, {upsert: true, new: true, setDefaultsOnInsert: true}, (err, authCred) =>{
            if(err){
                return res.status(400).json({
                    error: "something went wrong"
                })
            }
            req.authCredentials = authCred
            next()
        })
    })
     
} 

//update with otp password
exports.sendUpadatePassOTP = (req, res) =>{
    const authCredentials = req.authCredentials
    // const newPassword = req.body.password
    // const {encry_password, salt, mobile} = req.profile
    // if(encry_password == encrypassword(newPassword, salt)){
    //     return res.json({
    //         error: 'new password cannot be same as previous password'
    //     })
    // }

    const otpNumber = getRandomInt(1, 6)
    const otpID = otpIdgenerator()

    authCredentials.updatePassword.otp = otpNumber
    authCredentials.updatePassword.otpID = otpID
    authCredentials.updatePassword.tryCount = 0
    authCredentials.updatePassword.isUsed = false
    authCredentials.lastUpdateFor = "password"
    authCredentials.save((err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        otpSender(otpNumber, req.profile.mobile)
        return res.json({
            otpID: authCred.updatePassword.otpID
        })
    })
}

exports.updatePasswordIwthOTP = (req, res) =>{
    const {otpByUser, otpIdByUser, newPassword} = req.body
    const {_id, encry_password, salt} = req.profile

    if(encry_password === encrypassword(newPassword, salt)){
        return res.json({
            error: 'new password cannot be same as previous password'
        })
    }

    AuthCredentials.findOne({userId: _id, "updatePassword.otpID": otpIdByUser}, (err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })  
        }
        if(authCred && authCred.lastUpdateFor == "password"){
            const {otp, tryCount, isUsed} = authCred.updatePassword
            const currentTime = new Date()
            const expireTime = new Date(authCred.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 3)
            if(otp == otpByUser && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                
                authCred.updatePassword.tryCount = authCred.updatePassword.tryCount + 1
                authCred.updatePassword.isUsed = true
                authCred.save((err, authCred) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    const user = req.profile
                    user.encry_password = encrypassword(newPassword, salt)
                    user.save((err, user) =>{
                        if(err){
                            return res.json({
                                error: 'something went wrong'
                            })
                        }
                        return res.json({
                            status: true
                        })
                    })
                })
            }else if(tryCount <= 2 && isUsed == false && currentTime < expireTime){
                authCred.updatePassword.tryCount = authCred.updatePassword.tryCount + 1
                authCred.save((err, updatedOTP) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    return res.status(401).json({
                        error: "invalid otp please try again"
                    })
                })
            }else if(tryCount >= 2 && isUsed == false && currentTime < expireTime){
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
            return res.status(400).json({
                error: "Invalid otp"
            })
        }
    })
}

exports.updatePassword = (req, res) =>{
    const {currentPassword, newPassword} = req.body
    const {encry_password, salt} = req.profile
    if(encrypassword(currentPassword, salt) !== encry_password){
        return res.json({
            error: 'password not match'
        })
    }
    if(encry_password == encrypassword(newPassword, salt)){
        return res.json({
            error: 'new password cannot be same as previous password'
        })
    }
    req.profile.encry_password = encrypassword(newPassword, salt)
    req.profile.save((err, user) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        return res.json({
            status: true
        })
    })
}

//update Mobile
exports.sendUpdateMobileOTP = (req, res) =>{
    
    const authCredentials = req.authCredentials
    const newMobile = req.body.newMobile
    
    console.log(newMobile)

    const otpNumberforCurrent = getRandomInt(1, 6)
    const otpNumberforNew = getRandomInt(1, 6)
    const otpID = otpIdgenerator()

    authCredentials.updateMobile.otpForCurrentMobile = otpNumberforCurrent
    authCredentials.updateMobile.otpForNewMobile = otpNumberforNew
    authCredentials.updateMobile.otpID = otpID
    authCredentials.updateMobile.currentMobile = req.profile.mobile
    authCredentials.updateMobile.newMobile = newMobile
    authCredentials.updateMobile.tryCount = 0
    authCredentials.updateMobile.isUsed = false
    authCredentials.lastUpdateFor = "mobile"
    authCredentials.save((err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        otpSender(otpNumberforCurrent, req.profile.mobile)
        otpSender(otpNumberforNew, newMobile)
        return res.json({
            otpID: authCred.updateMobile.otpID
        })
    })
}

exports.updateMobile = (req, res) =>{
    const {obuCMobile, obuNMobile, otpIdByUser} = req.body
    const {_id} = req.profile

    AuthCredentials.findOne({userId: _id, "updateMobile.otpID": otpIdByUser}, (err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })  
        } 
        if(authCred && authCred.lastUpdateFor == "mobile"){
            const {otpForCurrentMobile, otpForNewMobile, newMobile, tryCount, isUsed} = authCred.updateMobile
            const currentTime = new Date()
            const expireTime = new Date(authCred.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 3)
            if(obuCMobile == otpForCurrentMobile && obuNMobile == otpForNewMobile && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                
                authCred.updateMobile.tryCount = authCred.updatePassword.tryCount + 1
                authCred.mobile = newMobile
                authCred.updateMobile.isUsed = true
                authCred.save((err, authCred) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    const user = req.profile
                    user.mobile = newMobile
                    user.save((err, user) =>{
                        if(err){
                            return res.json({
                                error: 'something went wrong'
                            })
                        }
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
                            user
                        })
                    })
                })
            }else if(tryCount <= 2 && isUsed == false && currentTime < expireTime){
                authCred.updateMobile.tryCount = authCred.updateMobile.tryCount + 1
                authCred.save((err, updatedOTP) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    return res.status(401).json({
                        error: "invalid otp please try again"
                    })
                })
            }else if(tryCount >= 2 && isUsed == false && currentTime < expireTime){
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
            return res.status(400).json({
                error: "Invalid otp"
            })
        }
    })
}

//update Email
exports.sendUpdateEmailOTP = (req, res) =>{
    const authCredentials = req.authCredentials
    const newEmail = req.body.newEmail
    
    const isEmail = (req.profile.email === undefined) ? "new" : "update"

    const otpNumberforCurrent = getRandomInt(1, 6)
    const otpNumberforNew = getRandomInt(1, 6)
    const otpID = otpIdgenerator()

    authCredentials.updateEmail.otpForCurrentEmail = otpNumberforCurrent
    authCredentials.updateEmail.otpForNewEmail = otpNumberforNew
    authCredentials.updateEmail.otpID = otpID
    authCredentials.updateEmail.currentEmail = req.profile.email
    authCredentials.updateEmail.newEmail = newEmail
    authCredentials.updateEmail.tryCount = 0
    authCredentials.updateEmail.isUsed = false
    authCredentials.lastUpdateFor = "email"
    authCredentials.save((err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        emailSender(otpNumberforNew, newEmail)
        emailSender(otpNumberforCurrent, req.profile.email)

        return res.json({
            otpID: authCred.updateEmail.otpID,
            type: isEmail
        })
    })
}

exports.updateEmail = (req, res) =>{
    let query
    const {obuCEmail, obuNEmail, otpIdByUser} = req.body
    const {_id} = req.profile

    AuthCredentials.findOne({userId: _id, "updateEmail.otpID": otpIdByUser}, (err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })  
        }
        if(authCred && authCred.lastUpdateFor == "email"){
            const {otpForCurrentEmail, otpForNewEmail, newEmail, tryCount, isUsed} = authCred.updateEmail
            const currentTime = new Date()
            const expireTime = new Date(authCred.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 3)

            if(req.profile.email === undefined){
                query = obuNEmail == otpForNewEmail
            }else{
                query = obuCEmail == otpForCurrentEmail && obuNEmail == otpForNewEmail
            }

            if(query && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                
                authCred.updateEmail.tryCount = authCred.updateEmail.tryCount + 1
                authCred.updateEmail.isUsed = true
                authCred.save((err, authCred) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    const user = req.profile
                    user.email = newEmail
                    user.isEmailVerified = true
                    user.save((err, user) =>{
                        if(err){
                            return res.json({
                                error: 'something went wrong'
                            })
                        }
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
                            user
                        })
                    })
                })
            }else if(tryCount <= 2 && isUsed == false && currentTime < expireTime){
                authCred.updateEmail.tryCount = authCred.updateEmail.tryCount + 1
                authCred.save((err, updatedOTP) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    return res.status(401).json({
                        error: "invalid otp please try again"
                    })
                })
            }else if(tryCount >= 2 && isUsed == false && currentTime < expireTime){
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
                error: "Invalid otp"
            })
        }
    })
}

exports.fpOTPSender = (req, res) =>{
    const mobile = req.body.mobile

    const otpNumber = getRandomInt(1, 6)
    const otpID = otpIdgenerator()

    User.findOne({mobile: mobile}, (err, user) =>{
        if(err){
            return res.status(400).json({
                error: "something went wrong"
            })
        }
        if(!user){
            return res.json({
                error: 'this mobile is not registered'
            })
        }
        if(user){
            ForgotPassotp.findOneAndUpdate({mobile: mobile, userId: user._id}, {otp: otpNumber, otpID: otpID, tryCount: 0, isUsed: false}, {upsert: true, new: true, setDefaultsOnInsert: true}, (err, fpRecord) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                otpSender(otpNumber, mobile)
                return res.json({
                    otpID: fpRecord.otpID
                })
            }) 
        }
    })
}

exports.changePassword = (req, res) =>{
    const {newPassword, uOtp, uOtpID, mobile} = req.body
    const user = req.profile
    ForgotPassotp.findOne({mobile: mobile, otpID: uOtpID}, (err, fpi) =>{
        if(err){
            return res.status(400).json({
                error: "something went wrong"
            })   
        }

        if(fpi){
            const {otp, isUsed, tryCount} = fpi
            const currentTime = new Date()
            const expireTime = new Date(fpi.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 30)
            
            if(otp == uOtp && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                fpi.tryCount = fpi.tryCount + 1
                fpi.isUsed = true
                fpi.save((err, fpi) =>{
                    
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    user.password = newPassword
                    user.save((err, savedUser) =>{
                        if(err){
                            return res.status(400).json({
                                error: "Something went wrong"
                            })  
                        }
                        return res.json({
                            success: true
                        })
                    })
                })    
            }
        }else{
            return res.status(401).json({
                error: "invalid"
            })
        }
    })
}

exports.getUserByMobile = (req, res, next) =>{
    const mobile = req.body.mobile
    User.findOne({mobile: mobile}, (err, user) =>{
        if(err){
            return res.status(400).json({
                error: "Something went wrong d"
            })
        }
        req.profile = user
        next()
    })
}

exports.sendforgetpasswordOTP = (req, res) =>{
    const authCredentials = req.authCredentials

    const otpNumber = getRandomInt(1, 6)
    const otpID = otpIdgenerator()

    authCredentials.updatePassword.otp = otpNumber
    authCredentials.updatePassword.otpID = otpID
    authCredentials.updatePassword.tryCount = 0
    authCredentials.updatePassword.isUsed = false
    authCredentials.lastUpdateFor = "password"
    authCredentials.save((err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong ds'
            })
        }
        otpSender(otpNumber, req.body.mobile)
        return res.json({
            otpID: authCred.updatePassword.otpID
        })
    })
}

exports.findUserByMobile = (req, res, next) =>{
    let {mobile} = req.body

    User.findOne({mobile: mobile}, (err, user) =>{
        if(err){
            return res.status(400).json({
                error: err
            }) 
        }
        req.profile = user
        next()
    })
}

exports.updateforgotpasswordOTP = (req, res) =>{
    const {otpByUser, otpIdByUser, newPassword} = req.body
    const { encry_password, salt} = req.profile

    if(encry_password === encrypassword(newPassword, salt)){
        return res.json({
            error: 'new password cannot be same as previous password'
        })
    }

    AuthCredentials.findOne({mobile: req.body.mobile, "updatePassword.otpID": otpIdByUser}, (err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })  
        }
        if(authCred && authCred.lastUpdateFor == "password"){
            const {otp, tryCount, isUsed} = authCred.updatePassword
            const currentTime = new Date()
            const expireTime = new Date(authCred.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 3)
            if(otp == otpByUser && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                
                authCred.updatePassword.tryCount = authCred.updatePassword.tryCount + 1
                authCred.updatePassword.isUsed = true
                authCred.save((err, authCred) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    const user = req.profile
                    user.encry_password = encrypassword(newPassword, salt)
                    user.save((err, user) =>{
                        if(err){
                            return res.json({
                                error: 'something went wrong'
                            })
                        }
                        return res.json({
                            status: true
                        })
                    })
                })
            }else if(tryCount <= 2 && isUsed == false && currentTime < expireTime){
                authCred.updatePassword.tryCount = authCred.updatePassword.tryCount + 1
                authCred.save((err, updatedOTP) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    return res.status(401).json({
                        error: "invalid otp please try again"
                    })
                })
            }else if(tryCount >= 2 && isUsed == false && currentTime < expireTime){
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
            return res.status(400).json({
                error: "Invalid otp"
            })
        }
    })
}