// import Ticket from '../models/ticket.js';
// import TicketReply from '../models/ticketReply.js';
// import User from '../models/user.js';
// import approvedTicket from '../models/approvedTicket.js';
// import { sendEmail } from '../utils/sendemail.js';


// // ———————————
// // 1) Create a reply on a ticket
// // ———————————
// export const replyToTicket = async (req, res) => {
//   try {
//     const { replyMessage } = req.body;
//     const senderId = req.user.id;

//     if (!replyMessage) {
//       return res.status(400).json({ message: 'Reply message is required' });
//     }

//     // Find the ticket by ID
//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }

//     console.log('senderId:', senderId);
//     const sender = await User.findById(senderId);
//     if (!sender) {
//       return res.status(404).json({ message: 'Sender not found' });
//     }

//     const reply = new TicketReply({
//       ticketId: ticket._id,
//       userId: senderId,
//       message: replyMessage,
//     });
//     await reply.save();

//     // Determine recipient
//     let recipient;
//     let subject, message;

//     if (sender.role === 'ADMIN') {
//       // notify the user who created the ticket
//       recipient = await User.findById(ticket.userId);
//       subject = 'Your support ticket has a new reply';
//       message = `Hello ${recipient.name},\n\nAn admin has replied to your ticket with ticket ID: ${ticket._id}. Please view the response.`;
//     } else {
//       // Find the admin who previously replied to this ticket
//       const previousAdminReply = await TicketReply.findOne({
//         ticketId: ticket._id,
//         userId: { $ne: ticket.userId } // not the ticket creator
//       }).sort({ createdAt: -1 }); // get the most recent admin reply

//       if (previousAdminReply) {
//         recipient = await User.findById(previousAdminReply.userId);
//       }

//       if (recipient && recipient.role === 'ADMIN') {
//         subject = 'A user has replied to a support ticket';
//         message = `Hello ${recipient.name},\n\nA user has replied to ticket ID: ${ticket._id}. Please check the admin dashboard for details.`;
//       } else {
//         console.log('No previous admin found in the conversation');
//         // Don't send an email if no previous admin found
//         recipient = null;
//       }
//     }

//     if (recipient?.email) {
//       try {
//         await sendEmail(
//           recipient.email,
//           subject,
//           message
//         );
//         console.log('Email sent successfully to:', recipient.email);
//       } catch (emailError) {
//         console.error('Failed to send email:', emailError);
//       }
//     }

//     res.status(201).json({ message: 'Reply added and notification sent', reply });
//   } catch (err) {
//     console.error('Error in replyToTicket:', err);
//     res.status(500).json({ error: err.message });
//   }
// };


// // ———————————
// // 2) Return a single ticket + its replies
// // ———————————
// export const getTicketReply = async (req, res) => {
//   try {
//     const ticket = await Ticket
//       .findById(req.params.id)
//       .populate('userId', 'name email');

//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }

//     const replies = await TicketReply
//       .find({ ticketId: ticket._id })
//       .populate('senderId', 'name email')
//       .sort({ createdAt: 1 });

//     return res.json({ ticket, replies });
//   } catch (err) {
//     console.error('❌ Error in getTicketReply:', err);
//     return res.status(500).json({
//       message: 'Error fetching ticket',
//       error: err.message,
//     });
//   }
// };


// // ———————————
// // 4) GET all resolved tickets (admin view) WITH PAGINATION
// // ———————————
// export const getAllResolvedTickets = async (req, res) => {
//   try {
//     // Check if user is admin
//     const user = await User.findById(req.user.id);
//     if (user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Access denied. Admin only.' });
//     }

//     // Pagination params
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Count total resolved tickets
//     const totalTickets = await Ticket.countDocuments({ status: 'RESOLVED' });
//     const totalPages = Math.ceil(totalTickets / limit);

//     // Fetch only the slice requested
//     const tickets = await Ticket
//       .find({ status: 'RESOLVED' })
//       .populate('userId', 'name email')
//       .sort({ updatedAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     return res.json({
//       tickets,
//       currentPage: page,
//       totalPages,
//       totalTickets,
//       hasNextPage: page < totalPages,
//       hasPrevPage: page > 1
//     });
//   } catch (err) {
//     console.error('❌ Error in getAllResolvedTickets:', err);
//     return res.status(500).json({ error: err.message });
//   }
// };


// // ———————————
// // 5) GET ticket history for a specific user (or all tickets if admin) WITH PAGINATION
// // ———————————
// export const getUserTicketHistory = async (req, res) => {
//   try {
//     // Get the authenticated user
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Pagination parameters
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Build query: “RESOLVED” tickets only; if not ADMIN, filter by userId
//     let query = { status: 'RESOLVED' };
//     if (user.role !== 'ADMIN') {
//       query.userId = user._id;
//     }

//     // Count total documents for this query
//     const totalTickets = await Ticket.countDocuments(query);
//     const totalPages = Math.ceil(totalTickets / limit);

//     // Fetch the slice
//     const tickets = await Ticket
//       .find(query)
//       .populate('userId', 'name email')
//       .sort({ updatedAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     return res.json({
//       tickets,
//       currentPage: page,
//       totalPages,
//       totalTickets,
//       hasNextPage: page < totalPages,
//       hasPrevPage: page > 1
//     });
//   } catch (err) {
//     console.error('❌ Error in getUserTicketHistory:', err);
//     return res.status(500).json({ error: err.message });
//   }
// };


