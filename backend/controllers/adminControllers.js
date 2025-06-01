import User from '../models/user.js'
import Ticket from '../models/ticket.js';
import mongoose from "mongoose";
import TicketReply from '../models/ticketReply.js'
import approvedTicket from '../models/approvedTicket.js'
import notification from '../models/notification.js'
import { sendEmail } from '../utils/sendemail.js';

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

    const user = await User.findById(req.user.id);
    // const user = await User.findOne({role: "ADMIN"});  // testing purposes
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "You are not authorized to access this resource" });
    }

    const { page, limit, search, sort, status, priority } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 5;
    const searchQuery = search || "";
    const sortOrder = sort === "desc" ? -1 : 1;
    const skip = (pageNum - 1) * limitNum;

    // Base aggregation pipeline stages
    const baseStages = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: '$userData'
      }
    ];

    // Search conditions
    const searchMatch = searchQuery ? {
      $or: [
        { subject: { $regex: searchQuery, $options: "i" } },
        { 'userData.name': { $regex: searchQuery, $options: "i" } },
        { 'userData.email': { $regex: searchQuery, $options: "i" } },
        ...(mongoose.Types.ObjectId.isValid(searchQuery) ? [{ _id: new mongoose.Types.ObjectId(searchQuery) }] : [])
      ]
    } : {};

    // Status and priority filters
    const filters = {
      ...(status && status !== "ALL" ? { status: status.toUpperCase() } : {}),
      ...(priority && priority !== "ALL" ? { priority: priority.toUpperCase() } : {})
    };

    // Get tickets using aggregation
    const tickets = await Ticket.aggregate([
      ...baseStages,
      {
        $match: {
          ...searchMatch,
          ...filters
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      {
        $unwind: '$userId'
      },
      {
        $project: {
          _id: 1,
          subject: 1,
          description: 1,
          status: 1,
          priority: 1,
          createdAt: 1,
          updatedAt: 1,
          'userId._id': 1,
          'userId.name': 1,
          'userId.email': 1
        }
      },
      { $skip: skip },
      { $limit: limitNum },
      { $sort: { createdAt: sortOrder } }
    ]);

    // Get total count
    const totalTickets = (await Ticket.aggregate([
      ...baseStages,
      {
        $match: {
          ...searchMatch,
          ...filters
        }
      },
      { $count: 'total' }
    ]))[0]?.total || 0;

    // Get status counts
    const [totalAwaitingApproval, totalProcessing, totalResolvedTickets] = await Promise.all([
      Ticket.countDocuments({ status: "AWAITING_APPROVAL" }),
      Ticket.countDocuments({ status: "PROCESSING" }),
      Ticket.countDocuments({ status: "RESOLVED" })
    ]);

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
      statusOptions: Ticket.schema.path('status').enumValues,
      priorityOptions: Ticket.schema.path('priority').enumValues
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateTicket(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const ticket = await Ticket.findById(req.params.id).populate('userId', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Access control
    if (user.role !== 'ADMIN' && ticket.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prevStatus = ticket.status;
    let newStatus;

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
      newStatus = req.body.status?.toUpperCase();

      // Prevent reverting to AWAITING_APPROVAL
      if (prevStatus !== 'AWAITING_APPROVAL' && newStatus === 'AWAITING_APPROVAL') {
        return res.status(403).json({ message: 'Cannot revert status to AWAITING_APPROVAL after approval' });
      }

      ticket.set({
        ...req.body,
        ...(newStatus && { status: newStatus }),
        ...(req.body.priority && { priority: req.body.priority.toUpperCase() })
      });

      // Save the ticket first to ensure the update succeeds
      await ticket.save();

      // Handle notifications after successful save
      try {
        // Log approval and send notification
        if (prevStatus === 'AWAITING_APPROVAL' && newStatus === 'PENDING') {
          await approvedTicket.create({
            ticketId: ticket._id,
            adminId: user._id
          });

          try {
            await sendEmail(
              ticket.userId.email,
              'Ticket Approved',
              `Hi ${ticket.userId.name},\n\nYour ticket has been approved and is now pending.\n\nThanks,\nSupport Team`
            );
          } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
          }
        }

        // Handle rejected tickets
        if (prevStatus === 'AWAITING_APPROVAL' && newStatus === 'REJECTED') {
          try {
            await sendEmail(
              ticket.userId.email,
              'Ticket Rejected',
              `Hi ${ticket.userId.name},\n\nWe regret to inform you that your ticket has been rejected.\n\nReason: ${req.body.rejectionReason || 'No reason provided'}\n\nThanks,\nSupport Team`
            );
          } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
          }
        }

        // Status change notifications
        if (newStatus && prevStatus !== newStatus) {
          let subject = '';
          let message = '';

          if (prevStatus === 'PENDING' && newStatus === 'PROCESSING') {
            subject = 'Ticket in Progress';
            message = `Hi ${ticket.userId.name},\n\nYour ticket is now being processed.\n\nThanks,\nSupport Team`;
          } else if (prevStatus === 'PROCESSING' && newStatus === 'RESOLVED') {
            subject = 'Ticket Resolved';
            message = `Hi ${ticket.userId.name},\n\nYour ticket has been resolved and closed.\n\nThanks,\nSupport Team`;
          }

          if (subject && message) {
            try {
              await sendEmail(ticket.userId.email, subject, message);
            } catch (emailError) {
              console.error('Failed to send status update email:', emailError);
            }
          }
        }
      } catch (notificationError) {
        console.error('Error handling notifications:', notificationError);
        // Continue execution - notifications are non-critical
      }
    }

    // For non-admin updates or if no notifications were needed
    if (!newStatus) {
      await ticket.save();
    }

    const updated = await Ticket.findById(ticket._id).populate('userId', 'name email');
    res.json(updated);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
}



export async function deleteUsers(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can delete users
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You are not authorized to delete users' });
    }

    // The ID of the user to delete is in req.params.id
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User to delete not found' });
    }

    // prevent admin from deleting themselves
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

export async function getCurrentAdmin(req, res) {
  try {
    // const user = await User.findOne({ role: "ADMIN" }); // testing purposes
    const user = await User.findById(req.user.id);
    
    if (user.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Return only necessary profile data
    const adminProfile = {
      name: user.name,
      email: user.email,
      profileImg: user.profileImg,
      department: user.department
    };

    return res.status(200).json(adminProfile);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
