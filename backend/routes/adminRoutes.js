import express from 'express';
import { deleteTicket, getAdminDashboardData, getAdminTickets, getAllUsers,  getTicketByPriority, getTicketByStatus, getTicketDetails, updateTicket } from '../controllers/adminControllers.js';

const router = express.Router();

router.get("/users", getAllUsers)

router.get("/tickets", getAdminTickets)

router.get("/ticketDetails/:id", getTicketDetails)

router.get("/dashboard", getAdminDashboardData)

router.get("/ticket/status/:status", getTicketByStatus)

router.get("/ticket/priority/:priority", getTicketByPriority)

router.patch("/ticket/:ticketId" , updateTicket);

router.delete("/ticket/:ticketId", deleteTicket)

export default router;