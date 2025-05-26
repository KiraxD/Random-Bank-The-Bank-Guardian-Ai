require('dotenv').config({ path: '../../.env' });
const { User, Transaction, sequelize } = require('../models');

/**
 * Script to check all user balances and recent transactions
 */
async function checkBalancesAndTransactions() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get all users
    const users = await User.findAll();
    console.log(`\n=== USER BALANCES (${users.length} users) ===`);
    
    for (const user of users) {
      console.log(`${user.username || user.email}: ${user.balance} INR (ID: ${user.id})`);
    }

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    console.log(`\n=== RECENT TRANSACTIONS (${recentTransactions.length} transactions) ===`);
    for (const tx of recentTransactions) {
      console.log(`ID: ${tx.id.substring(0, 8)}...`);
      console.log(`Type: ${tx.type}`);
      console.log(`Amount: ${tx.amount} INR`);
      console.log(`User ID: ${tx.userId}`);
      console.log(`Recipient ID: ${tx.recipientId || 'None'}`);
      console.log(`Status: ${tx.status}`);
      console.log(`Created: ${tx.createdAt}`);
      console.log('---');
    }

    console.log('Operation completed successfully.');
  } catch (error) {
    console.error('Error checking balances and transactions:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the function
checkBalancesAndTransactions();
