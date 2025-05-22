// models/User.js
import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String },
  loginWithGoogle: { type: Boolean, default: false },
  profileImg: { type: String },
  role: { type: String, enum: ['ADMIN', 'USER'], required: true },
  department: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model("User", userSchema)

export default User;