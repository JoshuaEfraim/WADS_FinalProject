// models/ticketReply.js

import mongoose from "mongoose"

const ticketReplySchema = new mongoose.Schema(
  {
    ticketId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Ticket", 
      required: true },
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true },
    message: { 
      type: String, 
      required: true },
  },
  { timestamps: true }
)

const TicketReply = mongoose.model("TicketReply", ticketReplySchema)
export default TicketReply
