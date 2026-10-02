// routes/dashboard.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/dashboardController');

router.get('/',              ctrl.getStats);
router.get('/recent-orders', ctrl.getRecentOrders);
router.get('/top-items',     ctrl.getTopItems);

module.exports = router;
