// controllers/customerController.js
const db = require('../config/db');

// GET /api/customers
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT customer_id, name, phone, email FROM Customer ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('customerController.getAll:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// GET /api/customers/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('customerController.getOne:', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// POST /api/customers
exports.create = async (req, res) => {
  const { customer_id, name, phone, email } = req.body;

  // Validation
  if (!customer_id || !name || !phone) {
    return res.status(400).json({ error: 'customer_id, name and phone are required' });
  }

  try {
    await db.query(
      'INSERT INTO Customer (customer_id, name, phone, email) VALUES (?, ?, ?, ?)',
      [customer_id.trim(), name.trim(), phone.trim(), (email || '').trim() || null]
    );
    res.status(201).json({ message: 'Customer registered successfully', customer_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Customer ID already exists' });
    }
    console.error('customerController.create:', err);
    res.status(500).json({ error: 'Failed to register customer' });
  }
};

// DELETE /api/customers/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error('customerController.remove:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
