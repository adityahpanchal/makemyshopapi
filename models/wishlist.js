var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User"
    },
    productId:{
        type: ObjectId,
        ref: "Product"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Wishlist", wishlistSchema);
