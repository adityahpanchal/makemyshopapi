var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var hitSchema = new mongoose.Schema(
  {
    ip: {
        type: String,
        required: true
    },
    productId: {
        type: ObjectId,
        ref: "Product"
    },
    sellerId: {
        type: ObjectId,
        ref: "BusinessProfile"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Hit", hitSchema);
