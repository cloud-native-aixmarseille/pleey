const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock de la base de données SQLite
jest.mock('sqlite3', () => {
  const mockDb = {
    serialize: jest.fn((callback) => callback()),
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn()
  };
  return {
    verbose: () => ({
      Database: jest.fn(() => mockDb)
    })
  };
});

describe('Quiz API', () => {
  let app;
  let authToken;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variables
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';

    // Generate a test token
    authToken = jwt.sign(
      { id: 1, username: 'testuser', isAdmin: 1 },
      'test_secret',
      { expiresIn: '24h' }
    );

    // Re-require server to get fresh instance
    delete require.cache[require.resolve('../server.js')];
  });

  describe('GET /api/quizzes', () => {
    test('should return all quizzes for authenticated user', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          { id: 1, title: 'Test Quiz 1', description: 'Description 1' },
          { id: 2, title: 'Test Quiz 2', description: 'Description 2' }
        ]);
      });

      const app = require('../server.js');

      request(app)
        .get('/api/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('title', 'Test Quiz 1');
          done();
        });
    });

    test('should return 401 without authentication', (done) => {
      const app = require('../server.js');

      request(app)
        .get('/api/quizzes')
        .expect(401, done);
    });
  });

  describe('POST /api/quizzes', () => {
    test('should create a new quiz for authenticated admin', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const app = require('../server.js');

      request(app)
        .post('/api/quizzes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Quiz',
          description: 'New Quiz Description'
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('title', 'New Quiz');
          done();
        });
    });

    test('should return 401 without authentication', (done) => {
      const app = require('../server.js');

      request(app)
        .post('/api/quizzes')
        .send({
          title: 'New Quiz',
          description: 'New Quiz Description'
        })
        .expect(401, done);
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    test('should delete a quiz for authenticated admin', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ changes: 1 }, null);
      });

      const app = require('../server.js');

      request(app)
        .delete('/api/quizzes/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('message', 'Quiz supprimé');
          done();
        });
    });

    test('should return 401 without authentication', (done) => {
      const app = require('../server.js');

      request(app)
        .delete('/api/quizzes/1')
        .expect(401, done);
    });
  });

  describe('GET /api/quizzes/:quizId/questions', () => {
    test('should return all questions for a quiz', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, [
          {
            id: 1,
            quiz_id: 1,
            question_text: 'What is 2+2?',
            type: 'multiple',
            correct_answer: '4',
            option_a: '3',
            option_b: '4',
            option_c: '5',
            option_d: '6'
          }
        ]);
      });

      const app = require('../server.js');

      request(app)
        .get('/api/quizzes/1/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0]).toHaveProperty('question_text', 'What is 2+2?');
          done();
        });
    });
  });

  describe('POST /api/questions', () => {
    test('should create a new question', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const app = require('../server.js');

      request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quiz_id: 1,
          question_text: 'What is the capital of France?',
          type: 'multiple',
          correct_answer: 'Paris',
          option_a: 'London',
          option_b: 'Paris',
          option_c: 'Berlin',
          option_d: 'Madrid',
          time_limit: 20,
          points: 1000
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('id', 1);
          expect(res.body).toHaveProperty('message', 'Question créée');
          done();
        });
    });
  });
});
