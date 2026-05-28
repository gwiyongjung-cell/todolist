const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken({ userId, email }) {
  return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
