const Hit = require("../models/hit")
const Product = require("../models/Product")
const BusinessProfile = require("../models/businessProfile")

exports.checkProductHit = (req, res, next) =>{
    Hit.findOne({ip: req.params.ip, productId: req.params.productId}, (err, rslt) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        if(rslt){
            return res.json({
                status: true
            })
        }
        if(!rslt){
            let newHit = new Hit({
                productId: req.params.productId,
                ip: req.params.ip,
            })
            newHit.save((err, saved) =>{
                if(err){
                    return res.status(400).json({
                        error: 'something went wrong'
                    })
                }
                if(saved){
                    req.hit = saved
                    next()
                }
            })
        }
    })
}

exports.addHitProduct = (req, res) =>{
    Product.findById(req.params.productId).exec((err, product) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        product.hits = product.hits + 1
        product.save((err, saved) =>{
            if(err){
                return res.status(400).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true
            })
        })
    })
}

exports.checkSellerHit = (req, res, next) =>{
    Hit.findOne({ip: req.params.ip, sellerId: req.params.sellerId}, (err, rslt) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        if(rslt){
            return res.json({
                status: true
            })
        }
        if(!rslt){
            let newHit = new Hit({
                sellerId: req.params.sellerId,
                ip: req.params.ip,
            })
            newHit.save((err, saved) =>{
                if(err){
                    return res.status(400).json({
                        error: 'something went wrong'
                    })
                }
                if(saved){
                    req.hit = saved
                    next()
                }
            })
        }
    })
}

exports.addHitSeller = (req, res) =>{
    BusinessProfile.findById(req.params.sellerId).exec((err, seller) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })
        }
        seller.hits = seller.hits + 1
        seller.save((err, saved) =>{
            if(err){
                return res.status(400).json({
                    error: 'something went wrong'
                })
            }
            return res.json({
                status: true
            })
        })
    })
}