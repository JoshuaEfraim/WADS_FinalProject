// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });

const notification = mongoose.model("notification", notificationSchema)

export default notification;


