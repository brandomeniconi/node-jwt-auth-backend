const { initDb } = require('../utils/init-db');

const { connect, disconnect, findDocument, getCollection } = require('../lib/storage');
const { USER_COLLECTION, findByUsername } = require('../lib/user');

const mockUsers = require('./mocks/users');
const dbName = 'test_api';

const request = require("supertest");
const app = require("../app");

describe('Check user authentication', () => {
  let db;

  beforeAll(async () => {
    db = await connect(dbName);
    await db.dropDatabase(dbName);
  });

  beforeEach(async () => {
    await initDb(db);
    await getCollection(USER_COLLECTION).insertMany(mockUsers);
  });

  afterEach(async () => {
    await db.dropDatabase(dbName);
  });

  afterAll(async () => {
    await disconnect();
  });

  describe("Test the api path", () => {

    test("It should authenticate successfully", async done => {
      request(app)
        .post("/user/signin")
        .send({username: 'testuser', password: 'testpassword'})
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('token');
          
          return request(app)
          .get("/api/profile")
          .set('Authorization', 'Bearer ' + response.body.token)
          .then(response => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status');
            done();
          });

        }).catch(done.fail);
    });

  });

  describe("Test the users path", () => {

    test("It should signin successfully", async  done => {
      request(app)
        .post("/user/signin")
        .send({username: 'testuser', password: 'testpassword'})
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty('token');
          done();
        });
    });

    test("It should fail signin on wrong password", async done => {
      request(app)
        .post("/user/signin")
        .send({username: 'testuser', password: 'wrongpassword'})
        .then(response => {
          expect(response.statusCode).toBe(401);
          done();
        });
    });

    test("It should fail signin on mpm existing user", async done => {
      request(app)
        .post("/user/signin")
        .send({username: 'nonexistent', password: 'testpassword'})
        .then(response => {
          expect(response.statusCode).toBe(401);
          done();
        });
    });    

    test("It should fail signin on missing password", async  done => {
      request(app)
        .post("/user/signin")
        .send({username: 'testuser'})
        .then(response => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });   

    test("It should fail signin on missing username", async  done => {
      request(app)
        .post("/user/signin")
        .send({password: 'testpassword'})
        .then(response => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });
    

  });

});
