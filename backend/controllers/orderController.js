// controllers/orderController.js
const db = require('../config/db');

// GET /api/orders
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        o.order_id, o.order_date, o.order_time, o.table_id, o.customer_id,
        c.name AS customer_name, b.total_amount, b.bill_id,
        (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) AS item_count
      FROM Orders o
      LEFT JOIN Customer c ON c.customer_id = o.customer_id
      LEFT JOIN Bill     b ON b.order_id    = o.order_id
      ORDER BY o.order_date DESC, o.order_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('orderController.getAll:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// GET /api/orders/:id
exports.getOne = async (req, res) => {
  try {
    const [[order]] = await db.query(
      `SELECT o.*, c.name AS customer_name, b.total_amount
       FROM Orders o
       LEFT JOIN Customer c ON c.customer_id = o.customer_id
       LEFT JOIN Bill     b ON b.order_id    = o.order_id
       WHERE o.order_id = ?`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items] = await db.query(
      `SELECT od.item_id, m.item_name, od.quantity, m.price,
              (od.quantity * m.price) AS subtotal
       FROM Order_Details od
       JOIN Menu_Item m ON m.item_id = od.item_id
       WHERE od.order_id = ?`,
      [req.params.id]
    );
    res.json({ ...order, items });
  } catch (err) {
    console.error('orderController.getOne:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// POST /api/orders
exports.create = async (req, res) => {
  const { order_id, order_date, order_time, customer_id, table_id, items } = req.body;

  if (!order_id || !order_date || !table_id || !items || !items.length) {
    return res.status(400).json({
      error: 'order_id, order_date, table_id and at least one item are required',
    });
  }

  // FIX: db is already a promise pool — getConnection() returns a promise
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'INSERT INTO Orders (order_id, order_date, order_time, customer_id, table_id) VALUES (?, ?, ?, ?, ?)',
      [order_id.trim(), order_date, order_time || null, customer_id || null, table_id.trim()]
    );

    let total = 0;
    for (const item of items) {
      const { item_id, quantity = 1 } = item;
      const [[menuItem]] = await conn.query(
        'SELECT price FROM Menu_Item WHERE item_id = ?', [item_id]
      );
      if (!menuItem) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: `Menu item ${item_id} not found` });
      }
      total += menuItem.price * quantity;
      await conn.query(
        'INSERT INTO Order_Details (order_id, item_id, quantity) VALUES (?, ?, ?)',
        [order_id.trim(), item_id, quantity]
      );
    }

    const bill_id = 'BILL-' + Date.now();
    await conn.query(
      'INSERT INTO Bill (bill_id, total_amount, order_id) VALUES (?, ?, ?)',
      [bill_id, total.toFixed(2), order_id.trim()]
    );

    await conn.commit();
    res.status(201).json({
      message: 'Order placed successfully',
      order_id: order_id.trim(),
      bill_id,
      total_amount: total.toFixed(2),
    });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      conn.release();
      return res.status(409).json({ error: 'Order ID already exists' });
    }
    console.error('orderController.create:', err);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    conn.release();
  }
};
