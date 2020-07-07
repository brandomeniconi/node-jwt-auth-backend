const PASSWORD_SALT_ROUNDS = 10;
const REVOKED_TOKEN_CACHE_SIZE = 500;
const REVOKED_TOKENS_COLLECTION = 'revokedTokens';

/**
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const LRU = require('lru-cache');
const expressJwt = require('express-jwt');
const { findToken } = require('./tokens');

// The revoked tokens cache to offload revoked token from the DB
const revokedTokenCache = new LRU(REVOKED_TOKEN_CACHE_SIZE);

/**
 * Express middleware to check if the HTTP has a valid access token
 *
 * @param {Request} req
 * @param {Response} res
 * @param {callable} next
 *
 * @returns {void}
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      console.error('JWT verification failed', err.message);
      return res.status(403).send(err.message);
    }
    req.user = payload;
    next();
  });
}

/**
 * Generate a JWT access token
 *
 * @param {object} payload  The JWT token payload
 *
 * @returns {string} The generated access token string
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '12h' });
}

/**
 * Verify if token has been revoked or invalidated
 *
 * @param {Request} req
 * @param {Response} res
 * @param {callable} next
 */
function isTokenRevoked(req, payload, done) {
  const tokenId = payload.jti;

  if (!tokenId) {
    // if it does not have jti it cannot be revoked
    return done(null, false);
  }

  const tokenIdentifier = payload.jti;
  let blacklisted = revokedTokenCache.get(tokenIdentifier);
  if (typeof blacklisted !== 'undefined') { return done(null, blacklisted); }

  findToken(tokenIdentifier)
    .then((token) => {
      blacklisted = !!token;
      revokedTokenCache.set(tokenIdentifier, blacklisted);
      return done(null, blacklisted);
    })
    .catch(() => {
      return done(err);
    })
}

/**
 * Compare plaintext password with a provided hash
 *
 * @param {string} password         The password to verify
 * @param {string} passwordHash     The hash to match against
 *
 * @returns {boolean} Return true if the password matches the hash
 */
async function validatePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

/**
 * Hashes the provided password
 *
 * @param {string} password     The password to hash
 *
 * @returns {string} The password hash
 */
async function hashPassword(password) {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

/**
 * Gets the app authentication secret
 */
function getAuthenticationSecret() {
  return process.env.TOKEN_SECRET;
}

const jwtMiddleware = expressJwt({
  secret: getAuthenticationSecret,
  //isRevoked: isTokenRevoked,
  algorithms: ['RS256']
});

module.exports = {
  authenticateToken,
  generateAccessToken,
  validatePassword,
  hashPassword,
  jwtMiddleware
};
