const dotenv = require('dotenv');
const express = require('express');
const expressJwt = require('express-jwt');

const auth = require('./lib/authentication');
const user = require('./lib/user');

// Load config vars from .env file
dotenv.config();

const app = express();

// Parse JSON in every request
app.use(express.json());

// Protect routes with JWTs
app.use('/api', jwtMiddleware);

/**
 *
 */
app.post('/user/signin', async (req, res, next) => {
  const { username, password } = req.body;

  console.log('LOGGING IN:', username);

  if (!username || !password) {
    res.send(400).json({ error: 'invalid_credentials', message: 'You must provide username and password' });
  }

  const userData = await user.findByUsername(username);
  const passwordValid = await auth.validatePassword(password, userData.passwordHash);

  if (!passwordValid) {
    res.status(401).json({ error: 'invalid_credentials', message: 'Your username/password is not valid' });
  }

  try {
    const tokenPayload = {
      sub: userData.uid,
      iss: 'https://treedom.com',
      aud: ['https://treedom.com/shop', 'https://treedom.com/app'],
      username: userData.username,
      email: userData.email,
      role: userData.email
    };
    const token = auth.generateAccessToken(tokenPayload);
    res.json({ token });
  } catch (err) {
    console.error('ERROR WHILE GENERATING TOKEN', err);
    res.status(500).json({ error: 'fatal_error', message: 'Could not authenticate user, please try later' });
  }
});

/**
 * Password change endopint
 */
app.post('/user/change-password', jwtMiddleware, (req, res) => {
  const { username } = req;

  console.log('LOGGING IN:', username);

  try {
    const token = auth.generateAccessToken({ username });
    res.json({ token });
  } catch (err) {
    console.error('ERROR WHILE GENERATING TOKEN', err);
    res.sendStatus(500);
  }
});


/**
 * Server startup
 */
app.listen(3000, function () {
  console.log('Backend listening on port 3000');
});

/**
 * Exception Process cleanup
 */
process.on('uncaughtException', function (err) {
  console.err(err);
  process.exit();
});
