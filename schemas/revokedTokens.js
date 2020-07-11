const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['expireAt'],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId'
      },
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
