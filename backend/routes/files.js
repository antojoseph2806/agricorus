const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// 📦 GridFS variables
let gfs;
mongoose.connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads' // must match your multer GridFS bucket name
  });
  console.log("✅ GridFS ready for file retrieval");
});

// 📂 GET file by filename
router.get('/:filename', (req, res) => {
  if (!gfs) {
    return res.status(500).json({ error: "GridFS not initialized" });
  }

  gfs.find({ filename: req.params.filename }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'No file found' });
    }

    const file = files[0];
    const mimeType = file.contentType || 'application/octet-stream';
    res.set('Content-Type', mimeType);

    const readStream = gfs.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  });
});

// 📂 GET file by ID
router.get('/id/:id', (req, res) => {
  if (!gfs) {
    return res.status(500).json({ error: "GridFS not initialized" });
  }

  try {
    const readStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(req.params.id));
    readStream.on('error', () => res.status(404).json({ error: 'File not found' }));
    readStream.pipe(res);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid file ID' });
  }
});

module.exports = router;
