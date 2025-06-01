import express from 'express';
import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory,
  getTicketDetails,
<<<<<<< HEAD
  deleteTicket
=======
>>>>>>> TicketReply
} from '../controllers/ticketController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

<<<<<<< HEAD
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
=======
// When you POST a reply:
router.post('/reply/:id', replyToTicket);

// When you fetch ticket + replies individually:
router.get('/ticketReply/:id', getTicketReply);

// Ticket history by user
router.get('/history/user/:userId', getUserTicketHistory);

// Ticket history (all resolved)
router.get('/history/resolved', getAllResolvedTickets);

router.get("/history/admin", getAllResolvedTickets)

// Ticket “details” endpoint (front end also calls this)
router.get('/ticketDetails/:id', getTicketDetails);

>>>>>>> TicketReply

export default router;
