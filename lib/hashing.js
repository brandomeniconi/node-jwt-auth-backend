const crypto = require('crypto');
const bcrypt = require('bcrypt');
const PASSWORD_SALT_ROUNDS = 10;

/**
 * Create a pure random string
 *
 * @param {number} byteLenght
 *
 * @returns {string}
 */
function randomHash (byteLenght = 20) {
  return crypto.randomBytes(byteLenght).toString('hex');
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

module.exports = {
  validatePassword,
  hashPassword,
  randomHash
};
