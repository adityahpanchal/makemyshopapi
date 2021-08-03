const express = require('express')
const { fileUploader, validate, adminSellerReqPer, removeUser } = require('../controllers/Test')
const { getUserById } = require('../controllers/user')
const {getBusinessId} = require('../controllers/businessProfile')
const businessProfile = require('../models/businessProfile')
const router = express.Router()

router.param('userId', getUserById)

router.post('/test/form/:userId', fileUploader, validate)

router.post('/remove/seller/:userId', getBusinessId ,removeUser)

router.get('/admin/seller/verification/:userId', getBusinessId)
router.post('/admin/seller/verification/approval/:userId', adminSellerReqPer)

router.get('/all/activate', (req, res) =>{
    businessProfile.updateMany({}, {warning: '', isWarning: false, isDeactivated: false, deactivationStatus: 'Running', msg: ''}, (err, msg) =>{
        return res.json({
            ok: 'ok'
        })
    })
})

module.exports = router