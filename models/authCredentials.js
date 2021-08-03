const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

var authCredentialsSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: "User"
    },
    mobile: {
        type: Number,
        required: true,
        maxlength: 10
    },
    updatePassword: {
        otp: {
            type: Number,
            maxlength: 6,
            trim: true
        },
        otpID: {
            type: String,
            trim: true
        },
        newPassword:{
            type: String,
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
    },
    updateMobile: {
        otpForCurrentMobile: {
            type: Number,
            maxlength: 6,
            trim: true
        },
        otpForNewMobile: {
            type: Number,
            maxlength: 6,
            trim: true
        },
        otpID: {
            type: String,
            trim: true
        },
        currentMobile:{
            type: Number,
            trim: true
        },
        newMobile:{
            type: Number,
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
        },   
    },
    updateEmail:{
        otpForCurrentEmail: {
            type: String,
            trim: true
        },
        otpForNewEmail: {
            type: String,
            trim: true
        },
        otpID: {
            type: String,
            trim: true
        },
        currentEmail:{
            type: String,
            trim: true
        },
        newEmail:{
            type: String,
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
    },
    businessRegistration:{
        otpID: {
            type: String,
            trim: true
        },
        otp:{
            type: Number,
            trim: true
        },
        mobile:{
            type: Number,
            trim: true
        },
        tryCount: {
            type: Number,
            required: true,
            default: 0
        },
        isUsed: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    lastUpdateFor: {
        type: String
    }
}, {timestamps: true})


module.exports = mongoose.model("AuthCredentials", authCredentialsSchema)
