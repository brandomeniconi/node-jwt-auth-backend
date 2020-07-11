const { initDb } = require('../utils/init-db');

const { connect, disconnect, getCollection } = require('../lib/storage');
const { USER_COLLECTION, findByUsername, insertUser, validateUser, findUser, createUserSession, updateUser } = require('../lib/user');

const mockUsers = require('./mocks/users');
const { successfulInsertion } = require('./utils');
const dbName = 'test_users';

describe('Test user model functions', () => {
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

  it('should find a user by username', async () => {
    await getCollection(USER_COLLECTION).insertMany(mockUsers);

    const insertedUser = await findByUsername(mockUsers[0].username);
    expect(insertedUser._id).toEqual(mockUsers[0]._id.toHexString());

    const insertedUser2 = await findByUsername(mockUsers[1].username);
    expect(insertedUser2._id).toEqual(mockUsers[1]._id.toHexString());

    const insertedUser3 = await findByUsername('nonexistent');
    expect(insertedUser3).toBeNull();
  });

  it('should find a user by id', async () => {
    await getCollection(USER_COLLECTION).insertMany(mockUsers);

    const insertedUser = await findUser(mockUsers[0]._id.toHexString());
    expect(insertedUser).not.toBeNull();
    expect(insertedUser._id).toEqual(mockUsers[0]._id.toHexString());

    const insertedUser2 = await findUser(mockUsers[1]._id.toHexString());
    expect(insertedUser).not.toBeNull();
    expect(insertedUser2._id).toEqual(mockUsers[1]._id.toHexString());

    const insertedUser3 = await findUser('cccccccccccccccccccccccc');
    expect(insertedUser3).toBeNull();
  });

  it('normalize the user correctly', async () => {
    await getCollection(USER_COLLECTION).insertMany(mockUsers);

    const insertedUser = await findUser(mockUsers[0]._id);
    expect(typeof insertedUser._id).toBe('string');
  });

  it('should create a user correctly', async () => {
    expect.assertions(6);

    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[0]);
    delete mockUser.passwordHash;

    return insertUser(mockUser).then((result) => {
      expect(result).toMatchObject(successfulInsertion);

      return getCollection(USER_COLLECTION).findOne({ _id: mockUser._id });
    })
      .then((insertedUser) => {
        expect(insertedUser).toHaveProperty('signature');
        expect(insertedUser.signature.length).toBeGreaterThan(20);
        expect(insertedUser).toHaveProperty('passwordHash');
        expect(insertedUser.passwordHash.length).toBeGreaterThan(20);
        expect(insertedUser).not.toHaveProperty('password');
      });
  });

  it('should update a user correctly', async () => {
    expect.assertions(2);

    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[0]);
    delete mockUser.passwordHash;

    return insertUser(mockUser)
      .then((result) => {
        expect(result).toMatchObject(successfulInsertion);
        return updateUser(result.insertedId, { firstName: 'Change' });
      })
      .then((update) => {
        return getCollection(USER_COLLECTION).findOne({ _id: mockUser._id });
      })
      .then((result) => {
        return expect(result.firstName).toBe('Change');
      });
  });

  it('should update user signature on password change', async () => {
    expect.assertions(2);
    await getCollection(USER_COLLECTION).insertMany(mockUsers);

    const mockUserId = mockUsers[0]._id.toHexString();
    const mockUserSignature = mockUsers[0].signature;

    return updateUser(mockUserId, { password: 'newtestpassword' })
      .then((result) => {
        expect(result).toMatchObject(successfulInsertion);

        return getCollection(USER_COLLECTION).findOne({ _id: mockUsers[0]._id });
      })
      .then((result) => {
        return expect(result.signature).not.toEqual(mockUserSignature);
      });
  });

  it('should update user signature on email change', async () => {
    expect.assertions(2);
    await getCollection(USER_COLLECTION).insertMany(mockUsers);

    const mockUserId = mockUsers[0]._id.toHexString();
    const mockUserSignature = mockUsers[0].signature;

    return updateUser(mockUserId, { email: 'new@email.it' })
      .then((result) => {
        expect(result).toMatchObject(successfulInsertion);

        return getCollection(USER_COLLECTION).findOne({ _id: mockUsers[0]._id });
      })
      .then((result) => {
        return expect(result.signature).not.toEqual(mockUserSignature);
      });
  });

  it('should validate fields schema', async () => {
    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[1]);
    delete mockUser.passwordHash;

    expect(() => { validateUser(Object.assign({}, mockUser)); }).not.toThrow(Error);
    expect(() => { validateUser(Object.assign({}, mockUser, { username: '' })); }).toThrow(Error);
    expect(() => { validateUser(Object.assign({}, mockUser, { password: '' })); }).toThrow(Error);
    expect(() => { validateUser(Object.assign({}, mockUser, { email: '' })); }).toThrow(Error);
    expect(() => { validateUser(Object.assign({}, mockUser, { email: 'aaa@bb' })); }).toThrow(Error);
    expect(() => { validateUser(Object.assign({}, mockUser, { firstName: '' })); }).toThrow(Error);
    expect(() => { validateUser(Object.assign({}, mockUser, { lastName: '' })); }).toThrow(Error);
  });

  it('should create a nice session', async () => {
    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[0]);
    delete mockUser.passwordHash;

    return insertUser(mockUser)
      .then((result) => {
        return getCollection(USER_COLLECTION).findOne({ _id: mockUser._id });
      })
      .then((resultUser) => {
        return expect(createUserSession(resultUser)).toEqual({
          sub: resultUser._id,
          role: resultUser.role,
          signature: resultUser.signature
        });
      });
  });
});
