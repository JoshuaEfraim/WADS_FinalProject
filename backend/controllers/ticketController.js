import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';

/**
 * POST /api/tickets/reply/:id
 * Add a reply to a ticket (from authenticated admin or user)
 */
export const replyToTicket = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const senderId = req.user._id; // get from authenticated user

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const reply = new TicketReply({
      ticketId: ticket._id,
      senderId,
      message: replyMessage,
    });

    await reply.save();
    res.status(201).json({ message: 'Reply added successfully', reply });
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
      .populate('senderId', 'name email role') // ⬅️ populate reply sender info
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