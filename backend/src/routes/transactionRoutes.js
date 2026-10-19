// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../../middleware/authenticateToken');

// Mount authentication middleware directly onto the POST rule
router.post('/', authenticateToken, transactionController.createTransaction);

module.exports = router;
