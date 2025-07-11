import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Ticket, Clock, Settings, CheckCircle, ArrowUpDown, ChevronDown, Search, AlertTriangle, Trash2 } from "lucide-react"
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
    AWAITING_APPROVAL: "status-awaiting-approval",
    PENDING: "status-pending",
    PROCESSING: "status-processing",
    REJECTED: "status-rejected",
  }
  return classes[status] || "bg-gray-100 text-gray-800 border-gray-200"
}

const AllTickets = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
  const [totalTickets, setTotalTickets] = useState(0)
  const [totalAwaitingApproval, setTotalAwaitingApproval] = useState(0)
  const [totalProcessing, setTotalProcessing] = useState(0)
  const [totalResolvedTickets, setTotalResolvedTickets] = useState(0)
  const [globalTotals, setGlobalTotals] = useState({
    totalTickets: 0,
    totalAwaitingApproval: 0,
    totalProcessing: 0,
    totalResolvedTickets: 0
  })
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || "")

  const API_URL = "https://e2425-wads-l4ccg1-server.csbihub.id"

  useEffect(() => {
    fetchTickets()
  }, [currentPage, selectedStatus, selectedPriority, searchQuery, sortOrder])

  // Fetch global totals (unfiltered)
  useEffect(() => {
    fetch(`${API_URL}/api/admin/tickets?page=1&limit=1` ,{
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setGlobalTotals({
          totalTickets: data.totalTickets || 0,
          totalAwaitingApproval: data.totalAwaitingApproval || 0,
          totalProcessing: data.totalProcessing || 0,
          totalResolvedTickets: data.totalResolvedTickets || 0
        })
      })
  }, [])

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
      const res = await fetch(`${API_URL}/api/admin/tickets?${params}` ,{
        credentials: "include"
      })
      const data = await res.json()
      if (data.success) {
        setTickets(data.tickets)
        setTotalPages(data.totalPages)
        if (data.statusOptions) setStatusOptions(["ALL", ...data.statusOptions])
        if (data.priorityOptions) setPriorityOptions(["ALL", ...data.priorityOptions])
        setTotalTickets(data.totalTickets || 0)
        setTotalAwaitingApproval(data.totalAwaitingApproval || 0)
        setTotalProcessing(data.totalProcessing || 0)
        setTotalResolvedTickets(data.totalResolvedTickets || 0)
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

  // Update delete handler
  const handleDeleteTicket = async (ticketId) => {
    setTicketToDelete(ticketId);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/tickets/${ticketToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        fetchTickets();
      } else {
        alert(data.message || 'Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Error deleting ticket');
    } finally {
      setIsDeleting(false);
      setTicketToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTicketToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200 rounded-4xl">
          <CardContent className="px-4 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-1">Total Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of tickets in the system</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{globalTotals.totalTickets}</p>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 rounded-4xl">
          <CardContent className="px-4  h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-1">Awaiting Approval Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">
                Total count of awaiting approval tickets in the system
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{globalTotals.totalAwaitingApproval}</p>
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 rounded-4xl">
          <CardContent className="px-4  h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-1">Total Processing Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of processing tickets in the system</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{globalTotals.totalProcessing}</p>
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200 rounded-4xl">
          <CardContent className="px-4  h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-1">Total Resolved Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of resolved tickets in the system</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{globalTotals.totalResolvedTickets}</p>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-xs hover:bg-primary-500 hover:text-white" 
              onClick={handleSortChange}
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === "asc" ? (
                <span className="flex items-center gap-1">
                  Sort: <span className="font-semibold">Oldest </span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Sort: <span className="font-semibold">Latest </span>
                </span>
              )}
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs min-w-[110px] hover:bg-primary-500 hover:text-white transition-colors"
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
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-secondary-300 hover:text-white cursor-pointer ${selectedStatus === status ? "bg-secondary-500 text-white font-semibold" : ""}`}
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
                className="flex items-center gap-1 text-xs min-w-[110px] hover:bg-primary-500 hover:text-white transition-colors"
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
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-secondary-300 hover:text-white cursor-pointer ${selectedPriority === priority ? "bg-secondary-500 text-white font-semibold" : ""}`}
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

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl ">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-primary-400 text-sm w-12 text-center">ID</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Requested By</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Short Description</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Priority Level</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Status</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Created Date</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Updated Date</TableHead>
                <TableHead className="font-semibold text-primary-400 text-sm text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket._id} className="border-gray-100 hover:bg-gray-50">
                  <TableCell className="font-semibold text-sm text-gray-900 text-center">{ticket._id}</TableCell>
                  <TableCell className= "text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                          {ticket.userId && ticket.userId.name ? ticket.userId.name.charAt(0) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold text-gray-900">
                        {ticket.userId && ticket.userId.name ? ticket.userId.name : "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 text-center font-regular">{ticket.subject}</TableCell>
                  <TableCell className= "text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityClass(ticket.priority)}`}
                    >
                      {ticket.priority === "HIGH" ? "High" : ticket.priority === "MEDIUM" ? "Medium" : "Low"}
                    </span>
                  </TableCell>
                  <TableCell className= "text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusClass(ticket.status)}`}
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
                  <TableCell className="text-sm text-gray-900 text-center font-semibold">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-gray-900 text-center font-semibold">{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs font-semibold rounded-full border-primary-500 text-primary-500 hover:bg-primary-500 hover:border-none hover:text-white" 
                        onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600" 
                        onClick={() => handleDeleteTicket(ticket._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                      {ticket.userId && ticket.userId.name ? ticket.userId.name.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold text-gray-900">
                    {ticket.userId && ticket.userId.name ? ticket.userId.name : "Unknown"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs rounded-full hover:bg-primary-500 hover:text-white" 
                    onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600" 
                    onClick={() => handleDeleteTicket(ticket._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">#{ticket._id}</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{ticket.subject}</p>
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
                  <span className="font-semibold">Created:</span> {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Updated:</span> {new Date(ticket.updatedAt).toLocaleDateString()}
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

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Ticket</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={isDeleting}
                className="text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Ticket'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllTickets 