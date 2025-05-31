// backend/controllers/ticketController.js

import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';

// ———————————
// 1) Create a reply on a ticket
// ———————————
export const replyToTicket = async (req, res) => {
  try {
    // read `message` from request body (not `replyMessage`)
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    // Find the ticket by ID
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // (Once you add real auth middleware, you can switch to `req.user._id`.)
    const senderId = req.user?._id || ticket.userId;

    // Create and save new TicketReply
    const reply = new TicketReply({
      ticketId: ticket._id,
      senderId,
      message: message.trim(),
    });
    await reply.save();

    return res
      .status(201)
      .json({ message: 'Reply added successfully', reply });
  } catch (err) {
    console.error('❌ Error in replyToTicket:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ———————————
// 2) Return a single ticket + its replies
// ———————————
export const getTicketReply = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const replies = await TicketReply
      .find({ ticketId: ticket._id })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });

    return res.json({ ticket, replies });
  } catch (err) {
    console.error('❌ Error in getTicketReply:', err);
    return res.status(500).json({
      message: 'Error fetching ticket',
      error: err.message,
    });
  }
};

// ———————————
// 3) Return only the ticket’s core fields (no replies)
//     This is used by your “Details” tab (GET /api/tickets/:id).
// ———————————
export const getTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.json(ticket);
  } catch (err) {
    console.error('❌ Error in getTicketDetails:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ———————————
// 4) GET all resolved tickets (admin view)
// ———————————
export const getAllResolvedTickets = async (req, res) => {
  try {
    const tickets = await Ticket
      .find({ status: 'RESOLVED' })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    return res.json({ tickets });
  } catch (err) {
    console.error('❌ Error in getAllResolvedTickets:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ———————————
// 5) GET ticket history for a specific user
// ———————————
export const getUserTicketHistory = async (req, res) => {
  try {
    const tickets = await Ticket
      .find({
        userId: req.params.userId,
        status: 'RESOLVED',
      })
      .sort({ updatedAt: -1 });

    return res.json({ tickets });
  } catch (err) {
    console.error('❌ Error in getUserTicketHistory:', err);
    return res.status(500).json({ error: err.message });
  }
};
