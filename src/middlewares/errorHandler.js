// 404 Handler — Route Not Found
exports.notFound = (req, res, next) => {
  res.status(404);

  return res.json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};



exports.errorHandler = (err, req, res, next) => {
 
  if (res.headersSent) {
    return next(err);
  }

 
  console.error("SERVER ERROR:", err);


  const statusCode = err.statusCode || err.status || 500;


  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };


  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
