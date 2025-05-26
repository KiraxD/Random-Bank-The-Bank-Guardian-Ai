import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-12 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block text-primary-600">Random Bank</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A secure and modern banking application for managing your finances.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {isAuthenticated ? (
              <div className="rounded-md shadow">
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <>
                <div className="rounded-md shadow">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Log In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Random Bank?</h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {/* Easy Transfers Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-2 hover:border-indigo-100">
              <div className="px-6 py-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-4 mb-5">
                    <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Transfers</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Send money to anyone, anytime with just a few clicks. Fast, secure, and hassle-free transfers to any account.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <div className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  <Link to={isAuthenticated ? "/transactions/new" : "/register"} className="flex items-center justify-center">
                    <span>Try it now</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Secure Banking Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-2 hover:border-purple-100">
              <div className="px-6 py-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full p-4 mb-5">
                    <svg className="h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Banking</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Advanced fraud detection and secure authentication protect your finances with industry-leading security measures.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <div className="text-sm font-medium text-purple-600 hover:text-purple-500">
                  <Link to={isAuthenticated ? "/dashboard" : "/register"} className="flex items-center justify-center">
                    <span>Learn more</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Transaction History Card */}
            <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-2 hover:border-blue-100">
              <div className="px-6 py-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-4 mb-5">
                    <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Transaction History</h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Track all your transactions with detailed history and analytics. Get insights into your spending habits.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <div className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  <Link to={isAuthenticated ? "/transactions" : "/register"} className="flex items-center justify-center">
                    <span>View transactions</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
