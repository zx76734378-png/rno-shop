const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'rno-shop-dev-secret-do-not-use-in-prod');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? null : 'rno-shop-dev-refresh-do-not-use-in-prod');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (process.env.NODE_ENV === 'production') {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in production environment');
  }
  if (JWT_SECRET === 'rno-shop-dev-secret-do-not-use-in-prod' || JWT_REFRESH_SECRET === 'rno-shop-dev-refresh-do-not-use-in-prod') {
    throw new Error('CRITICAL: Do not use dev JWT secrets in production! Set JWT_SECRET and JWT_REFRESH_SECRET.');
  }
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
