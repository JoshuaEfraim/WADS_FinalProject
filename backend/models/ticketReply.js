// models/TicketReply.js
import mongoose from 'mongoose';

const ticketReplySchema = new mongoose.Schema({
  ticketId: { type: mongoose.Types.ObjectId, ref: 'Ticket', required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const TicketReply = mongoose.model("TicketReply", ticketReplySchema)

export default TicketReply;
