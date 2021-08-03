const express = require('express')
const router = express.Router()
const path = require('path')
router.get('/seller/docs/:docType/:imgId', (req, res) =>{
    const imgId = req.params.imgId
    const folder = req.params.docType
    const filePath = path.join(__dirname, `../images/${folder}/${imgId}`)
    // console.log(filePath)
    return res.sendFile(filePath)
})

module.exports = router