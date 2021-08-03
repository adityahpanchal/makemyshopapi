const { deleteMany } = require("../models/cart")
const Cart = require("../models/cart")

exports.addToCart = (req, res) =>{
    console.log(req.body)
    if(req.body.type === 'single'){
        Cart.findOne({productId: req.body.productId, isSingleVariant: true, userId: req.params.userId}, (err, crt) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            if(crt){
                return res.json({
                    status: "true"
                })
            }
            if(!crt){
                let newItem = new Cart({
                    productId: req.body.productId,
                    sellerId: req.body.sellerId,
                    userId: req.params.userId,
                    isSingleVariant: true
                })
                newItem.save((err, savedItem) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            }
        })
    }

    if(req.body.type === 'multi'){
        Cart.findOne({productId: req.body.productId, isMultiVariant: true, mKey: req.body.mKey, userId: req.params.userId}, (err, crt) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            if(crt){
                return res.json({
                    status: "true"
                })
            }
            if(!crt){
                let newItem = new Cart({
                    productId: req.body.productId,
                    sellerId: req.body.sellerId,
                    userId: req.params.userId,
                    isMultiVariant: true,
                    mKey: req.body.mKey
                })
                newItem.save((err, savedItem) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            }
        })
    }

    if(req.body.type === 'subv'){
        Cart.findOne({productId: req.body.productId, isSubVariant: true, sKey: req.body.sKey, ssKey: req.body.ssKey, userId: req.params.userId}, (err, crt) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            if(crt){
                return res.json({
                    status: "true"
                })
            }
            if(!crt){
                let newItem = new Cart({
                    productId: req.body.productId,
                    sellerId: req.body.sellerId,
                    userId: req.params.userId,
                    isSubVariant: true,
                    sKey: req.body.sKey,
                    ssKey: req.body.ssKey
                })
                newItem.save((err, savedItem) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            }
        })
    }
}

exports.addQuantityToCart = (req, res) =>{
    Cart.findOne({_id: req.params.cartId, userId: req.params.userId}).populate('productId').exec((err, cartItem) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        if(cartItem.isSingleVariant){
            if(cartItem.productId.deactivated){
                return res.json({
                    msg: `this product ${cartItem.productId.productName} is removed by seller`
                })
            }else{
                if(cartItem.quantity < cartItem.productId.maxQauntity){
                    Cart.updateOne({_id: req.params.cartId, userId: req.params.userId}, {quantity: cartItem.quantity + 1}, (err, updatedSignle) =>{
                        if(err){
                            return res.status(400).json({
                                error: err
                            })
                        }
                    })
                    return res.json({
                        status: true
                    })
                }else{
                    return res.json({
                        msg: `you can buy only ${cartItem.quantity} of ${cartItem.productId.productName}`
                    })
                }
            }
        }
        if(cartItem.isMultiVariant){
            if(cartItem.productId.deactivated){
                return res.json({
                    msg: `this product ${cartItem.productId.productName} is removed by seller`
                })
            }else{
                let variantArr = cartItem.productId.multiVariantStock.filter(x => x.key === cartItem.mKey)
                if(variantArr.length === 0){
                    return res.json({
                        msg: `sorry this variant ${cartItem.mKey} of ${cartItem.productId.productName} is removed by seller`
                    })
                }else{
                    if(cartItem.quantity < cartItem.productId.maxQauntity){
                        Cart.updateOne({_id: req.params.cartId, userId: req.params.userId}, {quantity: cartItem.quantity + 1}, (err, updatedSignle) =>{
                            if(err){
                                return res.status(400).json({
                                    error: err
                                })
                            }
                        })
                        return res.json({
                            status: true
                        })
                    }else{
                        return res.json({
                            msg: `you can buy only ${cartItem.quantity} of ${cartItem.productId.productName}`
                        })  
                    }
                }
            }
        }
        if(cartItem.isSubVariant){
            if(cartItem.productId.deactivated){
                return res.json({
                    msg: `this product ${cartItem.productId.productName} is removed by seller`
                })
            }else{
                let myVariant = cartItem.productId.subVariantStock[cartItem.sKey]
                if(myVariant){
                    let mySubVariant = myVariant.filter(x => x.subVariant === cartItem.ssKey)
                    if(mySubVariant.length === 0){
                        return res.json({
                            msg: `this sub variant ${cartItem.ssKey} of ${cartItem.productId.productName} is removed by seller`
                        }) 
                    }else{
                        if(cartItem.quantity < cartItem.productId.maxQauntity){
                            Cart.updateOne({_id: req.params.cartId, userId: req.params.userId}, {quantity: cartItem.quantity + 1}, (err, updatedSignle) =>{
                                if(err){
                                    return res.status(400).json({
                                        error: err
                                    })
                                }
                            })
                            return res.json({
                                status: true
                            })
                        }else{
                            return res.json({
                                msg: `you can buy only ${cartItem.quantity} of ${cartItem.productId.productName}`
                            })  
                        }
                    }
                }else{
                    return res.json({
                        msg: `this variant ${cartItem.sKey} of ${cartItem.productId.productName} is removed by seller`
                    })
                }
            }
        }
    })
}

