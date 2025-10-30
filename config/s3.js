require("dotenv").config();
// config.js
module.exports = {
    bucketName: process.env.s3_bucketName,
    awsAccessKeyId: process.env.s3_awsAccessKeyId,
    awsSecretAccessKey: process.env.s3_awsSecretAccessKey,
    region: process.env.s3_region,
  };
