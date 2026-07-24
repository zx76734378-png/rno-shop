const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/helpers');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');

async function register({ email, password, firstName, lastName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName },
    select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true },
  });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin },
    accessToken,
    refreshToken,
  };
}

async function refreshAccessToken(token) {
  try {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true, isActive: true },
    });

    if (!user || !user.isActive) {
      const err = new Error('User not found');
      err.statusCode = 401;
      throw err;
    }

    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });
    return { user, accessToken, refreshToken };
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      const e = new Error('Invalid refresh token');
      e.statusCode = 401;
      throw e;
    }
    throw err;
  }
}

async function resetPassword(token, newPassword) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    const err = new Error('Invalid or expired reset token');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } });

  return { message: 'Password reset successful' };
}

module.exports = { register, login, refreshAccessToken, resetPassword };
