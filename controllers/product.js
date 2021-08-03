const { json } = require('body-parser')
const multer = require('multer')
const path = require('path')
const { getRandomInt } = require('../controllers/functions')
const Product = require('../models/Product')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../images/product'))
    },
    filename: (req, file, callback) => {
        const match = ["image/jpeg"]
    
        if (match.indexOf(file.mimetype) === -1 ) {
          var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
          return callback(message, null);
        }
        
        let filename = `${Date.now()}${getRandomInt(1,9)}.jpeg`
        callback(null, filename); 
    }
})

exports.fileUploader = (req, res, next) =>{
    let upload = multer({storage: storage}).array('images', 12)
    
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.json({
                error: "something went wrong"
            })
        } else if (err) {
            return res.json({
                error: err
            })
        }
        next()
    })
}

exports.createProduct = (req, res) =>{
    
    let imageArray = req.files.map((img) => `product/${img.filename}`)
    
    let product = {
        userId: req.params.userId,
        sellerId: req.params.sellerId,
        productName: req.body.productName,
        category: req.body.category,
        subCategory: req.body.subCategory,
        maxQauntity: req.body.maxQauntity,
        dCharge: req.body.dCharge,
        description: req.body.description,
    } 
    if(req.body.isSingleVariant === "true"){
        product.isSingleVariant = true,
        product.stock = req.body.stock,
        product.mrp = req.body.mrp,
        product.price = req.body.price
    }
    if(req.body.isMultiVariant === "true"){
        product.isMultiVariant = true
        let arr = JSON.parse(req.body.multiVariantStock).data
        product.multiVariantStock = arr
    }
    if(req.body.isSubVariant === "true"){
        product.isSubVariant = true
        let obj = JSON.parse(req.body.subVariantStock)
        product.subVariantStock = obj.data
    }
    if(req.body.specifications !== undefined){
        product.specifications = JSON.parse(req.body.specifications).data
    }
    product.images = imageArray

    let newProduct = new Product(product)
    newProduct.save((err, product) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            product
        })
    })
}

exports.updateProductwithImage = async(req, res) =>{
    let productId = req.params.productId
    let product = await Product.findById(productId)

    let newImageArray = req.files.map((img) => `product/${img.filename}`)
    
    product.productName = req.body.productName
    product.category = req.body.category
    product.subCategory = req.body.subCategory
    product.maxQauntity = req.body.maxQauntity
    product.dCharge = req.body.dCharge
    product.description = req.body.description

    if(req.body.isSingleVariant === "true"){
        product.isSingleVariant = true
        product.isMultiVariant = false
        product.isSubVariant = false

        product.stock = req.body.stock
        product.mrp = req.body.mrp
        product.price = req.body.price
    }
    if(req.body.isMultiVariant === "true"){

        product.isSingleVariant = false
        product.isMultiVariant = true
        product.isSubVariant = false
        
        let arr = JSON.parse(req.body.multiVariantStock).data
        product.multiVariantStock = arr
    }
    if(req.body.isSubVariant === "true"){

        product.isSingleVariant = false
        product.isMultiVariant = false
        product.isSubVariant = true

        let obj = JSON.parse(req.body.subVariantStock)
        product.subVariantStock = obj.data
    }
    if(req.body.specifications !== undefined){
        product.specifications = JSON.parse(req.body.specifications).data
    }
    product.images = newImageArray

    product.save((err, product) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            product
        })
    })
}

exports.updateProductwithoutImage = async(req, res) =>{
    let productId = req.params.productId
    let product = await Product.findById(productId)
    
    product.productName = req.body.productName
    product.category = req.body.category
    product.subCategory = req.body.subCategory
    product.maxQauntity = req.body.maxQauntity
    product.dCharge = req.body.dCharge
    product.description = req.body.description

    if(req.body.isSingleVariant === "true"){
        product.isSingleVariant = true
        product.isMultiVariant = false
        product.isSubVariant = false

        product.stock = req.body.stock
        product.mrp = req.body.mrp
        product.price = req.body.price
    }
    if(req.body.isMultiVariant === "true"){

        product.isSingleVariant = false
        product.isMultiVariant = true
        product.isSubVariant = false
        
        let arr = JSON.parse(req.body.multiVariantStock).data
        product.multiVariantStock = arr
    }
    if(req.body.isSubVariant === "true"){

        product.isSingleVariant = false
        product.isMultiVariant = false
        product.isSubVariant = true

        let obj = JSON.parse(req.body.subVariantStock)
        product.subVariantStock = obj.data
    }
    if(req.body.specifications !== undefined){
        product.specifications = JSON.parse(req.body.specifications).data
    }

    product.save((err, product) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            product
        })
    }) 
}

