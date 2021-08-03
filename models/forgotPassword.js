const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

var ForgotPasswordOTPSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "User"
    },
    otp: {
        type: Number,
        required: true,
        maxlength: 6,
        trim: true
    },
    otpID: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: Number,
        required: true,
        trim: true
    },
    isUsed: {
        type: Boolean,
        required: true,
        default: false
    },
    tryCount: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true})


module.exports = mongoose.model("ForgotPasswordOTP", ForgotPasswordOTPSchema)
