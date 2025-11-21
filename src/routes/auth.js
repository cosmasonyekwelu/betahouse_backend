const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', [
  body('name').isLength({min:2}).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Provide a valid email'),
  body('password').isLength({min:8}).withMessage('Password must be at least 8 characters')
], authController.signup);

router.post('/signin', [
  body('email').isEmail().withMessage('Provide a valid email'),
  body('password').exists().withMessage('Password is required')
], authController.signin);

module.exports = router;
