const express = require('express')
const router = express.Router()
const { getUserById, getUser, updatePersonalDetails, authCredentialsFinder, findUserByMobile, updateforgotpasswordOTP, acFinderMobile, sendforgetpasswordOTP, sendUpadatePassOTP, updatePassword, updatePasswordIwthOTP, sendUpdateMobileOTP, updateMobile, sendUpdateEmailOTP, updateEmail } = require('../controllers/user')
const { isSignedIn, isAuthenticated } = require('../controllers/auth')
const { createAddress, updateAddress, getAddressById, deleteAddress, getAddress, getAllAddress, makeDefaultAddress } = require('../controllers/address')

//params
router.param("userId", getUserById)
router.param("addressId", getAddressById)

//get user
router.get('/getuser/:userId', getUser)

//update name
router.put('/update/personal/details/:userId', updatePersonalDetails)

//update password
router.post('/update/password/sendotp/:userId', isSignedIn, isAuthenticated, authCredentialsFinder, sendUpadatePassOTP)
router.post('/update/password/validate/otp/:userId', isSignedIn, isAuthenticated, updatePasswordIwthOTP)
router.post('/update/password/:userId', isSignedIn, isAuthenticated, updatePassword)

router.post('/forgot/password/sendotp', acFinderMobile, sendforgetpasswordOTP)
router.post('/forgot/password/validate/otp', findUserByMobile, updateforgotpasswordOTP)

//update mobile
router.post('/update/mobile/sendotp/:userId', isSignedIn, isAuthenticated, authCredentialsFinder, sendUpdateMobileOTP)
router.post('/update/mobile/:userId', isSignedIn, isAuthenticated, updateMobile)

//update mobile
router.post('/update/email/sendotp/:userId', isSignedIn, isAuthenticated, authCredentialsFinder, sendUpdateEmailOTP)
router.post('/update/email/:userId', isSignedIn, isAuthenticated, updateEmail)

//Address
router.post('/create/address/:userId', isSignedIn, isAuthenticated, createAddress)
router.put('/update/address/:userId/:addressId', isSignedIn, isAuthenticated, updateAddress)
router.delete('/delete/address/:userId/:addressId', isSignedIn, isAuthenticated, deleteAddress)
router.get('/address/:userId/:addressId', isSignedIn, isAuthenticated, getAddress)
router.get('/all/address/:userId', isSignedIn, isAuthenticated, getAllAddress)
router.post('/address/makedefault/:userId/:addressId', isSignedIn, isAuthenticated, makeDefaultAddress)

module.exports = router
