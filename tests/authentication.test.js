const {
  revokeToken,
  generateAccessToken,
  isTokenRevoked,
  clearRevokedTokenCache
} = require('../lib/authentication');

const { initDb } = require('../utils/init-db');
const jwt = require('jsonwebtoken');
const { connect, disconnect, getDocument } = require('../lib/storage');
const { REVOKED_TOKENS_COLLECTION } = require('../lib/revokedTokens');
const { validatePassword, hashPassword } = require('../lib/hashing');

const dbName = 'test_auth';

test('password validation', () => {
  const pwd = 'testpassword';
  const validHash = '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VK';
  const notMatchinghash = '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VE';
  const malformedHash = 'aaabbbcccddeefgghhhttt';

  expect(validatePassword(pwd, validHash)).resolves.toBe(true);
  expect(validatePassword(pwd, notMatchinghash)).resolves.toBe(false);
  expect(validatePassword(pwd, malformedHash)).resolves.toBe(false);
  expect(validatePassword(pwd, '')).resolves.toBe(false);
  expect(validatePassword('', '')).resolves.toBe(false);
});

describe('Password handling', () => {
  test('password hashing', () => {
    const pwd = 'testpassword';

    return expect(
      hashPassword(pwd).then(hash => validatePassword(pwd, hash))
    ).resolves.toBe(true);
  });
});

describe('Token handling', () => {
  let db;

  beforeAll(async () => {
    db = await connect(dbName);
    await db.dropDatabase();
  });

  beforeEach(async () => {
    await initDb(db);
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  test('token revoke insert', async () => {
    const token = await generateAccessToken();
    const payload = jwt.decode(token);

    return expect(
      revokeToken(payload, 'test-reason')
        .then((result) => {
          expect(result).toBe(true);
          return getDocument(REVOKED_TOKENS_COLLECTION, payload.jti);
        })
    ).resolves.not.toBeNull();
  });

  test('token revoke without JTI', async () => {
    const missingJtiToken = {
      exp: Math.ceil((new Date()).getTime() / 1000) + 3600
    };

    return expect(
      revokeToken(missingJtiToken, 'test-reason')
    ).rejects.toThrow('Missing JTI identified');
  });

  test('token revoke', async () => {
    const token = await generateAccessToken();
    const payload = jwt.decode(token);

    clearRevokedTokenCache();

    return revokeToken(payload, 'test-reason')
      .then(() => {
        return isTokenRevoked(payload.jti);
      })
      .then((isRevoked) => {
        return expect(isRevoked).toBe(true);
      });
  });
});
