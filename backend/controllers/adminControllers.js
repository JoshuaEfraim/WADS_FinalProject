// import prisma from "../config/db.js";
// import { connectDB } from "../config/db.js"
import User from '../models/User.js'
import Ticket from '../models/Ticket.js'
import mongoose from "mongoose";
import TicketReply from '../models/ticketReply.js'
import approvedTicket from '../models/ApprovedTicket.js'
import notification from '../models/notification.js'

export async function getAdminDashboardData(req,res) {
    try {
        


    } catch (error) {
        
    }
}

export async function getAllUsers(req, res) {
  try {
    const { page, limit, search, sort } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;
    const searchQuery = search || "";
    const sortOrder = sort === "desc" ? -1 : 1; // default is ascending
    const skip = (pageNum - 1) * limitNum;

    // search by username and email
    const searchFilter = searchQuery
      ? {
          $or: [
            { username: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } }
          ]
        }
      : {};

    const totalUsers = await User.countDocuments(searchFilter);
    const users = await User.find(searchFilter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: sortOrder });

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalUsers / limitNum),
      totalUsers,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}



export async function getAdminTickets(req, res) {
  try {
    const { page, limit, search, sort, status, priority } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;
    const searchQuery = search || "";
    const sortOrder = sort === "desc" ? -1 : 1;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // Search by subject using regex (case-insensitive)
    const searchConditions = [];
    if (searchQuery) {
      searchConditions.push({ subject: { $regex: searchQuery, $options: "i" } });

      // Check if searchQuery is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(searchQuery)) {
        searchConditions.push({ _id: searchQuery });
      }

      filter.$or = searchConditions;
    }

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    const totalTickets = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: sortOrder });

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalTickets / limitNum),
      totalTickets,
      tickets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function approveTicket(req, res) {
  try {

    const user = await User.findById(req.user.id);
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can approve tickets.' });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.status !== 'AWAITING_APPROVAL') {
      return res.status(400).json({ message: 'Ticket must be in PENDING_APPROVAL status' });
    }

    ticket.status = 'PENDING';
    await ticket.save();

    await approvedTicket.create({ ticketId: ticket._id, userId: user._id });

    const updatedTicket = await Ticket.findById(ticket._id).populate('userId', 'userId name email');

    res.json({ message: 'Ticket approved successfully', ticket: updatedTicket });

  } catch (error) {
    res.status(500).json({ message: 'Error approving ticket', error: error.message });
  }
}


export async function getTicketByStatus(req, res) {
  try {
    const status = req.params.status.toUpperCase();

    // await connectDB();

    const tickets = await Ticket.find({ status })
      .sort({ createdAt: -1 }); // descending order

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
}

export async function getTicketByPriority(req, res) {
  try {
    const priority = req.params.priority.toUpperCase();

    // await connectDB();

    const tickets = await Ticket.find({ priority })
      .sort({ createdAt: -1 }); // descending order

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
}

export async function updateTicket(req, res) {
  try {

    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (user.role !== 'ADMIN' && ticket.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (user.role !== 'ADMIN' &&
        (ticket.status === 'AWAITING_APPROVAL' || ticket.status === 'REJECTED')) {
      return res.status(403).json({ message: 'Cannot update unapproved ticket' });
    }

    ticket.set({
      ...req.body,
      ...(req.body.status && { status: req.body.status.toUpperCase() }),
      ...(req.body.priority && { priority: req.body.priority.toUpperCase() })
    });

    await ticket.save();
    const updated = await Ticket.findById(ticket._id).populate('userId', 'userId name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
}




export async function deleteTicket(req,res){
    res.send("admin delete ticket")
}

export async function deleteUsers(req,res) {
    
    
}