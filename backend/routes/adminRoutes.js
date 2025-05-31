import express from 'express';
import {getAdminDashboardData, 
        getAdminTickets,
        getAllUsers,
        updateTicket,
        getCurrentAdmin } 
from '../controllers/adminControllers.js';

const router = express.Router();

router.get("/users", getAllUsers)

router.get("/tickets", getAdminTickets)

router.get("/dashboard", getAdminDashboardData)

router.get("/profile", getCurrentAdmin)

router.patch("/ticket/:ticketId" , updateTicket);

export default router;