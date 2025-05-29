import { protect } from '../middleware/authMiddleware.js';
import express from 'express';
const router = express.Router();

import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory
} from '../controllers/ticketController.js';

// ✅ Use `protect` middleware for all routes that need authentication

// GET all replies for a ticket (protected)
router.get('/:id/replies', protect, getTicketReply);

// POST a reply to a ticket (protected)
router.post('/reply/:id', protect, replyToTicket);

// GET all resolved tickets (admin view - protected)
router.get('/history/admin', protect, getAllResolvedTickets);

// GET resolved tickets for a specific user (protected)
router.get('/history/user/:userId', protect, getUserTicketHistory);

export default router;
