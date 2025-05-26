import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import SpendingAnalyticsWidget from './SpendingAnalyticsWidget';
import BudgetTrackerWidget from './BudgetTrackerWidget';
import TransactionInsightsWidget from './TransactionInsightsWidget';
import SavingsGoalWidget from './SavingsGoalWidget';
import RecurringPaymentsWidget from './RecurringPaymentsWidget';

// Widget types available for adding
const WIDGET_TYPES = {
  SPENDING_ANALYTICS: 'spending_analytics',
  BUDGET_TRACKER: 'budget_tracker',
  TRANSACTION_INSIGHTS: 'transaction_insights',
  SAVINGS_GOAL: 'savings_goal',
  RECURRING_PAYMENTS: 'recurring_payments',
};

// Widget definitions with metadata
const WIDGET_DEFINITIONS = {
  [WIDGET_TYPES.SPENDING_ANALYTICS]: {
    id: WIDGET_TYPES.SPENDING_ANALYTICS,
    title: 'Spending Analytics',
    description: 'Visualize your spending patterns by category',
    component: SpendingAnalyticsWidget,
    defaultWidth: 'col-span-2',
    defaultHeight: 'h-80',
  },
  [WIDGET_TYPES.BUDGET_TRACKER]: {
    id: WIDGET_TYPES.BUDGET_TRACKER,
    title: 'Budget Tracker',
    description: 'Track your spending against monthly budgets',
    component: BudgetTrackerWidget,
    defaultWidth: 'col-span-2',
    defaultHeight: 'h-80',
  },
  [WIDGET_TYPES.TRANSACTION_INSIGHTS]: {
    id: WIDGET_TYPES.TRANSACTION_INSIGHTS,
    title: 'Transaction Insights',
    description: 'Get insights about your recent transactions',
    component: TransactionInsightsWidget,
    defaultWidth: 'col-span-2',
    defaultHeight: 'h-80',
  },
  [WIDGET_TYPES.SAVINGS_GOAL]: {
    id: WIDGET_TYPES.SAVINGS_GOAL,
    title: 'Savings Goals',
    description: 'Set and track your financial savings goals',
    component: SavingsGoalWidget,
    defaultWidth: 'col-span-2',
    defaultHeight: 'h-80',
  },
  [WIDGET_TYPES.RECURRING_PAYMENTS]: {
    id: WIDGET_TYPES.RECURRING_PAYMENTS,
    title: 'Recurring Payments',
    description: 'Manage your subscriptions and recurring bills',
    component: RecurringPaymentsWidget,
    defaultWidth: 'col-span-2',
    defaultHeight: 'h-80',
  },
};

const WidgetManager = ({ transactions }) => {
  const { darkMode } = useTheme();
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  
  // Load saved widget configuration from localStorage on mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboard_widgets');
    if (savedWidgets) {
      try {
        const parsedWidgets = JSON.parse(savedWidgets);
        setActiveWidgets(parsedWidgets);
      } catch (error) {
        console.error('Error loading saved widgets:', error);
        // If there's an error, start with default widgets
        setActiveWidgets([
          { id: WIDGET_TYPES.TRANSACTION_INSIGHTS, instanceId: 'ti-1' },
          { id: WIDGET_TYPES.SPENDING_ANALYTICS, instanceId: 'sa-1' },
          { id: WIDGET_TYPES.BUDGET_TRACKER, instanceId: 'bt-1' },
          { id: WIDGET_TYPES.SAVINGS_GOAL, instanceId: 'sg-1' },
          { id: WIDGET_TYPES.RECURRING_PAYMENTS, instanceId: 'rp-1' },
        ]);
      }
    } else {
      // Default widgets for first-time users
      setActiveWidgets([
        { id: WIDGET_TYPES.TRANSACTION_INSIGHTS, instanceId: 'ti-1' },
        { id: WIDGET_TYPES.SPENDING_ANALYTICS, instanceId: 'sa-1' },
        { id: WIDGET_TYPES.BUDGET_TRACKER, instanceId: 'bt-1' },
        { id: WIDGET_TYPES.SAVINGS_GOAL, instanceId: 'sg-1' },
        { id: WIDGET_TYPES.RECURRING_PAYMENTS, instanceId: 'rp-1' },
      ]);
    }
  }, []);

  // Save widget configuration to localStorage whenever it changes
  useEffect(() => {
    if (activeWidgets.length > 0) {
      localStorage.setItem('dashboard_widgets', JSON.stringify(activeWidgets));
    }
  }, [activeWidgets]);

  const handleAddWidget = (widgetType) => {
    const newInstanceId = `${widgetType}-${Date.now()}`;
    setActiveWidgets([...activeWidgets, { id: widgetType, instanceId: newInstanceId }]);
    setShowWidgetSelector(false);
  };

  const handleRemoveWidget = (instanceId) => {
    setActiveWidgets(activeWidgets.filter(widget => widget.instanceId !== instanceId));
  };

  const handleRefreshAll = () => {
    // This would trigger a refresh of all widgets
    // For now, it's just a placeholder as each widget handles its own refresh
    console.log('Refreshing all widgets');
  };

  return (
    <div className="space-y-4">
      {/* Widget controls */}
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Dashboard Widgets
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowWidgetSelector(!showWidgetSelector)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Widget</span>
          </button>
        </div>
      </div>

      {/* Widget selector */}
      {showWidgetSelector && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Add a Widget
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(WIDGET_DEFINITIONS).map((widget) => (
              <div
                key={widget.id}
                onClick={() => handleAddWidget(widget.id)}
                className={`p-3 rounded-md cursor-pointer ${
                  darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
              >
                <h4 className="font-medium">{widget.title}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {widget.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widget grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeWidgets.map((widget) => {
          const widgetDef = WIDGET_DEFINITIONS[widget.id];
          if (!widgetDef) return null;
          
          const WidgetComponent = widgetDef.component;
          
          return (
            <div key={widget.instanceId} className={widgetDef.defaultWidth}>
              <WidgetComponent
                transactions={transactions}
                onRemove={() => handleRemoveWidget(widget.instanceId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WidgetManager;
