require('dotenv').config({ path: '../../.env' });
const { User, sequelize } = require('../models');

/**
 * Script to add 10,000 INR to all user accounts
 */
async function addBalanceToAllAccounts() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get all users
    const users = await User.findAll();
    console.log(`Found ${users.length} users in the database.`);

    // Add 10,000 INR to each user's balance
    const amount = 10000;
    let updatedCount = 0;

    for (const user of users) {
      const oldBalance = user.balance;
      await user.increment('balance', { by: amount });
      await user.reload();
      
      console.log(`Updated user ${user.username || user.email}: Balance ${oldBalance} → ${user.balance} (+${amount} INR)`);
      updatedCount++;

      // Create a deposit transaction record for this balance addition
      const { Transaction } = require('../models');
      await Transaction.create({
        userId: user.id,
        type: 'deposit',
        amount: amount,
        description: 'Balance addition',
        category: 'income',
        status: 'completed',
        notes: 'System added 10,000 INR to account',
        fraudScore: 0,
        accountType: 'checking',
        referenceNumber: `SYSADD-${Date.now()}-${user.id}`
      });
    }

    console.log(`Successfully updated ${updatedCount} user accounts with +${amount} INR.`);
    console.log('Operation completed successfully.');
  } catch (error) {
    console.error('Error updating user balances:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the function
addBalanceToAllAccounts();
