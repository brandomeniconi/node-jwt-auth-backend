const { ObjectID } = require("mongodb");

const mockUsers = [{
  _id: ObjectID.createFromTime(100),
  username: 'testuser',
  passwordHash: '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VK',
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  signature: 'PTpEg4HI1J7huzmS5CBNyOvJwvO2VK'
},
{
  _id: ObjectID.createFromTime(110),
  username: 'testuser2',
  passwordHash: '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VK',
  email: 'testuser2@example.com',
  firstName: 'Test2',
  lastName: 'User2',
  role: 'admin',
  signature: 'PTpEg4HI1J7huzmS5CBNyOvJwvO2VK'
}];

module.exports = mockUsers;
