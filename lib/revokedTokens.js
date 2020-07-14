/**
 * Module dependencies.
 */
const REVOKED_TOKENS_COLLECTION = 'revokedTokens';

class RevokedTokenStore {
  constructor (datastore) {
    this.datastore = datastore;
  }

  /**
   * Find a Token
   *
   * @param {string} tokenId
   *
   * @return {Promise<object>} the token object
   */
  async get (tokenId) {
    return this.datastore.get(REVOKED_TOKENS_COLLECTION, tokenId);
  }

  /**
   * Find a Token
   *
   * @param {string} tokenId
   *
   * @return {Promise<boolean>} if the token exists
   */
  async exists (tokenId) {
    return this.datastore.get(REVOKED_TOKENS_COLLECTION, tokenId)
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
  async insert (tokenId, expireAt, reason = '') {
    const revokeTokenDoc = {
      _id: tokenId,
      expireAt,
      reason
    };

    return this.datastore.insert(REVOKED_TOKENS_COLLECTION, revokeTokenDoc);
  }
}

module.exports = {
  REVOKED_TOKENS_COLLECTION,
  RevokedTokenStore
};