exports.removeQuantityToCart = (req, res) =>{
    Cart.findOne({_id: req.params.cartId, userId: req.params.userId}).populate('productId').exec((err, cartItem) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        if(cartItem.isSingleVariant){
            if(cartItem.productId.deactivated){
                return res.json({
                    msg: `this product ${cartItem.productId.productName} is removed by seller`
                })
            }else{
                if(1 < cartItem.quantity){
                    Cart.updateOne({_id: req.params.cartId, userId: req.params.userId}, {quantity: cartItem.quantity - 1}, (err, updatedSignle) =>{
                        if(err){
                            return res.status(400).json({
                                error: err
                            })
                        }
                    })
                    return res.json({
                        status: true
                    })
                }else{
                    return res.json({
                        msg: `you have to buy atleast 1 of ${cartItem.productId.productName}`
                    })
                }
            }
        }
        if(cartItem.isMultiVariant){
            if(cartItem.productId.deactivated){
                return res.json({
                    msg: `this product ${cartItem.productId.productName} is removed by seller`
                })
            }else{
                let variantArr = cartItem.productId.multiVariantStock.filter(x => x.key === cartItem.mKey)
                if(variantArr.length === 0){
                    return res.json({
                        msg: `sorry this variant ${cartItem.mKey} of ${cartItem.productId.productName} is removed by seller`
                    })
                }else{
                    if(1 < cartItem.quantity){
                        Cart.updateOne({_id: req.params.cartId, userId: req.params.userId}, {quantity: cartItem.quantity - 1}, (err, updatedSignle) =>{
                            if(err){
                                return res.status(400).json({
                                    error: err
                                })
                            }
                        })
                        return res.json({
                            status: true
                        })
                    }else{
                        return res.json({
                            msg: `you have to buy atleast 1 of ${cartItem.productId.productName}`
                        })  
                    }
                }
            }
        }
        if(cartItem.isSubVariant){
            if(cartItem.productId.deactivated){
                return res.json({
                    msg: `this product ${cartItem.productId.productName} is removed by seller`
                })
            }else{
                let myVariant = cartItem.productId.subVariantStock[cartItem.sKey]
                if(myVariant){
                    let mySubVariant = myVariant.filter(x => x.subVariant === cartItem.ssKey)
                    if(mySubVariant.length === 0){
                        return res.json({
                            msg: `this sub variant ${cartItem.ssKey} of ${cartItem.productId.productName} is removed by seller`
                        }) 
                    }else{
                        if(1 < cartItem.quantity){
                            Cart.updateOne({_id: req.params.cartId, userId: req.params.userId}, {quantity: cartItem.quantity - 1}, (err, updatedSignle) =>{
                                if(err){
                                    return res.status(400).json({
                                        error: err
                                    })
                                }
                            })
                            return res.json({
                                status: true
                            })
                        }else{
                            return res.json({
                                msg: `you have to buy atleast 1 of ${cartItem.productId.productName}`
                            })  
                        }
                    }
                }else{
                    return res.json({
                        msg: `this variant ${cartItem.sKey} of ${cartItem.productId.productName} is removed by seller`
                    })
                }
            }
        }
    })
}

