
const { initDb } = require('../utils/init-db');

const { connect, disconnect, getCollection } = require('../lib/storage');
const { REVOKED_TOKENS_COLLECTION, findRevokedToken, insertRevokedToken } = require('../lib/revokedTokens');

const mockTokens = require('./mocks/tokens');
const { TOKEN_TTL_SECONDS, TOKEN_JTI_BYTLE_LENGTH } = require('../lib/authentication');
const { randomHash } = require('../lib/hashing');
const dbName = 'test_revokedTokens';

describe('revoked tokens', () => {
  let db;

  beforeAll(async () => {
    db = await connect(dbName);
    await db.dropDatabase();
  });

  beforeEach(async () => {
    await initDb(db);
    await getCollection(REVOKED_TOKENS_COLLECTION).insertMany(mockTokens);
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('should find a token by id', async () => {
    const insertedToken = await findRevokedToken(mockTokens[0]._id);
    expect(insertedToken._id).toEqual(mockTokens[0]._id.toHexString());

    const insertedToken2 = await findRevokedToken(mockTokens[1]._id);
    expect(insertedToken2._id).toEqual(mockTokens[1]._id.toHexString());
  });

  test('creation', () => {
    const newToken = {
      _id: randomHash(TOKEN_JTI_BYTLE_LENGTH),
      expireAt: new Date(new Date().getTime() + (TOKEN_TTL_SECONDS * 1000)),
      reason: 'logout'
    };

    return insertRevokedToken(newToken._id, newToken.expireAt, newToken.reason)
      .then(response => {
        expect(response).toMatchObject(
          { result: { n: 1, ok: 1 } }
        );
        return findRevokedToken(newToken._id);
      })
      .then(result => {
        expect(result).not.toBeNull();
        expect(result).toMatchObject(newToken);
      });
  });
});
