const { initDb } = require('../utils/init-db');

const { connect, disconnect, getCollection } = require('../lib/storage');
const { USER_COLLECTION, findByUsername } = require('../lib/user');

const mockUsers = require('./mocks/users');
const dbName = 'test_users';

describe('Test user model functions', () => {
  let db;

  beforeAll(async () => {
    db = await connect(dbName);
    await db.dropDatabase();
  });

  beforeEach(async () => {
    await initDb(db);
    await getCollection(USER_COLLECTION).insertMany(mockUsers);
  });

  afterEach(async () => {
    await db.dropDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('should find a user by username', async () => {
    const insertedUser = await findByUsername(mockUsers[0].username);
    expect(insertedUser._id).toEqual(mockUsers[0]._id);

    const insertedUser2 = await findByUsername(mockUsers[1].username);
    expect(insertedUser2._id).toEqual(mockUsers[1]._id);
  });
});
