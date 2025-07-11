import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import {getAdminDashboardData, 
        getAdminTickets,
        getAllUsers,
        updateTicket,
        getCurrentAdmin,
        deleteUsers } 
from '../controllers/adminControllers.js';

const router = express.Router();

router.get("/users", auth, isAdmin, getAllUsers)
router.delete("/users/:id", auth, isAdmin, deleteUsers)

router.get("/tickets", auth, isAdmin, getAdminTickets)

router.get("/dashboard", auth, isAdmin, getAdminDashboardData)

router.get("/profile", auth, isAdmin, getCurrentAdmin)

router.patch("/tickets/:id", auth, isAdmin, updateTicket);

export default router;