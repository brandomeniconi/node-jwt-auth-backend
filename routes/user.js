/**
 * Module dependencies.
 */
var express = require('express');
var router = express.Router();

const { validatePassword, generateAccessToken, authenticateToken, revokeToken } = require('../lib/authentication');
const user = require('../lib/user');

/**
 * Authenticate the user and return the JWT token
 */
router.post('/signin', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'invalid_credentials', message: 'You must provide username and password' });
    return;
  }

  const userData = await user.findByUsername(username);

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
    const tokenPayload = {
      sub: userData.uid,
      username: userData.username,
      email: userData.email,
      role: userData.role
    };
    const token = generateAccessToken(tokenPayload);
    res.json({ token });
  } catch (err) {
    console.error('ERROR WHILE GENERATING TOKEN', err.message);
    res.status(500).json({ error: 'fatal_error', message: 'Could not authenticate user, please try later' });
  }
});

/**
 * Password change endopint
 */
router.post('/change-password', authenticateToken, (req, res) => {

});

/**
 * Password change endopint
 */
router.post('/logout', authenticateToken, (req, res) => {
  const tokenData = req.user;

  return revokeToken(tokenData, 'logout')
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err.message);
      res.sendStatus(500);
    });
});

module.exports = router;
