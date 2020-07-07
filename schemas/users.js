const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['firstName', 'lastName', 'email', 'role', 'passwordHash'],
    properties: {
      username: {
        bsonType: 'string',
        description: 'must be a string and is required',
        minLength: 4,
        maxLength: 50
      },
      firstName: {
        bsonType: 'string',
        description: 'must be a string and is required'
      },
      lastName: {
        bsonType: 'string',
        description: 'must be a string and is required'
      },
      email: {
        bsonType: 'string',
        pattern: '^.+\@.+$',
        description: 'must be a valid email and is required'
      },
      passwordHash: {
        bsonType: 'string',
        description: 'must be a string and is required'
      },
      role: {
        enum: ['admin', 'customer', 'guest'],
        description: 'can only be a valid role and is required'
      }
    }
  }
};

const indexes = [];

module.exports = {
  validator,
  indexes
};
