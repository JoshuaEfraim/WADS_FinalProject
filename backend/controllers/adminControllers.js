import User from '../models/user.js'
import Ticket from '../models/ticket.js';
import mongoose from "mongoose";
import TicketReply from '../models/ticketReply.js'
import approvedTicket from '../models/approvedTicket.js'
import notification from '../models/notification.js'

// ADMIN CONTROLLER

export async function getAdminDashboardData(req, res) {
  try {

    const now = new Date()
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const totalResolvedTickets = await Ticket.countDocuments({ status: "RESOLVED" });

    // Ticket priority summary
    const prioritySummary = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    // Ticket status summary
    const statusSummary = await Ticket.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent tickets (latest 5)
    const recentTickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email");

    // Weekly Chart (last 7 days grouped by day and status)
    const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyChart = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: past7Days }
        }
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" }, // 1 (Sunday) - 7 (Saturday)
          status: 1
        }
      },
      {
        $group: {
          _id: { day: "$day", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      totalUsers,
      totalTickets,
      totalResolvedTickets,
      prioritySummary,
      statusSummary,
      recentTickets,
      weeklyChart
    });
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
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
      .sort({ createdAt: sortOrder })
      .populate('userId', 'name email');

    // Add total counts for specific statuses
    const [
      totalAwaitingApproval,
      totalProcessing,
      totalResolvedTickets
    ] = await Promise.all([
      Ticket.countDocuments({ status: "AWAITING_APPROVAL" }),
      Ticket.countDocuments({ status: "PROCESSING" }),
      Ticket.countDocuments({ status: "RESOLVED" })
    ]);

    // Get status and priority options from Ticket schema
    const statusOptions = Ticket.schema.path('status').enumValues;
    const priorityOptions = Ticket.schema.path('priority').enumValues;

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalTickets / limitNum),
      totalTickets,
      totalAwaitingApproval,
      totalProcessing,
      totalResolvedTickets,
      tickets,
      statusOptions,
      priorityOptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getTicketDetails(req, res) {
  try {
    // const user = await User.findById(req.user.id);
    const user = await User.findOne({role:"ADMIN"})
    const ticket = await Ticket.findById(req.params.id).populate('userId', 'name email role');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (user.role !== 'ADMIN' && ticket.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
}

export async function getTicketByStatus(req, res) {
  try {
    const status = req.params.status.toUpperCase();

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

    // Access control
    if (user.role !== 'ADMIN' && ticket.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prevStatus = ticket.status;

    // Non-admin user restrictions
    if (user.role.toUpperCase() !== 'ADMIN') {
      if ('status' in req.body) {
        return res.status(403).json({ message: 'You are not allowed to update ticket status' });
      }

      if (['AWAITING_APPROVAL', 'REJECTED'].includes(ticket.status)) {
        return res.status(403).json({ message: 'Cannot update unapproved ticket' });
      }

      ticket.set(req.body);
    } else {
      // Admin can update everything
      const newStatus = req.body.status?.toUpperCase();

      //  Prevent changing status back to AWAITING_APPROVAL after it's approved
      if (prevStatus !== 'AWAITING_APPROVAL' && newStatus === 'AWAITING_APPROVAL') {
        return res.status(403).json({ message: 'Cannot revert status to AWAITING_APPROVAL after approval' });
      }

      ticket.set({
        ...req.body,
        ...(newStatus && { status: newStatus }),
        ...(req.body.priority && { priority: req.body.priority.toUpperCase() })
      });

      // Log approval and notify user
      if (prevStatus === 'AWAITING_APPROVAL' && newStatus === 'PENDING') {
        await approvedTicket.create({
          ticketId: ticket._id,
          adminId: user._id
        });

        //  approval notification
      }

      // Notify user on any other status change
      if (newStatus && prevStatus !== newStatus) {
        // status change notification
      }
    }

    await ticket.save();
    const updated = await Ticket.findById(ticket._id).populate('userId', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
}




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
    if (user.role !== 'admin' && ticket.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this ticket' });
    }

    await ticket.deleteOne();

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteUsers(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can delete users
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete users' });
    }

    // The ID of the user to delete is in req.params.id
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User to delete not found' });
    }

    // Optionally, prevent admin from deleting themselves
    if (userToDelete._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete themselves' });
    }

    await userToDelete.deleteOne();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
