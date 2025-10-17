const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
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

describe('Authentication API', () => {
  let app;
  let db;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-require server to get fresh instance
    delete require.cache[require.resolve('../server.js')];

    // Mock environment variables
    process.env.JWT_SECRET = 'test_secret';
    process.env.NODE_ENV = 'test';
  });

  describe('POST /api/register', () => {
    test('should register a new user successfully', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const app = require('../server.js');

      request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès');
          expect(res.body).toHaveProperty('userId', 1);
          done();
        });
    });

    test('should return error if user already exists', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.run.mockImplementation((query, params, callback) => {
        callback.call({ lastID: null }, new Error('UNIQUE constraint failed'));
      });

      const app = require('../server.js');

      request(app)
        .post('/api/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error', 'Utilisateur déjà existant');
          done();
        });
    });
  });

  describe('POST /api/login', () => {
    test('should login successfully with valid credentials', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      const hashedPassword = bcrypt.hashSync('password123', 10);

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: hashedPassword,
          is_admin: 0
        });
      });

      const app = require('../server.js');

      request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('username', 'testuser');
          done();
        });
    });

    test('should return error with invalid credentials', (done) => {
      const sqlite3 = require('sqlite3');
      const mockDb = new sqlite3.verbose().Database();

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const app = require('../server.js');

      request(app)
        .post('/api/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error', 'Identifiants incorrects');
          done();
        });
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', (done) => {
      const app = require('../server.js');

      request(app)
        .get('/api/health')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          done();
        });
    });
  });
});
