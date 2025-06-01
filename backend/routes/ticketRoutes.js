import express from 'express';
const router = express.Router();

import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory,
  getTicketDetails,
} from '../controllers/ticketController.js';

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


export default router;
