const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema;

var addressSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true
    },
    fullname: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true
    },
    mobile: {
      type: Number,
      required: true,
      maxlength: 10,
      trim: true
    },
    altMobile:{
        type: Number,
        maxlength: 10,
        trim: true
    },
    pincode: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 6
    },
    state: {
      type: String,
      trim: true,
      required: true
    },
    city: {
        type: String,
        trim: true,
        required: true 
    },
    houseNumberandBuilding: {
        type: String,
        trim: true,
        required: true 
    },
    area: {
        type: String,
        trim: true,
        required: true
    },
    famousSpot: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        trim: true,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isDeactivated: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema)
