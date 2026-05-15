const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
const upload = multer({ 
    storage,
    limits: {
    fileSize: 1 * 1024 * 1024,
  },
})

module.exports = upload