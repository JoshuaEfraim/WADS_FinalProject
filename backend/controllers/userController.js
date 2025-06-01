import User from '../models/user.js'
import Ticket from '../models/ticket.js';
import mongoose from "mongoose";
import TicketReply from '../models/ticketReply.js'
import approvedTicket from '../models/approvedTicket.js'

export async function getUserTickets(req, res) {
    try {
        // const userId = await User.findOne({_id: "6837e04f9275f96ff3a3c9c1"}); // Get user ID from authenticated request
        const userId = await User.findById(req.user.id) 
        const { page, limit, sort, status, priority } = req.query;
        
        // Convert page and limit to numbers
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 5;
        const skip = (pageNum - 1) * limitNum;
        
        // Sort order
        const sortOrder = sort === 'asc' ? 1 : -1;

        // Build filter object
        const filter = { userId };
        
        // Add status filter if provided
        if (status && status !== 'ALL') {
            filter.status = status.toUpperCase();
        }
        
        // Add priority filter if provided
        if (priority && priority !== 'ALL') {
            filter.priority = priority.toUpperCase();
        }

        // Find tickets for the user with pagination, sorting and filters
        const tickets = await Ticket.find(filter)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'name email');

        // Get total count of tickets for pagination
        const totalTickets = await Ticket.countDocuments(filter);

        // Get counts for different statuses
        const [totalAwaitingApproval, totalProcessing, totalResolved] = await Promise.all([
            Ticket.countDocuments({ userId, status: 'AWAITING_APPROVAL' }),
            Ticket.countDocuments({ userId, status: 'PROCESSING' }),
            Ticket.countDocuments({ userId, status: 'RESOLVED' })
        ]);

        return res.status(200).json({
            success: true,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalTickets / limitNum),
            totalTickets,
            totalAwaitingApproval,
            totalProcessing,
            totalResolved,
            tickets,
            statusOptions: Ticket.schema.path('status').enumValues,
            priorityOptions: Ticket.schema.path('priority').enumValues
        });

    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message
        });
    }
}

