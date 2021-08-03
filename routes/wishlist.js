const express = require('express')
const { isSignedIn, isAuthenticated } = require('../controllers/auth')
const { getUserById } = require('../controllers/user')
const { createWishlist, deleteWishList, getAllWishList } = require('../controllers/wishlist')
const router = express.Router()

router.param("userId", getUserById)

router.post('/wishlist/create/:userId/:productId', isSignedIn, isAuthenticated, createWishlist)
router.delete('/wishlist/delete/:userId/:productId/:wishlistId', isSignedIn, isAuthenticated, deleteWishList)
router.get('/get/all/wishlist/:userId', isSignedIn, isAuthenticated, getAllWishList)

module.exports = router 