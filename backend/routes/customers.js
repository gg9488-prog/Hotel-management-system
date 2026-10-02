// routes/customers.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/customerController');

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);
router.post('/',    ctrl.create);
router.delete('/:id', ctrl.remove);

module.exports = router;
