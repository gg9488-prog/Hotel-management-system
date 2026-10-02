// controllers/feedbackController.js
const db = require('../config/db');

// GET /api/feedback
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        f.feedback_id,
        f.rating,
        f.comments,
        f.customer_id,
        c.name AS customer_name,
        c.email
      FROM Feedback f
      LEFT JOIN Customer c ON c.customer_id = f.customer_id
      ORDER BY f.feedback_id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('feedbackController.getAll:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// POST /api/feedback
exports.create = async (req, res) => {
  const { feedback_id, rating, comments, customer_id } = req.body;

  if (!feedback_id || rating === undefined || !customer_id) {
    return res.status(400).json({ error: 'feedback_id, rating and customer_id are required' });
  }
  const r = parseInt(rating);
  if (isNaN(r) || r < 1 || r > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  try {
    await db.query(
      'INSERT INTO Feedback (feedback_id, rating, comments, customer_id) VALUES (?, ?, ?, ?)',
      [feedback_id.trim(), r, (comments || '').trim() || null, customer_id.trim()]
    );
    res.status(201).json({ message: 'Feedback submitted successfully', feedback_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Feedback ID already exists' });
    }
    console.error('feedbackController.create:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};
