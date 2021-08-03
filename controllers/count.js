const Cart = require("../models/cart");
const Category = require("../models/category");
const SellerApproval = require("../models/SellerApproval");
const SubCategory = require("../models/subcategory");
const User = require("../models/user")
const Order = require("../models/order")
const Product = require("../models/Product")

exports.adminCounter = async(req, res) =>{
    //status:0 new registration (status: false, reSubmit: undefined)
    //status: 1 resubmit (status: false, reSubmit: true)
    //status: 2 completed (status: true, isApproved: false)
    //status: 3 active sellers (status: true, isApproved: true)
    let zero = {status: false,  reSubmit: {$exists: false} }
    let one = {status: false, reSubmit: true}
    let two = {status: true, isApproved: false}
    let three = {status: true, isApproved: true}

    const query = (n) =>{
        switch (n) {
            case '0':
                return zero
            case '1':
                return one
            case '2':
                return two
            case '3':
                return three
            default:
                break;
        }
    }
    let newSellerRequestCount = await SellerApproval.find(query('0')).countDocuments()
    let resubmitedSellerCount = await SellerApproval.find(query('1')).countDocuments()
    let completedSellerCount = await SellerApproval.find(query('2')).countDocuments()
    let activeSellerCount = await SellerApproval.find(query('3')).countDocuments()

    let activeUserCount = await User.find({deactivated: false}).countDocuments()
    let userCount = await User.find({}).countDocuments()

    let categoryCount = await Category.find({}).countDocuments()
    let subCategoryCount = await SubCategory.find({}).countDocuments()

    return res.json({
        newSellerRequestCount,
        resubmitedSellerCount,
        completedSellerCount,
        activeSellerCount,
        activeUserCount,
        userCount,
        categoryCount,
        subCategoryCount
    })
}

exports.cartCounter = async(req, res) =>{
    let cartCount = await Cart.find({userId: req.params.userId}).countDocuments()
    return res.json({
        cartCount: cartCount
    })
}

exports.getOrderAndProductCount = async(req, res) => {
    let completedOrders = await Order.find({orderStatus: 'Delivered', sellerId: req.params.sellerId}).countDocuments()
    let pendingOrders = await Order.find({orderStatus: {$in: ["Cancelled", "Shipped", "Processing", "Recieved"]}, sellerId: req.params.sellerId}).countDocuments()
    let productTotal = await Product.find({sellerId: req.params.sellerId, deactivated: false}).countDocuments()

    return res.json({
        completedOrders,
        pendingOrders,
        productTotal
    })
}