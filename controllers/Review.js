const BusinessProfile = require("../models/businessProfile")
const Report = require("../models/report")
const Review = require("../models/Review")
const SellerReview = require("../models/sellerReview")

exports.addReview = (req, res) =>{
    
    Review.findOne({userId: req.params.userId, productId: req.params.productId}, (err, review) =>{
        if(err){
            console.log('f')
            return res.status(400).json({
                error: err
            })
        }
        if(review){
            console.log('fg')
            return res.json({
                error: "You have already registered your feedback"
            })
        }
        if(!review){
            let newReview = new Review({
                userId: req.params.userId,
                productId: req.params.productId,
                stars: req.body.stars,
                feedback: req.body.feedback
            })
            newReview.save((err, rv) =>{
                if(err){
            console.log('fg')

                    return res.status(400).json({
                        error: err
                    })
                }
                return res.json({
                    status: true
                })
            })
        }
    })
}

exports.updateReview = (req, res) =>{
    Review.findOneAndUpdate({userId: req.params.userId, productId: req.params.productId}, {stars: req.body.stars, feedback: req.body.feedback}, (err, rv) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            status: true
        })
    })
}

exports.deleteReview = (req, res) =>{
    Review.deleteOne({userId: req.params.userId, productId: req.params.productId}, (err, rv) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            status: true
        })
    })
}

exports.getReviewsWithoutSignin = (req, res) =>{
    Review.find({productId: req.params.productId}).sort('-createdAt').exec((err, reviews) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }

        if(reviews.length > 0){
            let averageRating = reviews.map(x => x.stars).reduce((accum, curr) => accum + curr) / reviews.length
            console.log(averageRating)
            return res.json({
                reviews,
                averageRating,
                totalReviews: reviews.length
            })
        }else{
            return res.json({
                reviews,
                averageRating: 0,
                totalReviews: 0
            })
        }
    })
}

exports.getReviewsWithSignin = async(req, res) =>{

    let myReview = await Review.findOne({userId: req.params.userId, productId: req.params.productId})

    Review.find({productId: req.params.productId}).sort('-createdAt').populate({
        path: 'userId',
        select: {
            firstname: 1,
            lastname: 1,
            createdAt: 1
        }
    }).exec((err, reviews) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        
        if(reviews.length > 0){

            let averageRating = reviews.map(x => x.stars).reduce((accum, curr) => accum + curr) / reviews.length
            let reviewsArr = reviews.filter((x) => req.params.userId != x.userId._id)
            if(myReview){
                return res.json({
                    reviews: reviewsArr,
                    averageRating,
                    totalReviews: reviews.length,
                    hasMyReview: true,
                    myReview
                })
            }else{
                return res.json({
                    reviews,
                    averageRating,
                    totalReviews: reviews.length,
                    hasMyReview: false
                })
            }
        }else{
            return res.json({
                reviews,
                averageRating: 0,
                totalReviews: 0,
                hasMyReview: false
            })
        }
    })
}

exports.addReport = (req, res) =>{
    let complain = req.body.complain

    let newReport = new Report({
        sellerId: req.params.sellerId,
        userId: req.params.userId,
        complain: complain
    })
    newReport.save((err, reported) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            status: true
        })
    })
}

//populate with selected
//nested populate
//populate insdie populate

exports.getSellerReport = (req, res) =>{
    Report.find({status: false}).populate([{path: 'userId', select: 'firstname lastname'}, {path: 'sellerId', select: 'businessName deactivationStatus'}]).exec((err, reportList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            reportList
        })
    })
}

exports.getSellerReportCompleted = (req, res) =>{
    Report.find({status: true}).populate([{path: 'userId', select: 'firstname lastname'}, {path: 'sellerId', select: 'businessName deactivationStatus msg'}]).sort('-updatedAt').exec((err, reportList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            reportList
        })
    })
}

exports.deleteReport = (req, res) =>{
    Report.deleteOne({_id: req.params.reportId}, (err, deleted) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            status: true
        })
    })
}

exports.blockSeller = (req, res) =>{
    if(req.body.reset === 'n'){
        if(req.body.status === 'Stopped' && req.body.onlyWarn){
            console.log('0')
            BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, deactivationStatus: 'Stopped', warning: req.body.msg, isWarning: true}, (err, rv) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                Report.findOneAndUpdate({_id: req.params.reportId}, {status: true, isBlocked: false, warningMsg: req.body.msg, prevStatus: req.body.prevStatus}, (err, d) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            })
        }else if(req.body.status === 'Stopped' && !req.body.onlyWarn){
            console.log('a')
            BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, msg: req.body.msg, deactivationStatus: 'Stopped'}, (err, rv) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                Report.findOneAndUpdate({_id: req.params.reportId}, {status: true, isBlocked: true, blockMsg: req.body.msg, prevStatus: req.body.prevStatus}, (err, d) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            })
        }else if(req.body.onlyWarn){
            console.log('b')
            BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, { warning: req.body.msg, isWarning: true, deactivationStatus: 'Running'}, (err, rv) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                Report.findOneAndUpdate({_id: req.params.reportId}, {status: true, isBlocked: false, warningMsg: req.body.msg, prevStatus: req.body.prevStatus}, (err, d) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            })
        }else if(!req.body.onlyWarn){
            console.log('c')
            BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, msg: req.body.msg, deactivationStatus: 'Stopped'}, (err, rv) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                Report.findOneAndUpdate({_id: req.params.reportId}, {status: true, isBlocked: true, blockMsg: req.body.msg, prevStatus: req.body.prevStatus}, (err, d) =>{
                    if(err){
                        return res.status(400).json({
                            error: err
                        })
                    }
                    return res.json({
                        status: true
                    })
                })
            })
        }
    }

}

