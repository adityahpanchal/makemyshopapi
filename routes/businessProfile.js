const express = require('express')
const router = express.Router()
const { isSignedIn, isAuthenticated, isAdmin} = require('../controllers/auth')
const { getUserById, authCredentialsFinder } = require('../controllers/user')
const { isRegistered, getMainpageSellersIndia, getMainpageSellersIndiaCityState, sellerRegiSendOTP, sellerOTPVerification, fileUploader, performValidation, sellerInfoVerification, getBusinessId, getVerificationStatus, getSellerForVerification, getSellerById, gstResubmit, reSubmitFile, bankResubmit, panCardResubmit, identityResubmit, logoResubmit, nameResubmit, getSellerList, getSellerByIdForShop, getAllProductBySellerId, searchSellerIndia, searchSellerAll, viewAllSellerIndia, viewAllSellerStateCity } = require('../controllers/businessProfile')

router.param("userId", getUserById)
router.param("sellerId", getSellerById)

//seller(user) routes
router.post('/seller/create/mobile/verification/sendotp/:userId', isSignedIn, isAuthenticated, isRegistered, authCredentialsFinder, sellerRegiSendOTP)
router.post('/seller/create/mobile/verification/:userId', isSignedIn, isAuthenticated, sellerOTPVerification)
router.post('/seller/create/upload/docs/:userId', isSignedIn, isAuthenticated, fileUploader, performValidation)
router.get('/seller/info/verification/status/:userId', isSignedIn, isAuthenticated, getVerificationStatus)

//seller(user) resubmit route
router.post('/seller/info/resubmit/gst/:userId', isSignedIn, isAuthenticated, getBusinessId, gstResubmit)
router.post('/seller/info/resubmit/bank/:fileType/:userId', isSignedIn, isAuthenticated, getBusinessId, reSubmitFile, bankResubmit)
router.post('/seller/info/resubmit/pancard/:fileType/:userId', isSignedIn, isAuthenticated, getBusinessId, reSubmitFile, panCardResubmit)
router.post('/seller/info/resubmit/identity/:fileType/:userId', isSignedIn, isAuthenticated, getBusinessId, reSubmitFile, identityResubmit)
router.post('/seller/info/resubmit/logo/:fileType/:userId', isSignedIn, isAuthenticated, getBusinessId, reSubmitFile, logoResubmit)
router.post('/seller/info/resubmit/businessname/:userId', isSignedIn, isAuthenticated, getBusinessId, nameResubmit)

//seller(admin) routes
router.get('/admin/seller/info/:userId/:sellerId', isSignedIn, isAuthenticated, isAdmin, getSellerForVerification)
router.post('/admin/seller/info/verification/:userId/:sellerId', isSignedIn, isAuthenticated, isAdmin, sellerInfoVerification)

router.get('/admin/get/list/seller/:status/:userId', isSignedIn, isAuthenticated, isAdmin, getSellerList)

//get for shop
router.get('/shop/:sellerId', getSellerByIdForShop)

router.get('/mainpage/sellers/india', getMainpageSellersIndia)
router.get('/mainpage/sellers/india/:state/:city', getMainpageSellersIndiaCityState)

router.get('/search/seller/sellers/india', searchSellerIndia)
router.get('/search/sellers/india/:state/:city', searchSellerAll)

router.get('/view/all/seller/sellers/india', viewAllSellerIndia)
router.get('/view/all/sellers/india/:state/:city', viewAllSellerStateCity)

module.exports = router
  