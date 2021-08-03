const express = require('express')
const router = express.Router()
const { getUserById } = require('../controllers/user')
const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth')
const { getCategoryById, getSubCategoryById, createCategory, updateCategory, deleteCategory, getAllCategory, createSubCategory, updateSubCategory, deleteSubCategory, getAllSubCategory, getBoth } = require('../controllers/category')

//params
router.param("userId", getUserById)
router.param("categoryId", getCategoryById)
router.param("subCategoryId", getSubCategoryById)

//category routes
router.post('/create/category/:userId', isSignedIn, isAuthenticated, isAdmin, createCategory)
router.put('/update/category/:userId/:categoryId', isSignedIn, isAuthenticated, isAdmin, updateCategory)
router.delete('/delete/category/:userId/:categoryId', isSignedIn, isAuthenticated, isAdmin, deleteCategory)
router.get('/all/category', getAllCategory)



router.post('/create/subcategory/:userId/:categoryId', isSignedIn, isAuthenticated, isAdmin, createSubCategory)
router.put('/update/subcategory/:userId/:categoryId/:subCategoryId', isSignedIn, isAuthenticated, isAdmin, updateSubCategory)
router.delete('/delete/subcategory/:userId/:subCategoryId', isSignedIn, isAuthenticated, isAdmin, deleteSubCategory)
router.get('/all/subcategory', getAllSubCategory)

router.get('/all/category/subcategory', getBoth)

module.exports = router