import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';

import {
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
router.get('/ticketReply/:id', auth, getTicketReply);

// POST reply to a ticket (by admin or user)
router.post('/ticketReply/:id', auth, replyToTicket);

// GET ticket history (handles both admin and user roles)
router.get('/history', auth, getUserTicketHistory);

router.get("/ticketDetails/:id", auth, getTicketDetails)

router.delete("/:ticketId", auth, deleteTicket)

export default router;
