const RazorPay = require('razorpay')
const Cart = require('../models/cart')
const Order = require('../models/order')

const rPay = new RazorPay({
    key_id: 'rzp_test_XVDfNdUcaStwfX',
    key_secret: 'PtmYWvo5RlOyz9XNSDLiFNWV'
})

const makingTotal = (id) =>{
    return new Promise((resolve, reject) =>{
        Cart.find({userId: id, isProcessed: true}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion'}]).exec((err, arr) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            } 
            
            let priceTotal = {
                total: 0,
                products: 0,
                shipping: 0
            }
        
            for (let i = 0; i < arr.length; i++) {
                let x = arr[i];
                
                priceTotal.total = priceTotal.total + (x.finalQuantity * x.finalPrice) + x.finalDcharge
                priceTotal.products = priceTotal.products +  (x.finalQuantity * x.finalPrice)
                priceTotal.shipping = priceTotal.shipping + x.finalDcharge
            }
    
            resolve(priceTotal)
        })
    })
}

exports.razorPay = async(req, res) =>{

    const priceData = await makingTotal(req.params.userId)
    console.log(priceData)
    console.log(req.body)

    if(req.body.total === priceData.total && req.body.products === priceData.products && req.body.shipping === priceData.shipping){
        const payment_capture = 1
        const amount = priceData.total
        const currency = "INR"
        const receipt = req.params.userId
    
        const paymentObj = await rPay.orders.create({amount: (amount * 100).toString(), currency, receipt, payment_capture})
        return res.json({
            paymentObj
        })
    }else{
        return res.json({
            error: 'something went wrong plz try again' 
        })
    }
    
}

exports.createOrderDigital = (req, res) =>{
    Cart.find({userId: req.params.userId, isProcessed: true}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion'}]).exec(async(err, cartProductList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        const priceData = await makingTotal(req.params.userId)
        
        let myOrderBulkWrite = cartProductList.map(x => {
            return {
                userId: req.params.userId,
                sellerId: x.sellerId._id,
                productId: x.productId._id,
                addressId: req.params.addressId,
                transactionId: req.params.transactionId,
                orderId: req.params.orderId,
                quantity: x.finalQuantity,
                price: x.finalPrice,
                totalPrice: priceData.total,
                totalProductAmount: priceData.products,
                totalShippingCost: priceData.shipping,
                shippingCost: x.finalDcharge,
                isSingleVariant: x.isSingleVariant,
                isMultiVariant: x.isMultiVariant,
                isSubVariant: x.isSubVariant,
                mKey: x.mKey,
                sKey: x.sKey,
                ssKey: x.ssKey,
                orderStatus: 'Recieved',
                paymentMethod: 'Online'
            }
        })
        Order.insertMany(myOrderBulkWrite, (err, insertedProducts) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            } 
            Cart.deleteMany({userId: req.params.userId, isProcessed: true}, (err, sendStatus) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                } 
                return res.json({
                    status: true
                })
            })
        })
    })
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return `${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}`
}

const makeid = (length) => {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

exports.createOrderCOD = (req, res) =>{
    Cart.find({userId: req.params.userId, isProcessed: true}).populate([{path: 'productId'}, {path: 'sellerId', select: 'businessName sellingRegion'}]).exec(async(err, cartProductList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        const priceData = await makingTotal(req.params.userId)
        let tId = `codti_${makeid(6)}${getRandomInt(1, 6).toString()}${makeid(6)}`
        let oId = `codoi_${makeid(6)}${getRandomInt(1, 6)}${makeid(6)}`

        let myOrderBulkWrite = cartProductList.map(x => {
            return {
                userId: req.params.userId,
                sellerId: x.sellerId._id,
                productId: x.productId._id,
                addressId: req.params.addressId,
                transactionId: tId,
                orderId: oId,
                quantity: x.finalQuantity,
                price: x.finalPrice,
                totalPrice: priceData.total,
                totalProductAmount: priceData.products,
                totalShippingCost: priceData.shipping,
                shippingCost: x.finalDcharge,
                isSingleVariant: x.isSingleVariant,
                isMultiVariant: x.isMultiVariant,
                isSubVariant: x.isSubVariant,
                mKey: x.mKey,
                sKey: x.sKey,
                ssKey: x.ssKey,
                orderStatus: 'Recieved',
                paymentMethod: 'COD'
            }
        })
        Order.insertMany(myOrderBulkWrite, (err, insertedProducts) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            } 
            Cart.deleteMany({userId: req.params.userId, isProcessed: true}, (err, sendStatus) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                } 
                return res.json({
                    status: true
                })
            })
        })
    })
}

