var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var sellerReviewSchema = new mongoose.Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "BusinessProfile"
    },
    userId: {
        type: ObjectId,
        ref: "User"
    },
    sellerText: {
        type: String,
        required: true,
    },
    adminReply: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Rejected', 'Approved']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    adminMsgOfBlock: {
        type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerReview", sellerReviewSchema) 