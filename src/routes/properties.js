const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const propertyController = require('../controllers/propertyController');
const { authMiddleware } = require('../middlewares/auth');
const uploadCloud = require('../middlewares/cloudinaryUpload');  


router.get('/', propertyController.list);


router.get('/:id', propertyController.getById);


router.post(
  '/',
  authMiddleware,
  uploadCloud.array("images", 8),  
  [
    body("title").isLength({ min: 3 }).withMessage("Title is required"),
    body("price").isNumeric().withMessage("Price must be a number")
  ],
  propertyController.create
);


router.put(
  '/:id',
  authMiddleware,
  uploadCloud.array("images", 8), 
  propertyController.update
);


router.delete('/:id', authMiddleware, propertyController.remove);

module.exports = router;
