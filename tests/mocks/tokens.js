const { TOKEN_TTL_SECONDS } = require('../../lib/authentication');

const mockTokens = [
  {
    _id: 'sSRl7MObPTpEg4HI1J7huzmS5',
    reason: 'Changed password',
    expireAt: new Date()
  },
  {
    _id: 'HI1J7huzmS5CBNyOvJwvO2VK',
    reason: 'Manually invalidated',
    expireAt: new Date(new Date().getTime() + TOKEN_TTL_SECONDS * 1000)
  }
];

module.exports = mockTokens;
