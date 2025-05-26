const { Sequelize } = require('sequelize');
const config = require('../config/db.config.js')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    pool: config.pool,
    logging: config.logging
  }
);

const db = {
  sequelize,
  Sequelize,
  User: require('./user.model')(sequelize, Sequelize),
  Transaction: require('./transaction.model')(sequelize, Sequelize)
};

// Define relationships
// User has many transactions (as sender)
db.User.hasMany(db.Transaction, { 
  foreignKey: 'userId',
  as: 'transactions' 
});

// Transaction belongs to user (as sender)
db.Transaction.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'sender'
});

// User has many transactions as recipient
db.User.hasMany(db.Transaction, { 
  foreignKey: 'recipientId',
  as: 'receivedTransactions' 
});

// Transaction belongs to user as recipient
db.Transaction.belongsTo(db.User, {
  foreignKey: 'recipientId',
  as: 'recipient'
});

module.exports = db;
