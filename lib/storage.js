/**
 * Database interface for MongoDB.
 *
 * This adds a little bit of code but allows the database/storage to be pluggable in the future
 */

const { ObjectID } = require('mongodb');

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
async function connect (dbName = process.env.MONGO_DB) {
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
  return getCollection(collectionName)
    .insertMany(documents);
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
  return getCollection(collectionName)
    .insertOne(prepare(document));
}

/**
 * Update single document
 *
 * @param {string} collectionName
 * @param {string} documentId
 * @param {object} documentUpdate
 *
 * @returns {Promise<Collection.insertOneWriteOpResultObject>}
 */
async function updateDocument (collectionName, documentId, documentUpdate) {
  // Insert some documents
  return getCollection(collectionName)
    .updateOne(prepare({ _id: documentId }), { $set: documentUpdate });
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
  return getCollection(collectionName)
    .find(prepare(query), options);
}

/**
 * Find the first document in a collection matching the query.
 * Specify a query to filter results.
 *
 * @param {string} collectionName
 * @param {object} query
 * @param {object?} options
 *
 * @returns {Promise<object>}
 */
async function findDocument (collectionName, query, options = {}) {
  return getCollection(collectionName)
    .findOne(prepare(query), options)
    .then(normalize);
}

/**
 * Find the document by id
 *
 * @param {string} collectionName
 * @param {string} documentId
 * @param {object?} options
 *
 * @returns {Promise<object>}
 */
async function getDocument (collectionName, documentId, options = {}) {
  return getCollection(collectionName)
    .findOne(prepare({ _id: documentId }), options)
    .then(normalize);
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
  return getCollection(collectionName)
    .countDocuments(prepare(query), options);
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
async function indexCollection (collectionName, index, options = {}) {
  return getCollection(collectionName).createIndex(index);
}

/**
 * Normalize a db record to app standards
 *
 * @param {object} data
 *
 * @return {object}
 */
function normalize (data) {
  if (data !== null) {
    return Object.assign({}, data, { _id: data._id.toHexString() });
  }

  return data;
}

/**
 * Prepare a document before sending it to the DB
 *
 * @param {object} data
 *
 * @return {object}
 */
function prepare (data) {
  if (data._id) {
    data._id = new ObjectID(data._id);
  }

  return data;
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
  updateDocument,
  findDocuments,
  findDocument,
  getDocument,
  countDocuments
};
