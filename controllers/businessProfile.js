const BusinessProfile = require('../models/businessProfile')
const AuthCredentials = require('../models/authCredentials')
const { otpIdgenerator, getRandomInt, otpSender } = require('./functions')
const path = require('path')
const multer = require('multer')
const SellerApproval = require('../models/SellerApproval')
const { readSync } = require('fs')
const { identity, result } = require('lodash')
const user = require('../models/user')
 
exports.isRegistered = (req, res, next) =>{
    const {role, businessId} = req.profile
    if(role === 0 && !businessId){
        BusinessProfile.findOne({businessMobile: req.body.mobile}, (err, sellerID) =>{
            if(err){
                return res.status(400).json({
                    error: "something went wrong"
                })
            }
            if(sellerID){
                return res.json({
                    error: "this mobile is already registered as seller"
                })
            }else{
                next()
            }
        })
    }else{
        return res.json({
            error: "you are already registered as seller"
        })
    }
}

exports.sellerRegiSendOTP = (req, res) =>{
    const mobile = req.body.mobile
    const authCredentials = req.authCredentials
    
    const otpNumber = getRandomInt(1, 6)
    const otpID = otpIdgenerator()
    authCredentials.businessRegistration.otp = otpNumber
    authCredentials.businessRegistration.otpID = otpID
    authCredentials.businessRegistration.mobile = mobile
    authCredentials.lastUpdateFor = "business_registration"
    authCredentials.save((err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: "something went wrong"
            })
        }
        otpSender(otpNumber, mobile)
        return res.json({
            otpID: otpID
        })
    })
}

exports.sellerOTPVerification = (req, res) =>{
    const userOTP = req.body.userOTP
    const {_id} = req.profile

    AuthCredentials.findOne({userId: _id, "businessRegistration.otpID": userOTP.otpID}, (err, authCred) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })  
        }
        if(authCred && authCred.lastUpdateFor == "business_registration"){
            const {otp, mobile, tryCount, isUsed} = authCred.businessRegistration

            const currentTime = new Date()
            const expireTime = new Date(authCred.updatedAt)
            expireTime.setMinutes(expireTime.getMinutes() + 5)
            if(otp == userOTP.otpNumber && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                authCred.businessRegistration.tryCount = authCred.businessRegistration.tryCount + 1
                authCred.businessRegistration.isUsed = true
                authCred.save((err, authCred) =>{
                    if(err){
                        return res.status(400).json({
                            error: "Something went wrong"
                        }) 
                    }
                    const businessDetails = req.body.businessDetails
                    const businessProfile = new BusinessProfile({
                        businessName: businessDetails.businessName,
                        businessMobile: mobile,
                        businessAddress: businessDetails.businessAddress,
                        registrationStatus: 1
                    })
                    businessProfile.save((err, savedBProfile) =>{
                        if(err){
                            return res.status(400).json({
                                error: "Something went wrong"
                            })   
                        }
                        const user = req.profile
                        user.businessId = savedBProfile._id
                        user.save((err, savedUser) =>{
                            if(err){
                                return res.status(400).json({
                                    error: "Something went wrong"
                                })   
                            }
                            return res.json({
                                status: true
                            })
                        })
                    })
                })
            }else if(tryCount <= 2 && isUsed == false && currentTime < expireTime){
                authCred.businessRegistration.tryCount = authCred.businessRegistration.tryCount + 1
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

exports.getSellerById = (req, res, next, id) =>{
    user.findById(id).populate('businessId').exec((err, user) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        req.sellerProfile = user
        next()
    })
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.fieldname === 'logo'){
            cb(null, path.join(__dirname, '../images/logo'))
        }else if(file.fieldname === 'panCard'){
            cb(null, path.join(__dirname, '../images/panCard'))
        }else if(file.fieldname === 'bankProof'){
            cb(null, path.join(__dirname, '../images/bankProof'))
        }else{
            cb(null, path.join(__dirname, '../images/idProof'))
        }
    },
    filename: (req, file, callback) => {
        const match = ["image/jpeg", "application/pdf", "image/png"];
        const matchLogo = ["image/png", "image/jpeg"];
    
        if (file.fieldname === 'logo' && matchLogo.indexOf(file.mimetype) === -1 ) {
          var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
          return callback(message, null);
        }
        if(file.fieldname !== 'logo' && match.indexOf(file.mimetype) === -1 ){
            var message = `${file.originalname} is invalid. Only accept pdf/jpeg.`;
            return callback(message, null);
        }
        
        if(file.mimetype === 'image/png'){
            let filename = `${Date.now()}${getRandomInt(1,9)}.png`
            callback(null, filename);
        }else if(file.mimetype === 'image/jpeg'){
            let filename = `${Date.now()}${getRandomInt(1,9)}.jpeg`
            callback(null, filename);
        }else if(file.mimetype === 'application/pdf'){
            let filename = `${Date.now()}${getRandomInt(1,9)}.pdf`
            callback(null, filename);
        }
        
    }
})

