// controllers/authController.js
const db  = require('../config/db');
const jwt = require('jsonwebtoken');
const fs  = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'saveur_secret_key_change_in_prod';
const JWT_EXPIRY = '8h';
const USERS_FILE = path.join(__dirname, '../data/users.json');

// ── Hardcoded fallback admin ──────────────────────────────────────────
const ADMIN = {
  username: process.env.ADMIN_USER || 'admin',
  password: process.env.ADMIN_PASS || 'saveur123',
  role: 'admin',
  name: 'Admin',
};

// ── Local user file helpers ───────────────────────────────────────────
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
      fs.writeFileSync(USERS_FILE, '[]');
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch { return []; }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ── POST /api/auth/register ───────────────────────────────────────────
exports.register = async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name)
    return res.status(400).json({ error: 'Username, password and name are required' });
  if (username.trim().length < 3)
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const users = readUsers();
  const exists = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (exists || username.trim().toLowerCase() === ADMIN.username.toLowerCase())
    return res.status(409).json({ error: 'Username already taken. Please choose another.' });

  const newUser = {
    id: Date.now().toString(),
    username: username.trim(),
    password,
    name: name.trim(),
    role: role || 'staff',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json({ message: 'Account created successfully! Please log in.' });
};

// ── POST /api/auth/login ──────────────────────────────────────────────
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  try {
    // 1. Hardcoded admin
    if (username.trim().toLowerCase() === ADMIN.username.toLowerCase() && password === ADMIN.password) {
      const token = jwt.sign({ username: ADMIN.username, role: ADMIN.role, name: ADMIN.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      return res.json({ token, name: ADMIN.name, role: ADMIN.role });
    }

    // 2. Registered users in local file
    const users = readUsers();
    const user  = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (user && user.password === password) {
      const token = jwt.sign({ username: user.username, role: user.role, name: user.name, id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      return res.json({ token, name: user.name, role: user.role });
    }

    // 3. Staff table in DB (optional fallback)
    const [rows] = await db.query(
      'SELECT staff_id, name, role, password_hash FROM Staff WHERE username = ? LIMIT 1',
      [username.trim()]
    ).catch(() => [[]]);
    if (rows.length && rows[0].password_hash === password) {
      const staff = rows[0];
      const token = jwt.sign({ username, role: staff.role || 'staff', name: staff.name, id: staff.staff_id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      return res.json({ token, name: staff.name, role: staff.role || 'staff' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('authController.login:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── POST /api/auth/verify ─────────────────────────────────────────────
exports.verify = (req, res) => {
  const auth  = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ valid: false });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, name: payload.name, role: payload.role });
  } catch { res.status(401).json({ valid: false }); }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────
exports.logout = (_req, res) => res.json({ message: 'Logged out successfully' });
