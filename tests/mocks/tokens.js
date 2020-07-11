const { TOKEN_TTL_SECONDS } = require('../../lib/authentication');
const { ObjectID } = require('mongodb');

const mockTokens = [
  {
    _id: new ObjectID('477b46a49060df99487e346b'),
    reason: 'change-password',
    expireAt: new Date()
  },
  {
    _id: new ObjectID('c80580b13473ed866aaccaa9'),
    reason: 'invalidated',
    expireAt: new Date(new Date().getTime() + TOKEN_TTL_SECONDS * 1000)
  }
];

module.exports = mockTokens;
