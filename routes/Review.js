const express = require('express')
const { isSignedIn, isAuthenticated, isAdmin, isSeller } = require('../controllers/auth')
const { getUserById } = require('../controllers/user')
const {addReview, getReviewsWithoutSignin, getReviewsWithSignin, getAllSellerReview ,updateReview, deleteReview, addBlock, addReport, getSellerReport, deleteReport, blockSeller, getSellerReportCompleted, removeBlock, addSellerAccReviewReq, getSellerReView, hideWarning, rejectReviewReq, unblockReviewReq, getAllSellerReviewCompleted, rejectReviewYVALAReq} = require('../controllers/Review')
const router = express.Router()

router.param('userId', getUserById)

router.post('/add/review/:userId/:productId', isSignedIn, isAuthenticated, addReview)
router.post('/update/review/:userId/:productId', isSignedIn, isAuthenticated, updateReview)
router.delete('/delete/review/:userId/:productId', isSignedIn, isAuthenticated, deleteReview)
router.get('/get/review/:productId', getReviewsWithoutSignin)
router.get('/get/review/with/signin/:userId/:productId', isSignedIn, isAuthenticated, getReviewsWithSignin)

router.post('/add/seller/report/:userId/:sellerId', isSignedIn, isAuthenticated, addReport)
router.post('/block/seller/report/:userId/:sellerId/:reportId', isSignedIn, isAuthenticated, blockSeller)
router.delete('/delete/seller/report/:reportId/:userId', isSignedIn, isAuthenticated, deleteReport)
router.get('/get/seller/report/:userId', isSignedIn, isAuthenticated, isAdmin, getSellerReport)
router.get('/get/completed/seller/report/:userId', isSignedIn, isAuthenticated, isAdmin, getSellerReportCompleted)

router.post('/report/remove/warning/block/:warning/:block/:sellerId/:userId', isSignedIn, isAuthenticated, isAdmin, removeBlock)
router.post('/report/add/warning/block/:warning/:block/:sellerId/:userId', isSignedIn, isAuthenticated, isAdmin, addBlock)

router.post('/hide/warning/:sellerId/:userId', isSignedIn, isAuthenticated, isSeller, hideWarning)

///review
router.post('/seller/account/review/add/:sellerId/:userId', isSignedIn, isAuthenticated, isSeller, addSellerAccReviewReq)
router.get('/seller/account/review/:sellerId/:userId',  isSignedIn, isAuthenticated, isSeller, getSellerReView)
router.get('/get/all/seller/review/:sellerId/:userId',  isSignedIn, isAuthenticated, isAdmin, getAllSellerReview)
router.get('/get/all/completed/seller/review/:sellerId/:userId',  isSignedIn, isAuthenticated, isAdmin, getAllSellerReviewCompleted)

router.post('/reject/seller/review/:sellerId/:userId/:reviewId',  isSignedIn, isAuthenticated, isAdmin, rejectReviewReq)
router.post('/rejectyvala/seller/review/:sellerId/:userId/:reviewId',  isSignedIn, isAuthenticated, isAdmin, rejectReviewYVALAReq)
router.post('/unblock/seller/review/:sellerId/:userId/:reviewId',  isSignedIn, isAuthenticated, isAdmin, unblockReviewReq)

module.exports = router