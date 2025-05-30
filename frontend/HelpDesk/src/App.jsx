import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageTickets from './pages/Admin/ManageTickets'
import ManageUsers from './pages/Admin/ManageUsers'
import Settings from './pages/Admin/Settings'
import TicketDetails from './pages/Admin/TicketDetails'
import TicketHistory from './pages/Admin/TicketHistory'
import AdminLayout from './components/AdminLayout'

const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          {/* {Admin Routes} */}
          {/* <Route element ={<PrivateRoute allowedRoles={["admin"]}/>}> */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />  {/* /admin */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tickets" element={<ManageTickets />} />
            <Route path="tickets/history" element={<TicketHistory />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* </Route> */}
        </Routes>

      </BrowserRouter>
  )
}

export default App