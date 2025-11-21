const jwt = require('jsonwebtoken');

exports.authMiddleware = (req,res,next) => {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ message: 'No token provided' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ message: 'Token error' });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch(err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
