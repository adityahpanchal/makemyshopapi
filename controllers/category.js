const Category = require('../models/category')
const subcategory = require('../models/subcategory')
const SubCategory = require('../models/subcategory')

exports.getCategoryById = (req, res, next, id) =>{
    Category.findById(id).exec((err, cate) => {
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        req.category = cate
        next()
    })
}

exports.getSubCategoryById = (req, res, next, id) =>{
    SubCategory.findById(id).exec((err, cate) => {
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        req.subcategory = cate
        next()
    })
}

exports.createCategory = (req, res) =>{
    let {categoryName, icon} = req.body
    let userId = req.profile._id
    
    Category.find({category: categoryName}, (err, categoryIsAvailbale) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        if(!categoryIsAvailbale){
            let category = new Category({
                category: categoryName,
                userId: userId,
                icon: icon
            })
            
            category.save((err, newCate) =>{
                if(err){
                    return res.status(401).json({
                        error: 'something went l wrong'
                    })
                }
                Category.find((err, categories) =>{
                    if(err){
                        return res.status(401).json({
                            error: 'something went wrong'
                        })
                    }
                    return res.json({
                        status: true,
                        categories
                    })
                })
            })
        }else{
            Category.find((err, categories) =>{
                if(err){
                    return res.status(401).json({
                        error: 'something went wrong'
                    })
                }
                return res.json({
                    status: true,
                    categories,
                    exists: true
                })
            })
        }
    })
}

exports.updateCategory = (req, res) =>{
    let {categoryName, icon} = req.body
    let userId = req.profile._id
    let category = req.category
    
    category.category = categoryName,
    category.icon = icon
    category.lastUpdatedBy = userId

    category.save((err, updatedCate) =>{
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        Category.find((err, categories) =>{
            if(err){
                return res.status(401).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true,
                categories
            })
        })
    })
}

exports.deleteCategory = (req, res) =>{
    let category = req.category

    category.remove((err, removedCate) =>{
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        Category.find((err, categories) =>{
            if(err){
                return res.status(401).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true,
                categories
            })
        })
    })
}


exports.getAllCategory = (req, res) =>{
    Category.find().sort({category: 1}).exec((err, categories) =>{
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        return res.json({
            categories
        })
    })
}

exports.createSubCategory = (req, res) =>{
    let {subCategoryName, icon} = req.body
    let userId = req.profile._id
    let categoryId = req.category._id

    let subCategory = new SubCategory({
        subCategory: subCategoryName,
        userId: userId,
        icon: icon,
        categoryId: categoryId
    })

    subCategory.save((err, newCate) =>{
        if(err){
            return res.status(401).json({
                error: 'something went l wrong'
            })
        }
        SubCategory.find({}, 'subCategory icon').populate({ path: 'categoryId', select: 'category icon' }).exec((err, subcategories) => {
            if(err){
                return res.status(401).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true,
                subcategories
            })
        })
    })
}

exports.updateSubCategory = (req, res) =>{
    let {subCategoryName, icon} = req.body
    let userId = req.profile._id
    let categoryId = req.category._id
    let subCategory = req.subcategory

    subCategory.subCategory = subCategoryName
    subCategory.categoryId = categoryId,
    subCategory.icon = icon
    subCategory.lastUpdatedBy = userId

    subCategory.save((err, updatedCate) =>{
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        SubCategory.find({}, 'subCategory icon').populate({ path: 'categoryId', select: 'category icon' }).exec((err, subcategories) => {
            if(err){
                return res.status(401).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true,
                subcategories
            })
        })
    })
}

exports.deleteSubCategory = (req, res) =>{
    
    let subCategory = req.subcategory

    subCategory.remove((err, removedCate) =>{
        if(err){
            return res.status(401).json({
                error: 'something went wrong'
            })
        }
        SubCategory.find({}, 'subCategory icon').populate({ path: 'categoryId', select: 'category icon' }).exec((err, subcategories) => {
            if(err){
                return res.status(401).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true,
                subcategories
            })
        })
    })
}

exports.getAllSubCategory = (req, res) =>{
    SubCategory.find({}, 'subCategory icon').populate({ path: 'categoryId', select: 'category icon' }).exec((err, subcategories) => {
        if(err){
            return res.status(401).json({
                error: err
            })
        }

        Category.find({}, 'category').exec((err, categoryList) => {
            if(err){
                return res.status(401).json({
                    error: err
                })
            }
            return res.json({
                subcategories,
                categoryList 
            })
        })
    })    
}

exports.getBoth = (req, res) =>{
    SubCategory.find({}, 'subCategory categoryId').exec((err, subcategories) => {
        if(err){
            return res.status(401).json({
                error: err
            })
        }

        Category.find({}, 'category').exec((err, categories) => {
            if(err){
                return res.status(401).json({
                    error: err
                })
            }
            return res.json({
                subcategories,
                categories
            })
        })
    })
}