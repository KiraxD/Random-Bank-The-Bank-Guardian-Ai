const express = require('express');
const router = express.Router();

// Simple mock fraud detection endpoint
router.post('/predict', (req, res) => {
  // Create a simple mock response
  const response = {
    transaction_id: `mock-${Date.now()}`,
    fraud_score: 0.2,
    is_fraudulent: false
  };
  
  // Return the response
  res.json(response);
});

module.exports = router;
