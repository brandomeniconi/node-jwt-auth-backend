/**
 * Module dependencies.
 */
var express = require('express');
var router = express.Router();

const { generateAccessToken, authenticateToken, revokeToken } = require('../lib/authentication');
const { UserStore } = require('../lib/user');
const { validatePassword } = require('../lib/hashing');

/**
 * Authenticate the user and return the JWT token
 */
router.post('/signin', async (req, res, next) => {
  const userStore = new UserStore(req.app.get('datastore'));
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'invalid_credentials', message: 'You must provide username and password' });
    return;
  }

  const userData = await userStore.findByUsername(username);

  if (userData === null) {
    res.status(401).json({ error: 'invalid_credentials', message: 'Your username/password is not valid' });
    return;
  }

  const passwordValid = await validatePassword(password, userData.passwordHash);

  if (!passwordValid) {
    res.status(401).json({ error: 'invalid_credentials', message: 'Your username/password is not valid' });
    return;
  }

  try {
    const tokenPayload = UserStore.createSession(userData);
    const token = generateAccessToken(tokenPayload);
    res.json({ token });
  } catch (err) {
    console.error('ERROR WHILE GENERATING TOKEN', err.message);
    res.status(500).json({ error: 'fatal_error', message: 'Could not authenticate user, please try later' });
  }
});

/**
 * Authenticate the user and return the JWT token
 */
router.post('/signup', async (req, res, next) => {
  const requestData = req.body;
  const userStore = new UserStore(req.app.get('datastore'));

  try {
    UserStore.validateUser(requestData);
  } catch (err) {
    console.warn('USER LOGIN FAILED', err.message);
    return res.status(400).json({ error: 'validation_error', message: err.message, fields: err.fields });
  }

  const tokenPayload = {};

  try {
    const response = await userStore.insert(requestData);
    const userData = await userStore.get(response.insertedId);
    Object.assign(tokenPayload, UserStore.createSession(userData));
  } catch (err) {
    console.error('CANNOT INSER USER', err.code, err.message);

    if (err.code === 11000) {
      return res.status(400).json({ error: 'already_exists', message: 'An user with that username or email alreasy exists' });
    }

    if (err.code === 121) {
      return res.status(400).json({ error: 'invalid_parameters', message: 'Some of the data provided is not valid' });
    }

    return res.status(400).json({ error: 'fatal_error', message: 'Could not create user, please try later' });
  }

  try {
    const token = generateAccessToken(tokenPayload);
    res.json({ userId: tokenPayload.sub, token });
  } catch (err) {
    console.error('ERROR WHILE GENERATING TOKEN', err.message);
    return res.status(500).json({ error: 'fatal_error', message: 'Could not authenticate user, please try later' });
  }
});

/**
 * Password change endopint
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { password, previousPassword } = req.body;
  const userStore = new UserStore(req.app.get('datastore'));

  if (!password || !previousPassword) {
    return res.status(400).json({ error: 'invalid_arguments', message: 'You must specify previous and new password' });
  }

  // Validate old password
  const userData = await userStore.get(userId);

  if (userData === null) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Your username/password is not valid' });
  }

  const passwordValid = await validatePassword(previousPassword, userData.passwordHash);

  if (!passwordValid) {
    return res.status(403).json({ error: 'invalid_credentials', message: 'Your old password is not valid' });
  }

  return userStore.update(userId, { password })
    .then(() => revokeToken(req, 'logout'))
    .then(() => userStore.get(userId))
    .then((userData) => {
      const tokenPayload = UserStore.createSession(userData);
      const token = generateAccessToken(tokenPayload);
      res.status(200).send({ token });
    })
    .catch((err) => {
      console.error(err.message);
      res.sendStatus(500);
    });
});

/**
 * Password change endopint
 */
router.post('/logout', authenticateToken, (req, res) => {
  return revokeToken(req, 'logout')
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err.message);
      res.sendStatus(500);
    });
});

module.exports = router;
