import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import NewTransaction from './pages/NewTransaction';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Placeholder pages for new routes
const Cards = () => (
  <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-2xl font-semibold text-gray-900">Accounts and Cards</h1>
    <p className="mt-4 text-gray-600">This feature is coming soon.</p>
  </div>
);

const Investments = () => (
  <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-2xl font-semibold text-gray-900">Investments</h1>
    <p className="mt-4 text-gray-600">This feature is coming soon.</p>
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <div className="w-screen min-h-screen flex flex-col bg-white">
        <Routes>
        <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } />

        {/* Protected Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="transactions/new" element={
          <ProtectedRoute>
            <NewTransaction />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="cards" element={
          <ProtectedRoute>
            <Cards />
          </ProtectedRoute>
        } />
        <Route path="investments" element={
          <ProtectedRoute>
            <Investments />
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
