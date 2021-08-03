const express = require('express')
const { razorPay, createOrderDigital, createOrderCOD, getOrderByUserId, getOrderStatusByUserId, getOrdersBySellerId, updateDeliveryStatus, getOrderStatusByUserIdForSellers, getOrderByUserIdRecent, getOrdersBySellerIdProcessing, getOrdersBySellerIdRecent } = require('../controllers/orders')
const { getUserById } = require('../controllers/user')
const { isSignedIn, isAuthenticated, isSeller } = require('../controllers/auth')
const router = express.Router()

router.param("userId", getUserById)

router.post('/razorpay/:userId', isSignedIn, isAuthenticated, razorPay)
router.post('/create/order/online/:addressId/:transactionId/:orderId/:userId', isSignedIn, isAuthenticated, createOrderDigital)
router.post('/create/order/cod/:addressId/:userId', isSignedIn, isAuthenticated, createOrderCOD)

router.get('/get/user/orders/:userId', isSignedIn, isAuthenticated, getOrderByUserId)
router.get('/get/user/recent/orders/:userId', isSignedIn, isAuthenticated, getOrderByUserIdRecent)

router.get('/get/order/status/user/:userId/:transactionId/:sellerId', isSignedIn, isAuthenticated, getOrderStatusByUserId)
router.get('/get/order/status/seller/:buyerId/:transactionId/:userId', isSignedIn, isAuthenticated, isSeller, getOrderStatusByUserIdForSellers)

router.post('/update/order/delivery/:buyerId/:transactionId/:userId/:orderStatus', isSignedIn, isAuthenticated, updateDeliveryStatus)


//sellers
router.get('/get/seller/orders/:sellerId/:userId', isSignedIn, isAuthenticated, isSeller, getOrdersBySellerId)
router.get('/get/seller/orders/processing/:sellerId/:userId', isSignedIn, isAuthenticated, isSeller, getOrdersBySellerIdProcessing)
router.get('/get/seller/orders/recent/:sellerId/:userId', isSignedIn, isAuthenticated, isSeller, getOrdersBySellerIdRecent)

module.exports = router