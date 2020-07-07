/**
 * Module dependencies.
 */
const { findDocument } = require('./storage');
const TOKEN_COLLECTION = 'revokedTokens';

async function findToken(tokenId) {
  return findDocument(TOKEN_COLLECTION, { _id: tokenId });
}

module.exports = {
  TOKEN_COLLECTION,
  findToken
};