exports.removeBlock = (req, res) =>{
    //only remove warning
    if(req.params.warning === 'y' && req.params.block === 'n'){
        BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isWarning: false, warning: ''}, (err, rv) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    }
    //only remove block
    if(req.params.block === 'y' && req.params.warning === 'n'){
        BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: false, msg: '', deactivationStatus: 'Running'}, (err, rv) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    }
    //both remove 
    if(req.params.block === 'y' && req.params.warning === 'y'){
        BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: false, msg: '', deactivationStatus: 'Running', isWarning: false, warning: ''}, (err, rv) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    }
}

exports.addBlock = (req, res) =>{
    //only add warning
    if(req.params.warning === 'y' && req.params.block === 'n'){
        BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isWarning: true, warning: req.body.warning}, (err, rv) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    }
    //only add block
    if(req.params.block === 'y' && req.params.warning === 'n'){
        BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, msg: req.body.msg, deactivationStatus: 'Stopped'}, (err, rv) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    }
    //both add 
    if(req.params.block === 'y' && req.params.warning === 'y'){
        BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, msg: req.body.msg, deactivationStatus: 'Stopped', isWarning: true, warning: req.body.warning}, (err, rv) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    }
}

exports.addSellerAccReviewReq = (req, res) =>{
    SellerReview.findOneAndUpdate({sellerId: req.params.sellerId, isApproved: false}, {userId: req.params.userId, sellerId: req.params.sellerId, sellerText: req.body.sellerText, status: 'Pending', adminMsgOfBlock: req.body.adminMsgOfBlock, isCompleted: false}, {upsert: true, new: true, setDefaultsOnInsert: true}, (err, rvReq) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            rvReq
        })
    })
}

exports.rejectReviewReq = (req, res) =>{
    console.log('d')
    BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, deactivationStatus: 'Stopped'}, (err, rv) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        SellerReview.updateMany({sellerId: req.params.sellerId, _id: { $ne: req.params.reviewId}}, {isApproved: true}, (err, rvReq) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            SellerReview.findOneAndUpdate({_id: req.params.reviewId}, {status: 'Rejected', isCompleted: true, adminReply: req.body.adminReply, isApproved: false}, (err, rvReq) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                return res.json({
                    status: true
                })
            })
        })
    })
}

exports.rejectReviewYVALAReq = (req, res) =>{
    console.log('e')
    BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: true, deactivationStatus: 'Stopped', msg: req.body.msg}, (err, rv) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        SellerReview.updateMany({sellerId: req.params.sellerId, _id: { $ne: req.params.reviewId}}, {isApproved: true}, (err, rvReq) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            SellerReview.findOneAndUpdate({_id: req.params.reviewId}, {status: 'Rejected', isCompleted: true, adminReply: req.body.adminReply, isApproved: false}, (err, rvReq) =>{
                if(err){
                    return res.status(400).json({
                        error: err
                    })
                }
                return res.json({
                    status: true
                })
            })
        })
    })
}

exports.unblockReviewReq = (req, res) =>{
    BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isDeactivated: false, msg: '', deactivationStatus: 'Running'}, (err, rv) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        SellerReview.findOneAndUpdate({_id: req.params.reviewId}, {status: 'Approved', isCompleted: true, isApproved: true}, (err, rvReq) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true
            })
        })
    })
}

exports.getSellerReView = (req, res) =>{
    SellerReview.findOne({sellerId: req.params.sellerId, isApproved: false}, (err, sellerReview) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            sellerReview
        })
    })
}

exports.hideWarning = (req, res) =>{
    BusinessProfile.findOneAndUpdate({_id: req.params.sellerId}, {isWarning: false, warning: ''}, (err, rv) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            status: true
        })
    })
}

exports.getAllSellerReview = (req, res) =>{
    SellerReview.find({isCompleted: false}).populate([{path: 'userId', select: 'firstname lastname'}, {path: 'sellerId', select: 'businessName deactivationStatus msg'}]).exec((err, reportList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            reportList
        })
    })
}

exports.getAllSellerReviewCompleted = (req, res) =>{
    SellerReview.find({isCompleted: true}).populate([{path: 'userId', select: 'firstname lastname'}, {path: 'sellerId', select: 'businessName deactivationStatus msg'}]).sort('-updatedAt').exec((err, reportList) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        return res.json({
            reportList
        })
    })
}