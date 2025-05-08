import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageTickets from './pages/Admin/ManageTickets'
import ManageUsers from './pages/Admin/ManageUsers'
import Settings from './pages/Admin/Settings'
import AdminLayout from './components/AdminLayout'

const App = () => {
  return (
    <AdminLayout>
      <BrowserRouter>
        <Routes>


          {/* {Admin Routes} */}
          {/* <Route element ={<PrivateRoute allowedRoles={["admin"]}/>}> */}
            <Route path='/admin' element ={<AdminDashboard/>}/>
            <Route path='/admin/dashboard' element= {<AdminDashboard/>}/>
            <Route path='/admin/tickets' element= {<ManageTickets/>}/>
            <Route path='/admin/users' element= {<ManageUsers/>}/>
            <Route path='/admin/settings' element= {<Settings/>}/>
          {/* </Route> */}
          
        </Routes>
          
      </BrowserRouter>
    </AdminLayout>
  )
}

export default App