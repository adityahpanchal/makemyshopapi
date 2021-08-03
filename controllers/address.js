const Address = require('../models/address')
const _ = require("lodash");

exports.createAddress = (req, res) =>{
    Address.find({userId: req.profile._id, isDeactivated: false}, (err, list) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        let address 
        if(list.length === 0){
            address = new Address({...req.body, isDefault: true})
        }else{
            address = new Address({...req.body}) 
        }
        address.userId = req.profile._id
        address.save((err, address) =>{
            if(err){
                return res.status(400).json({
                    error: err
                })
            }
            return res.json({
                status: true,
                id: address._id
            })
        })
    })
}

exports.getAddressById = (req, res, next, id) =>{
    Address.findOne({userId: req.params.userId, _id: id}, (err, address) =>{
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        if(address){
            req.address = address
            next()
        }else{
            return res.status(400).json({
                error: 'address not found'
            })
        }
    })
}

exports.getAddress = (req, res) =>{
    return res.json({
        address: req.address
    })
}

exports.updateAddress = (req, res) =>{
    let address = req.address
    let updateSource = req.body
    address = _.extend(address, updateSource)
    address.save((err, address) =>{
        if(err){
            return res.status(400).json({
                error: 'user not found'
            })
        }
        return res.json({
            status: true,
            id: address._id
        })
    })
}

exports.deleteAddress = (req, res) =>{
    let address = req.address
    address.isDeactivated = true
    address.save((err, address) =>{
        if(err){
            return res.status(400).json({
                error: 'user not found'
            })
        }
        return res.json({
            status: "ok"
        })
    })
}

exports.getAllAddress = (req, res) =>{
    Address.find({userId: req.profile._id, isDeactivated: false}, (err, addressList) =>{
        if(err){
            return res.status(400).json({
                error: 'user not found'
            })  
        }
        return res.json({
            allAddress: addressList
        })
    })
}

exports.makeDefaultAddress = async(req, res) =>{

    await Address.findOneAndUpdate({userId: req.params.userId, isDefault: true}, {isDefault: false})
    Address.findOneAndUpdate({_id: req.params.addressId, userId: req.params.userId}, {isDefault: true}, (err, result) =>{
        if(err){
            return res.status(400).json({
                error: 'something wents wrong'
            })
        }
        return res.json({
            status: true
        })
    })
}