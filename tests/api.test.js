const { initDb } = require('../utils/init-db');

const { connect, disconnect, getCollection } = require('../lib/storage');
const { USER_COLLECTION } = require('../lib/user');

const mockUsers = require('./mocks/users');
const dbName = 'test_api';

const request = require('supertest');
const app = require('../app');

describe('Check user authentication', () => {
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

  describe('Test the api path', () => {
    test('It should authenticate successfully', () => {
      expect.assertions(4);

      return request(app)
        .post('/user/signin')
        .send({ username: 'testuser', password: 'testpassword' })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('token');

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

      return request(app)
        .post('/user/signin')
        .send({ username: 'testuser', password: 'testpassword' })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('token');
        });
    });

    test('It should fail signin on wrong password', () => {
      expect.assertions(1);

      return request(app)
        .post('/user/signin')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .then(response => {
          expect(response.statusCode).toBe(401);
        });
    });

    test('It should fail signin on mpm existing user', () => {
      expect.assertions(1);

      return request(app)
        .post('/user/signin')
        .send({ username: 'nonexistent', password: 'testpassword' })
        .then(response => {
          return expect(response.statusCode).toBe(401);
        });
    });

    test('It should fail signin on missing password', () => {
      expect.assertions(1);

      return request(app)
        .post('/user/signin')
        .send({ username: 'testuser' })
        .then(response => {
          return expect(response.statusCode).toBe(400);
        });
    });

    test('It should fail signin on missing username', () => {
      expect.assertions(1);

      request(app)
        .post('/user/signin')
        .send({ password: 'testpassword' })
        .then(response => {
          return expect(response.statusCode).toBe(400);
        });
    });

    test('It should logout and revoke the token', () => {
      let token;
      expect.assertions(3);

      return request(app)
        .post('/user/signin')
        .send({ username: 'testuser', password: 'testpassword' })
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
          expect(response.statusCode).toEqual(401);
        });
    });
  });
});
