// backend/routes/ticketRoutes.js

import express from 'express';
const router = express.Router();

import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory
} from '../controllers/ticketController.js';

// GET ticket details + all replies
router.get('/tickets/:id', getTicketReply);

// POST reply to a ticket (by admin or user)
router.post('/tickets/reply/:id', replyToTicket);

// GET all resolved tickets (admin view)
router.get('/tickets/history/admin', getAllResolvedTickets);

// GET resolved tickets for a specific user
router.get('/tickets/history/user/:userId', getUserTicketHistory);

export default router;
