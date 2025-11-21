const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/me', authMiddleware, userController.me);
router.put('/me', authMiddleware, userController.updateMe);

module.exports = router;
