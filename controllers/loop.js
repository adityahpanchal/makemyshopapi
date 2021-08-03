const crypto = require('crypto')

const encrypassword = (plainpassword, salt) =>{
    return crypto.createHmac("sha256", salt).update(plainpassword).digest("hex")
}

console.log(encrypassword('aditya', '110087e0-6601-11eb-9de3-b3bd9763e158'))
console.log('4b470a8d4f2827145c3f04a599b4adb5622a654335524ca459f93f2d82e9c2ba')

// let str = ''
// let n = 3

// for(let i=0; i<=n; i++){
//     for(let j=i; j<=n; j++){
//         str += String.fromCharCode(j + 65)
//     }
//     str += '\n'
// }

// console.log(str)


// //update password
// exports.sendUpadatePassOTP = (req, res) =>{
//     const authCredentials = req.authCredentials
//     const newPassword = req.body.password
//     const {encry_password, salt, mobile} = req.profile
//     if(encry_password == encrypassword(newPassword, salt)){
//         return res.json({
//             error: 'new password cannot be same as previous password'
//         })
//     }

//     const otpNumber = getRandomInt(1, 6)
//     const otpID = otpIdgenerator()

//     authCredentials.updatePassword.otp = otpNumber
//     authCredentials.updatePassword.otpID = otpID
//     authCredentials.updatePassword.newPassword = encrypassword(newPassword, salt)
//     authCredentials.updatePassword.tryCount = 0
//     authCredentials.updatePassword.isUsed = false
//     authCredentials.lastUpdateFor = "password"
//     authCredentials.save((err, authCred) =>{
//         if(err){
//             return res.status(400).json({
//                 error: 'something went wrong'
//             })
//         }
//         otpSender(otpNumber, mobile)
//         return res.json({
//             otpID: authCred.updatePassword.otpID
//         })
//     })
// }

// exports.updatePassword = (req, res) =>{
//     const {otpByUser, otpIdByUser} = req.body
//     const {_id} = req.profile

//     AuthCredentials.findOne({userId: _id, "updatePassword.otpID": otpIdByUser}, (err, authCred) =>{
//         if(err){
//             return res.status(400).json({
//                 error: 'something went wrong'
//             })  
//         }
//         if(authCred && authCred.lastUpdateFor == "password"){
//             const {otp, newPassword, tryCount, isUsed} = authCred.updatePassword
//             const currentTime = new Date()
//             const expireTime = new Date(authCred.updatedAt)
//             expireTime.setMinutes(expireTime.getMinutes() + 3)
//             if(otp == otpByUser && tryCount <= 2 && isUsed == false && currentTime < expireTime){
                
//                 authCred.updatePassword.tryCount = authCred.updatePassword.tryCount + 1
//                 authCred.updatePassword.isUsed = true
//                 authCred.save((err, authCred) =>{
//                     if(err){
//                         return res.status(400).json({
//                             error: "Something went wrong"
//                         }) 
//                     }
//                     const user = req.profile
//                     user.encry_password = newPassword
//                     user.save((err, user) =>{
//                         if(err){
//                             return res.json({
//                                 error: 'something went wrong'
//                             })
//                         }
//                         return res.json({
//                             user
//                         })
//                     })
//                 })
//             }else if(tryCount <= 2 && isUsed == false && currentTime < expireTime){
//                 authCred.updatePassword.tryCount = authCred.updatePassword.tryCount + 1
//                 authCred.save((err, updatedOTP) =>{
//                     if(err){
//                         return res.status(400).json({
//                             error: "Something went wrong"
//                         }) 
//                     }
//                     return res.status(401).json({
//                         error: "invalid otp please try again"
//                     })
//                 })
//             }else if(tryCount >= 2 && isUsed == false && currentTime < expireTime){
//                 return res.status(401).json({
//                     error: "Sorry, you have exceeded the maximum number of attempts to verify your mobile"
//                 })
//             }else if(currentTime > expireTime){
//                 return res.status(401).json({
//                     error: "Timeout please try resend"
//                 })
//             }else{
//                 return res.status(401).json({
//                     error: "invalid otp"
//                 })
//             }
//         }else{
//             return res.status(400).json({
//                 error: "Invalid otp"
//             })
//         }
//     })
// }

