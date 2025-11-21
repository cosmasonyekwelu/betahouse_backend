const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const propertyController = require('../controllers/propertyController');
const { authMiddleware } = require('../middlewares/auth');
const uploadCloud = require('../middlewares/cloudinaryUpload');  // <-- NEW

// list
router.get('/', propertyController.list);

// get one
router.get('/:id', propertyController.getById);

// create
router.post(
  '/',
  authMiddleware,
  uploadCloud.array("images", 8),  // <-- now uploads to Cloudinary
  [
    body("title").isLength({ min: 3 }).withMessage("Title is required"),
    body("price").isNumeric().withMessage("Price must be a number")
  ],
  propertyController.create
);

// update
router.put(
  '/:id',
  authMiddleware,
  uploadCloud.array("images", 8), 
  propertyController.update
);

// delete
router.delete('/:id', authMiddleware, propertyController.remove);

module.exports = router;
