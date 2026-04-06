const enforceHttpsInProduction = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const isForwardedHttps = typeof forwardedProto === 'string'
    ? forwardedProto.split(',')[0].trim() === 'https'
    : false;

  if (req.secure || isForwardedHttps) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'HTTPS is required in production',
  });
};

module.exports = {
  enforceHttpsInProduction,
};
