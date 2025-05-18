import express from 'express';
import { deleteTicket, getAdminTickets, getAllUsers, getRecentTicket, getTicketByPriority, getTicketByStatus, getTicketReport, updateTicket } from '../controllers/adminControllers.js';

const router = express.Router();

router.get("/users", getAllUsers)

router.get("/tickets", getAdminTickets)

router.get("/ticket/status/:status", getTicketByStatus)

router.get("/ticket/priority/:priority", getTicketByPriority)

router.get("/tikcet/report", getTicketReport)

router.get("/ticket/recent", getRecentTicket)

router.put("/ticket/:id", updateTicket)

router.delete("/ticket/:id", deleteTicket)

export default router;