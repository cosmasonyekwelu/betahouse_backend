const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const propertyRoutes = require('./properties');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);

router.get('/', (req,res)=> res.json({ message: 'BetaHouse API' }));

module.exports = router;
