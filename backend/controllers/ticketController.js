// import Ticket from '../models/ticket.js';
// import TicketReply from '../models/ticketReply.js';

// // 4. Ticket Details Page (reply + ticket info)
// export const replyToTicket = async (req, res) => {
//   try {
//     // const senderId = req.user._id; // <<== Pake yg ini
//     const { replyMessage } = req.body;
    
//     // Example sender ID for local testing, replace with req.user._id when auth is integrated
//     const senderId = '6834640aabde44e25db92257'; // <<===== Mockup ID

//     const ticket = await Ticket.findById(req.params.id);
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }
   
//     const reply = new TicketReply({
//       ticketId: ticket._id,
//       senderId,
//       message: replyMessage,
//     });

//     await reply.save();
//     res.status(201).json({ message: 'Reply added successfully', reply });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getTicketReply = async (req, res) => {
//   try {
//      console.log("🟢 Received request for ticket ID:", req.params.id); 

//     const ticket = await Ticket
//       .findById(req.params.id)
//       .populate('userId', 'name email');

//     if (!ticket) {
//       console.log("❌ Ticket not found for ID:", req.params.id);
//       return res.status(404).json({ message: 'Ticket not found' });
//     }

//     console.log("✅ Ticket fetched:", ticket);

//     const replies = await TicketReply
//       .find({ ticketId: ticket._id })
//       .populate('senderId', 'name email')
//       .sort({ createdAt: 1 });

//     console.log("✅ Replies fetched:", replies);

//     res.json({ ticket, replies });
//   } catch (err) {
//     console.error("❌ Error in getTicketReply:", err);
//     res.status(500).json({
//       message: "Error fetching ticket",
//       error: err.message,
//     });
//   }
// };


// // 5. Ticket History Page (only resolved tickets)
// export const getAllResolvedTickets = async (req, res) => {
//   try {
//     const tickets = await Ticket
//       .find({ status: 'RESOLVED' })
//       .populate('userId', 'name email')
//       .sort({ updatedAt: -1 });

//     res.json({ tickets });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getUserTicketHistory = async (req, res) => {
//   try {
//     const tickets = await Ticket
//       .find({
//         userId: req.params.userId,
//         status: 'RESOLVED'
//       })
//       .sort({ updatedAt: -1 });

//     res.json({ tickets });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// export const getTicketDetails = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const ticket = await Ticket.findById(id).populate("userId", "name email");

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     res.status(200).json(ticket);
//   } catch (error) {
//     console.error("Error fetching ticket:", error.message);
//     res.status(500).json({ message: "Error fetching ticket", error: error.message });
//   }
// };
import Ticket from '../models/ticket.js';
import TicketReply from '../models/ticketReply.js';
import User from '../models/user.js';

export const replyToTicket = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    // TODO: Replace with actual user authentication
    // For now, we'll get the first admin user as a mock
    const sender = await User.findOne({ role: 'ADMIN' });
    
    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const reply = new TicketReply({
      ticketId: ticket._id,
      senderId: sender._id,
      message: replyMessage,
    });

    await reply.save();
    
    // Populate the sender info before sending response
    await reply.populate('senderId', 'name email role');
    
    res.status(201).json({ message: 'Reply added successfully', reply });
  } catch (err) {
    console.error('Error in replyToTicket:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getTicketReply = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate('userId', 'name email role');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const replies = await TicketReply
      .find({ ticketId: ticket._id })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ ticket, replies });
  } catch (err) {
    console.error('Error in getTicketReply:', err);
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
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ tickets });
  } catch (err) {
    console.error('Error in getUserTicketHistory:', err);
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
    console.error('Error in getAllResolvedTickets:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    console.error('Error in getTicketDetails:', err);
    res.status(500).json({ error: err.message });
  }
};