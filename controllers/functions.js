const unirest = require('unirest')
const crypto = require("crypto")
const nodemailer = require('nodemailer')

exports.otpSender = (otp, mobile) =>{

    var req = unirest("POST", "https://www.fast2sms.com/dev/bulk")

        req.headers({
            "content-type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
            "authorization": "tMjXifrcoWQR04DyYSB1vzU6AKl5OgIPEhNJauLbH2sqCVmwGFYoX3B2zKjTqiHr69hI4tALUwJaQpfR"
        })

        req.form({
            "sender_id": "FSTSMS",
            "language": "english",
            "route": "qt",
            "numbers": `${mobile}`,
            "message": "39208",
            "variables": "{#BB#}",
            "variables_values": otp
        })

        req.end(function (res) {

        if (res.error){
            res.destroy()
        }else{
            console.log('OTP Sent')
        }
    })
}
 
//random 6 digit number generator
exports.getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return `${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}${Math.floor(Math.random() * (max - min) + min)}`
}

//random string generator
const makeid = (length) => {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}
 
//otp id generator
exports.otpIdgenerator = () =>{
    const date = new Date()
    return `${makeid(5)}${date.toJSON()}${makeid(3)}`
}


exports.encrypassword = (plainpassword, salt) =>{
    return crypto.createHmac("sha256", salt).update(plainpassword).digest("hex")
}

exports.emailSender = (otpNumber, email) =>{
    
    if(email !== undefined){
        let transporter = nodemailer.createTransport({
            host: "smtp.hostinger.in",
            port: 587,
            secure: false,
            auth: {
                user: "developers@hinduhelpline.in", 
                pass: "Hhl1@developer", 
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    
        transporter.sendMail({
            from: '"Aditya Panchal" <developers@hinduhelpline.in>',
            to: email, 
            subject: "Hello ✔", 
            text: "Hello world?", 
            html: `<h1 style='color:blue;'>your otp is ${otpNumber}</h1>`
        }).then((data) =>{
            console.log(data)
        })
    }
}



// exports.emailSender = async(otpNumber, email) =>{
    
//     if(email !== undefined){
//         let transporter = nodemailer.createTransport({
//             host: "mail.connectweb.in",
//             port: 587,
//             secure: false,
//             auth: {
//                 user: "hello@connectweb.in", 
//                 pass: "Priyanshu@1919", 
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });
    
//         let resp = await transporter.sendMail({
//             from: '"Aditya Panchal" <developers@hinduhelpline.in>',
//             to: email, 
//             subject: "Hello ✔", 
//             text: "Hello world?", 
//             html: `<h1 style='color:blue;'>your otp is ${otpNumber}</h1>`
//         })

//         console.log(resp)
//     }
// }


// const path = require('path')

// console.log(path.join(`${__dirname}/../upload`))