/**
 * Module dependencies.
 */
var express = require('express');
var router = express.Router();
const { jwtMiddleware, authenticateToken} = require('../lib/authentication');

router.use(authenticateToken);

/**
 * User Profile endopint
 */
router.get('/profile', (req, res) => {
  res.send({ status: 'ok' });
});

module.exports = router;
