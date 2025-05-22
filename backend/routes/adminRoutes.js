import express from 'express';
import { approveTicket, deleteTicket, getAdminDashboardData, getAdminTickets, getAllUsers,  getTicketByPriority, getTicketByStatus, updateTicket } from '../controllers/adminControllers.js';

const router = express.Router();

router.get("/users", getAllUsers)

router.get("/tickets", getAdminTickets)

router.get("/dashboard", getAdminDashboardData)

router.get("/ticket/status/:status", getTicketByStatus)

router.get("/ticket/priority/:priority", getTicketByPriority)

router.post("/approveTicket/:ticketId", approveTicket)

router.patch("/ticket/:ticketId" , updateTicket);

router.delete("/ticket/:id", deleteTicket)

export default router;