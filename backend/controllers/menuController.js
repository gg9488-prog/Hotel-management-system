// controllers/menuController.js
const db = require('../config/db');

// GET /api/menu
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT item_id, item_name, price FROM Menu_Item ORDER BY item_name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('menuController.getAll:', err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// GET /api/menu/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Menu_Item WHERE item_id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('menuController.getOne:', err);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

// POST /api/menu
exports.create = async (req, res) => {
  const { item_id, item_name, price } = req.body;

  if (!item_id || !item_name || price === undefined) {
    return res.status(400).json({ error: 'item_id, item_name and price are required' });
  }
  if (isNaN(price) || parseFloat(price) < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number' });
  }

  try {
    await db.query(
      'INSERT INTO Menu_Item (item_id, item_name, price) VALUES (?, ?, ?)',
      [item_id.trim(), item_name.trim(), parseFloat(price)]
    );
    res.status(201).json({ message: 'Menu item added successfully', item_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Item ID already exists' });
    }
    console.error('menuController.create:', err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

// PUT /api/menu/:id
exports.update = async (req, res) => {
  const { item_name, price } = req.body;
  if (!item_name && price === undefined) {
    return res.status(400).json({ error: 'Provide item_name or price to update' });
  }
  try {
    const fields = [];
    const vals   = [];
    if (item_name) { fields.push('item_name = ?'); vals.push(item_name.trim()); }
    if (price !== undefined) { fields.push('price = ?'); vals.push(parseFloat(price)); }
    vals.push(req.params.id);

    const [result] = await db.query(
      `UPDATE Menu_Item SET ${fields.join(', ')} WHERE item_id = ?`, vals
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Menu item updated' });
  } catch (err) {
    console.error('menuController.update:', err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// DELETE /api/menu/:id
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM Menu_Item WHERE item_id = ?', [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('menuController.remove:', err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
