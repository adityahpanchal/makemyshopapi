var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var reportSchema = new mongoose.Schema(
  {
    sellerId: {
      type: ObjectId,
      ref: "BusinessProfile"
    },
    userId: {
        type: ObjectId,
        ref: "User"
    },
    complain: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false 
    },
    blockMsg: {
        type: String
    },
    warningMsg: {
        type: String
    },
    prevStatus: {
        type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema) 