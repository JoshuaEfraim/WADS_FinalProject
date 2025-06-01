import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageTickets from './pages/Admin/ManageTickets'
import ManageUsers from './pages/Admin/ManageUsers'
import TicketDetails from './pages/Admin/TicketDetails'
import TicketHistory from './pages/Admin/TicketHistory'
import AdminLayout from './components/AdminLayout'

// User Pages
import UserTicketDetails from './pages/User/UserTicketDetails'
import UserDashboard from './pages/User/UserDashboard'
import UserLayout from './components/UserLayout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to a default route */}
        <Route path="/" element={<Navigate to="/user" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<ManageTickets />} />
          <Route path="tickets/history" element={<TicketHistory />} />
          <Route path="tickets/:id" element={<TicketDetails />} />
          <Route path="users" element={<ManageUsers />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="tickets/:id" element={<UserTicketDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
