import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import WidgetManager from '../components/widgets/WidgetManager';
import { getCategoryById, getCategoryIcon } from '../data/categories';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowsRightLeftIcon, 
  ExclamationTriangleIcon,
  HomeIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const [balance, setBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spendingData, setSpendingData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('Checking Account');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get user profile to get the latest balance and account number
      const profileResponse = await api.get('/auth/profile');
      setBalance(profileResponse.data.balance);
      setAccountNumber(profileResponse.data.accountNumber || 'Not Available');
      
      // Get recent transactions
      const transactionsResponse = await api.get('/transactions?limit=5');
      setRecentTransactions(transactionsResponse.data.transactions);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();

    // Set up polling to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Listen for transaction completed events
    const handleTransactionCompleted = () => {
      console.log('Transaction completed, refreshing dashboard data');
      fetchDashboardData();
    };
    
    window.addEventListener('transactionCompleted', handleTransactionCompleted);

    // Clean up interval and event listener on component unmount
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('transactionCompleted', handleTransactionCompleted);
    };
  }, []);

  // Generate mock spending data for the chart
  useEffect(() => {
    const mockData = [
      { day: '1/7', amount: 3000 },
      { day: '1/2', amount: 2500 },
      { day: '1/3', amount: 2000 },
      { day: '1/4', amount: 4000 },
      { day: '1/5', amount: 2800 },
      { day: '1/6', amount: 3500 },
      { day: '1/7', amount: 3200 },
    ];
    setSpendingData(mockData);
  }, []);

  // Helper function to format currency in Indian Rupees
  const formatCurrency = (amount) => {
    // Use INR prefix with space and proper formatting
    return 'INR ' + new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get transaction icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
      case 'transfer':
        return <ArrowsRightLeftIcon className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <BanknotesIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  // Helper function to get transaction icon background color
  const getTransactionIconBg = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100';
      case 'withdrawal':
        return 'bg-red-100';
      case 'transfer':
        return 'bg-blue-100';
      case 'payment':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Helper function to get transaction title
  const getTransactionTitle = (transaction) => {
    if (transaction.description) {
      return transaction.description;
    }
    
    switch (transaction.type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return transaction.recipientName ? `Transfer to ${transaction.recipientName}` : 'Transfer';
      case 'payment':
        return transaction.recipientName ? `Payment to ${transaction.recipientName}` : 'Payment';
      default:
        return 'Transaction';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Filter transactions based on active filter and search query
  const filteredTransactions = recentTransactions ? recentTransactions.filter(transaction => {
    // Filter by type
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'expenses' && transaction.type === 'withdrawal') || 
      (activeFilter === 'income' && transaction.type === 'deposit');
    
    if (!matchesFilter) return false;
    
    // Filter by search query
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (transaction.description && transaction.description.toLowerCase().includes(searchLower)) ||
      (transaction.recipientName && transaction.recipientName.toLowerCase().includes(searchLower)) ||
      (transaction.amount.toString().includes(searchLower)) ||
      (transaction.type.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Generate a random card number for display
  const cardNumber = '1111 **** **** ' + (currentUser?.id ? String(currentUser.id).substring(0, 4) : '0000');

  return (
    <div className={`flex w-full min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Sidebar */}
      <div className={`w-64 min-h-screen p-4 shadow-md flex-shrink-0 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>
        <div className="mb-4">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Random Bank</h1>
        </div>
        
        <nav className="space-y-1">
          <NavLink to="/dashboard" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <HomeIcon className="w-5 h-5 mr-3" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/transactions/new?type=deposit" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <ArrowDownIcon className="w-5 h-5 mr-3" />
            <span>Deposit</span>
          </NavLink>
          
          <NavLink to="/transactions/new?type=withdrawal" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <ArrowUpIcon className="w-5 h-5 mr-3" />
            <span>Withdraw</span>
          </NavLink>
          
          <NavLink to="/transactions/new?type=transfer" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <ArrowsRightLeftIcon className="w-5 h-5 mr-3" />
            <span>Transfer</span>
          </NavLink>
          
          <NavLink to="/transactions/new?type=payment" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <BanknotesIcon className="w-5 h-5 mr-3" />
            <span>Pay by Account Number</span>
          </NavLink>
          
          <NavLink to="/transactions" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <BanknotesIcon className="w-5 h-5 mr-3" />
            <span>Transactions</span>
          </NavLink>
          
          <NavLink to="/cards" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <CreditCardIcon className="w-5 h-5 mr-3" />
            <span>Accounts and Cards</span>
          </NavLink>
          
          <NavLink to="/investments" className={`flex items-center px-4 py-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-purple-100'} rounded-lg`}>
            <ChartBarIcon className="w-5 h-5 mr-3" />
            <span>Investments</span>
          </NavLink>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 p-4 md:p-5 overflow-y-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`} style={{ maxHeight: '100vh', overflowY: 'auto' }}>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Transactions overview</h2>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                <BellIcon className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-medium">{currentUser?.username || 'User'}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Account Card - Left Column */}
            <div className="lg:col-span-1">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-purple-900'} text-white rounded-lg p-4 mb-4 shadow-lg w-full`}>
                <div className="flex justify-between items-center mb-4">
                  <select 
                    value={selectedAccount} 
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md"
                  >
                    <option>Checking Account</option>
                    <option>Savings Account</option>
                  </select>
                  <span className="text-xs">2.36%</span>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Balance</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(balance)}</h3>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Account Number</p>
                  <h4 className="text-lg font-medium">{accountNumber}</h4>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Assets</p>
                  <h4 className="text-lg">{formatCurrency(balance * 0.8)}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Income</p>
                    <p className="text-sm">{formatCurrency(30000)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Expenses</p>
                    <p className="text-sm">{formatCurrency(20000)}</p>
                  </div>
                </div>
              </div>
              
              {/* Card Display */}
              <div className="bg-gradient-to-r from-orange-300 to-red-300 rounded-lg p-4 shadow-lg h-48 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-12">
                  <div className="w-10 h-6 bg-yellow-200 rounded-md opacity-70"></div>
                  <div className="w-8 h-8 rounded-full bg-white/30"></div>
                </div>
                
                <p className="text-lg font-medium mb-4">{cardNumber}</p>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm">{currentUser?.username || 'User'}</p>
                  <p className="text-sm">12/24</p>
                </div>
              </div>
            </div>
            
            {/* Transactions - Middle and Right Columns */}
            <div className="lg:col-span-2">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4 shadow-lg w-full`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Transactions</h3>
                  <div className="flex items-center">
                    <button 
                      className={`px-3 py-1 rounded-md mr-2 ${activeFilter === 'all' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200') : (darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100')}`}
                      onClick={() => setActiveFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md mr-2 ${activeFilter === 'income' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200') : (darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100')}`}
                      onClick={() => setActiveFilter('income')}
                    >
                      Income
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-md ${activeFilter === 'expenses' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200') : (darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100')}`}
                      onClick={() => setActiveFilter('expenses')}
                    >
                      Expenses
                    </button>
                  </div>
                  <button className={`p-1 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100'}`}>
                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              
                <div className="mt-3 space-y-2 max-h-[450px] overflow-y-auto pr-1 w-full">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No transactions found
                    </div>
                  ) : (
                    <>
                      {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-all duration-200 hover:shadow-md`}>
                          <div className="flex items-center">
                            {transaction.category ? (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryById(transaction.category).bgColor}`}>
                                {getCategoryIcon(transaction.category)}
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionIconBg(transaction.type)}`}>
                                {getTransactionIcon(transaction.type)}
                              </div>
                            )}
                            <div className="ml-3">
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{getTransactionTitle(transaction)}</p>
                              <div className="flex items-center">
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                {transaction.category && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getCategoryById(transaction.category).bgColor} ${getCategoryById(transaction.category).color}`}>
                                    {getCategoryById(transaction.category).name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`font-medium ${transaction.type === 'deposit' || transaction.type === 'refund' ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'} INR {transaction.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between h-56 mt-4">
                <p className={`transform -rotate-90 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Statistics</p>
                
                <div className="flex-1 h-full flex items-end justify-between px-4">
                  {spendingData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-6 ${darkMode ? 'bg-purple-400' : 'bg-purple-200'} rounded-t-md`} 
                        style={{ height: `${(item.amount / 4000) * 150}px` }}
                      ></div>
                      <p className={`text-xs mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.day}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Widgets */}
          <div className="mb-6">
            <WidgetManager transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
