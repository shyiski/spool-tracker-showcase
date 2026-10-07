const AUTH_COOKIE_NAME = 'token';
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME);
}

export function getRequestInfo(req) {
  return {
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown'
  };
}

export function sendError(res, error, defaultStatus = 400) {
  const status = error.statusCode || defaultStatus;
  res.status(status).json({
    error: error.message,
    ...(error.isLocked && {
      isLocked: true,
      remainingMinutes: error.remainingMinutes
    })
  });
}
