import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Clock, MessageSquare, Calendar, User } from "lucide-react"

function getPriorityClass(priority) {
  const classes = {
    HIGH: "bg-rose-50 text-rose-700 border-rose-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }
  return classes[priority] || "bg-gray-50 text-gray-700 border-gray-200"
}

function getStatusClass(status) {
  const classes = {
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    NEW_TICKET: "bg-violet-50 text-violet-700 border-violet-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  }
  return classes[status] || "bg-gray-50 text-gray-700 border-gray-200"
}

const UserTicketDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    fetchTicketDetails()
  }, [id])

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tickets/ticketDetails/${id}`)
      const data = await response.json()
      setTicket(data)
    } catch (err) {
      setError("An error occurred while fetching ticket details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Ticket not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-gray-100"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Button>
      </div>

      {/* Ticket Details Card */}
      <Card className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Ticket Header */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{ticket.subject}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Ticket ID: #{ticket._id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(ticket.createdAt).date}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ticket Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Created Date</p>
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(ticket.createdAt).date}</p>
                  <p className="text-sm text-gray-500">{formatDate(ticket.createdAt).time}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(ticket.updatedAt).date}</p>
                  <p className="text-sm text-gray-500">{formatDate(ticket.updatedAt).time}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full ${getPriorityClass(ticket.priority).split(' ')[0]}`} />
                    <p className="text-sm font-medium text-gray-500">Priority</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityClass(ticket.priority)}`}
                  >
                    {ticket.priority === "HIGH" ? "High" : ticket.priority === "MEDIUM" ? "Medium" : "Low"} Priority
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-5 h-5 rounded-full ${getStatusClass(ticket.status).split(' ')[0]}`} />
                    <p className="text-sm font-medium text-gray-500">Status</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusClass(ticket.status)}`}
                  >
                    {ticket.status === "PENDING"
                      ? "Pending"
                      : ticket.status === "REJECTED" ? "Rejected"
                      : ticket.status === "PROCESSING" ? "Processing"
                      : ticket.status === "RESOLVED"
                        ? "Resolved" 
                        : "Awaiting Approval"}
                  </span>
                </div>
                {ticket.approvalInfo && (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Approved By</p>
                      </div>
                      <p className="text-gray-900 font-medium">{ticket.approvalInfo.approvedBy}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Approval Date</p>
                      </div>
                      <p className="text-gray-900 font-medium">{formatDate(ticket.approvalInfo.approvedAt).date}</p>
                      <p className="text-sm text-gray-500">{formatDate(ticket.approvalInfo.approvedAt).time}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ticket Description */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserTicketDetails; 