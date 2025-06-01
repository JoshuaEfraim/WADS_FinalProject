import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

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
// import TicketReply from "./pages/Admin/TicketReply"

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
            <Route path="ticketHistory" element={<TicketHistory/>}/>
            <Route path="tickets/:id" element={<UserTicketDetails />} />
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
