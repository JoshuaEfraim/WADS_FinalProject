<<<<<<< HEAD
import { useState } from "react"
import AllTickets from "@/components/AllTickets"
=======
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Ticket, Clock, Settings, CheckCircle, ArrowUpDown, ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSearchParams, useNavigate } from "react-router-dom"
import TicketHistory from "./TicketHistory"

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
>>>>>>> TicketReply

const ManageTickets = () => {
  const [activeTab, setActiveTab] = useState("all")
<<<<<<< HEAD
=======
  
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

  useEffect(() => {
    fetchTickets()
  }, [currentPage, selectedStatus, selectedPriority, searchQuery, sortOrder])

  // Fetch global totals (unfiltered)
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/tickets?page=1&limit=1")
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
      const res = await fetch(`http://localhost:5000/api/admin/tickets?${params}`)
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
>>>>>>> TicketReply

  return (
    <div className="space-y-6 min-h-screen font-regular">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-500 px-2">Tickets</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "all" 
              ? "text-primary-500 border-b-2 border-primary-500" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Tickets
        </button>
        <button 
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "history" 
              ? "text-primary-500 border-b-2 border-primary-500" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Ticket History
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "all" ? (
        <AllTickets />
      ) : (
        // Ticket History View
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
          <div className="text-center text-gray-500">
            <TicketHistory/>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageTickets;