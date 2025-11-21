exports.notFound = (req,res,next) => {
  res.status(404).json({ message: 'Route not found' });
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  // send stack trace only in development
  const payload = { message };
  if(process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.status(status).json(payload);
};
