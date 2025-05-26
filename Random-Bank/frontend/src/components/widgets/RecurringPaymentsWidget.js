import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import BaseWidget from './BaseWidget';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';

const RecurringPaymentsWidget = ({ transactions, onRemove }) => {
  const { darkMode } = useTheme();
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    nextDueDate: '',
    category: 'bills',
    notes: ''
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [totalMonthly, setTotalMonthly] = useState(0);

  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'bills', label: 'Bills & Utilities' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'rent', label: 'Rent/Mortgage' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ];

  // Load saved recurring payments from localStorage
  useEffect(() => {
    const savedPayments = localStorage.getItem('recurring_payments');
    if (savedPayments) {
      try {
        setRecurringPayments(JSON.parse(savedPayments));
      } catch (error) {
        console.error('Error loading saved recurring payments:', error);
        setRecurringPayments([]);
      }
    }
  }, []);

  // Save recurring payments to localStorage whenever they change
  useEffect(() => {
    if (recurringPayments.length > 0) {
      localStorage.setItem('recurring_payments', JSON.stringify(recurringPayments));
    }
  }, [recurringPayments]);

  // Calculate total monthly expenses
  useEffect(() => {
    let total = 0;
    
    recurringPayments.forEach(payment => {
      const amount = parseFloat(payment.amount);
      
      switch (payment.frequency) {
        case 'daily':
          total += amount * 30; // Approximate for a month
          break;
        case 'weekly':
          total += amount * 4.33; // Average weeks in a month
          break;
        case 'biweekly':
          total += amount * 2.17; // Average bi-weeks in a month
          break;
        case 'monthly':
          total += amount;
          break;
        case 'quarterly':
          total += amount / 3;
          break;
        case 'yearly':
          total += amount / 12;
          break;
        default:
          total += amount;
      }
    });
    
    setTotalMonthly(total);
  }, [recurringPayments]);

  const handleAddPayment = () => {
    if (!newPayment.name || !newPayment.amount) return;
    
    const paymentToAdd = {
      ...newPayment,
      amount: parseFloat(newPayment.amount),
      createdAt: new Date().toISOString(),
    };
    
    if (editingIndex !== null) {
      // Update existing payment
      const updatedPayments = [...recurringPayments];
      updatedPayments[editingIndex] = paymentToAdd;
      setRecurringPayments(updatedPayments);
      setEditingIndex(null);
    } else {
      // Add new payment
      setRecurringPayments([...recurringPayments, paymentToAdd]);
    }
    
    // Reset form
    setNewPayment({
      name: '',
      amount: '',
      frequency: 'monthly',
      nextDueDate: '',
      category: 'bills',
      notes: ''
    });
    setShowAddPayment(false);
  };

  const handleEditPayment = (index) => {
    const paymentToEdit = recurringPayments[index];
    setNewPayment({
      name: paymentToEdit.name,
      amount: paymentToEdit.amount.toString(),
      frequency: paymentToEdit.frequency,
      nextDueDate: paymentToEdit.nextDueDate || '',
      category: paymentToEdit.category || 'bills',
      notes: paymentToEdit.notes || ''
    });
    setEditingIndex(index);
    setShowAddPayment(true);
  };

  const handleDeletePayment = (index) => {
    const updatedPayments = recurringPayments.filter((_, i) => i !== index);
    setRecurringPayments(updatedPayments);
    if (updatedPayments.length === 0) {
      localStorage.removeItem('recurring_payments');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysUntilDue = (dateString) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time part for accurate day calculation
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDueDateStatus = (dateString) => {
    if (!dateString) return null;
    
    const daysUntilDue = getDaysUntilDue(dateString);
    
    if (daysUntilDue < 0) {
      return { text: 'Overdue', color: 'text-red-500' };
    } else if (daysUntilDue === 0) {
      return { text: 'Due today', color: 'text-yellow-500' };
    } else if (daysUntilDue <= 3) {
      return { text: `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`, color: 'text-yellow-500' };
    } else {
      return { text: `Due in ${daysUntilDue} days`, color: 'text-green-500' };
    }
  };

  return (
    <BaseWidget 
      title="Recurring Payments" 
      onRemove={onRemove}
      actionButton={
        !showAddPayment && (
          <button
            onClick={() => setShowAddPayment(true)}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )
      }
    >
      <div className="space-y-4">
        {showAddPayment ? (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingIndex !== null ? 'Edit Payment' : 'Add New Payment'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Payment Name
                </label>
                <input
                  type="text"
                  value={newPayment.name}
                  onChange={(e) => setNewPayment({...newPayment, name: e.target.value})}
                  className={`w-full p-2 rounded-md text-sm ${
                    darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                  placeholder="Netflix, Rent, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    className={`w-full p-2 rounded-md text-sm ${
                      darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                    placeholder="199"
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Frequency
                  </label>
                  <select
                    value={newPayment.frequency}
                    onChange={(e) => setNewPayment({...newPayment, frequency: e.target.value})}
                    className={`w-full p-2 rounded-md text-sm ${
                      darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={newPayment.nextDueDate}
                    onChange={(e) => setNewPayment({...newPayment, nextDueDate: e.target.value})}
                    className={`w-full p-2 rounded-md text-sm ${
                      darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Category
                  </label>
                  <select
                    value={newPayment.category}
                    onChange={(e) => setNewPayment({...newPayment, category: e.target.value})}
                    className={`w-full p-2 rounded-md text-sm ${
                      darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Notes (Optional)
                </label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                  className={`w-full p-2 rounded-md text-sm ${
                    darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                  rows="2"
                  placeholder="Additional details..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddPayment(false);
                    setEditingIndex(null);
                    setNewPayment({
                      name: '',
                      amount: '',
                      frequency: 'monthly',
                      nextDueDate: '',
                      category: 'bills',
                      notes: ''
                    });
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${
                    darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                >
                  {editingIndex !== null ? 'Update Payment' : 'Add Payment'}
                </button>
              </div>
            </div>
          </div>
        ) : recurringPayments.length === 0 ? (
          <div className="text-center py-6">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No recurring payments yet. Click the + button to add one.
            </p>
          </div>
        ) : (
          <>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between items-center">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Monthly
                </p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  INR {totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {recurringPayments
                .sort((a, b) => {
                  // Sort by due date (null dates at the end)
                  if (!a.nextDueDate && !b.nextDueDate) return 0;
                  if (!a.nextDueDate) return 1;
                  if (!b.nextDueDate) return -1;
                  return new Date(a.nextDueDate) - new Date(b.nextDueDate);
                })
                .map((payment, index) => {
                  const dueStatus = payment.nextDueDate ? getDueDateStatus(payment.nextDueDate) : null;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {payment.name}
                          </h4>
                          <div className="flex items-center">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {frequencyOptions.find(f => f.value === payment.frequency)?.label}
                            </span>
                            <span className="mx-1 text-xs text-gray-400">•</span>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {categoryOptions.find(c => c.value === payment.category)?.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleEditPayment(index)}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePayment(index)}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          INR {payment.amount.toLocaleString()}
                        </p>
                        {dueStatus && (
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            <p className={`text-xs ${dueStatus.color}`}>
                              {dueStatus.text}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </BaseWidget>
  );
};

export default RecurringPaymentsWidget;
