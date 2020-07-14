/**
 * Database interface for Mongothis.db.
 *
 * This adds a little bit of code but allows the database/storage to be pluggable in the future
 */

/**
 * Module dependencies.
 */
const { MongoClient, ObjectID } = require('mongodb');

class DataStore {
  constructor (connectUrl = process.env.MONGO_URL) {
    this.connectUrl = connectUrl;
  }

  /**
 * Connects to database
 *
 * @param {string?} this.dbName The database to connect with. Defaults to env this.db.
 *
 * @returns {MongoClient}
 */
  async connect (dbName = process.env.MONGO_DB) {
    this.connection = await MongoClient.connect(this.connectUrl, { useUnifiedTopology: true });
    this.db = await this.connection.db(dbName);
    return this.db;
  }

  /**
 * Closes database this.connection
 *
 * @returns {MongoClient}
 */
  async disconnect () {
    if (this.connection) {
      await this.connection.close();
    }

    if (this.db) {
      await this.db.close();
    }
  }

  /**
 * Get collection instance
 *
 * @param {string} collectionName
 *
 * @returns {Collection}
 */
  getCollection (collectionName) {
  // Get the documents collection
    return this.db.collection(collectionName);
  }

  /**
 * Insert multiple documents at once
 *
 * @param {string} collectionName
 * @param {object[]} documents

 * @returns {Promise<Mongo>}
 */
  async insertMany (collectionName, documents) {
  // Insert some documents
    return this.getCollection(collectionName)
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
  async insert (collectionName, document) {
  // Insert some documents
    return this.getCollection(collectionName)
      .insertOne(DataStore.prepare(document));
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
  async update (collectionName, documentId, documentUpdate) {
  // Insert some documents
    return this.getCollection(collectionName)
      .updateOne(DataStore.prepare({ _id: documentId }), { $set: documentUpdate });
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
  async find (collectionName, query = {}, options = {}) {
    return this.getCollection(collectionName)
      .find(DataStore.prepare(query), options);
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
  async findOne (collectionName, query, options = {}) {
    return this.getCollection(collectionName)
      .findOne(DataStore.prepare(query), options)
      .then(DataStore.normalize);
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
  async get (collectionName, documentId, options = {}) {
    return this.getCollection(collectionName)
      .findOne(DataStore.prepare({ _id: documentId }), options)
      .then(DataStore.normalize);
  }

  /**
   * Check if a document exist
   *
   * @param {string} collectionName
   * @param {string} documentId
   *
   * @return {Promise<boolean>} if the token exists
   */
  async exists (collectionName, documentId) {
    return this.getCollection(collectionName)
      .findOne(DataStore.prepare({ _id: documentId }))
      .then(result => result !== null);
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
  async count (collectionName, query = {}, options = {}) {
    return this.getCollection(collectionName)
      .countDocuments(DataStore.prepare(query), options);
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
  async createIndex (collectionName, index, options = {}) {
    return this.getCollection(collectionName).createIndex(index);
  }

  /**
 * Empty the entire datastore
 *
 * @returns {Promise<object>}
 */
  async clear () {
    return this.db.dropDatabase();
  }

  /**
 * this.normalize a this.db record to app standards
 *
 * @param {object} data
 *
 * @return {object}
 */
  static normalize (data) {
    if (data !== null) {
      return Object.assign({}, data, { _id: data._id.toHexString() });
    }

    return data;
  }

  /**
 * this.prepare a document before sending it to the this.db
 *
 * @param {object} data
 *
 * @return {object}
 */
  static prepare (data) {
    if (data._id) {
      data._id = new ObjectID(data._id);
    }

    return data;
  }
}

module.exports = DataStore;
