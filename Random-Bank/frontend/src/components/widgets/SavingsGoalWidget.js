import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import BaseWidget from './BaseWidget';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const SavingsGoalWidget = ({ transactions, onRemove }) => {
  const { darkMode } = useTheme();
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: 'blue'
  });
  const [editingIndex, setEditingIndex] = useState(null);

  // Load saved goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('savings_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading saved goals:', error);
        setGoals([]);
      }
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('savings_goals', JSON.stringify(goals));
    }
  }, [goals]);

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    
    const goalToAdd = {
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      createdAt: new Date().toISOString(),
    };
    
    if (editingIndex !== null) {
      // Update existing goal
      const updatedGoals = [...goals];
      updatedGoals[editingIndex] = goalToAdd;
      setGoals(updatedGoals);
      setEditingIndex(null);
    } else {
      // Add new goal
      setGoals([...goals, goalToAdd]);
    }
    
    // Reset form
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      color: 'blue'
    });
    setShowAddGoal(false);
  };

  const handleEditGoal = (index) => {
    const goalToEdit = goals[index];
    setNewGoal({
      name: goalToEdit.name,
      targetAmount: goalToEdit.targetAmount.toString(),
      currentAmount: goalToEdit.currentAmount.toString(),
      deadline: goalToEdit.deadline || '',
      color: goalToEdit.color || 'blue'
    });
    setEditingIndex(index);
    setShowAddGoal(true);
  };

  const handleDeleteGoal = (index) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    if (updatedGoals.length === 0) {
      localStorage.removeItem('savings_goals');
    }
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <BaseWidget 
      title="Savings Goals" 
      onRemove={onRemove}
      actionButton={
        !showAddGoal && (
          <button
            onClick={() => setShowAddGoal(true)}
            className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )
      }
    >
      <div className="space-y-4">
        {showAddGoal ? (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingIndex !== null ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Goal Name
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  className={`w-full p-2 rounded-md text-sm ${
                    darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                  placeholder="Vacation, New Car, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Target Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                    className={`w-full p-2 rounded-md text-sm ${
                      darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Current Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
                    className={`w-full p-2 rounded-md text-sm ${
                      darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  className={`w-full p-2 rounded-md text-sm ${
                    darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setEditingIndex(null);
                    setNewGoal({
                      name: '',
                      targetAmount: '',
                      currentAmount: '',
                      deadline: '',
                      color: 'blue'
                    });
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${
                    darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
                >
                  {editingIndex !== null ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-6">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No savings goals yet. Click the + button to add one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {goal.name}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Target: INR {goal.targetAmount.toLocaleString()} • Due: {formatDate(goal.deadline)}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditGoal(index)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(index)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      INR {goal.currentAmount.toLocaleString()}
                    </p>
                    <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(goal.currentAmount, goal.targetAmount)}`} 
                      style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default SavingsGoalWidget;
