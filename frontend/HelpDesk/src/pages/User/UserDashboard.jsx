import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Ticket, CheckCircle, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate, useSearchParams } from "react-router-dom"

const priorityColors = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-green-100 text-green-700 border-green-200",
}

const statusColors = {
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
  AWAITING_APPROVAL: "bg-purple-100 text-purple-700 border-purple-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
}

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    resolvedTickets: 0,
    processingTickets: 0
  })
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "ALL")
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get("priority") || "ALL")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const navigate = useNavigate()

  const ITEMS_PER_PAGE = 5
  const currentPage = parseInt(searchParams.get("page") || "1")

  const statusOptions = ["ALL", "PENDING", "PROCESSING", "RESOLVED", "AWAITING_APPROVAL", "REJECTED"]
  const priorityOptions = ["ALL", "HIGH", "MEDIUM", "LOW"]

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/service/user/dashboard`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw new Error('Failed to fetch dashboard data')
        const data = await response.json()
        
        setStats({
          totalTickets: data.totalTickets || 0,
          resolvedTickets: data.totalResolved || 0,
          processingTickets: data.totalProcessing || 0
        })
        setTickets(data.tickets || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = selectedStatus === "ALL" || ticket.status === selectedStatus
    const priorityMatch = selectedPriority === "ALL" || ticket.priority === selectedPriority
    return statusMatch && priorityMatch
  })

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTickets = filteredTickets.slice(startIndex, endIndex)

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    setShowStatusDropdown(false)
    const newParams = new URLSearchParams(searchParams)
    if (status === "ALL") {
      newParams.delete("status")
    } else {
      newParams.set("status", status)
    }
    setSearchParams(newParams)
  }

  const handlePriorityChange = (priority) => {
    setSelectedPriority(priority)
    setShowPriorityDropdown(false)
    const newParams = new URLSearchParams(searchParams)
    if (priority === "ALL") {
      newParams.delete("priority")
    } else {
      newParams.set("priority", priority)
    }
    setSearchParams(newParams)
  }

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", newPage.toString())
    setSearchParams(newParams)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-screen font-regular">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-500 px-2">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="px-4 py-2 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-2">Total Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of your tickets</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
                <div className="w-3 h-3 bg-secondary-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-secondary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="px-4 py-2 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-2">Resolved Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of resolved tickets</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedTickets}</p>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="px-4 py-2 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-2">Processing Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of processing tickets</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{stats.processingTickets}</p>
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs hover:bg-primary-500 hover:text-white"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <Filter className="w-4 h-4" />
            Status: <span className="font-semibold ml-1">{selectedStatus.replace("_", " ")}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {showStatusDropdown && (
            <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-secondary-300 hover:text-white cursor-pointer ${
                    selectedStatus === status ? "bg-secondary-500 text-white font-semibold" : ""
                  }`}
                  onClick={() => handleStatusChange(status)}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs hover:bg-primary-500 hover:text-white"
            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
          >
            <Filter className="w-4 h-4" />
            Priority: <span className="font-semibold ml-1">{selectedPriority}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {showPriorityDropdown && (
            <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg">
              {priorityOptions.map((priority) => (
                <button
                  key={priority}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-secondary-300 hover:text-white cursor-pointer ${
                    selectedPriority === priority ? "bg-secondary-500 text-white font-semibold" : ""
                  }`}
                  onClick={() => handlePriorityChange(priority)}
                  >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTickets.map((ticket) => (
          <Card key={ticket._id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">Ticket #{ticket._id}</p>
                    <h3 className="font-bold text-2xl text-primary-500">{ticket.subject}</h3>
                    <p className="text-sm font-regular text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${priorityColors[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${statusColors[ticket.status]}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-900 font-regular">
                    Created At: {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold rounded-full border-primary-500 text-primary-500 hover:bg-primary-500 hover:border-none hover:text-white"
                    onClick={() => navigate(`/user/tickets/${ticket._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No tickets found matching the selected filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredTickets.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 font-semibold hover:bg-primary-500 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 p-0 ${
                  currentPage === page 
                    ? "bg-primary-500 text-white hover:bg-primary-600" 
                    : "hover:bg-primary-500 hover:text-white"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 hover:bg-primary-500 hover:text-white font-semibold"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default UserDashboard 