const helperFunction = (arr) =>{
    return new Promise((resolve, reject) => {

        let finalList = []
        
        let priceTotal = {
            total: 0,
            products: 0,
            shipping: 0
        }


        for (let i = 0; i < arr.length; i++) {

            let abc = arr[i]
            let x = {
                isSingleVariant: abc.isSingleVariant,
                isMultiVariant: abc.isMultiVariant,
                isSubVariant: abc.isSubVariant,
                quantity: abc.quantity,
                _id: abc._id,
                productId: abc.productId,
                sellerId: abc.sellerId,
                userId: abc.userId,
                mKey: abc.mKey,
                sKey: abc.sKey,
                ssKey: abc.ssKey,
                finalPrice: abc.finalPrice,
                createdAt: abc.createdAt,
                updatedAt: abc.updatedAt,
                __v: abc.__v
            }

            if(x.isSingleVariant){
                x.price = x.productId.price
                x.dCharge = x.productId.dCharge
                x.isVariantAvailable = true
                finalList.push(x)

                priceTotal.total = priceTotal.total + (x.productId.price * x.quantity) + x.productId.dCharge
                priceTotal.products = priceTotal.products + (x.productId.price * x.quantity) 
                priceTotal.shipping = priceTotal.shipping + x.productId.dCharge
            }
            if(x.isMultiVariant){
                let obj = x.productId.multiVariantStock.filter((y) => y.key === x.mKey)[0]
                if(typeof obj === 'object'){
                    x.price = parseInt(obj.price)
                    x.dCharge = x.productId.dCharge
                    x.isVariantAvailable = true
                    finalList.push(x)

                    priceTotal.total = priceTotal.total + (parseInt(obj.price) * x.quantity) + x.productId.dCharge
                    priceTotal.products = priceTotal.products + (parseInt(obj.price) * x.quantity)
                    priceTotal.shipping = priceTotal.shipping + x.productId.dCharge
                }else{
                    // x.isVariantAvailable = false
                    // finalList.push(x)
                    
                }
            }
            if(x.isSubVariant){
                let skeyCheck = x.productId.subVariantStock[x.sKey]
                if(skeyCheck === undefined){
                    // x.isVariantAvailable = false
                    // finalList.push(x)
                }
                if(skeyCheck !== undefined){
                    let validateSub = skeyCheck.filter(z => z.subVariant === x.ssKey)[0]
                    if(typeof validateSub !== 'object'){
                        // x.isVariantAvailable = false
                        // finalList.push(x)
                    }else{
                        x.price = parseInt(validateSub.price)
                        x.dCharge = x.productId.dCharge
                        x.isVariantAvailable = true
                        finalList.push(x)

                        priceTotal.total = priceTotal.total + (parseInt(validateSub.price) * x.quantity) + x.productId.dCharge
                        priceTotal.products = priceTotal.products + (parseInt(validateSub.price) * x.quantity)
                        priceTotal.shipping = priceTotal.shipping + x.productId.dCharge
                    }
                }
            }
        }
        resolve({
            finalList: finalList,
            priceTotal: priceTotal
        })
    })
}

exports.getAllCartProduct = (req, res) =>{
 
    Cart.find({userId: req.params.userId}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion isDeactivated'}]).exec(async(err, list) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }

        let del = list.filter((x) => x.productId.deactivated === true || x.sellerId.isDeactivated === true).map(x => x._id)
        await Cart.deleteMany({_id: {$in: del}})

        let cartList = list.filter((x) => x.productId.deactivated === false)

        let obj = await helperFunction(cartList)

        let myOperations = obj.finalList.map(x => {
            return {
              updateOne: {
                filter: { _id: x._id },
                update: { finalPrice: x.price, lastPriceUpdate: new Date(), finalDcharge: x.dCharge }
              }
            }
        })

        Cart.bulkWrite(myOperations, {}, (err, products) => {
            if (err) {
              return res.status(400).json({
                error: "Bulk operation failed"
              });
            }
            return res.json({
                cartObj: obj
            })
        })
    })
}