exports.fileUploader = (req, res, next) =>{
    // if(req.profile.businessId.registrationStatus !== 1){
    //     return res.json({
    //         error: "Access Denied"
    //     })
    // }
    let upload = multer({storage: storage}).fields([{ name: 'logo', maxCount: 1 }, { name: 'idProof', maxCount: 1 }, { name: 'bankProof', maxCount: 1 }, { name: 'panCard', maxCount: 1 }])
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.json({
              error: "something went wrong"
          })
        } else if (err) {
            return res.json({
                error: err
            })
        }
        next()
      })
}

exports.performValidation = (req, res) =>{
    const bid = req.profile.businessId._id
    const user = req.profile
    if(req.body.sellerType === 'All' && req.body.gst === ''){
        return res.json({
            error: 'something wents wrong plz try again'
        })
    }
    const keys = Object.keys(req.files)
    let fields = ['logo', 'bankProof', 'panCard', 'idProof']
    const validateFiles = fields.every(field => keys.includes(field))
    if(validateFiles){
        const paths = {}
        for (let i = 0; i < fields.length; i++) {
            paths[keys[i]] = `${keys[i]}/${req.files[keys[i]][0]['filename']}`
        }
        console.log(paths)
        BusinessProfile.findById(bid).exec((err, sellerProfile) =>{
            if(err){
                return res.status(400).json({
                    error: 'something want wrong'
                })
            }
            sellerProfile.businessLogo.url = paths.logo
            sellerProfile.sellerType = req.body.sellerType
            sellerProfile.sellingPermission = req.body.sellingPermission 
            if(req.body.sellingPermission === 'All'){
                sellerProfile.gst.gstNumber = req.body.gst
            }
            sellerProfile.bankAccount.url = paths.bankProof
            sellerProfile.bankAccount.docType = req.body.bankProofType
            sellerProfile.bankAccount.bankAccountNumber = req.body.bankAccountNumber
            sellerProfile.panCard.url = paths.panCard
            sellerProfile.identity.url = paths.idProof
            sellerProfile.identity.docType = req.body.idProofType
            sellerProfile.sellingRegion = req.body.sellingRegion
            sellerProfile.registrationStatus = 2

            sellerProfile.save((err, updatedSeller) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                let sellerApproval = new SellerApproval({businessId: bid, userId: user._id})
                sellerApproval.save((err, sreq) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    res.json({
                        status: true
                    })
                })
            })
        })
    }else{
        return res.json({
            error: 'please select all required documents'
        }) 
    }
}


///admin routes

exports.sellerInfoVerification = (req, res) =>{
    const {identity, panCard, gst, bankAccount, otherData, message, checkBoxData} = req.body
    const bid = req.sellerProfile.businessId._id
    let sellerProfile = req.sellerProfile

    SellerApproval.findOne({businessId: bid, userId: sellerProfile._id}, (err, sid) =>{
        if(err || !sid){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        if(sellerProfile.businessId.sellingPermission === 'All'){
            sellerProfile.businessId.gst.isVerified = gst
        }else{
            sellerProfile.businessId.gst.isVerified = 'true'
        }
        sellerProfile.businessId.bankAccount.isVerified = bankAccount
        sellerProfile.businessId.panCard.isVerified = panCard
        sellerProfile.businessId.identity.isVerified = identity

        let objUserDocWithGST = {
            gst: '',
            identity: '',
            bankAccount: '',
            panCard: ''
        }
        for (const key in objUserDocWithGST) {
            objUserDocWithGST[key] = sellerProfile.businessId[key].isVerified
        }
        let objUserDocNonGST = {
            identity: '',
            bankAccount: '',
            panCard: ''
        }
        for (const key in objUserDocNonGST) {
            objUserDocNonGST[key] = sellerProfile.businessId[key].isVerified
        }
        let validate

        if(sellerProfile.businessId.sellingPermission === "All"){
            validate = Object.values(objUserDocWithGST).every(x => x === "true")
        }else{
            validate = Object.values(objUserDocNonGST).every(x => x === "true")
        }

        if(validate && otherData === "true"){
            sid.logo = true
            sid.bankAccountNumber = true
            sid.businessName = true
            sid.isApproved = true
            sid.status = true
            sid.save((err, uSid) =>{
                if(err){
                    return res.status(400).json({
                        error: 'something went wrong'
                    }) 
                }
                BusinessProfile.findOneAndUpdate({_id: bid}, 
                    {
                        registrationStatus: 3, 
                        'gst.isVerified': "true",
                        'panCard.isVerified': "true",
                        'identity.isVerified': "true",
                        'bankAccount.isVerified': "true"
                    }, {new: true}, (err, bsnsp) =>{
                    if(err){
                        return res.status(400).json({
                            error: 'something went wrong'
                        }) 
                    }
                    sellerProfile.role = 1
                    sellerProfile.save((err, newUSer) => {
                        if(err){
                            return res.status(400).json({
                                error: 'something went wrong'
                            }) 
                        }
                        return res.json({
                            status:  true
                        })
                    })
                })
            })
        }else{
            sid.status = true

            sid.message = message
            sid.bankAccountNumber = checkBoxData.bankAccountNumber
            sid.logo = checkBoxData.logo
            sid.businessName = checkBoxData.businessName
            sid.isApproved = false

            sid.save((err, uSid) =>{
                if(err){
                    return res.status(400).json({
                        error: 'something went wrong'
                    }) 
                }
                let quer
                if(sellerProfile.businessId.sellingPermission === "All"){
                    quer = {
                        'gst.isVerified': gst,
                        'panCard.isVerified': panCard,
                        'identity.isVerified': identity,
                        'bankAccount.isVerified': bankAccount
                    }
                }else{
                    quer = {
                        'gst.isVerified': 'true',
                        'panCard.isVerified': panCard,
                        'identity.isVerified': identity,
                        'bankAccount.isVerified': bankAccount
                    }
                }
                BusinessProfile.findOneAndUpdate({_id: bid}, 
                    quer, {new: true}, (err, bsnsp) =>{
                    if(err){
                        return res.status(400).json({
                            error: 'something went wrong'
                        }) 
                    }
                    sellerProfile.role = 0
                    sellerProfile.save((err, newUSer) => {
                        if(err){
                            return res.status(400).json({
                                error: 'something went wrong'
                            }) 
                        }
                        return res.json({
                            status:  true
                        })
                    })
                })
            })
        }
    })
}

exports.getVerificationStatus = (req, res) =>{
    if(req.profile.businessId.registrationStatus !== 2){
        return res.json({
            error: "Access Denied"
        })
    }
    SellerApproval.findOne({userId: req.profile._id}, (err, sellerApprovalData) =>{
        if(err || !sellerApprovalData){
            return res.status(400).json({
                error: "something went wrong"
            })
        }
        return res.json(sellerApprovalData)
    })
}

exports.getBusinessId = (req, res, next) =>{
    BusinessProfile.findOne({_id: req.profile.businessId._id}, (err, businessProfile) =>{
        if(err){
            return res.status(400).json({
                error: "something went wrong"
            })
        }
        req.businessProfile = businessProfile
        next()
    })
}

exports.gstResubmit = (req, res) =>{
    let businessProfile = req.businessProfile
    businessProfile.gst.gstNumber = req.body.gstNumber
    businessProfile.gst.isVerified = 'pending'
    SellerApproval.findOneAndUpdate({userId: req.profile._id}, {status: false, reSubmit: true}, {new: true}, (err, sid) =>{
        if(err){
            return res.status(400).json({
                error: 'something want wrong'
            })
        }
        businessProfile.save((err, sp) =>{
            if(err){
                return res.status(400).json({
                    error: 'something want wrong'
                }) 
            }
            return res.json({
                status: true
            })
        })
    })
}

exports.getSellerForVerification = (req, res) =>{
    user.findById(req.params.sellerId).populate('businessId').exec(async(err, user) =>{
        if(err){
            return res.json({
                error: 'something want wrong'
            })
        }
        let bid = user.businessId._id 
        const sellerData = {
            userId: user._id,
            businessId: bid,
            businessName: user.businessId.businessName,
            businessMobile: user.businessId.businessMobile,
            sellerType: user.businessId.sellerType,
            sellingRegion: user.businessId.sellingRegion,
            sellingPermission: user.businessId.sellingPermission,
            logo: user.businessId.businessLogo.url,
            docs:{
                panCard: {
                    isVerified: user.businessId.panCard.isVerified,
                    url: user.businessId.panCard.url,
                },
                identity:{
                    isVerified: user.businessId.identity.isVerified,
                    url: user.businessId.identity.url,
                    docType: user.businessId.identity.docType
                },
                bankAccount:{
                    isVerified: user.businessId.bankAccount.isVerified,
                    url: user.businessId.bankAccount.url,
                    docType: user.businessId.bankAccount.docType,
                    bankAccountNumber: user.businessId.bankAccount.bankAccountNumber
                }
            }
        }
        if(user.businessId.sellingPermission === "All"){
            sellerData.docs.gst = {
                isVerified: user.businessId.gst.isVerified,
                gstNumber: user.businessId.gst.gstNumber
            }
        }

        let rslt = await SellerApproval.find({userId: user._id})
        sellerotherdata = rslt[0]

        if(sellerotherdata.logo === undefined){
            sellerData.osd = 'pending'
        }else if(sellerotherdata.logo && sellerotherdata.logo === true && sellerotherdata.businessName === true && sellerotherdata.bankAccountNumber === true){
            sellerData.osd = "true"            
        }else if(sellerotherdata.logo && sellerotherdata.logo === false || sellerotherdata.businessName === false || sellerotherdata.bankAccountNumber === false){
            sellerData.osd = "false"
            sellerData.osddata = {
                logo: sellerotherdata.logo,
                businessName: sellerotherdata.businessName,
                bankAccountNumber: sellerotherdata.bankAccountNumber
            }
        }
        console.log(sellerData.osd)
        return res.json({
            sellerData
        })
    })
}

exports.reSubmitFile = (req, res, next) =>{
    let upload = multer({storage: storage}).single(req.params.fileType)
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.json({
              error: err
          })
        } else if (err) {
            return res.json({
                error: err
            })
        }
        next()
      })
}

exports.bankResubmit = (req, res) =>{
    const bankAccountNumber = req.body.bankAccountNumber
    const docType = req.body.docType

    const fileName = req.file.filename
    const docPath = `bankProof/${fileName}`

    let businessProfile = req.businessProfile
    businessProfile.bankAccount.bankAccountNumber = bankAccountNumber
    businessProfile.bankAccount.docType = docType
    businessProfile.bankAccount.url = docPath
    businessProfile.bankAccount.isVerified = 'pending'

    SellerApproval.findOneAndUpdate({userId: req.profile._id}, {status: false, reSubmit: true, bankAccountNumber: false}, {new: true}, (err, sid) =>{
        if(err){
            return res.status(400).json({
                error: 'something wants wrong'
            })
        }
        businessProfile.save((err, resultB) =>{
            if(err){
                return res.status(400).json({
                    error: 'something wants wrong'
                })
            }
            return res.json({
                resultB
            })
        })
    })
}

exports.panCardResubmit = (req, res) =>{

    const fileName = req.file.filename
    const docPath = `panCard/${fileName}`
    console.log(docPath)
    let businessProfile = req.businessProfile
    businessProfile.panCard.url = docPath
    businessProfile.panCard.isVerified = "pending"

    SellerApproval.findOneAndUpdate({userId: req.profile._id}, {status: false, reSubmit: true}, {new: true}, (err, sid) =>{
        if(err){
            return res.status(400).json({
                error: 'something wants wrong'
            })
        }
        businessProfile.save((err, resultB) =>{
            if(err){
                return res.status(400).json({
                    error: 'something wants wrong'
                })
            }
            return res.json({
                resultB
            })
        })
    })
}

exports.identityResubmit = (req, res) =>{
    console.log(req.file)
    const docType = req.body.docType

    const fileName = req.file.filename
    const docPath = `idProof/${fileName}`

    let businessProfile = req.businessProfile
    businessProfile.identity.url = docPath
    businessProfile.identity.isVerified = "pending"
    businessProfile.identity.docType = docType

    SellerApproval.findOneAndUpdate({userId: req.profile._id}, {status: false, reSubmit: true}, {new: true}, (err, sid) =>{
        if(err){
            return res.status(400).json({
                error: 'something wants wrong'
            })
        }
        businessProfile.save((err, resultB) =>{
            if(err){
                return res.status(400).json({
                    error: 'something wants wrong'
                })
            }
            return res.json({
                resultB
            })
        })
    })
}

