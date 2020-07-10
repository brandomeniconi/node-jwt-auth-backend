const usersSchema = require('../schemas/users');
const revokedTokensSchema = require('../schemas/revokedTokens');

/**
 * Initialize database
 *
 * @param {MongoClient} db The db instance
 */
async function initDb (db, dbName = process.env.MONGO_DB) {
  await db.dropDatabase();

  // Create collection
  await initCollection(db, 'users', usersSchema);
  await initCollection(db, 'revokedTokens', revokedTokensSchema);
}

/**
 * Initialize collection
 */
async function initCollection (db, collectionName, schema) {
  // Create collection
  const collection = await db.createCollection(collectionName, { validator: schema.validator });

  // Create indexes
  return Promise.all(schema.indexes.map(
    ([index, options]) => collection.createIndex(index, options)
  ));
}

module.exports = {
  initDb
};
