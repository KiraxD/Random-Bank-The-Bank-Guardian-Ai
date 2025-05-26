import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';
import BaseWidget from './BaseWidget';
import { transactionCategories, getCategoryById } from '../../data/categories';

const BudgetTrackerWidget = ({ transactions, onRefresh }) => {
  const { darkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [budgets, setBudgets] = useState([
    { category: 'shopping', limit: 5000, spent: 0 },
    { category: 'entertainment', limit: 2000, spent: 0 },
    { category: 'food', limit: 3000, spent: 0 },
    { category: 'transportation', limit: 1500, spent: 0 }
  ]);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: 'other', limit: 1000 });

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      calculateSpending();
    }
  }, [transactions]);

  const calculateSpending = () => {
    setIsLoading(true);
    
    // Get current month transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });
    
    // Only include expenses
    const expenses = monthlyTransactions.filter(tx => 
      tx.type === 'withdrawal' || tx.type === 'payment' || tx.type === 'transfer'
    );
    
    // Calculate spending by category
    const categorySpending = {};
    expenses.forEach(tx => {
      const category = tx.category || 'other';
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += tx.amount;
    });
    
    // Update budgets with actual spending
    const updatedBudgets = budgets.map(budget => ({
      ...budget,
      spent: categorySpending[budget.category] || 0
    }));
    
    setBudgets(updatedBudgets);
    setIsLoading(false);
  };

  const handleRefresh = () => {
    calculateSpending();
    if (onRefresh) onRefresh();
  };

  const handleAddBudget = () => {
    // Check if budget for this category already exists
    const exists = budgets.some(b => b.category === newBudget.category);
    if (exists) {
      // Update existing budget
      const updatedBudgets = budgets.map(b => 
        b.category === newBudget.category 
          ? { ...b, limit: parseFloat(newBudget.limit) } 
          : b
      );
      setBudgets(updatedBudgets);
    } else {
      // Add new budget
      setBudgets([...budgets, { 
        category: newBudget.category, 
        limit: parseFloat(newBudget.limit),
        spent: 0
      }]);
    }
    
    setShowAddBudget(false);
    setNewBudget({ category: 'other', limit: 1000 });
  };

  return (
    <BaseWidget
      title="Budget Tracker"
      icon={CurrencyDollarIcon}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      height="h-80"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Monthly Budgets
          </h4>
          <button
            onClick={() => setShowAddBudget(!showAddBudget)}
            className={`p-1 rounded-full ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Add Budget Form */}
        {showAddBudget && (
          <div className={`p-3 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs mb-1">Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className={`w-full p-2 text-sm rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                >
                  {transactionCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Monthly Limit (INR)</label>
                <input
                  type="number"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  className={`w-full p-2 text-sm rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                />
              </div>
            </div>
            <button
              onClick={handleAddBudget}
              className="w-full py-1 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              Save Budget
            </button>
          </div>
        )}

        {/* Budget List */}
        <div className="space-y-3 overflow-y-auto max-h-48 pr-1">
          {budgets.length === 0 ? (
            <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No budgets set. Add your first budget to start tracking.
            </p>
          ) : (
            budgets.map((budget) => {
              const category = getCategoryById(budget.category);
              const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
              const isOverBudget = percentage > 100;
              
              return (
                <div key={budget.category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${category.bgColor}`}></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={isOverBudget ? 'text-red-500 font-medium' : ''}>
                        INR {budget.spent.toLocaleString()}
                      </span>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {' '}/{' '}INR {budget.limit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className={`w-full h-2 bg-gray-200 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${isOverBudget ? 'bg-red-500' : category.bgColor}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className={isOverBudget ? 'text-red-500' : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {percentage.toFixed(0)}% used
                    </span>
                    {isOverBudget && (
                      <span className="text-red-500">
                        Over by INR {(budget.spent - budget.limit).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </BaseWidget>
  );
};

export default BudgetTrackerWidget;
