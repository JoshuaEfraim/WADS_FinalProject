// import React from 'react'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import AdminDashboard from './pages/Admin/AdminDashboard'
// import ManageTickets from './pages/Admin/ManageTickets'
// import ManageUsers from './pages/Admin/ManageUsers'
// import Settings from './pages/Admin/Settings'
// import AdminLayout from './components/AdminLayout'
// import TicketDetails from './pages/Admin/TicketDetails'
// const App = () => {
//   return (
//     <AdminLayout>
//       <BrowserRouter>
//         <Routes>


//           {/* {Admin Routes} */}
//           {/* <Route element ={<PrivateRoute allowedRoles={["admin"]}/>}> */}
//             <Route path='/admin' element ={<AdminDashboard/>}/>
//             <Route path='/admin/dashboard' element= {<AdminDashboard/>}/>
//             <Route path='/admin/tickets' element= {<ManageTickets/>}/>
//             <Route path='/admin/users' element= {<ManageUsers/>}/>
//             <Route path='/admin/settings' element= {<Settings/>}/>
//             <Route path="/admin/tickets/:id" element={<TicketDetails />} />
//           {/* </Route> */}
          
//         </Routes>
          
//       </BrowserRouter>
//     </AdminLayout>
//   )
// }

// export default App
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageTickets from './pages/Admin/ManageTickets';
import ManageUsers from './pages/Admin/ManageUsers';
import Settings from './pages/Admin/Settings';
import TicketDetails from './pages/Admin/TicketDetails';
import AdminLayout from './components/AdminLayout';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all admin routes inside AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<ManageTickets />} />
          <Route path="tickets/:id" element={<TicketDetails />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