exports.getProductsBySellerId = (req, res) =>{
    let sellerId = req.params.sellerId

    Product.find({sellerId: sellerId, deactivated: false}, (err, products) =>{
        if(err){
            return res.status(400).json({
                err: 'something wents wrong'
            })
        }
        return res.json({
            products
        })
    })
}

exports.getProductsById = (req, res) =>{
    let productId = req.params.productId

    Product.findOne({_id: productId}).populate([{path: 'userId'}, {path: 'sellerId'}, {path: 'category'}, {path: 'subCategory'}]).exec((err, product) =>{
        if(err){
            return res.status(400).json({
                err: 'something went wrong'
            })
        }

        return res.json({
            product
        })
    })
}

exports.deactivateProduct = (req, res) =>{
    console.log(req.params)
    Product.findOneAndUpdate({_id: req.params.productId, userId: req.params.userId, sellerId: req.params.sellerId}, {deactivated: true}, (err, result) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        return res.json({
            status: true
        })
    })
}

exports.getAllProductBySellerId = (req, res) =>{
    Product.find({sellerId: req.params.sellerId}, (err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        return res.json({
            list
        })
    })
}

exports.getMainpageIndia = (req, res) =>{
    Product.find({}).populate({path: 'sellerId'}).sort('-hits').limit(7).exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellerId.sellingRegion === "India" && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}

exports.getMainpageIndiaCityState = (req, res) =>{

    let city = req.params.city
    let state = req.params.state

    Product.find({}).populate({path: 'sellerId'}).sort('-hits').limit(7).exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellerId.sellingRegion === city || x.sellerId.sellingRegion === state || x.sellerId.sellingRegion === "India") && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}



exports.viewAllIndia = (req, res) =>{
    Product.find({}).populate({path: 'sellerId'}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellerId.sellingRegion === "India" && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}

exports.viewAllCityState = (req, res) =>{

    let city = req.params.city
    let state = req.params.state

    Product.find({}).populate({path: 'sellerId'}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellerId.sellingRegion === city || x.sellerId.sellingRegion === state || x.sellerId.sellingRegion === "India") && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}


exports.searchProductIndia = (req, res) =>{
    let str = req.query.q
    Product.find({$text: {$search: str}}).populate({path: 'sellerId'}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellerId.sellingRegion === "India" && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}

exports.searchProductCity = (req, res) =>{
    let city = req.params.city
    let state = req.params.state
    let str = req.query.q
    
    Product.find({$text: {$search: str}}).populate({path: 'sellerId'}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellerId.sellingRegion === city || x.sellerId.sellingRegion === state || x.sellerId.sellingRegion === "India") && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}

exports.searchCategoryAll = (req, res) =>{
    let category = req.query.q
   
    Product.find({category: category}).populate({path: 'sellerId'}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) =>  x.sellerId.sellingRegion === "India" && !x.sellerId.isDeactivated && !x.deactivated)

        return res.json({
            queryList
        })
    })
}

exports.searchCategory = (req, res) =>{
    let category = req.query.q
    let city = req.params.city
    let state = req.params.state

    Product.find({category: category}).populate({path: 'sellerId'}).sort('-hits').exec((err, list) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        let queryList = list.filter((x) => (x.sellerId.sellingRegion === city || x.sellerId.sellingRegion === state || x.sellerId.sellingRegion === "India") && !x.sellerId.isDeactivated && !x.deactivated)
        return res.json({
            queryList
        })
    })
}

exports.productCounter = async(req, res) =>{
    let productCount = await Product.find({userId: req.params.sellerId}).countDocuments()
    return res.json({
        productCount: productCount
    })
}