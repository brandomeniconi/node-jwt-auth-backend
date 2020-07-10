const crypto = require('crypto');

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

module.exports = {
  randomHash
};
