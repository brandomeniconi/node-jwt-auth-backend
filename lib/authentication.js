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
const LRU = require('lru-cache');
const { RevokedTokenStore } = require('./revokedTokens');
const { randomHash } = require('./hashing');
const { UserStore } = require('./user');

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
  const userStore = new UserStore(req.app.get('datastore'));

  if (!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  try {
    req.user = await verifyToken(token, JWT_CLAIMS);
  } catch (err) {
    console.error('JWT verification failed', err.message);
    return res.status(403).json({ error: 'invalid_token', message: err.message });
  }

  try {
    // check if the token can be used
    const isRevoked = await isTokenRevoked(req);
    const userData = await userStore.get(req.user.sub);

    if (isRevoked) {
      return res.status(401).json({ error: 'expired_token', message: 'Your session expired, please login again' });
    }

    if (userData === null || userData.fingerprint !== req.user.fingerprint) {
      await revokeToken(req);
      return res.status(401).json({ error: 'expired_token', message: 'Your session expired, please login again' });
    }
  } catch (err) {
    console.warn('Cannot verify if the token is revoked: ', err.message);
  }

  next();
}

/**
 * Validate the fingerprint and expiration
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
 *
 * @return {Promise<boolean>}
 */
async function isTokenRevoked (req) {
  const revokedTokenStore = new RevokedTokenStore(req.app.get('datastore'));
  const tokenId = req.user.jti;

  if (!tokenId) {
    // if it does not have jti it cannot be revoked
    return false;
  }

  let isRevoked = revokedTokenCache.get(tokenId);

  // result is found in cache
  if (typeof isRevoked !== 'undefined') { return isRevoked; }

  // get result from persistent storage
  return revokedTokenStore.exists(tokenId)
    .then((tokenExsist) => {
      isRevoked = tokenExsist;
      revokedTokenCache.set(tokenId, isRevoked);
      return isRevoked;
    });
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
 * @param {Request}  req
 * @param {string?} reason  The reason name like logout|invalidated|password-change
 *
 * @returns {Promise<boolean>}
 */
async function revokeToken (req, reason = '') {
  const { jti, exp } = req.user;
  const revokedTokenStore = new RevokedTokenStore(req.app.get('datastore'));
  const expirationDate = new Date(parseInt(exp) * 1000);

  if (!jti) {
    throw new Error('Missing JTI identified');
  }

  return revokedTokenStore.insert(jti, expirationDate, reason)
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

module.exports = {
  TOKEN_TTL_SECONDS,
  TOKEN_JTI_BYTLE_LENGTH,
  authenticateToken,
  generateAccessToken,
  verifyToken,
  revokeToken,
  isTokenRevoked,
  clearRevokedTokenCache,
  getAuthenticationSecret
};
