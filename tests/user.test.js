const { initDb } = require('../utils/init-db');

const DataStore = require('../lib/datastore');
const { USER_COLLECTION, UserStore } = require('../lib/user');

const mockUsers = require('./mocks/users');
const { successfulInsertion } = require('./utils');

describe('Test user model functions', () => {
  let db;
  let datastore;

  beforeAll(async () => {
    datastore = new DataStore(global.__MONGO_URI__);
    db = await datastore.connect(global.__MONGO_DB_NAME__);
    await db.dropDatabase();
  });

  beforeEach(async () => {
    await initDb(db);
  });

  afterEach(async () => {
    await datastore.clear();
  });

  afterAll(async () => {
    await datastore.disconnect();
  });

  it('should find a user by username', async () => {
    await datastore.getCollection(USER_COLLECTION).insertMany(mockUsers);

    const userStore = new UserStore(datastore);

    const insertedUser = await userStore.findByUsername(mockUsers[0].username);
    expect(insertedUser).not.toBeNull();
    expect(insertedUser._id).toEqual(mockUsers[0]._id.toHexString());

    const insertedUser2 = await userStore.findByUsername(mockUsers[1].username);
    expect(insertedUser2).not.toBeNull();
    expect(insertedUser2._id).toEqual(mockUsers[1]._id.toHexString());

    const insertedUser3 = await userStore.findByUsername('nonexistent');
    expect(insertedUser3).toBeNull();
  });

  it('should find a user by id', async () => {
    await datastore.getCollection(USER_COLLECTION).insertMany(mockUsers);
    const userStore = new UserStore(datastore);

    const insertedUser = await userStore.get(mockUsers[0]._id.toHexString());
    expect(insertedUser).not.toBeNull();
    expect(insertedUser._id).toEqual(mockUsers[0]._id.toHexString());

    const insertedUser2 = await userStore.get(mockUsers[1]._id.toHexString());
    expect(insertedUser).not.toBeNull();
    expect(insertedUser2._id).toEqual(mockUsers[1]._id.toHexString());

    const insertedUser3 = await userStore.get('cccccccccccccccccccccccc');
    expect(insertedUser3).toBeNull();
  });

  it('normalize the user correctly', async () => {
    await datastore.getCollection(USER_COLLECTION).insertMany(mockUsers);
    const userStore = new UserStore(datastore);

    const insertedUser = await userStore.get(mockUsers[0]._id);
    expect(typeof insertedUser._id).toBe('string');
  });

  it('should create a user correctly', async () => {
    expect.assertions(6);
    const userStore = new UserStore(datastore);

    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[0]);
    delete mockUser.passwordHash;

    return userStore.insert(mockUser).then((result) => {
      expect(result).toMatchObject(successfulInsertion);

      return datastore.getCollection(USER_COLLECTION).findOne({ _id: mockUser._id });
    })
      .then((insertedUser) => {
        expect(insertedUser).toHaveProperty('fingerprint');
        expect(insertedUser.fingerprint.length).toBeGreaterThan(20);
        expect(insertedUser).toHaveProperty('passwordHash');
        expect(insertedUser.passwordHash.length).toBeGreaterThan(20);
        expect(insertedUser).not.toHaveProperty('password');
      });
  });

  it('should update a user correctly', async () => {
    expect.assertions(2);
    const userStore = new UserStore(datastore);

    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[0]);
    delete mockUser.passwordHash;

    return userStore.insert(mockUser)
      .then((result) => {
        expect(result).toMatchObject(successfulInsertion);
        return userStore.update(result.insertedId, { firstName: 'Change' });
      })
      .then((update) => {
        return datastore.getCollection(USER_COLLECTION).findOne({ _id: mockUser._id });
      })
      .then((result) => {
        return expect(result.firstName).toBe('Change');
      });
  });

  it('should update user fingerprint on password change', async () => {
    expect.assertions(2);
    await datastore.getCollection(USER_COLLECTION).insertMany(mockUsers);

    const mockUserId = mockUsers[0]._id.toHexString();
    const mockUserfingerprint = mockUsers[0].fingerprint;
    const userStore = new UserStore(datastore);

    return userStore.update(mockUserId, { password: 'newtestpassword' })
      .then((result) => {
        expect(result).toMatchObject(successfulInsertion);

        return datastore.getCollection(USER_COLLECTION).findOne({ _id: mockUsers[0]._id });
      })
      .then((result) => {
        return expect(result.fingerprint).not.toEqual(mockUserfingerprint);
      });
  });

  it('should update user fingerprint on email change', async () => {
    expect.assertions(2);
    await datastore.getCollection(USER_COLLECTION).insertMany(mockUsers);

    const userStore = new UserStore(datastore);
    const mockUserId = mockUsers[0]._id.toHexString();
    const mockUserfingerprint = mockUsers[0].fingerprint;

    return userStore.update(mockUserId, { email: 'new@email.it' })
      .then((result) => {
        expect(result).toMatchObject(successfulInsertion);

        return userStore.get(mockUsers[0]._id);
      })
      .then((result) => {
        return expect(result.fingerprint).not.toEqual(mockUserfingerprint);
      });
  });

  it('should validate fields schema', async () => {
    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[1]);
    delete mockUser.passwordHash;

    expect(() => { UserStore.validate(Object.assign({}, mockUser)); }).not.toThrow(Error);
    expect(() => { UserStore.validate(Object.assign({}, mockUser, { username: '' })); }).toThrow(Error);
    expect(() => { UserStore.validate(Object.assign({}, mockUser, { password: '' })); }).toThrow(Error);
    expect(() => { UserStore.validate(Object.assign({}, mockUser, { email: '' })); }).toThrow(Error);
    expect(() => { UserStore.validate(Object.assign({}, mockUser, { email: 'aaa@bb' })); }).toThrow(Error);
    expect(() => { UserStore.validate(Object.assign({}, mockUser, { firstName: '' })); }).toThrow(Error);
    expect(() => { UserStore.validate(Object.assign({}, mockUser, { lastName: '' })); }).toThrow(Error);
  });

  it('should create a nice session', async () => {
    const userStore = new UserStore(datastore);
    const mockUser = Object.assign({ password: 'testuser' }, mockUsers[0]);
    delete mockUser.passwordHash;

    return userStore.insert(mockUser)
      .then((result) => {
        return datastore.getCollection(USER_COLLECTION).findOne({ _id: mockUser._id });
      })
      .then((resultUser) => {
        return expect(UserStore.createSession(resultUser)).toEqual({
          sub: resultUser._id,
          role: resultUser.role,
          fingerprint: resultUser.fingerprint
        });
      });
  });
});
