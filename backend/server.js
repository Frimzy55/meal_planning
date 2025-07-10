import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// === MySQL Connection ===
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// === Models ===
const userModel = {
  async create({ fullName, indexNumber, email, password, role }) {
    const [result] = await pool.query(
      'INSERT INTO students (full_name, index_number, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, indexNumber, email, password, role]
    );
    return result;
  },

  async findByEmailOrIndex(email, indexNumber) {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE email = ? OR index_number = ?',
      [email, indexNumber]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    return rows[0];
  }
};

// === JWT Utility ===
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'student'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// === Auth Controllers ===
const authController = {
  async signup(req, res) {
    try {
      const { fullName, indexNumber, email, password } = req.body;

      const existingUser = await userModel.findByEmailOrIndex(email, indexNumber);
      if (existingUser) return res.status(409).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);

      await userModel.create({
        fullName,
        indexNumber,
        email,
        password: hashedPassword,
        role: 'student' // Restrict all signups to students only
      });

      res.status(201).json({ message: 'Student registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = generateToken(user);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// === Middleware for Authentication & Authorization ===
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

// === Routes ===
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);

// Example: Protected Route (any logged-in user)
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}! You accessed a protected route.` });
});

// Example: Admin-only route
app.get('/api/admin/dashboard', authenticateToken, authorizeAdmin, (req, res) => {
  res.json({ message: `Hello Admin ${req.user.email}, welcome to the admin dashboard.` });
});

// === Server Start ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Connected to database ${process.env.DB_NAME}`);
});
