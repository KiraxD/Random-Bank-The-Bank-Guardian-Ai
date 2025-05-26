require('dotenv').config({ path: '../../.env' });
const { User, Transaction, sequelize } = require('../models');

/**
 * Script to directly transfer money between users
 * This bypasses the regular transaction flow to ensure correct transfers
 */
async function directTransfer(fromUsername, toUsername, amount) {
  let t;
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Start a transaction
    t = await sequelize.transaction();

    // Find sender and recipient users
    const sender = await User.findOne({ 
      where: { username: fromUsername },
      transaction: t
    });
    
    const recipient = await User.findOne({ 
      where: { username: toUsername },
      transaction: t
    });

    if (!sender || !recipient) {
      throw new Error(`Could not find ${!sender ? 'sender' : 'recipient'} user`);
    }

    console.log(`Found users: ${fromUsername} (${sender.id}) and ${toUsername} (${recipient.id})`);
    console.log(`Current balances: ${fromUsername}: ${sender.balance} INR, ${toUsername}: ${recipient.balance} INR`);

    if (sender.balance < amount) {
      throw new Error(`Insufficient balance: ${sender.balance} INR (need ${amount} INR)`);
    }
    
    // Generate reference number
    const referenceNumber = `DIRECT-${Math.floor(Math.random() * 100000000)}`;
    
    // Create transaction record for sender
    await Transaction.create({
      userId: sender.id,
      type: 'payment',
      amount: amount,
      description: `Direct payment to ${toUsername}`,
      category: 'transfer',
      recipientId: recipient.id,
      recipientName: recipient.username,
      accountType: 'checking',
      status: 'completed',
      fraudScore: 0,
      notes: 'Direct transfer via script',
      referenceNumber
    }, { transaction: t });
    
    // Create transaction record for recipient
    await Transaction.create({
      userId: recipient.id,
      type: 'deposit',
      amount: amount,
      description: `Payment received from ${fromUsername}`,
      category: 'transfer',
      recipientId: sender.id,
      recipientName: sender.username,
      accountType: 'checking',
      status: 'completed',
      fraudScore: 0,
      notes: 'Direct transfer via script',
      referenceNumber: `${referenceNumber}-R`
    }, { transaction: t });
    
    // Update balances
    await sender.decrement('balance', { by: amount, transaction: t });
    await recipient.increment('balance', { by: amount, transaction: t });
    
    // Commit the transaction
    await t.commit();
    
    // Reload users to get updated balances
    await sender.reload();
    await recipient.reload();
    
    console.log(`Transfer complete!`);
    console.log(`New balances: ${fromUsername}: ${sender.balance} INR, ${toUsername}: ${recipient.balance} INR`);
    console.log('Operation completed successfully.');
  } catch (error) {
    // Rollback transaction on error
    if (t) await t.rollback();
    console.error('Error transferring funds:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the function with the specified parameters
// Arguments: fromUsername, toUsername, amount
const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error('Usage: node direct-transfer.js <fromUsername> <toUsername> <amount>');
  process.exit(1);
}

const [fromUsername, toUsername, amountStr] = args;
const amount = parseFloat(amountStr);

if (isNaN(amount) || amount <= 0) {
  console.error('Amount must be a positive number');
  process.exit(1);
}

directTransfer(fromUsername, toUsername, amount);
