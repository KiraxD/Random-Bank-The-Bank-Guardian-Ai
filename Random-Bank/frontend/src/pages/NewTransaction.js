/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { transactionCategories, getCategoryById } from '../data/categories';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const transactionTypes = [
  { id: 'deposit', name: 'Deposit', icon: ArrowDownIcon, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'withdrawal', name: 'Withdrawal', icon: ArrowUpIcon, color: 'text-red-600', bg: 'bg-red-100' },
  { id: 'transfer', name: 'Transfer', icon: ArrowsRightLeftIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'payment', name: 'Pay by Account Number', icon: ArrowsRightLeftIcon, color: 'text-purple-600', bg: 'bg-purple-100' }
];

const NewTransaction = () => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'deposit');
  const [transferMethod, setTransferMethod] = useState('username'); // 'username' or 'accountNumber'
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fraudScore, setFraudScore] = useState(null);
  const [isFraudChecking, setIsFraudChecking] = useState(false);
  const [isFraudulent, setIsFraudulent] = useState(false);

  useEffect(() => {
    // If we need to fetch users for transfers
    if (selectedType === 'transfer') {
      fetchUsers();
    }
  }, [selectedType]);

  const fetchUsers = async () => {
    try {
      // In a real app, you would have an endpoint to fetch users
      // For now, we'll simulate it with a timeout
      setIsLoading(true);
      
      // Simulated API call to get users
      setTimeout(() => {
        setUsers([
          { id: 'user1', username: 'john_doe', firstName: 'John', lastName: 'Doe' },
          { id: 'user2', username: 'jane_smith', firstName: 'Jane', lastName: 'Smith' },
          { id: 'user3', username: 'bob_johnson', firstName: 'Bob', lastName: 'Johnson' }
        ]);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users for transfer');
      setIsLoading(false);
    }
  };

  // Create validation schema based on transaction type
  const getValidationSchema = () => {
    // Create different schemas based on transaction type
    if (selectedType === 'transfer') {
      return Yup.object().shape({
        amount: Yup.number()
          .required('Amount is required')
          .positive('Amount must be positive'),
        description: Yup.string(),
        recipientId: Yup.string().required('Recipient is required')
      });
    } else if (selectedType === 'payment') {
      return Yup.object().shape({
        amount: Yup.number()
          .required('Amount is required')
          .positive('Amount must be positive'),
        description: Yup.string(),
        recipientAccountNumber: Yup.string()
          .required('Account number is required')
          .length(16, 'Account number must be 16 digits'),
        recipientName: Yup.string()
          .required('Recipient name is required')
      });
    } else {
      // For deposit and withdrawal
      return Yup.object().shape({
        amount: Yup.number()
          .required('Amount is required')
          .positive('Amount must be positive'),
        description: Yup.string()
      });
    }
  };
  
  // Function to check for fraud using the ML service
  const detectFraud = async (formValues) => {
    if (!formValues || !formValues.amount) {
      // No notification needed here - will be handled by form validation
      return;
    }
    
    try {
      setIsFraudChecking(true);
      
      // Get the amount as a number
      const amount = parseFloat(formValues.amount) || 0;
      
      // Check if the transaction should be flagged as fraudulent based on local rules
      // Flag as fraudulent if category is 'other' and amount is over 2000
      const isLocallyFlagged = selectedCategory === 'other' && amount > 2000;
      
      if (isLocallyFlagged) {
        console.log('Transaction flagged locally: category is "other" and amount exceeds 2000');
        
        // Set fraud detection results directly without calling the ML service
        const fraudScore = 0.9; // High fraud score
        setFraudScore(fraudScore);
        setIsFraudulent(true);
        
        // Show popup notification for the locally flagged transaction
        toast.error('Warning: Large transactions in the "Other" category require additional verification!');
        
        // Prepare transaction data to pass to verification page
        const transactionData = {
          type: selectedType,
          amount: amount,
          category: selectedCategory,
          user: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || ''
          }
        };
        
        // Show confirmation dialog first
        const confirmMessage = 'This transaction requires additional identity verification. Click OK to proceed to verification.';
        
        // Use setTimeout to show the dialog after the toast notification is visible
        setTimeout(() => {
          const confirmProceed = window.confirm(confirmMessage);
          
          if (confirmProceed) {
            // Show notification about redirection
            toast.info('Redirecting to identity verification...');
            
            // Encode the transaction data for URL parameter
            const encodedData = encodeURIComponent(JSON.stringify(transactionData));
            
            // Redirect to Persona verification page
            window.location.href = `/persona-verification.html?transactionData=${encodedData}`;
          } else {
            // User canceled, show notification
            toast.warning('Transaction canceled. Identity verification is required for this transaction.');
          }
        }, 500); // Short delay to allow the toast notification to be seen
        
        return {
          score: fraudScore,
          isFraudulent: true,
          transactionId: `local-${Date.now()}`
        };
      }
      
      // If not locally flagged, proceed with normal ML service check
      // Prepare the data for the ML service
      const fraudCheckData = {
        userId: currentUser?.id || 'anonymous',
        type: selectedType,
        amount: amount,
        recipientId: formValues.recipientId || null
      };
      
      // Call the ML service API
      const response = await api.post('/api/ml/predict', fraudCheckData);
      
      // Store fraud detection results in state but don't display in UI
      setFraudScore(response.data.fraud_score);
      setIsFraudulent(response.data.is_fraudulent);
      
      // Only show popup notification for fraudulent transactions
      if (response.data.is_fraudulent) {
        toast.error('Warning: This transaction has been flagged as potentially fraudulent!');
      }
      
      return {
        score: response.data.fraud_score,
        isFraudulent: response.data.is_fraudulent,
        transactionId: response.data.transaction_id
      };
    } catch (error) {
      console.error('Error checking for fraud:', error);
      // Don't show error notification to user
      
      // Return a default low-risk score on error
      return { score: 0.1, isFraudulent: false };
    } finally {
      setIsFraudChecking(false);
    }
  };
  
  // Helper function to determine risk level based on score
  const getFraudRiskLevel = (score) => {
    if (score === null) return null;
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  };
  
  // Simplified FraudRiskIndicator component - only shows loading state
  const FraudRiskIndicator = ({ isChecking }) => {
    if (isChecking) {
      return (
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing transaction...</span>
        </div>
      );
    }
    
    // No visible UI when not checking - just return null
    return null;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Get the amount as a number for validation
      const amount = parseFloat(values.amount) || 0;
      
      // Special validation for 'other' category with large amounts
      // Force fraud detection for 'other' category with amount > 2000
      if (selectedCategory === 'other' && amount > 2000) {
        console.log('Large "Other" category transaction detected in handleSubmit');
        
        // Directly set as fraudulent without calling the ML service
        setFraudScore(0.9); // High fraud score
        setIsFraudulent(true);
        
        // Prepare transaction data to pass to verification page
        const transactionData = {
          type: selectedType,
          amount: amount,
          category: selectedCategory,
          user: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || ''
          }
        };
        
        // Show confirmation dialog first
        const confirmMessage = 'This transaction requires additional identity verification. Click OK to proceed to verification.';
        const confirmProceed = window.confirm(confirmMessage);
        
        if (confirmProceed) {
          // Show notification about required verification
          toast.info('Redirecting to identity verification...');
          
          // Encode the transaction data for URL parameter
          const encodedData = encodeURIComponent(JSON.stringify(transactionData));
          
          // Redirect to Persona verification page
          window.location.href = `/persona-verification.html?transactionData=${encodedData}`;
        } else {
          // User canceled, show notification
          toast.warning('Transaction canceled. Identity verification is required for this transaction.');
        }
        
        // Stop form submission in either case
        setSubmitting(false);
        return;
      }
      
      // Check for fraud before proceeding with transaction
      const fraudResult = await detectFraud(values);
      
      // If transaction is flagged as fraudulent, redirect to identity verification
      if (fraudResult && fraudResult.isFraudulent) {
        // Prepare transaction data to pass to verification page
        const transactionData = {
          type: selectedType,
          amount: amount,
          category: selectedCategory,
          user: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || ''
          }
        };
        
        // Show notification about required verification
        toast.info('Additional identity verification required for this transaction.');
        
        // Encode the transaction data for URL parameter
        const encodedData = encodeURIComponent(JSON.stringify(transactionData));
        
        // Redirect to Persona verification page
        window.location.href = `/persona-verification.html?transactionData=${encodedData}`;
        
        // Stop form submission
        setSubmitting(false);
        return;
      }
      
      // Proceed with transaction - ensure amount is a number
      const transactionData = {
        ...values,
        type: selectedType,
        amount: parseFloat(values.amount) // Ensure amount is a number
      };
      
      // Client-side validation
      if (!transactionData.amount || isNaN(transactionData.amount)) {
        toast.error('Please enter a valid amount');
        return;
      }
      
      // Additional validation for transfer/payment
      if ((selectedType === 'transfer' || selectedType === 'payment') && 
          !transactionData.recipientId && !transactionData.recipientAccountNumber) {
        toast.error(`Recipient information is required for ${selectedType} transactions`);
        return;
      }
      
      // Log the data being sent to help with debugging
      console.log('Sending transaction data:', transactionData);
      
      try {
        const response = await api.post('/transactions', transactionData);
        
        // Create a custom event to notify the dashboard of a new transaction
        const transactionEvent = new CustomEvent('transactionCompleted', {
          detail: { transaction: response.data.transaction }
        });
        window.dispatchEvent(transactionEvent);
        
        toast.success('Transaction created successfully');
        navigate('/dashboard');
      } catch (serverError) {
        console.error('Server error during transaction creation:', serverError);
        
        // Extract detailed error information
        let errorMessage = 'Transaction failed';
        
        if (serverError.response) {
          // The server responded with an error
          const responseData = serverError.response.data;
          
          if (responseData.message) {
            errorMessage = responseData.message;
          }
          
          // Handle validation errors
          if (responseData.errors && responseData.errors.length > 0) {
            const fieldErrors = responseData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            errorMessage = `Validation error: ${fieldErrors}`;
          }
          
          // Log the full error response for debugging
          console.log('Server error response:', responseData);
          
          // Show appropriate toast based on status code
          if (serverError.response.status === 400) {
            toast.error(`Invalid transaction: ${errorMessage}`);
          } else if (serverError.response.status === 401) {
            toast.error('Your session has expired. Please log in again.');
            // Redirect to login page after a delay
            setTimeout(() => navigate('/login'), 2000);
          } else {
            toast.error(`Transaction error: ${errorMessage}`);
          }
        } else if (serverError.request) {
          // The request was made but no response was received
          toast.error('No response from server. Please try again later.');
        } else {
          // Something happened in setting up the request
          toast.error(serverError.message || 'An unexpected error occurred');
        }
        
        // Fallback mechanism for handling backend errors in development
        if (process.env.NODE_ENV === 'development') {
          // Ask user if they want to create a mock transaction
          const useMockTransaction = window.confirm(
            'Server error occurred. Would you like to create a mock transaction for testing purposes? (Development mode only)'
          );
          
          if (useMockTransaction) {
            console.log('Using fallback mechanism in development mode');
            
            // Create a mock transaction event
            const mockTransaction = {
              id: `mock-${Date.now()}`,
              type: selectedType,
              amount: parseFloat(values.amount) || 0,
              description: values.description || '',
              status: 'completed',
              createdAt: new Date().toISOString()
            };
            
            const mockEvent = new CustomEvent('transactionCompleted', {
              detail: { transaction: mockTransaction }
            });
            window.dispatchEvent(mockEvent);
            
            toast.success('Mock transaction created (development mode)');
            navigate('/dashboard');
          }
        }
      }
    } finally {
      // Always ensure the form is no longer in submitting state
      setSubmitting(false);
    }
  };

  // Define initial values for the form
  const initialValues = {
    amount: '',
    description: '',
    recipientId: '',
    recipientAccountNumber: '',
    recipientName: '',
    category: selectedCategory,
    notes: ''
  };
  
  // This was previously used but we're now using the initialValues variable directly
  const getInitialValues = () => {
    return {
      amount: '',
      description: '',
      recipientId: '',
      recipientAccountNumber: '',
      recipientName: '',
      category: selectedCategory,
      notes: ''
    };
  };

  return (
    <div className="py-6 w-full">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Transaction</h1>
        
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Transaction Type Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {transactionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`relative flex items-center justify-center rounded-lg shadow-md transition-all duration-200 hover:shadow-lg p-4 ${
                        selectedType === type.id
                          ? `${type.bg} border-2 border-${type.color.replace('text-', '')}`
                          : 'bg-white border border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full ${selectedType === type.id ? 'bg-white' : type.bg} p-3 mb-2`}>
                          <Icon className={`h-6 w-6 ${type.color}`} />
                        </div>
                        <span className={`text-sm font-medium ${
                          selectedType === type.id ? 'text-white' : 'text-gray-800'
                        }`}>
                          {type.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Transaction Form */}
            <Formik
              initialValues={initialValues}
              validationSchema={getValidationSchema()}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values }) => (
                <Form className="space-y-6">
                  <div className="mb-6">
                    <label htmlFor="amount" className="block text-base font-semibold text-gray-800 mb-2">
                      Amount
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-600 font-medium">₹</span>
                      </div>
                      <Field
                        type="number"
                        name="amount"
                        id="amount"
                        className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-8 pr-16 py-3 text-lg border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-gray-600 font-medium">INR</span>
                      </div>
                    </div>
                    <ErrorMessage name="amount" component="div" className="mt-2 text-red-600 text-sm font-medium" />
                  </div>
                  
                  {selectedType === 'transfer' && (
                    <div className="mb-4">
                      <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient
                      </label>
                      {isLoading ? (
                        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                      ) : (
                        <Field
                          as="select"
                          id="recipientId"
                          name="recipientId"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select recipient</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.username} ({user.firstName} {user.lastName})
                            </option>
                          ))}
                        </Field>
                      )}
                      <ErrorMessage name="recipientId" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  )}
                  
                  {selectedType === 'payment' && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="recipientAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Account Number
                        </label>
                        <Field
                          type="text"
                          id="recipientAccountNumber"
                          name="recipientAccountNumber"
                          placeholder="Enter 16-digit account number"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <ErrorMessage name="recipientAccountNumber" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Name
                        </label>
                        <Field
                          type="text"
                          id="recipientName"
                          name="recipientName"
                          placeholder="Enter recipient name"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <ErrorMessage name="recipientName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </>
                  )}
                  
                  <div className="mb-6">
                    <label className="block text-base font-semibold text-gray-800 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {transactionCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <div 
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              // Also update the form field
                              const categoryField = document.getElementById('category');
                              if (categoryField) categoryField.value = category.id;
                              
                              // Fraud detection removed
                            }}
                            className={`cursor-pointer rounded-lg p-3 transition-all duration-200 ${selectedCategory === category.id 
                              ? `${category.bgColor} border-2 border-${category.color.replace('text-', '')}` 
                              : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border border-gray-200`
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`rounded-full ${category.bgColor} p-2`}>
                                <IconComponent className={`h-5 w-5 ${category.color}`} />
                              </div>
                              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {category.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Hidden field to store the category value */}
                    <Field
                      type="hidden"
                      id="category"
                      name="category"
                      value={selectedCategory}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <Field
                      as="textarea"
                      id="notes"
                      name="notes"
                      rows="2"
                      placeholder="Add any additional notes"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Fraud detection is now handled automatically during submission */}
                  {/* Loading indicator only shown when checking for fraud */}
                  {isFraudChecking && (
                    <div className="mb-4">
                      <FraudRiskIndicator isChecking={isFraudChecking} />
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-8 space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="bg-white py-3 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {isSubmitting && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSubmitting ? 'Processing...' : 'Create Transaction'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;
