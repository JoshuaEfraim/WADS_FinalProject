import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';

import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory,
  getTicketDetails,
  deleteTicket,
  createTicket
} from '../controllers/ticketController.js';


// Create a new ticket (requires authentication)
router.post('/create', auth, createTicket);

// GET ticket details + all replies
router.get('/:id', auth, getTicketReply);

// POST reply to a ticket (by admin or user)
router.post('/reply/:id', auth, replyToTicket);

// GET all resolved tickets (admin view)
router.get('/history/admin', auth, getAllResolvedTickets);

// GET resolved tickets for a specific user
router.get('/history/user/:userId', auth, getUserTicketHistory);

router.get("/details/:id", auth, getTicketDetails);

router.delete("/:ticketId", auth, deleteTicket);

export default router;
