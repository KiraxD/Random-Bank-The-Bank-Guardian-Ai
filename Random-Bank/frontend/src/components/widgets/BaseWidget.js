import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  ArrowsPointingOutIcon, 
  XMarkIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const BaseWidget = ({ 
  title, 
  icon: Icon, 
  children, 
  onRefresh, 
  onRemove, 
  onExpand, 
  isLoading = false,
  className = '',
  height = 'h-64'
}) => {
  const { darkMode } = useTheme();

  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} ${className}`}>
      {/* Widget Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-5 w-5 text-primary-500" />}
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              className={`p-1 rounded-full hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onExpand && (
            <button 
              onClick={onExpand} 
              className={`p-1 rounded-full hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          )}
          {onRemove && (
            <button 
              onClick={onRemove} 
              className={`p-1 rounded-full hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Widget Content */}
      <div className={`p-4 ${height} overflow-auto`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default BaseWidget;
