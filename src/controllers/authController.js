const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.signup = async (req,res,next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if(existing) return res.status(409).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash: hash });
    await user.save();

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    logger.info('New user signup', { userId: user._id, email: user.email });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch(err){ next(err); }
};

exports.signin = async (req,res,next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if(!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch(err){ next(err); }
};
