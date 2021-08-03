var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var sellerApprovalSchema = new mongoose.Schema(
  {
    businessId: {
      type: ObjectId,
      ref: "BusinessProfile"
    },
    userId: {
        type: ObjectId,
        ref: "User"
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    message: {
        type: String,
        trim: true
    },
    reSubmit:{
        type: Boolean
    },
    logo:{
      type: Boolean,
    },
    bankAccountNumber:{
      type: Boolean
    },
    businessName: {
      type: Boolean
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerApproval", sellerApprovalSchema)