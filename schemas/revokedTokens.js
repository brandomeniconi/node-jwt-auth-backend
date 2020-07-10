const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['expireAt'],
    properties: {
      reason: {
        bsonType: 'string',
        description: 'must be a string'
      },
      expireAt: {
        bsonType: 'date',
        description: 'must be a date and is required'
      }
    }
  }
};

const indexes = [
  [{ expireAt: 1 }, { expireAfterSeconds: 0 }]
];

module.exports = {
  validator,
  indexes
};
