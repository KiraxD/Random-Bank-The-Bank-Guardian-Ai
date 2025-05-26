import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import BaseWidget from './BaseWidget';
import { transactionCategories, getCategoryById } from '../../data/categories';

// This would normally be a proper chart library like Chart.js or Recharts
// For simplicity, we're implementing a basic visualization
const SpendingAnalyticsWidget = ({ transactions, onRefresh }) => {
  const { darkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      analyzeTransactions();
    }
  }, [transactions, timeframe]);

  const analyzeTransactions = () => {
    setIsLoading(true);
    
    // Filter transactions by timeframe
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const txDate = new Date(transaction.createdAt);
      if (timeframe === 'week') {
        // Last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return txDate >= weekAgo;
      } else if (timeframe === 'month') {
        // Last 30 days
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        return txDate >= monthAgo;
      } else if (timeframe === 'year') {
        // Last 365 days
        const yearAgo = new Date();
        yearAgo.setDate(now.getDate() - 365);
        return txDate >= yearAgo;
      }
      return true;
    });
    
    // Only include expenses (withdrawal, payment, transfer)
    const expenses = filtered.filter(tx => 
      tx.type === 'withdrawal' || tx.type === 'payment' || tx.type === 'transfer'
    );
    
    // Group by category
    const categoryAmounts = {};
    expenses.forEach(tx => {
      const category = tx.category || 'other';
      if (!categoryAmounts[category]) {
        categoryAmounts[category] = 0;
      }
      categoryAmounts[category] += tx.amount;
    });
    
    // Convert to array and sort by amount
    const data = Object.entries(categoryAmounts).map(([category, amount]) => ({
      category,
      amount,
      ...getCategoryById(category)
    }));
    
    data.sort((a, b) => b.amount - a.amount);
    setCategoryData(data);
    setIsLoading(false);
  };

  const handleRefresh = () => {
    analyzeTransactions();
    if (onRefresh) onRefresh();
  };

  // Find the total amount
  const totalAmount = categoryData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <BaseWidget
      title="Spending Analytics"
      icon={ChartBarIcon}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      height="h-80"
    >
      {/* Timeframe selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setTimeframe('week')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeframe === 'week'
              ? `${darkMode ? 'bg-primary-600' : 'bg-primary-500'} text-white`
              : `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${darkMode ? 'text-gray-200' : 'text-gray-700'}`
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeframe === 'month'
              ? `${darkMode ? 'bg-primary-600' : 'bg-primary-500'} text-white`
              : `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${darkMode ? 'text-gray-200' : 'text-gray-700'}`
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setTimeframe('year')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeframe === 'year'
              ? `${darkMode ? 'bg-primary-600' : 'bg-primary-500'} text-white`
              : `${darkMode ? 'bg-gray-600' : 'bg-gray-200'} ${darkMode ? 'text-gray-200' : 'text-gray-700'}`
          }`}
        >
          Year
        </button>
      </div>

      {categoryData.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No spending data available for this period
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoryData.map((item) => {
            // Calculate percentage of total
            const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
            
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-sm font-medium">
                    INR {item.amount.toLocaleString()}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className={`w-full h-2 bg-gray-200 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${item.bgColor}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-right text-gray-500">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BaseWidget>
  );
};

export default SpendingAnalyticsWidget;
