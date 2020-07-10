/**
 * Module dependencies.
 */
const { findDocument } = require('./storage');
const USER_COLLECTION = 'users';

async function findByUsername (username) {
  return findDocument(USER_COLLECTION, { username });
}

module.exports = {
  USER_COLLECTION,
  findByUsername
};
