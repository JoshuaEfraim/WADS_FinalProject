import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';
import User from '../models/user.js';
import approvedTicket from '../models/approvedTicket.js';

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

export async function deleteTicket(req, res) {
  try {
    const user = await User.findById(req.user.id);
    // const user = await User.findOne({role:"ADMIN"}); //testing purposes
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is admin or owns the ticket
    if (user.role !== 'ADMIN' && ticket.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this ticket' });
    }

    await ticket.deleteOne();

    res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getTicketDetails(req, res) {
  try {

    const user = await User.findById(req.user.id);  
    // const user = await User.findOne({_id : '6837e04f9275f96ff3a3c9bb'});  // testing purposes
    // const user = await User.findOne({role: "ADMIN"}); // testing purposes
    
    const ticket = await Ticket.findById(req.params.id).populate('userId', 'name email role');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (user.role !== 'ADMIN' && ticket.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get approval information if the ticket is approved
    let approvalInfo = null;
    if (ticket.status !== 'AWAITING_APPROVAL') {
      const approval = await approvedTicket.findOne({ ticketId: ticket._id })
        .populate('adminId', 'name email');
      if (approval) {
        approvalInfo = {
          approvedBy: approval.adminId.name,
          approvedAt: approval.createdAt
        };
      }
    }

    res.json({ ...ticket.toObject(), approvalInfo });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
}