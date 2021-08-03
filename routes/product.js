const express = require('express')
const { isSignedIn, isAuthenticated, isSeller } = require('../controllers/auth')
const { fileUploader, createProduct, getProductsBySellerId, searchProductIndia, searchCategoryAll, getMainpageIndia, getMainpageIndiaCityState, getProductsById, viewAllIndia, viewAllCityState, updateProductwithImage, updateProductwithoutImage, deactivateProduct, getAllProductBySellerId, searchProduct, searchProductCity, searchCategory } = require('../controllers/product')
const { getUserById } = require('../controllers/user')
var multer  = require('multer')
const { route } = require('./getImages')
const Product = require('../models/Product')
var upload = multer()
const router = express.Router()

router.param("userId", getUserById)

router.post('/create/product/:userId/:sellerId', isSignedIn, isAuthenticated, isSeller, fileUploader, createProduct)
router.post('/update/product/withimg/:userId/:sellerId/:productId', isSignedIn, isAuthenticated, isSeller, fileUploader, updateProductwithImage)
router.post('/update/product/withoutimg/:userId/:sellerId/:productId', isSignedIn, isAuthenticated, isSeller, upload.none(), updateProductwithoutImage)

router.get('/get/all/seller/products/:sellerId', getProductsBySellerId)
router.get('/get/seller/product/:productId', getProductsById)

router.get('/shop/all/products/:sellerId', getAllProductBySellerId)

router.get('/mainpage/products/india', getMainpageIndia)
router.get('/mainpage/products/india/:state/:city', getMainpageIndiaCityState)

router.get('/view/all/products/india', viewAllIndia)
router.get('/view/all/products/india/:state/:city', viewAllCityState)

router.get('/search/products/name/india', searchProductIndia)
router.get('/search/products/name/india/:state/:city', searchProductCity)

router.get('/search/products/category', searchCategoryAll)
router.get('/search/products/category/:state/:city', searchCategory)

router.delete('/deactivate/product/:userId/:sellerId/:productId', isSignedIn, isAuthenticated, isSeller, deactivateProduct)
router.get('/all/active', (req, res) => {
    Product.updateMany({}, {deactivated: false}, (err, result) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        return res.json({
            status: true
        })
    })
})
module.exports = router
