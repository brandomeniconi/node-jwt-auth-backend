const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['username', 'firstName', 'lastName', 'email', 'role', 'passwordHash', 'signature'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
      },   
      username: {
        bsonType: 'string',
        description: 'must be a string and is required',
        minLength: 5,
        maxLength: 50
      },
      firstName: {
        bsonType: 'string',
        description: 'must be a string and is required',
        minLength: 2,
        maxLength: 50
      },
      lastName: {
        bsonType: 'string',
        description: 'must be a string and is required',
        minLength: 2,
        maxLength: 50
      },
      email: {
        bsonType: 'string',
        pattern: '^.+@.+$',
        description: 'must be a valid email and is required',
        minLength: 3,
        maxLength: 256
      },
      passwordHash: {
        bsonType: 'string',
        description: 'must be a string and is required'
      },
      signature: {
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

const indexes = [
  [{ username: 1 }, { unique: true }],
  [{ email: 1 }, { unique: true }]
];

module.exports = {
  validator,
  indexes
};
