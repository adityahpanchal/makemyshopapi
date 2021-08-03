let multer = require('multer')
let path = require('path')

exports.storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(`${__dirname}/../profile`));
    },
    filename: (req, file, callback) => {
      const match = ["image/png", "image/jpeg"];
  
      if (match.indexOf(file.mimetype) === -1) {
        var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
        return callback(message, null);
      }
  
      var filename = `${Date.now()}-bezkoder-${file.originalname}`;
      callback(null, filename);
    }
})