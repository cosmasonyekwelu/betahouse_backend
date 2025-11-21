const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary Storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "betahouse/properties",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [
        { width: 1600, height: 900, crop: "limit" } // prevents large images
      ]
    };
  }
});

// Multer upload middleware (NO file size limit — Cloudinary handles it)
const uploadCloud = multer({
  storage,
  limits: {
    files: 8 // maximum 8 images
  }
});

module.exports = uploadCloud;
