const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All transaction routes require authentication
router.use(verifyToken);

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Get user transactions with optional filtering
router.get('/', transactionController.getUserTransactions);

// Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

module.exports = router;
