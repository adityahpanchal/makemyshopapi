var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: ObjectId,
      ref: "Product"
    },
    userId: {
        type: ObjectId,
        ref: "User"
    },
    stars: {
        type: Number,
        required: true,
    },
    feedback: {
        type: String,
        required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema) 