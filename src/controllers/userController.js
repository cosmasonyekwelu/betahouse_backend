const User = require('../models/User');

exports.me = async (req,res,next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch(err){ next(err); }
};

exports.updateMe = async (req,res,next) => {
  try {
    const updates = req.body;
    // don't allow password updates here; separate endpoint would handle password changes
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-passwordHash');
    res.json({ user });
  } catch(err){ next(err); }
};
