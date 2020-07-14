
const { initDb } = require('../utils/init-db');

const DataStore = require('../lib/datastore');
const { REVOKED_TOKENS_COLLECTION, RevokedTokenStore } = require('../lib/revokedTokens');

const mockTokens = require('./mocks/tokens');
const { TOKEN_TTL_SECONDS, TOKEN_JTI_BYTLE_LENGTH } = require('../lib/authentication');
const { randomHash } = require('../lib/hashing');

describe('revoked tokens', () => {
  let db;
  let datastore;

  beforeAll(async () => {
    datastore = new DataStore(global.__MONGO_URI__);
    db = await datastore.connect(global.__MONGO_DB_NAME__);
    await db.dropDatabase();
  });

  beforeEach(async () => {
    await initDb(db);
    await datastore.insertMany(REVOKED_TOKENS_COLLECTION, mockTokens);
  });

  afterEach(async () => {
    await datastore.clear();
  });

  afterAll(async () => {
    await datastore.disconnect();
  });

  it('should find a token by id', async () => {
    const revokedTokenStore = new RevokedTokenStore(datastore);

    const insertedToken = await revokedTokenStore.get(mockTokens[0]._id);
    expect(insertedToken).not.toBeNull();
    expect(insertedToken._id).toEqual(mockTokens[0]._id.toHexString());

    const insertedToken2 = await revokedTokenStore.get(mockTokens[1]._id);
    expect(insertedToken2).not.toBeNull();
    expect(insertedToken2._id).toEqual(mockTokens[1]._id.toHexString());
  });

  test('creation', () => {
    const revokedTokenStore = new RevokedTokenStore(datastore);

    const newToken = {
      _id: randomHash(TOKEN_JTI_BYTLE_LENGTH),
      expireAt: new Date(new Date().getTime() + (TOKEN_TTL_SECONDS * 1000)),
      reason: 'logout'
    };

    return revokedTokenStore.insert(newToken._id, newToken.expireAt, newToken.reason)
      .then(response => {
        expect(response).toMatchObject(
          { result: { n: 1, ok: 1 } }
        );
        return revokedTokenStore.get(newToken._id);
      })
      .then(result => {
        expect(result).not.toBeNull();
        expect(result).toMatchObject(newToken);
      });
  });
});