exports.deleteCartItem = (req, res) =>{
    let id = req.params.cartId
    Cart.findOneAndDelete({_id: id}, (err, rm) =>{
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

const deactivationValidator = (arr) =>{
    return new Promise((resolve, reject) => {

        let isErr = false
        let errArr = []

        for (let i = 0; i < arr.length; i++) {

            let abc = arr[i]
            let x = {
                isSingleVariant: abc.isSingleVariant,
                isMultiVariant: abc.isMultiVariant,
                isSubVariant: abc.isSubVariant,
                quantity: abc.quantity,
                _id: abc._id,
                productId: abc.productId,
                sellerId: abc.sellerId,
                userId: abc.userId,
                mKey: abc.mKey,
                sKey: abc.sKey,
                ssKey: abc.ssKey,
                createdAt: abc.createdAt,
                updatedAt: abc.updatedAt,
                __v: abc.__v
            }

            if(x.isSingleVariant){
                if(x.sellerId.isDeactivated){
                    isErr = true
                    errArr.push(`the seller "${x.sellerId.businessName}" of product ${x.productId.productName} is temporarly blocked`)
                }
            }
            if(x.isMultiVariant){
                if(x.sellerId.isDeactivated){
                    isErr = true
                    errArr.push(`the seller "${x.sellerId.businessName}" of product ${x.productId.productName} is temporarly blocked`)
                }
            }
            if(x.isSubVariant){
                if(x.sellerId.isDeactivated){
                    isErr = true
                    errArr.push(`the seller "${x.sellerId.businessName}" of product ${x.productId.productName} is temporarly blocked`)
                }
            }
        }
        resolve({
            isErr: isErr,
            errArr: errArr
        })
    })
}

const stockValidator = (arr) =>{
    return new Promise((resolve, reject) => {

        let isErr = false
        let errArr = []

        for (let i = 0; i < arr.length; i++) {

            let abc = arr[i]
            let x = {
                isSingleVariant: abc.isSingleVariant,
                isMultiVariant: abc.isMultiVariant,
                isSubVariant: abc.isSubVariant,
                quantity: abc.quantity,
                _id: abc._id,
                productId: abc.productId,
                sellerId: abc.sellerId,
                userId: abc.userId,
                mKey: abc.mKey,
                sKey: abc.sKey,
                ssKey: abc.ssKey,
                createdAt: abc.createdAt,
                updatedAt: abc.updatedAt,
                __v: abc.__v
            }

            if(x.isSingleVariant){
                if(x.quantity > x.productId.stock){
                    isErr = true
                    errArr.push(`the product ${x.productId.productName} is out of stock`)
                }
            }
            if(x.isMultiVariant){
                let variantArr = x.productId.multiVariantStock.filter(ab => ab.key === x.mKey)
                if(variantArr.length === 0){
                    isErr = true
                    errArr.push(`the product ${x.productId.productName} is removed by seller ${x.sellerId.businessName}`)
                }
                if(x.quantity > parseInt(variantArr[0].value)){
                    isErr = true
                    errArr.push(`the variant ${x.mKey} of product ${x.productId.productName} is out of stock`)
                }
            }
            if(x.isSubVariant){
                let skeyCheck = x.productId.subVariantStock[x.sKey]
                if(skeyCheck === undefined){
                    isErr = true
                    errArr.push(`the variant ${x.sKey} of product ${x.productId.productName} is removed by seller ${x.sellerId.businessName}`)
                }
               
                if(skeyCheck !== undefined){
                    let validateSub = skeyCheck.filter(z => z.subVariant === x.ssKey)
                    if(validateSub.length === 0){
                        isErr = true
                        errArr.push(`the sub variant ${x.ssKey} of variant ${x.sKey} of product ${x.productId.productName} is removed by seller ${x.sellerId.businessName}`)
                    }
                    if(validateSub.length !== 0 && x.quantity > validateSub[0].stock){
                        isErr = true
                        errArr.push(`the sub variant ${x.ssKey} of product ${x.productId.productName} is out of stock`)
                    }
                }
            }
        }
        resolve({
            isErr: isErr,
            errArr: errArr
        })
    })
}

exports.validateStock = (req, res) =>{
    Cart.updateMany({userId: req.params.userId}, {isProcessed: true}, (err, done) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        Cart.find({userId: req.params.userId, isProcessed: true}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion'}]).exec(async(err, cartList) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            } 
    
            let dV = await deactivationValidator(cartList)
            if(dV.isErr){
                return res.json({
                    status: false,
                    errArr: dV.errArr
                })
            }else{
                let sV = await stockValidator(cartList)
                if(sV.isErr){
                    return res.json({
                        status: false,
                        errArr: dV.errArr
                    }) 
                }else{
                    return res.json({
                        status: true
                    })
                }
            }
        })
    })
}

exports.lockQuantity = async(req, res) =>{
    Cart.find({userId: req.params.userId, isProcessed: true}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion'}]).exec(async(err, list) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        let obj = await helperFunction(list)
        // console.log(obj.finalList.filter(x => x.finalPrice === undefined).length)
        let hasNofinalPrice = obj.finalList.filter(x => x.finalPrice === undefined).map(x => {
            return {
              updateOne: {
                filter: { _id: x._id },
                update: { finalPrice: x.price, finalDcharge: x.dCharge, lastPriceUpdate: new Date() }
              }
            }
        })
        Cart.bulkWrite(hasNofinalPrice, {}, (err, hnfp) => {
            if (err) {
              return res.status(400).json({
                error: "Bulk operation failed"
              })
            }

            let myOperations = list.map(x => {
                return {
                  updateOne: {
                    filter: { _id: x._id },
                    update: { finalQuantity: x.quantity }
                  }
                }
            })
            
            Cart.bulkWrite(myOperations, {}, (err, locked) => {
                if (err) {
                  return res.status(400).json({
                    error: "Bulk operation failed"
                  })
                }
                Cart.find({userId: req.params.userId, isProcessed: true}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion'}]).exec((err, lockedList) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    } 
                    return res.json({
                        lockedList: lockedList
                    })
                })
            })
        })    
    })
}


