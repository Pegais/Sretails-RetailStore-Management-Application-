// services/s3UploadService.js
const AWS = require('aws-sdk');
const sharp = require('sharp'); // Image compression

const s3 = new AWS.S3({
  accessKeyId: process.env.S3AccessKey,
  secretAccessKey: process.env.S3SecretKey,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const buildKey = (storeId, fileName, folder = 'bills') =>
  `${folder}/${storeId}/${Date.now()}-${fileName}`

exports.uploadBillImage = async (buffer, fileName, storeId) => {
  try {
    // 1. Compress image (reduce size by 70%)
    const compressedBuffer = await sharp(buffer)
      .resize(1920, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // 2. Upload to S3
    const key = buildKey(storeId, fileName);
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: compressedBuffer,
      ContentType: 'image/jpeg',
      ACL: 'private' // Not public
    };

    const result = await s3.upload(params).promise();
    
    return {
      s3Url: result.Location,
      s3Key: result.Key,
      size: compressedBuffer.length
    };

  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload to S3');
  }
};

exports.uploadBillFile = async (buffer, fileName, storeId, options = {}) => {
  try {
    const key = buildKey(storeId, fileName, options.folder || 'bills')

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || 'application/octet-stream',
      ACL: 'private',
    }

    const result = await s3.upload(params).promise()

    return {
      s3Url: result.Location,
      s3Key: result.Key,
      size: buffer.length,
    }
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw new Error('Failed to upload to S3')
  }
}

// Get signed URL for viewing (temporary access)
exports.getSignedUrl = (s3Key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Expires: 3600 // 1 hour
  };
  
  return s3.getSignedUrl('getObject', params);
};