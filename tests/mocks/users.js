const { ObjectID } = require('mongodb');

const mockUsers = [{
  _id: new ObjectID('aaaaaaaaaaaaaaaaaaaaaaaa'),
  username: 'testuser',
  passwordHash: '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VK',
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  fingerprint: 'PTpEg4HI1J7huzmS5CBNyOvJwvO2VK'
},
{
  _id: new ObjectID('bbbbbbbbbbbbbbbbbbbbbbbb'),
  username: 'testuser2',
  passwordHash: '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VK',
  email: 'testuser2@example.com',
  firstName: 'Test2',
  lastName: 'User2',
  role: 'admin',
  fingerprint: 'OCR2421CssSRl7MObPTpEg4HIDiuS0'
}];

module.exports = mockUsers;
