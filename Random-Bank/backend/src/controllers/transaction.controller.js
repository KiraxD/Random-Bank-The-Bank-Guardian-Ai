const { Transaction, User, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Simple fraud detection function for INR transactions
 */
const detectFraud = (amount, type) => {
  // No fraud risk for small amounts (under ₹5,000)
  if (amount < 5000) {
    return {
      fraud_score: 0,
      is_fraudulent: false
    };
  }
  
  // Calculate base risk score
  let fraudScore = 0.1; // Base score
  
  // Add risk based on amount tiers in INR
  if (amount >= 5000 && amount < 25000) {
    fraudScore += 0.1;
  } else if (amount >= 25000 && amount < 50000) {
    fraudScore += 0.2;
  } else if (amount >= 50000 && amount < 200000) {
    fraudScore += 0.3;
  } else if (amount >= 200000 && amount < 500000) {
    fraudScore += 0.4;
  } else {
    // Very large amounts (₹5 lakh+)
    fraudScore += 0.5;
  }
  
  // Add risk for certain transaction types
  if (type === 'transfer' || type === 'payment') {
    fraudScore += 0.1;
  }
  
  // Determine if fraudulent (threshold is 0.7)
  const isFraudulent = fraudScore > 0.7;
  
  return {
    fraud_score: parseFloat(fraudScore.toFixed(2)),
    is_fraudulent: isFraudulent
  };
};

/**
 * Create a new transaction
 */
exports.createTransaction = async (req, res) => {
  // Start a database transaction
  let t;
  
  try {
    t = await sequelize.transaction();
    
    // Extract request data with defaults
    const { 
      type, 
      amount, 
      description = '', 
      recipientId = null, 
      recipientAccountNumber = null, 
      recipientName = '', 
      category = 'uncategorized', 
      accountType = 'checking',
      location = ''
    } = req.body;
    
    // Use let for these variables since they might be modified later
    let notes = req.body.notes || '';
    let metadata = req.body.metadata || {};
    const verification = req.body.verification || null;
    
    const userId = req.userId;
    
    // Basic validation
    if (!type || !['deposit', 'withdrawal', 'transfer', 'payment', 'refund'].includes(type)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid transaction type' });
    }
    
    if (!amount) {
      await t.rollback();
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    // Convert amount to number and validate
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    
    // Find user
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check balance for outgoing transactions
    if (['withdrawal', 'transfer', 'payment'].includes(type) && user.balance < numericAmount) {
      await t.rollback();
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Handle recipient for transfers and payments
    let recipient = null;
    
    if (type === 'transfer' || type === 'payment') {
      // Use recipient ID if provided
      if (recipientId) {
        recipient = await User.findByPk(recipientId, { transaction: t });
        if (!recipient) {
          await t.rollback();
          return res.status(404).json({ message: 'Recipient not found' });
        }
        
        // Prevent self-transfers
        if (recipient.id === userId) {
          await t.rollback();
          return res.status(400).json({ message: 'Cannot transfer to yourself' });
        }
      } 
      // Use recipient account number if provided
      else if (recipientAccountNumber) {
        // Special case handling for Payal-Reshob transactions
        if (recipientAccountNumber === 'RESHOB_RC_123456' || req.body.specialCase === 'payal_sender') {
          // This is a transaction from Payal to Reshob
          console.log('Detected special case: Payal sending to Reshob');
          
          // Find Reshob by email
          recipient = await User.findOne({
            where: {
              email: 'reshob.rc12345@gmail.com',
              id: { [Op.ne]: userId } // Not the sender
            },
            transaction: t
          });
          
          if (!recipient) {
            console.log('Reshob account not found, using fallback logic');
            // Use fallback if Reshob's account isn't found
            recipient = await User.findOne({
              where: {
                role: 'admin' // Assuming Reshob has admin role
              },
              transaction: t
            });
          }
        } else if (recipientAccountNumber === '1234119698013820' || req.body.specialCase === 'reshob_sender') {
          // This is a transaction from Reshob to Payal
          console.log('Detected special case: Reshob sending to Payal');
          
          // Find Payal by email
          recipient = await User.findOne({
            where: {
              email: 'payal12@gmai.com',
              id: { [Op.ne]: userId } // Not the sender
            },
            transaction: t
          });
          
          if (!recipient) {
            console.log('Payal account not found by email, trying by account number');
            // Try by account number as fallback
            recipient = await User.findOne({
              where: {
                accountNumber: '1234119698013820',
                id: { [Op.ne]: userId } // Not the sender
              },
              transaction: t
            });
          }
        } else {
          // Regular account lookup by account number
          recipient = await User.findOne({
            where: {
              accountNumber: recipientAccountNumber,
              id: { [Op.ne]: userId } // Not the sender
            },
            transaction: t
          });
        }
        
        // If not found and verified transaction, create a demo recipient
        if (!recipient && verification && verification.verified) {
          const userEmail = verification.user?.email || req.body.user?.email || req.body.recipientEmail || `demo_${Date.now()}@example.com`;
          recipient = await User.create({
            username: recipientName || 'Demo Recipient',
            email: userEmail,
            accountNumber: recipientAccountNumber,
            role: 'demo',
            balance: 0
          }, { transaction: t });
          
          console.log(`Created demo recipient: ${recipient.username} with account number: ${recipientAccountNumber}`);
        } else if (!recipient) {
          await t.rollback();
          return res.status(404).json({ message: 'Recipient account not found' });
        }
      } else {
        await t.rollback();
        return res.status(400).json({ message: 'Recipient ID or account number is required for transfers and payments' });
      }
    }
    
    // Set default fraud detection values
    let fraud_score = 0;
    let is_fraudulent = false;
    let status = 'completed';
    
    // Check if transaction is verified
    if (verification && verification.verified === true) {
      // For verified transactions, set low fraud score
      fraud_score = 0.1;
      is_fraudulent = false;
      status = 'completed';
      
      // Add verification data to metadata
      metadata = {
        ...metadata,
        verification: {
          method: verification.method || 'persona',
          timestamp: verification.timestamp || new Date().toISOString(),
          verified: true
        }
      };
    } else {
      // Regular fraud detection
      const fraudDetection = detectFraud(numericAmount, type);
      fraud_score = fraudDetection.fraud_score;
      is_fraudulent = fraudDetection.is_fraudulent;
      
      // Determine transaction status
      if (is_fraudulent) {
        status = 'flagged';
      } else if (fraud_score > 0.5) {
        status = 'processing';
      }
    }
    
    // Generate reference number
    const referenceNumber = `TX-${Date.now()}-${userId}`;
    
    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type,
      amount: numericAmount,
      description,
      category,
      recipientId: recipient ? recipient.id : null,
      recipientName: recipient ? recipient.username : recipientName,
      accountType,
      location,
      status,
      fraudScore: fraud_score,
      notes,
      metadata,
      referenceNumber
    }, { transaction: t });
    
    // Create mirror transaction for recipient if applicable
    if ((type === 'transfer' || type === 'payment') && recipient) {
      const recipientReferenceNumber = `${referenceNumber}-R`;
      
      // Create the recipient's transaction record
      await Transaction.create({
        userId: recipient.id,
        type: 'deposit', // Always appears as a deposit to the recipient
        amount: numericAmount,
        description: `${type === 'transfer' ? 'Transfer' : 'Payment'} received from ${user.username || 'User'}`,
        category: category,
        recipientId: userId, // The original sender becomes the recipient in this record
        recipientName: user.username || 'User',
        accountType,
        location,
        status: 'completed', // Always completed for the recipient
        fraudScore: 0, // No fraud risk for receiving money
        notes: `Received via ${type} from ${user.username || 'User'}`,
        metadata,
        referenceNumber: recipientReferenceNumber
      }, { transaction: t });
    }
    
    // Update account balances
    if (['deposit', 'refund'].includes(type)) {
      // Add to user's balance
      await user.increment('balance', { by: numericAmount, transaction: t });
    } else if (type === 'withdrawal') {
      // Subtract from user's balance
      await user.decrement('balance', { by: numericAmount, transaction: t });
    } else if (['transfer', 'payment'].includes(type)) {
      // Subtract from sender
      await user.decrement('balance', { by: numericAmount, transaction: t });
      // Add to recipient
      await recipient.increment('balance', { by: numericAmount, transaction: t });
    }
    
    // Commit the transaction
    await t.commit();
    
    // Get updated balance
    const updatedUser = await User.findByPk(userId);
    
    // Return success response
    return res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      currentBalance: updatedUser.balance
    });
    
  } catch (error) {
    // Rollback transaction on error
    if (t) await t.rollback();
    
    console.error('Transaction error:', error);
    
    // Check for specific validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Handle database constraint errors
    if (error.name === 'SequelizeDatabaseError') {
      // Check for enum constraint errors
      if (error.message.includes('enum')) {
        return res.status(400).json({
          message: 'Invalid value for field',
          error: error.message
        });
      }
    }
    
    return res.status(500).json({
      message: 'An error occurred while processing the transaction',
      error: error.message
    });
  }
};

/**
 * Get user transactions
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, offset = 0, type, category, status, sort = 'createdAt', order = 'DESC' } = req.query;
    
    // Build query filters
    const where = { userId };
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Find transactions
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]],
      include: [{
        model: User,
        as: 'recipient',
        attributes: ['id', 'username', 'email', 'accountNumber'],
        required: false
      }]
    });
    
    return res.status(200).json({
      count,
      transactions
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

/**
 * Get transaction by ID
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const transaction = await Transaction.findOne({
      where: {
        id,
        userId
      },
      include: [{
        model: User,
        as: 'recipient',
        attributes: ['id', 'username', 'email', 'accountNumber'],
        required: false
      }]
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    return res.status(200).json(transaction);
    
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return res.status(500).json({
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
};
