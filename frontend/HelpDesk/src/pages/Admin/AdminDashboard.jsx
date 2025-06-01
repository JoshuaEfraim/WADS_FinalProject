import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Ticket, Users, CheckCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

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

const priorityProgressColors = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
}

const API_URL = import.meta.env.VITE_API_URL

function getPriorityPercent(prioritySummary, totalTickets, level) {
  const found = prioritySummary.find((p) => p._id === level)
  return totalTickets ? Math.round(((found ? found.count : 0) / totalTickets) * 100) : 0
}

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: 0, day: '', status: '' })

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_URL}/api/admin/dashboard`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>
  if (!data) return null

  const { totalTickets, totalResolvedTickets, totalUsers, prioritySummary, statusSummary, recentTickets, weeklyChart } = data

  // Chart configuration
  const chartStatuses = ["RESOLVED", "AWAITING_APPROVAL", "PENDING", "PROCESSING", "REJECTED"]
  const chartColors = {
    RESOLVED: "#4A9C2E",
    AWAITING_APPROVAL: "#8B5CF6",
    PENDING: "#F59E0B",
    PROCESSING: "#1E266D",
    REJECTED: "#EF4444",
  }
  const statusLabels = {
    RESOLVED: "Resolved",
    AWAITING_APPROVAL: "Awaiting Approval",
    PENDING: "Pending",
    PROCESSING: "Processing",
    REJECTED: "Rejected",
  }

  // Generate last 7 days' dates for x-axis labels
  const getLast7DaysLabels = () => {
    const labels = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
    }
    return labels
  }
  const intervals = getLast7DaysLabels()

  // Map chart data to last 7 days by date string
  const processChartData = (chartData) => {
    // Build a map: { 'YYYY-MM-DD': { status: count } }
    const dateMap = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      dateMap[key] = {}
    }
    chartData.forEach(item => {
      // Convert day of week to date in the last 7 days
      // $dayOfWeek: 1 (Sun) - 7 (Sat)
      // Find the date in the last 7 days that matches this day of week
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        if (d.getDay() === item._id.day % 7) { // JS: 0=Sun, Mongo: 1=Sun
          const key = d.toISOString().slice(0, 10)
          dateMap[key][item._id.status] = (dateMap[key][item._id.status] || 0) + item.count
          break
        }
      }
    })
    // Build chart data arrays for each status
    return chartStatuses.map(status =>
      Object.keys(dateMap).map(date => dateMap[date][status] || 0)
    )
  }

  const chartData = processChartData(weeklyChart)
  const maxValue = Math.max(...chartData.flat()) || 100

  // Pie chart data with 5 statuses
  const totalStatus = statusSummary.reduce((sum, s) => sum + s.count, 0)
  const pieData = statusSummary.map((s) => ({
    label: s._id,
    value: s.count,
    color: statusColors[s._id] || "bg-gray-100",
  }))

  // Prepare data for recharts
  const getRechartsData = () => {
    const today = new Date()
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateKey = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const entry = { date: label }
      chartStatuses.forEach((status, idx) => {
        entry[status] = chartData[idx][6 - i] || 0
      })
      data.push(entry)
    }
    return data
  }
  const rechartsData = getRechartsData()

  return (
    <div className=" space-y-3 min-h-screen font-regular">
      {/* Header */}
      <div>
        <h1 className="text-2xl  font-bold text-primary-500 px-2">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="px-4 py-2 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-2">Total Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of tickets in the system</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="px-4 py-2 h-full flex flex-col">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary-500 mb-1">Total Resolved Tickets</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total count of resolved tickets</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{totalResolvedTickets}</p>
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
              <p className="text-2xl font-bold text-primary-500 mb-1">Total Users</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Total number of users in the system</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

       <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="px-4 py-2 h-full flex flex-col">
            <div className="flex-1 items-start justify-between mb-4">
              <p className="text-2xl font-bold text-primary-500">Ticket Priority Level</p>
              <p className="text-sm font-regular text-gray-500 mb-4">Percentage of ticket priority level in the system</p>
            </div>
            <div className="space-y-5">
              {["HIGH", "MEDIUM", "LOW"].map((level) => {
                const percent = getPriorityPercent(prioritySummary, totalTickets, level)
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${priorityColors[level]} whitespace-nowrap`}>
                      {level}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${priorityProgressColors[level]}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700 ml-2">{percent}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Table */}
        <Card className="lg:col-span-2 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-primary-500">Recent Tickets</CardTitle>
                <p className="text-sm text-gray-600 mt-1">View the latest 5 tickets</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-primary-400 text-sm">ID</TableHead>
                    <TableHead className="font-semibold text-primary-400 text-sm">Requested By</TableHead>
                    <TableHead className="font-semibold text-primary-400 text-sm">Short Description</TableHead>
                    <TableHead className="font-semibold text-primary-400 text-sm">Priority Level</TableHead>
                    <TableHead className="font-semibold text-primary-400 text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket, index) => (
                    <TableRow key={ticket._id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-semibold text-sm text-gray-900">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                              {ticket.userId?.name ? ticket.userId.name[0] : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold  text-gray-900">{ticket.userId?.name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div>
                          <div className="font-regular text-sm text-gray-900">{ticket.subject}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{ticket.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${priorityColors[ticket.priority]}`}
                        >
                          {ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${statusColors[ticket.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                        >
                          {ticket.status
                            .replace("_", " ")
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Status Summary */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-primary-500">Ticket Status Summary</CardTitle>
            <p className="text-sm text-gray-500 mt-1/2">Chart representing status of tickets in the system</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-6">
              <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
                {(() => {
                  let acc = 0
                  return pieData.map((slice) => {
                    const percent = totalStatus ? slice.value / totalStatus : 0
                    const start = acc
                    const end = acc + percent * 2 * Math.PI
                    const x1 = 64 + 56 * Math.sin(start)
                    const y1 = 64 - 56 * Math.cos(start)
                    const x2 = 64 + 56 * Math.sin(end)
                    const y2 = 64 - 56 * Math.cos(end)
                    const largeArc = percent > 0.5 ? 1 : 0
                    acc = end

                    const colors = {
                      RESOLVED: "#4A9C2E",
                      AWAITING_APPROVAL: "#8B5CF6",
                      PENDING: "#F59E0B",
                      PROCESSING: "#1E266D",
                      REJECTED: "#EF4444",
                    }

                    return (
                      <path
                        key={slice.label}
                        d={`M64,64 L${x1},${y1} A56,56 0 ${largeArc} 1 ${x2},${y2} Z`}
                        fill={colors[slice.label] || "#6b7280"}
                      />
                    )
                  })
                })()}
              </svg>
            </div>

            <div className="w-full space-y-2">
              {["AWAITING_APPROVAL", "PENDING", "PROCESSING", "RESOLVED", "REJECTED"].map((status) => {
                const slice = pieData.find((s) => s.label === status)
                if (!slice) return null
                const colors = {
                  RESOLVED: "bg-green-500",
                  AWAITING_APPROVAL: "bg-purple-500",
                  PENDING: "bg-yellow-500",
                  PROCESSING: "bg-blue-600",
                  REJECTED: "bg-red-500",
                }
                const labels = {
                  RESOLVED: "Resolved",
                  AWAITING_APPROVAL: "Awaiting Approval",
                  PENDING: "Pending",
                  PROCESSING: "Processing",
                  REJECTED: "Rejected",
                }
                return (
                  <div key={slice.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[slice.label] || "bg-gray-400"}`}></div>
                      <span className="text-gray-900 font-semibold text-xs">{labels[slice.label]}</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-xs">{slice.value}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Chart */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary-500">Report</CardTitle>
              <p className="text-sm text-gray-900 mt-1">This is a weekly ticket report for the last 7 days. Hover over the lines to see the data for each day.</p>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-4 mt-3 sm:mt-0">
              {["RESOLVED", "AWAITING_APPROVAL", "PENDING", "PROCESSING", "REJECTED"].map((status) => {
                const colors = {
                  RESOLVED: "#4A9C2E",
                  AWAITING_APPROVAL: "#8B5CF6",
                  PENDING: "#F59E0B",
                  PROCESSING: "#1E266D",
                  REJECTED: "#EF4444",
                }
                const labels = {
                  RESOLVED: "Resolved",
                  AWAITING_APPROVAL: "Awaiting Approval",
                  PENDING: "Pending",
                  PROCESSING: "Processing",
                  REJECTED: "Rejected",
                }
                return (
                  <div key={status} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ background: colors[status], display: 'inline-block' }}></span>
                    <span className="text-xs text-gray-700 font-medium">{labels[status]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rechartsData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ 
                    background: 'rgba(30,38,109,0.95)', 
                    borderRadius: 8, 
                    color: 'white', 
                    border: 'none',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  labelStyle={{ 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                  itemStyle={{ 
                    color: 'white', 
                    fontWeight: 500,
                    fontSize: '13px',
                    padding: '4px 0'
                  }}
                  formatter={(value, name) => [value, statusLabels[name] || name]}
                  cursor={{ stroke: '#1E266D', strokeWidth: 2, strokeDasharray: '5 5' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                {chartStatuses.map((status) => (
                  <Line
                    key={status}
                    type="monotone"
                    dataKey={status}
                    stroke={chartColors[status]}
                    strokeWidth={3}
                    dot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard;


