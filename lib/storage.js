
/**
 * Module dependencies.
 */
const MongoClient = require('mongodb').MongoClient;
let connection;
let db;

/**
 * Connects to database
 *
 * @returns {MongoClient}
 */
async function connect ( dbName ) {
  connection = await MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true });
  db = await connection.db(dbName || process.env.MONGO_DB);
  return db;
}

/**
 * Closes database connection
 *
 * @returns {MongoClient}
 */
async function disconnect () {
  if (connection) {
    await connection.close();
  }

  if (db) {
    await db.close();
  }
}

/**
 * Insert documents
 *
 * @param {string} collectionName
 * @param {object[]} documents
 */
function getCollection (collectionName) {
  // Get the documents collection
  const collection = db.collection(collectionName);

  return collection;
}

/**
 * Insert documents
 *
 * @param {string} collectionName
 * @param {object[]} documents
 */
async function insertDocuments (collectionName, documents) {
  // Insert some documents
  return getCollection(collectionName).insertMany(documents);
}

/**
 * Insert document
 *
 * @param {string} collectionName
 * @param {object[]} documents
 */
async function insertDocument (collectionName, document) {
  // Insert some documents
  return getCollection(collectionName).insert(document);
}

/**
 * Find all documents in a collection.
 * Specify a query to filter results.
 *
 * @param {*} collectionName
 * @param {*} query
 */
async function findDocuments (collectionName, query = {}, projection = {}) {
  return getCollection(collectionName).find(query, projection);
}

/**
 * Find all documents in a collection.
 * Specify a query to filter results.
 *
 * @param {*} collectionName
 * @param {*} query
 */
async function findDocument (collectionName, query = {}, projection = {}) {
  return getCollection(collectionName).findOne(query, projection);
}

/**
 * Create indexes in collection
 *
 * @param {*} collectionName
 * @param {*} indexes
 */
async function indexCollection (collectionName, indexes) {
  return getCollection(collectionName).createIndex(indexes);
}

module.exports = {
  connection,
  db,
  connect,
  disconnect,
  getCollection,
  insertDocuments,
  insertDocument,
  findDocuments,
  findDocument,
  indexCollection
};
