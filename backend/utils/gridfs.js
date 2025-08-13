// utils/gridfs.js
const mongoose = require('mongoose');
let gfsBucket = null;

function initGridFS(connection) {
  if (!connection) connection = mongoose.connection;
  gfsBucket = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: 'uploads' });
  return gfsBucket;
}

function getBucket() {
  if (!gfsBucket) throw new Error('GridFSBucket not initialized');
  return gfsBucket;
}

module.exports = { initGridFS, getBucket };
