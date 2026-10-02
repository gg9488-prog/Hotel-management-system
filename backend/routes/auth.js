// routes/auth.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.post('/verify',   ctrl.verify);
router.post('/logout',   ctrl.logout);

module.exports = router;
