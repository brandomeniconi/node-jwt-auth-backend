
const { initDb } = require('../utils/init-db');

const { connect, disconnect, findDocument, getCollection } = require('../lib/storage');
const { REVOKED_TOKENS_COLLECTION, findRevokedToken, insertRevokedToken } = require('../lib/tokens');

const mockTokens = require('./mocks/tokens');
const dbName = 'test_revokedTokens';


describe('revoked tokens', () => {
  let db;

  beforeAll(async () => {
    db = await connect();
    await db.dropDatabase(dbName);
  });

  beforeEach(async () => {
    await initDb(db);
    await getCollection(REVOKED_TOKENS_COLLECTION).insertMany(mockTokens);
  });

  afterEach(async () => {
    await db.dropDatabase(dbName);
  });

  afterAll(async () => {
    await disconnect();
  });

  it('should find a token by id', async () => {
      const insertedToken = await findRevokedToken(mockTokens[0]._id);
      expect(insertedToken._id).toEqual(mockTokens[0]._id);
  
      const insertedToken2 = await findRevokedToken(mockTokens[1]._id);
      expect(insertedToken2._id).toEqual(mockTokens[1]._id);
  });

  test('creation', async () => {

      const _id = 'some-random-jti';
      const expireAt = new Date();
      const reason = 'logout';
      
      expect(insertRevokedToken(_id, expireAt, reason)).resolves.toMatchObject(
        { result: { "n": 1, "ok": 1 } }
      );
  });
});