// // ———————————
// // DELETE a ticket (no change from before)
// // ———————————
// export async function deleteTicket(req, res) {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const ticket = await Ticket.findById(req.params.ticketId);
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }

//     // Check if user is admin or owns the ticket
//     if (user.role !== 'ADMIN' && ticket.userId.toString() !== user._id.toString()) {
//       return res.status(403).json({ message: 'You are not authorized to delete this ticket' });
//     }

//     await ticket.deleteOne();
//     res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// }


// // ———————————
// // GET ticket details (no change from before)
// // ———————————
// export async function getTicketDetails(req, res) {
//   try {
//     const user = await User.findById(req.user.id);
//     const ticket = await Ticket.findById(req.params.id).populate('userId', 'name email role');
//     if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

//     if (user.role !== 'ADMIN' && ticket.userId._id.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     // Get approval information if the ticket is approved
//     let approvalInfo = null;
//     if (ticket.status !== 'AWAITING_APPROVAL') {
//       const approval = await approvedTicket.findOne({ ticketId: ticket._id })
//         .populate('adminId', 'name email');
//       if (approval) {
//         approvalInfo = {
//           approvedBy: approval.adminId.name,
//           approvedAt: approval.createdAt
//         };
//       }
//     }

//     res.json({ ...ticket.toObject(), approvalInfo });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching ticket', error: error.message });
//   }
// }

import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';
import User from '../models/user.js';
import approvedTicket from '../models/approvedTicket.js';
import { sendEmail } from '../utils/sendemail.js';


// ———————————
// 1) Create a reply on a ticket
// ———————————
export const replyToTicket = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const senderId = req.user.id;

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    // Find the ticket by ID
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Save the reply (use senderId instead of userId)
    const reply = new TicketReply({
      ticketId: ticket._id,
      senderId: senderId,
      message: replyMessage,
    });
    await reply.save();

    // Determine recipient
    let recipient;
    let subject, message;

    if (sender.role === 'ADMIN') {
      // Admin is replying → notify the user who created the ticket
      recipient = await User.findById(ticket.userId);
      subject = 'Your support ticket has a new reply';
      message = `Hello ${recipient.name},\n\nAn admin has replied to your ticket with ticket ID: ${ticket._id}. Please view the response.`;
    } else {
      // A normal user is replying → first try to find the most recent admin reply
      const previousAdminReply = await TicketReply.findOne({ ticketId: ticket._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'role');

      if (previousAdminReply && previousAdminReply.senderId.role === 'ADMIN') {
        recipient = await User.findById(previousAdminReply.senderId._id);
      }

      // If no previous admin found, fallback to any admin account
      if (!recipient) {
        recipient = await User.findOne({ role: 'ADMIN' });
      }

      if (recipient) {
        subject = 'A user has replied to a support ticket';
        message = `Hello ${recipient.name},\n\nUser "${sender.name}" has replied to ticket ID: ${ticket._id}. Please check the admin dashboard for details.`;
      }
    }

    if (recipient?.email) {
      try {
        await sendEmail(recipient.email, subject, message);
        console.log('Email sent successfully to:', recipient.email);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    res.status(201).json({ message: 'Reply added and notification sent', reply });
  } catch (err) {
    console.error('Error in replyToTicket:', err);
    res.status(500).json({ error: err.message });
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
// 4) GET all resolved tickets (admin view) WITH PAGINATION
// ———————————
export const getAllResolvedTickets = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Count total resolved tickets
    const totalTickets = await Ticket.countDocuments({ status: 'RESOLVED' });
    const totalPages = Math.ceil(totalTickets / limit);

    // Fetch only the slice requested
    const tickets = await Ticket
      .find({ status: 'RESOLVED' })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      tickets,
      currentPage: page,
      totalPages,
      totalTickets,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (err) {
    console.error('❌ Error in getAllResolvedTickets:', err);
    return res.status(500).json({ error: err.message });
  }
};


// ———————————
// 5) GET ticket history for a specific user (or all tickets if admin) WITH PAGINATION
// ———————————
export const getUserTicketHistory = async (req, res) => {
  try {
    // Get the authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query: “RESOLVED” tickets only; if not ADMIN, filter by userId
    let query = { status: 'RESOLVED' };
    if (user.role !== 'ADMIN') {
      query.userId = user._id;
    }

    // Count total documents for this query
    const totalTickets = await Ticket.countDocuments(query);
    const totalPages = Math.ceil(totalTickets / limit);

    // Fetch the slice
    const tickets = await Ticket
      .find(query)
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      tickets,
      currentPage: page,
      totalPages,
      totalTickets,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (err) {
    console.error('❌ Error in getUserTicketHistory:', err);
    return res.status(500).json({ error: err.message });
  }
};


// ———————————
// DELETE a ticket (no change from before)
// ———————————
export async function deleteTicket(req, res) {
  try {
    const user = await User.findById(req.user.id);
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


// ———————————
// GET ticket details (no change from before)
// ———————————
export async function getTicketDetails(req, res) {
  try {
    const user = await User.findById(req.user.id);
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
