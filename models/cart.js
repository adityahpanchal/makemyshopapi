var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var cartSchema = new mongoose.Schema(
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
    quantity: {
        type: Number,
        default: 1
    },
    region:{
        type: String
    },
    finalPrice: {
        type: Number
    },
    finalQuantity: {
        type: Number
    },
    finalDcharge: {
        type: Number
    },
    lastPriceUpdate: {
        type: Date
    },
    isProcessed: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Cart", cartSchema);
