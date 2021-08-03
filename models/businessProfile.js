const { reject } = require('lodash')
const mongoose = require('mongoose')

var businessProfileSchema = new mongoose.Schema({
    businessName: {
        type: String,
        trim: true
    },
    businessMobile: {
        type: Number,
        required: true,
        trim: true
    },
    businessLogo: {
        url: {
            type: String
        }
    },
    businessAddress: {
        addressLineOne:{
            type: String
        },
        addressLineTwo:{
            type: String
        },
        pincode:{
            type: String,
            maxlength: 6
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        }
    },
    businessEmail: {
        emailId: {
            type: String,
            trim: true
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    sellerType: {
        type: String,
        trim: true,
        enum: ['wholesale', 'retail', 'both']
    },
    gst: {
        gstNumber:{
            type: String,
            trim: true
        },
        isVerified: {
            type: String,
            required: true,
            default: 'pending',
            enum: ["true", 'pending', 'reject']
        }
    },
    bankAccount:{
        url: {
            type: String,
            trim: true
        },
        docType: {
            type: String,
            trim: true
        },
        bankAccountNumber: {
            type: String,
            trim: true
        },
        isVerified: {
            type: String,
            required: true,
            default: "pending",
            enum: ["true", "pending", 'reject']
        }
    },
    identity:{
        url: {
            type: String,
            trim: true
        },
        docType: {
            type: String,
            trim: true
        },
        isVerified: {
            type: String,
            required: true,
            default: 'pending',
            enum: ["true", "pending", 'reject']
        }
    },
    panCard:{
        url: {
            type: String,
            trim: true
        },
        isVerified: {
            type: String,
            required: true,
            default: 'pending',
            enum: ["true", "pending", 'reject']
        }
    },
    sellingRegion:{
        type: String,
        trim: true
    },
    sellingPermission:{
        type: String,
        trim: true,
        enum: ['All', 'Books']
    },
    registrationStatus: {
        type: Number,
        required: true,
        default: 0
    },
    hits: {
        type: Number,
        default: 0
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    deactivationStatus: {
        type: String,
        enum: ['Running', 'Under Review', 'Stopped'],
        default: 'Running'
    },
    msg: {
        type: String
    },
    warning: {
        type: String
    },
    isWarning: {
        type: Boolean
    }
}, {timestamps: true})

businessProfileSchema.index({'$**': 'text'})
 
module.exports = mongoose.model("BusinessProfile", businessProfileSchema)
