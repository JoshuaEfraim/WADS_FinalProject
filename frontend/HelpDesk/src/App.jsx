import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import authService from '@/services/auth'

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageTickets from './pages/Admin/ManageTickets'
import ManageUsers from './pages/Admin/ManageUsers'
import TicketDetails from './pages/Admin/TicketDetails'
import TicketHistory from './pages/Admin/TicketHistory'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ForgotPasswordPage from './pages/Auth/forgotpasswordpage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import ProfileSettings from './components/ProfileSettings'
import { ToastContainer } from './components/ui/toast'
import TicketForm from './pages/User/ticketform'

// User Pages
import UserTicketDetails from './pages/User/UserTicketDetails'
import UserDashboard from './pages/User/UserDashboard'
import UserLayout from './components/UserLayout'

import TicketReply from "./pages/Admin/TicketReply";

// Auth callback component
function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!loading) {
        console.log('AuthCallback - User:', user);
        if (user && user.role) {
          // Redirect based on role
          const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
          console.log('Redirecting to:', redirectPath);
          navigate(redirectPath, { replace: true });
        } else {
          // If no user or role, try to get current user
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.profile && response.profile.role) {
              const redirectPath = response.profile.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
              navigate(redirectPath, { replace: true });
            } else {
              console.log('No user or role, redirecting to login');
              navigate('/login', { replace: true });
            }
          } catch (error) {
            console.error('Error getting user profile:', error);
            navigate('/login', { replace: true });
          }
        }
      }
    };

    handleRedirect();
  }, [user, loading, navigate]);

  return <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>;
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to a default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Protected Profile Route */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'USER']}>
                <ProfileSettings />
              </ProtectedRoute>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/logout" element={<Navigate to="/login" replace />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tickets" element={<ManageTickets />} />
            <Route path="tickets/history" element={<TicketHistory />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* User Routes */}
          <Route 
            path="/user" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="tickets/:id" element={<UserTicketDetails />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="ticketHistory" element={<TicketHistory/>}/>
          </Route>

          {/* Ticket Form Route */}
          <Route 
            path="/ticketform" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <TicketForm />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
