import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().max(50, 'First name must be at most 50 characters'),
  lastName: Yup.string().max(50, 'Last name must be at most 50 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  currentPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Current password is required to set a new password')
    }),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Please confirm your new password')
    })
});

const Profile = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Remove confirmNewPassword as it's not needed for the API
      const { confirmNewPassword, ...userData } = values;
      
      // Only include password fields if newPassword is provided
      const updateData = { ...userData };
      if (!updateData.newPassword) {
        delete updateData.currentPassword;
        delete updateData.newPassword;
      }
      
      const result = await updateProfile(updateData);
      
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        resetForm({ values: { ...values, currentPassword: '', newPassword: '', confirmNewPassword: '' } });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          </div>
          <div className="mt-4 flex md:mt-0">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:space-x-8">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    <p className="mt-1 text-lg text-gray-900">{currentUser?.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-lg text-gray-900">{currentUser?.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:space-x-8">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-sm font-medium text-gray-500">First Name</h3>
                    <p className="mt-1 text-lg text-gray-900">{currentUser?.firstName || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Name</h3>
                    <p className="mt-1 text-lg text-gray-900">{currentUser?.lastName || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Balance</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(currentUser?.balance || 0)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={{
                  firstName: currentUser?.firstName || '',
                  lastName: currentUser?.lastName || '',
                  email: currentUser?.email || '',
                  currentPassword: '',
                  newPassword: '',
                  confirmNewPassword: ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <div className="mt-1">
                          <Field
                            id="firstName"
                            name="firstName"
                            type="text"
                            className={`block w-full rounded-md ${
                              errors.firstName && touched.firstName
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                            }`}
                          />
                          <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <div className="mt-1">
                          <Field
                            id="lastName"
                            name="lastName"
                            type="text"
                            className={`block w-full rounded-md ${
                              errors.lastName && touched.lastName
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                            }`}
                          />
                          <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className={`block w-full rounded-md ${
                            errors.email && touched.email
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Leave these fields blank if you don't want to change your password.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1">
                        <Field
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          className={`block w-full rounded-md ${
                            errors.currentPassword && touched.currentPassword
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1">
                        <Field
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          className={`block w-full rounded-md ${
                            errors.newPassword && touched.newPassword
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1">
                        <Field
                          id="confirmNewPassword"
                          name="confirmNewPassword"
                          type="password"
                          className={`block w-full rounded-md ${
                            errors.confirmNewPassword && touched.confirmNewPassword
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                          }`}
                        />
                        <ErrorMessage name="confirmNewPassword" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        Save Changes
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // In a real app, you would call an API to delete the account
                    toast.info('Account deletion would be processed here in a real app');
                    logout();
                  }
                }}
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
