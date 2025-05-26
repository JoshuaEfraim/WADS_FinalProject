import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';

/**
 * POST /api/tickets/:id/reply
 * Add a reply to a ticket (from admin or user)
 */
export const replyToTicket = async (req, res) => {
  try {
    const { replyMessage, senderId, senderRole } = req.body;

    if (!['admin', 'user'].includes(senderRole)) {
      return res.status(400).json({ message: 'senderRole must be "admin" or "user"' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const reply = new TicketReply({
      ticketId: ticket._id,
      senderId,
      senderRole,
      message: replyMessage,
    });

    await reply.save();
    res.status(201).json({ message: 'Reply added successfully', reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllResolvedTickets = async (req, res) => {
  try {
    const tickets = await Ticket
      .find({ status: 'RESOLVED' })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
      .sort({ createdAt: 1 });

    res.json({ ticket, replies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserTicketHistory = async (req, res) => {
  try {
    const tickets = await Ticket
      .find({
        userId: req.params.userId,
        status: 'RESOLVED'
      })
      .sort({ updatedAt: -1 });

    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
