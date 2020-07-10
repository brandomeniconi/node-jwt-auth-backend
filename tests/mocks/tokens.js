const { TOKEN_TTL_SECONDS } = require('../../lib/authentication');
const { ObjectID } = require("mongodb");

const mockTokens = [
  {
    _id: ObjectID.createFromTime(110),
    reason: 'Changed password',
    expireAt: new Date()
  },
  {
    _id: ObjectID.createFromTime(115),
    reason: 'Manually invalidated',
    expireAt: new Date(new Date().getTime() + TOKEN_TTL_SECONDS * 1000)
  }
];

module.exports = mockTokens;
