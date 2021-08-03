const WishList = require("../models/wishlist");

exports.createWishlist = (req, res) =>{    

    WishList.findOne({userId: req.params.userId, productId: req.params.productId}, (err, wl) =>{
        if(err){
            return res.status(400).json({
                error: 'something went wrong'
            })  
        }
        if(!wl){
            const newWishlist = new WishList({
                userId: req.params.userId,
                productId: req.params.productId
            })
            newWishlist.save((err, wishlist) =>{
                if(err){
                    return res.status(400).json({
                        error: 'something went wrong'
                    })
                }
                return res.json({
                    status: true
                })
            })
        }else{
            return res.json({
                status: true
            })
            // const newWishlist = new WishList({
            //     userId: req.params.userId,
            //     productId: req.params.productId
            // })
            // newWishlist.save((err, wishlist) =>{
            //     if(err){
            //         return res.status(400).json({
            //             error: 'something went wrong'
            //         })
            //     }
            //     return res.json({
            //         status: true
            //     })
            // })
        }
    })
}

exports.deleteWishList = (req, res) =>{
    let id = req.params.wishlistId
    WishList.findOneAndDelete({_id: id}, (err, rm) =>{
        if(err){
            return res.status(400).json({
                error: 'user not found'
            })
        }
        return res.json({
            status: true
        })
    })
}

exports.getAllWishList = (req, res) =>{
    WishList.find({userId: req.profile._id}).populate('productId').exec((err, wishlistList) => {
        if(err){
            return res.status(400).json({
                error: 'user not found'
            })  
        }
        return res.json({
            wishlistList: wishlistList
        })
    })
}