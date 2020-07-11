const PASSWORD_SALT_ROUNDS = 10;
const REVOKED_TOKEN_CACHE_SIZE = 500;
const TOKEN_TTL_SECONDS = 43200; // 12 hours
const TOKEN_JTI_BYTLE_LENGTH = 12;

const JWT_CLAIMS = {
  iss: 'https://example.com/',
  aud: ['https://example.com/']
};

/**
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const LRU = require('lru-cache');
const expressJwt = require('express-jwt');
const { hasRevokedToken, insertRevokedToken } = require('./tokens');
const { randomHash } = require('../utils/hashing');

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
async function authenticateToken (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  try {
    req.user = await verifyToken(token, JWT_CLAIMS);
  } catch (err) {
    console.error('JWT verification failed', err.message);
    return res.status(403).send(err.message);
  }

  try {
    // check if the token is revoked
    const isRevoked = await isTokenRevoked(req.user.jti);

    if (isRevoked) {
      return res.status(401).json({ error: 'invalid_token', message: 'Your session expired, please login again' });
    }
  } catch (err) {
    console.warn('Cannot verify if the token is revoked: ', err.message);
  }

  next();
}

/**
 * Validate the signature and expiration
 *
 * @param {string} token
 */
async function verifyToken (token, claims = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getAuthenticationSecret(), claims, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
}

/**
 * Generate a JWT access token
 *
 * @param {object} payload  The JWT token payload
 *
 * @returns {string} The generated access token string
 */
function generateAccessToken (payload = {}) {
  Object.assign(payload, JWT_CLAIMS, { jti: randomHash(TOKEN_JTI_BYTLE_LENGTH) });

  return jwt.sign(payload, getAuthenticationSecret(), { expiresIn: TOKEN_TTL_SECONDS });
}

/**
 * Verify if token has been revoked or invalidated
 *
 * @param {Request} req
 * @param {Response} res
 * @param {callable} next
 */
async function isTokenRevoked (tokenId) {
  if (!tokenId) {
    // if it does not have jti it cannot be revoked
    return false;
  }

  let isRevoked = revokedTokenCache.get(tokenId);

  // result is found in cache
  if (typeof isRevoked !== 'undefined') { return isRevoked; }

  // get result from persistent storage
  return hasRevokedToken(tokenId)
    .then((tokenExsist) => {
      isRevoked = tokenExsist;
      revokedTokenCache.set(tokenId, isRevoked);
      return isRevoked;
    });
}

/**
 * Compare plaintext password with a provided hash
 *
 * @param {string} password         The password to verify
 * @param {string} passwordHash     The hash to match against
 *
 * @returns {boolean} Return true if the password matches the hash
 */
async function validatePassword (password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Hashes the provided password
 *
 * @param {string} password     The password to hash
 *
 * @returns {string} The password hash
 */
async function hashPassword (password) {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

/**
 * Gets the app authentication secret
 *
 * @returns {string}
 */
function getAuthenticationSecret () {
  return process.env.TOKEN_SECRET;
}

/**
 * Revokes a token
 *
 * @param {object}  tokenPayload   The token claims. See RFC 7519
 * @param {string?} reason        The reason name like logout|invalidated|password-change
 *
 * @returns {Promise<boolean>}
 */
async function revokeToken (tokenPayload, reason = '') {
  const { jti, exp } = tokenPayload;
  const expirationDate = new Date(parseInt(exp) * 1000);

  if (!jti) {
    throw new Error('Missing JTI identified');
  }

  return insertRevokedToken(jti, expirationDate, reason)
    .then(response => {
      // delete the revoked token from local cache
      revokedTokenCache.del(jti);
      return response.result.ok === 1;
    });
}

/**
 * Clear the trevoked tokens cache
 */
function clearRevokedTokenCache () {
  revokedTokenCache.reset();
}

/**
 * JWT Authentication Library
 */
const jwtMiddleware = expressJwt({
  secret: getAuthenticationSecret,
  // isRevoked: isTokenRevoked,
  algorithms: ['RS256']
});

module.exports = {
  TOKEN_TTL_SECONDS,
  TOKEN_JTI_BYTLE_LENGTH,
  authenticateToken,
  generateAccessToken,
  verifyToken,
  validatePassword,
  hashPassword,
  revokeToken,
  isTokenRevoked,
  clearRevokedTokenCache,
  getAuthenticationSecret,
  jwtMiddleware
};
