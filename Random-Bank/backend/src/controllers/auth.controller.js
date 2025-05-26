const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Sequelize } = require('../models');
const { Op } = Sequelize;

// Generate a random account number
const generateAccountNumber = () => {
  // Generate a 16-digit account number starting with 1234
  const prefix = '1234';
  const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
  return prefix + randomDigits;
};

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username or email already in use'
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Generate a unique account number
    let accountNumber;
    let isUnique = false;
    
    while (!isUnique) {
      accountNumber = generateAccountNumber();
      // Check if account number already exists
      const existingAccount = await User.findOne({
        where: { accountNumber }
      });
      
      if (!existingAccount) {
        isUnique = true;
      }
    }
    
    // Create new user with account number
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      accountNumber
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'random-bank-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        accountNumber: user.accountNumber
      },
      accessToken: token
    });
  } catch (error) {
    console.error('Signup error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'An error occurred while registering the user',
      error: error.message,
      stack: error.stack
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check password validity
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'random-bank-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        accountNumber: user.accountNumber
      },
      accessToken: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while logging in',
      error: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // If user doesn't have an account number, generate one
    if (!user.accountNumber) {
      const prefix = '1234';
      const randomDigits = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
      user.accountNumber = prefix + randomDigits;
      await user.save();
    }
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      accountNumber: user.accountNumber
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      message: 'An error occurred while fetching the profile',
      error: error.message
    });
  }
};
