// import { useState, useEffect } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { ArrowLeft, Clock, MessageSquare } from "lucide-react"

// function getPriorityClass(priority) {
//   const classes = {
//     HIGH: "priority-high",
//     MEDIUM: "priority-medium",
//     LOW: "priority-low",
//   }
//   return classes[priority] || "priority-low"
// }

// function getStatusClass(status) {
//   const classes = {
//     RESOLVED: "status-resolved",
//     IN_PROGRESS: "status-pending",
//     NEW_TICKET: "status-awaiting-approval",
//     PENDING: "status-pending",
//     PROCESSING: "status-processing",
//     REJECTED: "status-rejected",
//   }
//   return classes[status] || "bg-gray-100 text-gray-800 border-gray-200"
// }

// const UserTicketDetails = () => {
//   const { ticketId } = useParams()
//   const navigate = useNavigate()
//   const [ticket, setTicket] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     fetchTicketDetails()
//   }, [ticketId])

//   const fetchTicketDetails = async () => {
//     try {
//       // const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`)
//       const data = await response.json()
      
//       if (data.success) {
//         setTicket(data.ticket)
//       } else {
//         setError(data.message || "Failed to fetch ticket details")
//       }
//     } catch (err) {
//       setError("An error occurred while fetching ticket details")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-red-500 mb-4">{error}</p>
//         <Button onClick={() => navigate(-1)}>Go Back</Button>
//       </div>
//     )
//   }

//   if (!ticket) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-gray-500 mb-4">Ticket not found</p>
//         <Button onClick={() => navigate(-1)}>Go Back</Button>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header with back button */}
//       <div className="flex items-center gap-4">
//         <Button
//           variant="ghost"
//           size="sm"
//           className="flex items-center gap-2"
//           onClick={() => navigate(-1)}
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Tickets
//         </Button>
//       </div>

//       {/* Ticket Details Card */}
//       <Card className="bg-white shadow-sm border border-gray-200 rounded-2xl">
//         <CardContent className="p-6">
//           <div className="space-y-6">
//             {/* Ticket Header */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm text-gray-500">
//                     Ticket ID: #{ticket._id}
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     Created: {new Date(ticket.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 <span
//                   className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityClass(ticket.priority)}`}
//                 >
//                   {ticket.priority === "HIGH" ? "High" : ticket.priority === "MEDIUM" ? "Medium" : "Low"} Priority
//                 </span>
//                 <span
//                   className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(ticket.status)}`}
//                 >
//                   {ticket.status === "PENDING"
//                     ? "Pending"
//                     : ticket.status === "REJECTED" ? "Rejected"
//                     : ticket.status === "PROCESSING" ? "Processing"
//                     : ticket.status === "RESOLVED"
//                       ? "Resolved" 
//                       : "Awaiting Approval"}
//                 </span>
//               </div>
//             </div>

//             {/* Ticket Description */}
//             <div className="border-t border-gray-200 pt-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
//               <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
//             </div>

//             {/* Ticket Details */}
//             <div className="border-t border-gray-200 pt-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Category</p>
//                   <p className="text-gray-900">{ticket.category || "Not specified"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Department</p>
//                   <p className="text-gray-900">{ticket.department || "Not specified"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Created Date</p>
//                   <p className="text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">Last Updated</p>
//                   <p className="text-gray-900">{new Date(ticket.updatedAt).toLocaleString()}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default UserTicketDetails; 