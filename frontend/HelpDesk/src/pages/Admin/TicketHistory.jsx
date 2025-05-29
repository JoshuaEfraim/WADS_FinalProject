import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchParams, useNavigate } from "react-router-dom"

function getPriorityClass(priority) {
  const classes = {
    HIGH: "priority-high",
    MEDIUM: "priority-medium",
    LOW: "priority-low",
  }
  return classes[priority] || "priority-low"
}

function getStatusClass(status) {
  const classes = {
    RESOLVED: "status-resolved",
    IN_PROGRESS: "status-pending",
    NEW_TICKET: "status-awaiting-approval",
    PENDING: "status-pending",
    PROCESSING: "status-processing",
    REJECTED: "status-rejected",
  }
  return classes[status] || "bg-gray-100 text-gray-800 border-gray-200"
}

const TicketHistory = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Initialize state from URL params
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || "ALL")
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || "ALL")
  const [statusOptions, setStatusOptions] = useState(["ALL"])
  const [priorityOptions, setPriorityOptions] = useState(["ALL"])
  const [tickets, setTickets] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "")
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || "asc")
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || "")

  useEffect(() => {
    fetchTickets()
  }, [currentPage, selectedStatus, selectedPriority, searchQuery, sortOrder])

  const fetchTickets = async () => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10,
      search: searchQuery,
      sort: sortOrder,
      status: selectedStatus !== "ALL" ? selectedStatus : "",
      priority: selectedPriority !== "ALL" ? selectedPriority : ""
    })

    try {
      const res = await fetch(`http://localhost:3000/api/admin/tickets/history/admin?${params}`)
      const data = await res.json()
      if (data.success) {
        setTickets(data.tickets)
        setTotalPages(data.totalPages)
        if (data.statusOptions) setStatusOptions(["ALL", ...data.statusOptions])
        if (data.priorityOptions) setPriorityOptions(["ALL", ...data.priorityOptions])
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    }
  }

  // Update URL when filters change
  const updateURL = (updates) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update or remove params based on values
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Update URL without full page reload
    navigate(`?${params.toString()}`, { replace: true })
  }

  // Update handlers to modify URL
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      updateURL({ page })
    }
  }

  const handleStatusSelect = (status) => {
    setSelectedStatus(status)
    setShowStatusDropdown(false)
    updateURL({ status: status !== "ALL" ? status : null })
  }

  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority)
    setShowPriorityDropdown(false)
    updateURL({ priority: priority !== "ALL" ? priority : null })
  }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    updateURL({ search: searchInput || null })
  }

  const handleSortChange = () => {
    const newSort = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newSort)
    updateURL({ sort: newSort })
  }

  // Update search input handler
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6 min-h-screen font-regular">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/admin/tickets")}
        >
          All Tickets
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium text-primary-500 border-b-2 border-primary-500"
        >
          Ticket History
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-500 px-2">Ticket History</h1>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        {/* Filter/Sort/Search Bar Row - top of table */}
        <div className="flex flex-wrap justify-between items-center px-4 pt-4 pb-2 gap-2">
          {/* Search Bar (left) */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-48"
              />
              <Button onClick={handleSearch} className="absolute left-2 top-2 p-0 h-5 w-5 bg-transparent hover:bg-transparent">
                <Search className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
          {/* Filter/Sort Bar (right) */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs" onClick={handleSortChange}>
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs min-w-[110px]"
                onClick={() => setShowStatusDropdown((v) => !v)}
              >
                Status: <span className="font-semibold ml-1">{selectedStatus.replace("_", " ")}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              {showStatusDropdown && (
                <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-primary-50 ${selectedStatus === status ? "bg-primary-100 font-semibold" : ""}`}
                      onClick={() => handleStatusSelect(status)}
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
                className="flex items-center gap-1 text-xs min-w-[110px]"
                onClick={() => setShowPriorityDropdown((v) => !v)}
              >
                Priority: <span className="font-semibold ml-1">{selectedPriority}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              {showPriorityDropdown && (
                <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-primary-50 ${selectedPriority === priority ? "bg-primary-100 font-semibold" : ""}`}
                      onClick={() => handlePrioritySelect(priority)}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Ticket ID</TableHead>
                <TableHead className="text-center">User</TableHead>
                <TableHead className="text-center">Subject</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Created At</TableHead>
                <TableHead className="text-center">Updated At</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket._id} className="border-gray-100 hover:bg-gray-50">
                  <TableCell className="font-medium text-sm text-gray-900 text-center">{ticket._id}</TableCell>
                  <TableCell className= "text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                          {ticket.userId && ticket.userId.name ? ticket.userId.name.charAt(0) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.userId && ticket.userId.name ? ticket.userId.name : "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-center">{ticket.subject}</TableCell>
                  <TableCell className= "text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityClass(ticket.priority)}`}
                    >
                      {ticket.priority === "HIGH" ? "High" : ticket.priority === "MEDIUM" ? "Medium" : "Low"}
                    </span>
                  </TableCell>
                  <TableCell className= "text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusClass(ticket.status)}`}
                    >
                      {ticket.status === "PENDING"
                        ? "Pending"
                        : ticket.status === "REJECTED" ? "Rejected"
                        : ticket.status === "PROCESSING" ? "Processing"
                        : ticket.status === "RESOLVED"
                          ? "Resolved" 
                          : "Awaiting Approval"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-center">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-gray-900 text-center">{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => navigate(`/admin/tickets/${ticket._id}`)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">#{ticket._id}</span>
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                      {ticket.userId && ticket.userId.name ? ticket.userId.name.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.userId && ticket.userId.name ? ticket.userId.name : "Unknown"}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => navigate(`/admin/tickets/${ticket._id}`)}>
                  View
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">{ticket.subject}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityClass(ticket.priority)}`}
                >
                  {ticket.priority === "HIGH" ? "High" : ticket.priority === "MEDIUM" ? "Medium" : "Low"}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusClass(ticket.status)}`}
                >
                  {ticket.status === "IN_PROGRESS"
                    ? "In-Progress"
                    : ticket.status === "RESOLVED"
                      ? "Resolved"
                      : "New Ticket"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created:</span> {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {new Date(ticket.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center py-4 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${currentPage === page ? "bg-primary-500 text-white" : "text-gray-600"}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 p-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketHistory 