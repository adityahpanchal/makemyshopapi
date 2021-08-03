const multer = require('multer')
const path = require('path')
const AuthCredentials = require('../models/authCredentials')
const BusinessProfile = require('../models/businessProfile')
const SellerApproval = require('../models/SellerApproval')
const User = require('../models/user')
const { getRandomInt, makeid } = require('./functions')

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

exports.validate = (req, res) =>{
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
                    res.json(updatedSeller)
                })
            })
        })
    }else{
        return res.json({
            error: 'please select all required documents'
        }) 
    }
}

exports.getBusinessId = (req, res) =>{
    const bid = req.profile.businessId._id
    const user = req.profile
    const sellerData = {
        userId: user._id,
        businessId: bid,
        businessName: user.businessId.businessName,
        businessMobile: user.businessId.businessMobile,
        sellerType: user.businessId.sellerType,
        sellingRegion: user.businessId.sellingRegion,
        sellingPermission: user.businessId.sellingPermission,
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
    return res.json({
        sellerData
    })
}

exports.adminSellerReqPer = (req, res) =>{
    const {identity, panCard, gst, bankAccount, otherData, message} = req.body
    const bid = req.profile.businessId._id
    let user = req.profile

    SellerApproval.findOne({businessId: bid, userId: user._id}, (err, sid) =>{
        if(err || !sid){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        user.businessId.gst.isVerified = gst,
        user.businessId.bankAccount.isVerified = bankAccount
        user.businessId.panCard.isVerified = panCard
        user.businessId.identity.isVerified = identity

        let objUserDoc = {
            gst: '',
            identity: '',
            bankAccount: '',
            panCard: ''
        }
        for (const key in objUserDoc) {
            objUserDoc[key] = user.businessId[key].isVerified
        }
        let validate = Object.values(objUserDoc).every(x => x === "true")
        if(validate && otherData === "true"){
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
                    return res.json({
                        bsnsp
                    })
                })
            })
        }else{
            sid.status = true
            sid.message = message
            sid.isApproved = false
            sid.save((err, uSid) =>{
                if(err){
                    return res.status(400).json({
                        error: 'something went wrong'
                    }) 
                }
                BusinessProfile.findOneAndUpdate({_id: bid}, 
                    {
                        registrationStatus: 2, 
                        'gst.isVerified': gst,
                        'panCard.isVerified': panCard,
                        'identity.isVerified': identity,
                        'bankAccount.isVerified': bankAccount
                    }, {new: true}, (err, bsnsp) =>{
                    if(err){
                        return res.status(400).json({
                            error: 'something went wrong'
                        }) 
                    }
                    return res.json({
                        bsnsp
                    })
                })
            })
        }
    })
}

exports.removeUser = (req, res) =>{
    const user = req.profile
    const businessProfile = req.businessProfile
    
    AuthCredentials.findOneAndDelete({userId: user._id}, (err, deletedCred) =>{
        if(err){
            return res.json({
                error: err
            })
        }
        SellerApproval.findOneAndDelete({userId: user._id}, (err, deletedSellerApproval) =>{
            if(err){
                return res.json({
                    error: 'e'
                })
            }
            BusinessProfile.findOneAndDelete({_id: businessProfile._id}, (err, deletedSeller) =>{
                if(err){
                    return res.json({
                        error: 'r'
                    })
                }
                user.businessId = undefined
                user.save((err, user) =>{
                    if(err){
                        return res.json({
                            error: 'e'
                        })
                    }
                    return res.json({
                        status: true
                    })
                }) 
            })
        })
    })
}