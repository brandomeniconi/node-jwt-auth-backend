const { initDb } = require('../utils/init-db');

const { connect, disconnect, getCollection } = require('../lib/storage');
const { USER_COLLECTION } = require('../lib/user');

const mockUsers = require('./mocks/users');
const dbName = 'test_api';

const request = require('supertest');
const app = require('../app');

describe('Check APIs', () => {
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

  function signIn (credentials = { username: 'testuser', password: 'testpassword' }) {
    return request(app)
      .post('/user/signin')
      .send(credentials);
  }

  describe('Test the api path', () => {
    test('It should authenticate successfully', () => {
      expect.assertions(2);

      return signIn()
        .then(response => {
          return request(app)
            .get('/api/profile')
            .set('Authorization', 'Bearer ' + response.body.token);
        })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('status');
        });
    });
  });

  describe('Test the users path', () => {
    test('It should signin successfully', () => {
      expect.assertions(2);

      return signIn()
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('token');
        });
    });

    test('It should fail signin on wrong password', () => {
      expect.assertions(1);

      return signIn({ username: 'testuser', password: 'wrongpassword' })
        .then(response => {
          expect(response.statusCode).toBe(401);
        });
    });

    test('It should fail signin on non existing user', () => {
      expect.assertions(1);

      return signIn({ username: 'nonexistent', password: 'testpassword' })
        .then(response => {
          return expect(response.statusCode).toBe(401);
        });
    });

    test('It should fail signin on missing password', () => {
      expect.assertions(1);

      return signIn({ username: 'testuser' })
        .then(response => {
          return expect(response.statusCode).toBe(400);
        });
    });

    test('It should fail signin on missing username', () => {
      expect.assertions(1);

      return signIn({ password: 'testpassword' })
        .then(response => {
          return expect(response.statusCode).toBe(400);
        });
    });

    test('It should logout and revoke the token', () => {
      let token;
      expect.assertions(3);

      return signIn()
        .then(response => {
          expect(response.statusCode).toEqual(200);

          token = response.body.token;

          return request(app)
            .post('/user/logout')
            .set('Authorization', 'Bearer ' + token);
        })
        .then(response => {
          expect(response.statusCode).toEqual(200);

          return request(app)
            .get('/api/profile')
            .set('Authorization', 'Bearer ' + token);
        })
        .then(response => {
          return expect(response.statusCode).toEqual(401);
        });
    });

    test('It should change password and revoke previous token', () => {
      let token;
      expect.assertions(5);

      return signIn()
        .then(response => {
          expect(response.statusCode).toEqual(200);

          token = response.body.token;

          return request(app)
            .post('/user/change-password')
            .send({ previousPassword: 'testpassword', password: 'newtestpassword' })
            .set('Authorization', 'Bearer ' + token);
        })
        .then(response => {
          expect(response.statusCode).toEqual(200);
          expect(response.body.token).toBeDefined();

          const oldToken = token;
          token = response.body.token;

          return request(app)
            .get('/api/profile')
            .set('Authorization', 'Bearer ' + oldToken);
        })
        .then(response => {
          expect(response.statusCode).toEqual(401);

          return request(app)
            .get('/api/profile')
            .set('Authorization', 'Bearer ' + token);
        })
        .then(response => {
          return expect(response.statusCode).toEqual(200);
        });
    });
  });
});
