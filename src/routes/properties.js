const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authMiddleware } = require('../middlewares/auth');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null, uploadDir),
  filename: (req,file,cb)=> cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'-'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// list with search/filter/pagination
router.get('/', propertyController.list);

// get single
router.get('/:id', propertyController.getById);

// protected create
router.post('/', authMiddleware, upload.array('images', 8), [
  body('title').isLength({min:3}).withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number')
], propertyController.create);

// update
router.put('/:id', authMiddleware, upload.array('images', 8), propertyController.update);

// delete
router.delete('/:id', authMiddleware, propertyController.remove);

module.exports = router;
