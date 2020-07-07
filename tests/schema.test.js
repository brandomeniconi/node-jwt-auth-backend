const { MongoClient } = require('mongodb');
const { initDb } = require('../utils/init-db');

const mockUsers = require('./mocks/users');
const mockTokens = require('./mocks/tokens');
const jestConfig = require('../jest.config');

const dbName = 'test_db';

describe('db-schema', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db(dbName);
    await db.dropDatabase(dbName);
  });

  beforeEach(async () => {
    await initDb(db);
  });

  afterEach(async () => {
    await db.dropDatabase(dbName);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('should insert a valid user into collection', async () => {
    const usersCollection = db.collection('users');
    const mockUser = mockUsers[0];

    expect(usersCollection.insertOne(mockUser)).resolves.toMatchObject(
      { result: { "n": 1, "ok": 1 } }
    );
  });

  it('should not insert an invalid user into collection', async () => {
    const usersCollection = db.collection('users');
    const mockUser = Object.assign({}, mockUsers[1], { username: null });
    
    expect(usersCollection.insertOne(mockUser)).rejects.toThrow('Document failed validation');
  });

  it('should insert an valid token', async () => {
    const revokedTokens = db.collection('revokedTokens');

    const mockToken = mockTokens[0];

    expect(revokedTokens.insertOne(mockToken)).resolves.toMatchObject({
        result: {"n": 1, "ok": 1}
      }
    );

  });

  it('should not insert an invalid token', async () => {
    const revokedTokens = db.collection('revokedTokens');

    const mockToken = Object.assign({}, mockTokens[1], { expireAt: null });

    expect(revokedTokens.insertOne(mockToken)).rejects.toThrow('Document failed validation');
  });  

  jest.setTimeout(100000);

  it('should delete a token after expiration', async (done) => {

    console.log('This test takes up to a minute, please wait..');

    const revokedTokens = db.collection('revokedTokens');
    
    // expire the document immediately
    const mockToken = Object.assign({}, mockTokens[1], { expireAt: new Date() });

    await revokedTokens.insertOne(mockToken);

    setTimeout(() => {
      
      revokedTokens.findOne({ _id: mockToken._id })
        .then((result) => { 
          expect(result).toBeNull();
          done();
        })
        .catch((err) => { 
          done.fail(err)
        });
      
    // it requires approximately 60s to delete an expired record
    }, 65000);

  });    
});
