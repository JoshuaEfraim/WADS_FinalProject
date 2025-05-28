import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';

/**
 * POST /api/tickets/:id/reply
 * Add a reply to a ticket (from admin or user)
 */
export const replyToTicket = async (req, res) => {
  try {
    const { senderId, replyMessage } = req.body;

    if (!senderId || !replyMessage) {
      return res.status(400).json({ message: 'Missing required fields' });
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

// import Ticket from '../models/ticket.js';
// import TicketReply from '../models/ticketReply.js';
// import User from '../models/user.js'; // TEMP: used for role lookup

// // POST /api/tickets/:id/reply
// export const replyToTicket = async (req, res) => {
//   try {
//     const { replyMessage, senderId } = req.body; // ✅ Extract first
//     console.log("Looking for user with ID:", senderId); // ✅ Then log

//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

//     const user = await User.findById(senderId);
//     if (!user) return res.status(404).json({ message: 'Sender not found' });

//     const reply = new TicketReply({
//       ticketId: ticket._id,
//       senderId: user._id,
//       message: replyMessage,
//     });

//     await reply.save();
//     res.status(201).json({ message: 'Reply added successfully', reply });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
