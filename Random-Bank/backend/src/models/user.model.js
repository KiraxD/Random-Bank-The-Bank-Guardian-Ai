module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 10000.00, // Starting balance in Indian Rupees (₹) for new users
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    accountNumber: {
      type: DataTypes.STRING(16),
      unique: true,
      allowNull: true,
      defaultValue: () => {
        // Generate a 16-digit account number starting with 1234
        const prefix = '1234';
        const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        return prefix + randomDigits;
      }
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    tableName: 'users'
  });

  return User;
};
