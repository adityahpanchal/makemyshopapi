var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var productSchema = new mongoose.Schema(
  {
    userId: {
        type: ObjectId,
        ref: "User"
    },
    sellerId: {
        type: ObjectId,
        ref: "BusinessProfile"
    },
    productName:{
        type: String,
        required: true,
        text: true
    },
    category:{
        type: ObjectId,
        ref: "Category"
    },
    subCategory: {
        type: ObjectId,
        ref: "SubCategory"
    },
    maxQauntity: {
        type: Number,
        required: true
    },
    dCharge: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    specifications: {
        type: Array
    },
    isSingleVariant: {
        type: Boolean,
        default: false
    },
    mrp: {
        type: Number
    },
    price: {
        type: Number
    },
    stock:{
      type: Number  
    },
    isMultiVariant:{
        type: Boolean,
        default: false
    },
    multiVariantStock: {
        type: Array
    },
    isSubVariant:{
        type: Boolean,
        default: false
    },
    subVariantStock:{
        type: Object
    },
    images: {
        type: Array
    },
    deactivated: {
        type: Boolean,
        default: false
    },
    hits:{
        type: Number,
        default: 0
    }
  },
  { timestamps: true }
)

productSchema.index({productName: 'text', description: 'text'})

module.exports = mongoose.model("Product", productSchema);
