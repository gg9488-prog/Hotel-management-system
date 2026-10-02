// controllers/dashboardController.js
const db = require('../config/db');

// GET /api/dashboard  — aggregated stats for the dashboard
exports.getStats = async (req, res) => {
  try {
    const [[{ total_orders }]]   = await db.query('SELECT COUNT(*) AS total_orders FROM Orders');
    const [[{ total_customers }]] = await db.query('SELECT COUNT(*) AS total_customers FROM Customer');
    const [[{ total_revenue }]]  = await db.query('SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM Bill');
    const [[{ avg_rating }]]     = await db.query('SELECT COALESCE(AVG(rating),0) AS avg_rating FROM Feedback');

    res.json({
      total_orders,
      total_customers,
      total_revenue: parseFloat(total_revenue).toFixed(2),
      avg_rating:    parseFloat(avg_rating).toFixed(1),
    });
  } catch (err) {
    console.error('dashboardController.getStats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// GET /api/dashboard/recent-orders — last 10 orders with customer name & bill
exports.getRecentOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        o.order_id,
        o.order_date,
        o.order_time,
        o.table_id,
        c.name        AS customer_name,
        b.total_amount,
        (SELECT COUNT(*) FROM Order_Details od WHERE od.order_id = o.order_id) AS item_count
      FROM Orders o
      LEFT JOIN Customer       c ON c.customer_id = o.customer_id
      LEFT JOIN Bill           b ON b.order_id    = o.order_id
      ORDER BY o.order_date DESC, o.order_time DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error('dashboardController.getRecentOrders:', err);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
};

// GET /api/dashboard/top-items — top 5 ordered menu items
exports.getTopItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.item_name,
        SUM(od.quantity)         AS total_qty,
        SUM(od.quantity * m.price) AS total_revenue
      FROM Order_Details od
      JOIN Menu_Item m ON m.item_id = od.item_id
      GROUP BY m.item_id, m.item_name
      ORDER BY total_qty DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    console.error('dashboardController.getTopItems:', err);
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
};
