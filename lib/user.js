/**
 * Module dependencies.
 */
const { validateEmail } = require('../utils/validators');
const { randomHash, hashPassword } = require('./hashing');

const USER_COLLECTION = 'users';
const USERNAME_MIN_LENGTH = 5;
const PASSWORD_MIN_LENGTH = 7;
const NAMES_MIN_LENGTH = 2;
const USER_DEFAULT_ROLE = 'guest';

class UserStore {
  constructor (datastore) {
    if (datastore === undefined) {
      throw new Error('missing datastore');
    }

    this.datastore = datastore;
  }

  /**
   * Finds a user by id
   *
   * @param {string} userId
   *
   * @returns {Promise<object>}
   */
  async get (userId) {
    return this.datastore.get(USER_COLLECTION, userId);
  }

  /**
   * Finds a user by it's username
   *
   * @param {string} username
   *
   * @returns {Promise<object>}
   */
  async findByUsername (username) {
    return this.datastore.findOne(USER_COLLECTION, { username });
  }

  /**
   * Create a user.
   * WARNING: It doesn't validate the fields
   *
   * @param {string} username
   *
   * @returns {Promise<object>}
   */
  async insert (userData) {
    const passwordHash = await hashPassword(userData.password);
    delete userData.password;

    Object.assign(userData, {
      role: USER_DEFAULT_ROLE,
      passwordHash,
      fingerprint: randomHash(20)
    });

    return this.datastore.insert(USER_COLLECTION, userData);
  }

  /**
   * Update a user.
   *
   * @param {string} username
   *
   * @returns {Promise<object>}
   */
  async update (userId, userData) {
    // If user changes password or email update the fingerprint.
    if (userData.password || userData.email) {
      Object.assign(userData, {
        fingerprint: randomHash(20)
      });
    }

    // If user changes password remove plaintext and hash it.
    if (userData.password) {
      const passwordHash = await hashPassword(userData.password);
      delete userData.password;

      Object.assign(userData, {
        passwordHash
      });
    }

    return this.datastore.update(USER_COLLECTION, userId, userData);
  }

  /**
   * Returns the required session data.
   * WARNING: This data is public, do not put sensitive informations here!
   *
   * @param {object} userData
   *
   * @returns {object}
   */
  static createSession (userData) {
    return {
      sub: userData._id,
      role: userData.role,
      fingerprint: userData.fingerprint
    };
  }

  /**
   * Chacks if a user is valid
   *
   * @param {object} userData
   *
   * @throws {Error} On field validation error
   *
   * @returns {void}
   */
  static validate (userData) {
    const {
      username,
      password,
      firstName,
      lastName,
      email
    } = userData;

    if (!username || username.length <= USERNAME_MIN_LENGTH) {
      throw new Error('You must provide valid username');
    }

    if (!password || password.length <= PASSWORD_MIN_LENGTH) {
      throw new Error('You must provide secure password');
    }

    if (!email || !validateEmail(email)) {
      throw new Error('You must provide a valid email');
    }

    if (!firstName || firstName.length <= NAMES_MIN_LENGTH) {
      throw new Error('You must provide a valid first name');
    }

    if (!lastName || lastName.length <= NAMES_MIN_LENGTH) {
      throw new Error('You must provide a valid last  name');
    }
  }
}

module.exports = {
  USER_COLLECTION,
  UserStore
};
