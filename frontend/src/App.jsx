import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import components
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import UserDashboard from './pages/UserDashboard/UserDashboard';
import SurveyCreationPage from './pages/SurveyCreation/SurveyCreationPage';
import SurveyFormPage from './pages/SurveyForm/SurveyFormPage';

// Component that handles initial routing based on auth state
const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated() ? (
          user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />
        ) : (
          <Login />
        )
      } />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* Survey Form Route - Public/Anonymous access */}
      <Route path="/survey/:surveyId" element={<SurveyFormPage />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/surveys/create" element={
        <ProtectedRoute requiredRole="ADMIN">
          <SurveyCreationPage />
        </ProtectedRoute>
      } />

      {/* Legacy admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="ADMIN">
          <Navigate to="/admin/dashboard" replace />
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute requiredRole="USER">
          <UserDashboard />
        </ProtectedRoute>
      } />

      {/* Legacy dashboard route - redirect based on role */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'ADMIN' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/user/dashboard" replace />
          )}
        </ProtectedRoute>
      } />

      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated() ? (
          user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;