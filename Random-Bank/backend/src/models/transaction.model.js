module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer', 'payment', 'refund'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.01
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(
        'uncategorized',
        'general',
        'groceries',
        'shopping',
        'entertainment',
        'dining',
        'transportation',
        'utilities',
        'healthcare',
        'education',
        'housing',
        'travel',
        'income',
        'investment',
        'transfer',
        'food',
        'business',
        'health',
        'other',
        'family'
      ),
      defaultValue: 'general',
      allowNull: false
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accountType: {
      type: DataTypes.ENUM('checking', 'savings', 'credit', 'investment'),
      defaultValue: 'checking',
      allowNull: false
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'completed',
        'failed',
        'flagged',
        'reversed',
        'cancelled',
        'pending_verification' // New status for transactions requiring identity verification
      ),
      defaultValue: 'pending',
      allowNull: false
    },
    fraudScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'transactions',
    hooks: {
      beforeCreate: (transaction) => {
        // Generate a reference number if one doesn't exist
        if (!transaction.referenceNumber) {
          const prefix = 'TXN';
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          transaction.referenceNumber = `${prefix}-${timestamp}-${random}`;
        }
      }
    }
  });

  return Transaction;
};
