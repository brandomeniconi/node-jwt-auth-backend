/**
 * Module dependencies.
 */
const { getDocument, insertDocument } = require('./storage');
const REVOKED_TOKENS_COLLECTION = 'revokedTokens';

/**
 * Find a Token
 *
 * @param {string} tokenId
 *
 * @return {Promise<object>} the token object
 */
async function findRevokedToken (tokenId) {
  return getDocument(REVOKED_TOKENS_COLLECTION, tokenId);
}

/**
 * Find a Token
 *
 * @param {string} tokenId
 *
 * @return {Promise<boolean>} if the token exists
 */
async function hasRevokedToken (tokenId) {
  return getDocument(REVOKED_TOKENS_COLLECTION, tokenId)
    .then(result => result !== null);
}

/**
 * Revoke a token
 *
 * @param {string} tokenId  The token JTI id
 * @param {Date}   expireAt The token expiration date
 * @param {string?} reason   The reason name like logout|invalidated|password-change
 *
 * @returns {Promise<object>}
 */
async function insertRevokedToken (tokenId, expireAt, reason = '') {
  const revokeTokenDoc = {
    _id: tokenId,
    expireAt,
    reason
  };

  return insertDocument(REVOKED_TOKENS_COLLECTION, revokeTokenDoc);
}

module.exports = {
  REVOKED_TOKENS_COLLECTION,
  findRevokedToken,
  insertRevokedToken,
  hasRevokedToken
};