exports.getOrderByUserId = (req, res) =>{
    Order.find({userId: req.params.userId, orderStatus: {$in: ["Shipped", "Processing", "Recieved"]}}).populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName'}, {path: 'addressId'}]).sort('-createdAt').exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        return res.json({
            orders: orderList
        })
    })
}

exports.getOrderByUserIdRecent = (req, res) =>{
    Order.find({userId: req.params.userId, orderStatus: {$in: ['Delivered']}}).populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName'}, {path: 'addressId'}]).sort('-createdAt').exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        return res.json({
            orders: orderList
        })
    })
}

exports.getOrderStatusByUserId = (req, res) =>{
    Order.find({userId: req.params.userId, sellerId: req.params.sellerId, transactionId: req.params.transactionId})
    .populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName businessMobile businessAddress'}, {path: 'addressId'}])
    .exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        let priceData = {
            total: 0,
            product: 0,
            shipping: 0
        }

        orderList.map(x => {
            priceData.total = priceData.total + (x.price * x.quantity) + x.shippingCost
            priceData.product = priceData.product + (x.price * x.quantity)
            priceData.shipping = priceData.shipping + x.shippingCost 
        })
        console.log(priceData)

        return res.json({
            orders: orderList,
            priceData: priceData
        })
    })
}

exports.getOrdersBySellerId = (req, res) =>{
    Order.find({sellerId: req.params.sellerId, orderStatus: 'Recieved'}).populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName'}, {path: 'addressId'}, {path: 'userId', select: 'firstname lastname mobile email'}]).sort('-createdAt').exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        return res.json({
            orders: orderList
        })
    })
}

exports.getOrdersBySellerIdProcessing = (req, res) =>{
    Order.find({sellerId: req.params.sellerId, orderStatus: {$in: ["Shipped", "Processing"]}}).populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName'}, {path: 'addressId'}, {path: 'userId', select: 'firstname lastname mobile email'}]).sort('-createdAt').exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        return res.json({
            orders: orderList
        })
    })
}

exports.getOrdersBySellerIdRecent = (req, res) =>{
    Order.find({sellerId: req.params.sellerId, orderStatus: 'Delivered'}).populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName'}, {path: 'addressId'}, {path: 'userId', select: 'firstname lastname mobile email'}]).sort('-createdAt').exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        return res.json({
            orders: orderList
        })
    })
}

exports.getOrderStatusByUserIdForSellers = (req, res) =>{
    console.log(req.profile.businessId._id)
    Order.find({userId: req.params.buyerId, transactionId: req.params.transactionId, sellerId: req.profile.businessId._id})
    .populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName businessMobile businessAddress'}, {path: 'addressId'}])
    .exec((err, orderList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        } 

        let priceData = {
            total: 0,
            product: 0,
            shipping: 0
        }

        orderList.map(x => {
            priceData.total = priceData.total + (x.price * x.quantity) + x.shippingCost
            priceData.product = priceData.product + (x.price * x.quantity)
            priceData.shipping = priceData.shipping + x.shippingCost 
        })
        console.log(priceData)

        return res.json({
            orders: orderList,
            priceData: priceData
        })
    })
}

exports.updateDeliveryStatus = (req, res) =>{
    Order.updateMany({transactionId: req.params.transactionId, sellerId: req.profile.businessId._id, userId: req.params.buyerId}, {orderStatus: req.params.orderStatus}, (err, updateDeliveryStatus) => {
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        Order.find({userId: req.params.buyerId, transactionId: req.params.transactionId, sellerId: req.profile.businessId._id})
        .populate([{path: 'productId', select: 'productName images'}, {path: 'sellerId', select: 'businessName businessMobile businessAddress'}, {path: 'addressId'}])
        .exec((err, orderList) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            } 

            let priceData = {
                total: 0,
                product: 0,
                shipping: 0
            }

            orderList.map(x => {
                priceData.total = priceData.total + (x.price * x.quantity) + x.shippingCost
                priceData.product = priceData.product + (x.price * x.quantity)
                priceData.shipping = priceData.shipping + x.shippingCost 
            })
            console.log(priceData)

            return res.json({
                status: true,
                orders: orderList,
                priceData: priceData
            })
        })
    })
}