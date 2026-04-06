const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const createRateLimiter = ({
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = 100,
  message = 'Too many requests. Please try again later.',
  keyGenerator,
}) => {
  const hits = new Map();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }
  }, Math.max(30_000, Math.floor(windowMs / 2)));

  if (typeof cleanupInterval.unref === 'function') {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    next();
  };
};

const loginRateLimiter = createRateLimiter({
  windowMs: parsePositiveInteger(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  maxRequests: parsePositiveInteger(process.env.LOGIN_RATE_LIMIT_MAX, 10),
  message: 'Too many login attempts. Please wait before trying again.',
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    return `${getClientIp(req)}:${email}`;
  },
});

const adminRateLimiter = createRateLimiter({
  windowMs: parsePositiveInteger(process.env.ADMIN_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
  maxRequests: parsePositiveInteger(process.env.ADMIN_RATE_LIMIT_MAX, 120),
  message: 'Too many admin requests. Please slow down and retry shortly.',
  keyGenerator: (req) => `${getClientIp(req)}:${req.user?.id || 'anonymous'}`,
});

module.exports = {
  createRateLimiter,
  loginRateLimiter,
  adminRateLimiter,
};
