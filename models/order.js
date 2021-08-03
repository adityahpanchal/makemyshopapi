var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var orderSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User"
    },
    sellerId: {
        type: ObjectId,
        ref: "BusinessProfile"
    },
    productId:{
        type: ObjectId,
        ref: "Product"
    },
    addressId: {
        type: ObjectId,
        ref: "Address"
    },
    transactionId: {
        type: String
    },
    orderId: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number
    },
    totalPrice:{
        type: Number
    },
    totalProductAmount:{
        type: Number
    },
    totalShippingCost:{
        type: Number
    },
    isSingleVariant: {
        type: Boolean,
        default: false
    },
    isMultiVariant: {
        type: Boolean,
        default: false
    },
    isSubVariant: {
        type: Boolean,
        default: false
    },
    mKey: {
        type: String
    },
    sKey:{
        type: String
    },
    ssKey: {
        type: String
    },
    orderStatus: {
        type: String,
        default: "Recieved",
        enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Recieved"]
    },
    paymentMethod: {
        type: String,
        enum: ["Online", "COD"]
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema);
