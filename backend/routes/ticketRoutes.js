// backend/routes/ticketRoutes.js

import express from 'express';
import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory,
  getTicketDetails,
  deleteTicket
} from '../controllers/ticketController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET ticket details + all replies
router.get('/tickets/:id', auth, getTicketReply);

// POST reply to a ticket (by admin or user)
router.post('/tickets/reply/:id', auth, replyToTicket);

// GET all resolved tickets (admin view)
router.get('/tickets/history/admin', auth, getAllResolvedTickets);

// GET resolved tickets for a specific user
router.get('/tickets/history/user/:userId', auth, getUserTicketHistory);

router.get("/ticketDetails/:id", auth, getTicketDetails)

router.delete("/:ticketId", auth, deleteTicket)

export default router;
