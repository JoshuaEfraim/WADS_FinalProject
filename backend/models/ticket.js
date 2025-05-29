  // models/Ticket.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
  status: {
    type: String,
    enum: ['AWAITING_APPROVAL', 'PENDING', 'REJECTED', 'PROCESSING', 'RESOLVED'],
    required: true
  },
}, { timestamps: true });

ticketSchema.index({ createdAt: 1 });

const Ticket =  mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema)


export default Ticket;
