
const { initDb } = require('../utils/init-db');

const { connect, disconnect, findDocument, getCollection } = require('../lib/storage');
const { TOKEN_COLLECTION, findToken } = require('../lib/tokens');

const mockTokens = require('./mocks/tokens');
const dbName = 'test_revokedTokens';


describe('tokens', () => {
  let db;

  beforeAll(async () => {
    db = await connect();
    await initDb(db);
  });

  beforeEach(async () => {
    await initDb(db);
    await getCollection(TOKEN_COLLECTION).insertMany(mockTokens);
  });

  afterEach(async () => {
    await db.dropDatabase('test');
  });

  afterAll(async () => {
    await disconnect();
  });

  it('should find a token by id', async () => {
      const insertedToken = await findToken(mockTokens[0]._id);
      expect(insertedToken._id).toEqual(mockTokens[0]._id);
  
      const insertedToken2 = await findToken(mockTokens[1]._id);
      expect(insertedToken2._id).toEqual(mockTokens[1]._id);
  });
});
