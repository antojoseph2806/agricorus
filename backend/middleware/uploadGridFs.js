// middleware/uploadGridFs.js
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/agricorus';

// configure storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname);
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString('hex') + Date.now() + ext;
        const fileInfo = {
          filename,
          bucketName: 'uploads' // collection: uploads.files & uploads.chunks
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

module.exports = upload;
