// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_changez_moi';

// Base de données SQLite - utiliser un chemin persistant en production
const DB_PATH = process.env.NODE_ENV === 'production' ? './data/quiz.db' : './quiz.db';
const db = new sqlite3.Database(DB_PATH);

// Initialisation de la base de données
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('multiple', 'truefalse')),
    correct_answer TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    time_limit INTEGER DEFAULT 20,
    points INTEGER DEFAULT 1000,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    pin TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'waiting',
    current_question INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    answer_time INTEGER,
    is_correct INTEGER DEFAULT 0,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  )`);

  // Créer un admin par défaut
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)`,
    ['admin', 'admin@quiz.com', hashedPassword, 1]);
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes d'authentification
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Utilisateur déjà existant' });
      }
      res.json({ message: 'Utilisateur créé avec succès', userId: this.lastID });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Identifiants incorrects' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
  });
});

// Routes Quiz (Admin)
app.get('/api/quizzes', authenticateToken, (req, res) => {
  db.all('SELECT * FROM quizzes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/quizzes', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  db.run(
    'INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)',
    [title, description, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, description });
    }
  );
});

app.delete('/api/quizzes/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM quizzes WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Quiz supprimé' });
  });
});

// Routes Questions
app.get('/api/quizzes/:quizId/questions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM questions WHERE quiz_id = ?', [req.params.quizId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/questions', authenticateToken, (req, res) => {
  const { quiz_id, question_text, type, correct_answer, option_a, option_b, option_c, option_d, time_limit, points } = req.body;

  db.run(
    `INSERT INTO questions (quiz_id, question_text, type, correct_answer, option_a, option_b, option_c, option_d, time_limit, points)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [quiz_id, question_text, type, correct_answer, option_a, option_b, option_c, option_d, time_limit || 20, points || 1000],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Question créée' });
    }
  );
});

app.delete('/api/questions/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM questions WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Question supprimée' });
  });
});

// Routes Game Sessions
app.post('/api/sessions/create', authenticateToken, (req, res) => {
  const { quizId } = req.body;
  const pin = Math.floor(100000 + Math.random() * 900000).toString();

  db.run(
    'INSERT INTO game_sessions (quiz_id, pin) VALUES (?, ?)',
    [quizId, pin],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ sessionId: this.lastID, pin });
    }
  );
});

// Gestion des connexions WebSocket
const gameRooms = new Map();

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  socket.on('join-game', ({ pin, username, userId }) => {
    db.get('SELECT * FROM game_sessions WHERE pin = ?', [pin], (err, session) => {
      if (err || !session) {
        socket.emit('error', { message: 'Session introuvable' });
        return;
      }

      socket.join(pin);
      
      if (!gameRooms.has(pin)) {
        gameRooms.set(pin, { players: [], session });
      }

      const room = gameRooms.get(pin);
      room.players.push({ socketId: socket.id, username, userId, score: 0 });

      io.to(pin).emit('player-joined', {
        players: room.players,
        playerCount: room.players.length
      });

      socket.emit('joined-successfully', { session });
    });
  });

  socket.on('start-game', ({ pin }) => {
    const room = gameRooms.get(pin);
    if (!room) return;

    db.all('SELECT * FROM questions WHERE quiz_id = ?', [room.session.quiz_id], (err, questions) => {
      if (err || !questions.length) {
        socket.emit('error', { message: 'Aucune question trouvée' });
        return;
      }

      room.questions = questions;
      room.currentQuestion = 0;

      io.to(pin).emit('game-started', {
        question: questions[0],
        questionNumber: 1,
        totalQuestions: questions.length
      });
    });
  });

  socket.on('submit-answer', ({ pin, userId, answer, timeLeft }) => {
    const room = gameRooms.get(pin);
    if (!room) return;

    const question = room.questions[room.currentQuestion];
    const isCorrect = answer === question.correct_answer;
    const timeBonus = Math.floor((timeLeft / question.time_limit) * 500);
    const points = isCorrect ? question.points + timeBonus : 0;

    const player = room.players.find(p => p.userId === userId);
    if (player) {
      player.score += points;
    }

    db.run(
      'INSERT INTO scores (session_id, user_id, question_id, points, answer_time, is_correct) VALUES (?, ?, ?, ?, ?, ?)',
      [room.session.id, userId, question.id, points, question.time_limit - timeLeft, isCorrect ? 1 : 0]
    );

    socket.emit('answer-result', { isCorrect, points, correctAnswer: question.correct_answer });
  });

  socket.on('next-question', ({ pin }) => {
    const room = gameRooms.get(pin);
    if (!room) return;

    room.currentQuestion++;

    if (room.currentQuestion >= room.questions.length) {
      const sortedPlayers = room.players.sort((a, b) => b.score - a.score);
      io.to(pin).emit('game-ended', { leaderboard: sortedPlayers });
      gameRooms.delete(pin);
    } else {
      io.to(pin).emit('next-question', {
        question: room.questions[room.currentQuestion],
        questionNumber: room.currentQuestion + 1,
        totalQuestions: room.questions.length
      });
    }
  });

  socket.on('get-leaderboard', ({ pin }) => {
    const room = gameRooms.get(pin);
    if (!room) return;

    const sortedPlayers = room.players.sort((a, b) => b.score - a.score);
    socket.emit('leaderboard-update', { leaderboard: sortedPlayers });
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion:', socket.id);
    
    gameRooms.forEach((room, pin) => {
      const index = room.players.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        io.to(pin).emit('player-left', {
          players: room.players,
          playerCount: room.players.length
        });
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});