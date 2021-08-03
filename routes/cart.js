const express = require('express')
const router = express.Router()
const {isSignedIn, isAuthenticated } = require('../controllers/auth')
const { addToCart, getAllCartProduct, addQuantityToCart, deleteCartItem, removeQuantityToCart, validateStock, lockQuantity } = require('../controllers/cart')
const { getUserById } = require('../controllers/user')

router.param("userId", getUserById)

router.post('/cart/add/:userId', isSignedIn, isAuthenticated, addToCart)
router.post('/cart/add/quantity/:userId/:cartId', isSignedIn, isAuthenticated, addQuantityToCart)
router.post('/cart/remove/quantity/:userId/:cartId', isSignedIn, isAuthenticated, removeQuantityToCart)
router.post('/cart/validate/stocks/:userId', isSignedIn, isAuthenticated, validateStock)
router.post('/cart/lock/quantity/:userId', isSignedIn, isAuthenticated, lockQuantity)
router.get('/cart/all/:userId', isSignedIn, isAuthenticated, getAllCartProduct)
router.delete('/cart/delete/:userId/:cartId', isSignedIn, isAuthenticated, deleteCartItem)

module.exports = router