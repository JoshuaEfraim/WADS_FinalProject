// import express from 'express';
// const router = express.Router();

// import {
//   getAllResolvedTickets,
//   getTicketReply,
//   replyToTicket,
//   getUserTicketHistory,
//   getTicketDetails
// } from '../controllers/ticketController.js';


// // POST a reply to a ticket (protected)
// router.post('/reply/:id', replyToTicket);

// // GET all resolved tickets (admin view - protected)
// router.get('/history/admin', getAllResolvedTickets);

// // GET resolved tickets for a specific user (protected)
// router.get('/history/user/:userId', getUserTicketHistory);

// router.get('/ticketReply/:id', getTicketReply);

// export default router;
import express from 'express';
const router = express.Router();

import {
  getAllResolvedTickets,
  getTicketReply,
  replyToTicket,
  getUserTicketHistory,
  getTicketDetails
} from '../controllers/ticketController.js';

// Ticket reply routes
router.post('/reply/:id', replyToTicket);
router.get('/ticketReply/:id', getTicketReply);

// Ticket history routes
router.get('/history/user/:userId', getUserTicketHistory);
router.get('/history/resolved', getAllResolvedTickets);

// Ticket details route
router.get('/:id', getTicketDetails);

export default router; 