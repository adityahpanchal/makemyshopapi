var mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var subCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User"
    },
    categoryId:{
        type: ObjectId,
        ref: "Category"
    },
    icon:{
        type: String
    },
    subCategory: {
        type: String,
        required: true
    },
    lastUpdatedBy:{
        type: ObjectId,
        ref: "User"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("SubCategory", subCategorySchema);
