/**
 * Database interface for MongoDB.
 * 
 * This adds a little bit of code but allows the database/storage to be pluggable in the future
 */

const Collection = require('mongodb/lib/collection');
const Cursor = require('mongodb/lib/cursor');

/**
 * Module dependencies.
 */
const MongoClient = require('mongodb').MongoClient;
let connection;
let db;

/**
 * Connects to database
 *
 * @param {string?} dbName The database to connect with. Defaults to env DB.
 * 
 * @returns {MongoClient}
 */
async function connect(dbName = process.env.MONGO_DB) {
  connection = await MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true });
  db = await connection.db(dbName);
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
 * Get collection instance
 *
 * @param {string} collectionName
 * 
 * @returns {Collection}
 */
function getCollection (collectionName) {
  // Get the documents collection
  const collection = db.collection(collectionName);

  return collection;
}

/**
 * Insert multiple documents at once
 *
 * @param {string} collectionName
 * @param {object[]} documents
 
 * @returns {Promise<Mongo>} 
 */
async function insertDocuments (collectionName, documents) {
  // Insert some documents
  return getCollection(collectionName).insertMany(documents);
}

/**
 * Insert single document
 *
 * @param {string} collectionName
 * @param {object} document
 * 
 * @returns {Promise<Collection.insertOneWriteOpResultObject>} 
 */
async function insertDocument (collectionName, document) {
  // Insert some documents
  return getCollection(collectionName).insertOne(document);
}

/**
 * Find all documents in a collection.
 * Specify a query to filter results.
 *
 * @param {string} collectionName
 * @param {object?} query
 * @param {object?} options
 * 
 * @returns {Promise<Cursor>} 
 */
async function findDocuments (collectionName, query = {}, options = {}) {
  return getCollection(collectionName).find(query, options);
}

/**
 * Find all documents in a collection.
 * Specify a query to filter results.
 *
 * @param {string} collectionName
 * @param {object?} query
 * @param {object?} options
 * 
 * @returns {Promise<object>}
 */
async function findDocument (collectionName, query = {}, options = {}) {
  return getCollection(collectionName).findOne(query, options);
}

/**
 * Count documents
 * Specify a query to filter results.
 *
 * @param {string} collectionName
 * @param {object?} query
 * @param {object?} options
 * 
 * @returns {Promise<number>}
 */
async function countDocuments (collectionName, query = {}, options = {}) {
  return getCollection(collectionName).countDocuments(query, options);
}

/**
 * Create indexes in collection
 *
 * @param {string} collectionName
 * @param {object|string} index
 * @param {object|string} options
 * 
 * @returns {Promise<object>}
 */
async function indexCollection(collectionName, index, options = {}) {
  return getCollection(collectionName).createIndex(indexes);
}

module.exports = {
  connection,
  db,
  connect,
  disconnect,
  getCollection,
  indexCollection,
  insertDocuments,
  insertDocument,
  findDocuments,
  findDocument,
  countDocuments
};
