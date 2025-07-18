// utils/s3.js

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.deleteS3File = async (fileKey) => {
  if (!fileKey) return;

  const params = {
    Bucket: 'powerhouseassets',
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`File deleted from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Failed to delete file from S3: ${fileKey}`, error);
    // Optional: throw error to stop process or just log it
  }
};
