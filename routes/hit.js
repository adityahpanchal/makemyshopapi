const express = require('express')
const { addHitProduct, checkProductHit, checkSellerHit, addHitSeller } = require('../controllers/hit')
const router = express.Router()

router.post('/hit/product/add/:ip/:productId', checkProductHit, addHitProduct)
router.post('/hit/seller/add/:ip/:sellerId', checkSellerHit, addHitSeller)

module.exports = router 