import express from 'express';
import {
  getTicketReply,
  replyToTicket,
  getUserTicketHistory,
  getTicketDetails,
  deleteTicket
} from '../controllers/ticketController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET ticket details + all replies
router.get('/ticketReply/:id', auth, getTicketReply);

// POST reply to a ticket (by admin or user)
router.post('/ticketReply/:id', auth, replyToTicket);

// GET ticket history (handles both admin and user roles)
router.get('/history', auth, getUserTicketHistory);

router.get("/ticketDetails/:id", auth, getTicketDetails)

router.delete("/:ticketId", auth, deleteTicket)

export default router;
