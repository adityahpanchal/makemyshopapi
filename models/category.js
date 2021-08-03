var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var categorySchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User"
    },
    category:{
        type: String,
        required: true
    },
    icon:{
        type: String
    },
    lastUpdatedBy:{
        type: ObjectId,
        ref: "User"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Category", categorySchema);
