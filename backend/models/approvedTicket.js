// models/ApprovedTicket.js
import mongoose from 'mongoose';

const approvedTicketSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Types.ObjectId, ref: 'Ticket', required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Composite unique index
approvedTicketSchema.index({ ticketId: 1, userId: 1 }, { unique: true });

const approvedTicket = mongoose.model("approvedTicket", approvedTicketSchema)

export default approvedTicket;
