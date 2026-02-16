const cloudinary = require('cloudinary');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'foodieHub_DEV',
       allowed_formats: ["png", "jpg", "jpeg"],
    
    },
  });
console.log("Cloudinary config:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY);
module.exports = {
    cloudinary, storage
}