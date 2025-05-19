import prisma from "../config/db.js";

export async function getAllUsers(req,res) {
    try {
        const { page, limit } = req.query;

        // If no pagination params: just return total user count
        if (!page && !limit) {
        const totalUsers = await prisma.user.count();
        return res.status(200).json({ success: true, totalUsers });
        }

        // Pagination parameters are present
        const pageNum = parseInt(page)  ;
        const limitNum = parseInt(limit) ;
        const skip = (pageNum - 1) * limitNum;

        const totalUsers = await prisma.user.count();

        const users = await prisma.user.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({
        success: true,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function getAdminTickets(req,res) {
    
    try {
        const { page, limit } = req.query;

        // If no pagination params: just return total user count
        if (!page && !limit) {
        const totalTickets = await prisma.ticket.count();
        return res.status(200).json({ success: true, totalTickets });
        }

            // Pagination parameters are present
        const pageNum = parseInt(page)  ;
        const limitNum = parseInt(limit) ;
        const skip = (pageNum - 1) * limitNum;

        const totalTickets = await prisma.ticket.count();

        const tickets = await prisma.ticket.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({
        success: true,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalTickets / limitNum),
        totalTickets,
        tickets,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } 
}

export async function getTicketByStatus(req,res){

  try {
    const status = req.params.status.toUpperCase();

    const tickets = await prisma.ticket.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }

}


export async function getTicketByPriority(req,res) {
    try {
        const priority = req.params.priority.toUpperCase();

        const tickets = await prisma.ticket.findMany({
            where: {priority},
            orderBy: {createdAt: 'desc'}
        });

        res.json(tickets)
    } catch (error) {
        res.status(500).json({message: "Error fetching tickets", error: error.message});
    }
}

export async function getTicketReport(req,res){
    res.send("ticket report")
}

export async function getRecentTicket(req,res) {
    res.send("recent tickets")
}


export async function updateTicket(req,res){
    res.send("update ticket")
}


export async function deleteTicket(req,res){
    res.send("admin delete ticket")
}

export async function deleteUsers(req,res) {
    
    
}