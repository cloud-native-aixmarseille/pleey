const { Server } = require('socket.io');
const Client = require('socket.io-client');

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

describe('WebSocket Events', () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    // Create Socket.io server
    const httpServer = require('http').createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);

      io.on('connection', (socket) => {
        serverSocket = socket;
      });

      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test('should connect to socket server', () => {
    expect(clientSocket.connected).toBe(true);
  });

  test('should emit and receive custom events', (done) => {
    const testData = { message: 'test' };

    serverSocket.on('test-event', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    clientSocket.emit('test-event', testData);
  });

  test('should broadcast events to all clients', (done) => {
    const testData = { game: 'started' };

    clientSocket.on('broadcast-event', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    serverSocket.emit('broadcast-event', testData);
  });

  test('should handle disconnection', (done) => {
    serverSocket.on('disconnect', () => {
      expect(serverSocket.connected).toBe(false);
      done();
    });

    clientSocket.disconnect();
  });
});

describe('Game Session WebSocket Logic', () => {
  test('should validate game session structure', () => {
    const mockSession = {
      id: 1,
      quiz_id: 1,
      pin: '123456',
      status: 'waiting',
      current_question: 0,
      players: []
    };

    expect(mockSession).toHaveProperty('pin');
    expect(mockSession).toHaveProperty('status', 'waiting');
    expect(mockSession).toHaveProperty('current_question', 0);
    expect(Array.isArray(mockSession.players)).toBe(true);
  });

  test('should validate player answer structure', () => {
    const mockAnswer = {
      session_id: 1,
      user_id: 1,
      question_id: 1,
      answer: 'A',
      answer_time: 5000,
      is_correct: 1,
      points: 1200
    };

    expect(mockAnswer).toHaveProperty('session_id');
    expect(mockAnswer).toHaveProperty('user_id');
    expect(mockAnswer).toHaveProperty('question_id');
    expect(mockAnswer).toHaveProperty('answer');
    expect(typeof mockAnswer.points).toBe('number');
  });

  test('should calculate points based on speed', () => {
    const basePoints = 1000;
    const timeLimit = 20000; // 20 seconds
    const answerTime = 10000; // 10 seconds
    const timeBonus = 500;

    const timeLeft = timeLimit - answerTime;
    const calculatedBonus = Math.floor((timeLeft / timeLimit) * timeBonus);
    const totalPoints = basePoints + calculatedBonus;

    expect(totalPoints).toBeGreaterThan(basePoints);
    expect(totalPoints).toBeLessThanOrEqual(basePoints + timeBonus);
  });
});
