const express = require('express')
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth')
const { adminCounter, cartCounter, getOrderAndProductCount } = require('../controllers/count')
const { getUserById } = require('../controllers/user')
const { productCounter } = require('../controllers/product')
const router = express.Router()

router.param("userId", getUserById)

router.get('/count/admin/:userId', isSignedIn, isAuthenticated, isAdmin, adminCounter)
router.get('/count/cart/:userId', isSignedIn, isAuthenticated, cartCounter) 
router.get('/count/product/:sellerId', isSignedIn, isAuthenticated, productCounter) 

router.get('/count/seller/orders/product/:sellerId/:userId', getOrderAndProductCount)

module.exports = router