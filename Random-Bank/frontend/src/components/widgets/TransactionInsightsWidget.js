import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import BaseWidget from './BaseWidget';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { getCategoryById } from '../../data/categories';

const TransactionInsightsWidget = ({ transactions, onRemove }) => {
  const { darkMode } = useTheme();
  const [insights, setInsights] = useState({
    topCategories: [],
    largestTransaction: null,
    totalIncome: 0,
    totalExpense: 0,
    netChange: 0,
    transactionCount: 0
  });
  
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      generateInsights(transactions);
    }
  }, [transactions]);
  
  const generateInsights = (transactionData) => {
    // Count transactions by category
    const categoryCounts = {};
    let totalIncome = 0;
    let totalExpense = 0;
    let largestTransaction = null;
    
    transactionData.forEach(transaction => {
      // Track largest transaction
      if (!largestTransaction || transaction.amount > largestTransaction.amount) {
        largestTransaction = transaction;
      }
      
      // Track income and expenses
      if (transaction.type === 'deposit' || transaction.type === 'refund') {
        totalIncome += transaction.amount;
      } else {
        totalExpense += transaction.amount;
      }
      
      // Count by category
      if (transaction.category) {
        if (!categoryCounts[transaction.category]) {
          categoryCounts[transaction.category] = {
            count: 0,
            totalAmount: 0,
            id: transaction.category
          };
        }
        categoryCounts[transaction.category].count += 1;
        categoryCounts[transaction.category].totalAmount += transaction.amount;
      }
    });
    
    // Convert to array and sort by count
    const topCategories = Object.values(categoryCounts)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3)
      .map(category => ({
        ...category,
        name: getCategoryById(category.id).name,
        color: getCategoryById(category.id).color,
        bgColor: getCategoryById(category.id).bgColor
      }));
    
    setInsights({
      topCategories,
      largestTransaction,
      totalIncome,
      totalExpense,
      netChange: totalIncome - totalExpense,
      transactionCount: transactionData.length
    });
  };
  
  return (
    <BaseWidget 
      title="Transaction Insights" 
      onRemove={onRemove}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Income</p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  INR {insights.totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowDownIcon className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expenses</p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  INR {insights.totalExpense.toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowUpIcon className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Categories */}
        <div>
          <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Top Spending Categories
          </h3>
          
          {insights.topCategories.length > 0 ? (
            <div className="space-y-2">
              {insights.topCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${category.bgColor} mr-2`}></span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    INR {category.totalAmount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No categorized transactions yet
            </p>
          )}
        </div>
        
        {/* Transaction Stats */}
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-3`}>
          <div className="flex justify-between">
            <span>Total Transactions:</span>
            <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {insights.transactionCount}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Net Change:</span>
            <span className={`font-medium ${insights.netChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {insights.netChange >= 0 ? '+' : ''} INR {insights.netChange.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default TransactionInsightsWidget;