exports.logoResubmit = (req, res) =>{

    const fileName = req.file.filename
    const docPath = `logo/${fileName}`
    console.log(docPath)
    let businessProfile = req.businessProfile
    businessProfile.businessLogo.url = docPath

    SellerApproval.findOneAndUpdate({userId: req.profile._id}, {status: false, reSubmit: true, logo: false}, {new: true}, (err, sid) =>{
        if(err){
            return res.status(400).json({
                error: 'something  r wants wrong'
            })
        }
        businessProfile.save((err, resultB) =>{
            if(err){
                
                console.log(err)
                return res.status(400).json({
                    error: 'something d wants wrong'
                })
            }
            return res.json({
                resultB
            })
        })
    })
}

exports.nameResubmit = (req, res) =>{
    let businessName = req.body.businessName

    let businessProfile = req.businessProfile
    businessProfile.businessName = businessName

    SellerApproval.findOneAndUpdate({userId: req.profile._id}, {status: false, reSubmit: true, businessName: false}, {new: true}, (err, sid) =>{
        if(err){
            return res.status(400).json({
                error: 'something wants wrong'
            })
        }
        businessProfile.save((err, resultB) =>{
            if(err){
                return res.status(400).json({
                    error: 'something wants wrong'
                })
            }
            return res.json({
                resultB
            })
        })
    })
}

exports.getSellerList = (req, res) =>{
    const sellerStatus = req.params.status

    //status:0 new registration (status: false, reSubmit: undefined)
    //status: 1 resubmit (status: false, reSubmit: true)
    //status: 2 completed (status: true, isApproved: false)
    //status: 3 active sellers (status: true, isApproved: true)
    let zero = {status: false,  reSubmit: {$exists: false} }
    let one = {status: false, reSubmit: true}
    let two = {status: true, isApproved: false}
    let three = {status: true, isApproved: true}

    const query = () =>{
        switch (sellerStatus) {
            case '0':
                return zero
            case '1':
                return one
            case '2':
                return two
            case '3':
                return three
            default:
                break;
        }
    }

    SellerApproval.find(query()).populate([{path: 'userId', populate: {
        path: 'businessId'
    }}]).exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }

        return res.json({
            list
        })
    })
}

exports.getSellerByIdForShop = (req, res) =>{
    BusinessProfile.findById(req.params.sellerId).exec((err, sellerProfile) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            sellerProfile
        })
    })
}

exports.getMainpageSellersIndia = (req, res) =>{
    BusinessProfile.find({}).sort('-hits').limit(7).exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellingRegion === "India" && !x.isDeactivated)
        return res.json({
            queryList
        })
    })
}

exports.getMainpageSellersIndiaCityState = (req, res) =>{
    let city = req.params.city
    let state = req.params.state

    BusinessProfile.find({}).sort('-hits').limit(7).exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellingRegion === city || x.sellingRegion === state || x.sellingRegion === "India") && !x.isDeactivated)
        return res.json({
            queryList
        })
    })
}

exports.searchSellerIndia = (req, res) =>{
    let str = req.query.q

    BusinessProfile.find({$text: {$search: str}}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellingRegion === "India" && !x.isDeactivated)
        return res.json({
            queryList
        })
    })
}

exports.searchSellerAll = (req, res) =>{
    let city = req.params.city
    let state = req.params.state
    let str = req.query.q

    BusinessProfile.find({$text: {$search: str}}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellingRegion === city || x.sellingRegion === state || x.sellingRegion === "India") && !x.isDeactivated)
        return res.json({
            queryList
        })
    })
}


exports.viewAllSellerIndia = (req, res) =>{
    BusinessProfile.find({}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellingRegion === "India" && !x.isDeactivated)
        return res.json({
            queryList
        })
    })
}

exports.viewAllSellerStateCity = (req, res) =>{
    let city = req.params.city
    let state = req.params.state

    BusinessProfile.find({}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellingRegion === city || x.sellingRegion === state || x.sellingRegion === "India") && !x.isDeactivated)
        return res.json({
            queryList
        })
    })
}