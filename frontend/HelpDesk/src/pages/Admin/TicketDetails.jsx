import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react"
import TicketReplyPage from "./TicketReplyPage";

const API_URL = import.meta.env.VITE_API_URL

const statusOptions = ["AWAITING_APPROVAL", "PENDING", "REJECTED", "PROCESSING", "RESOLVED"]
const priorityOptions = ["LOW", "MEDIUM", "HIGH"]

const priorityColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
}

const statusColors = {
  AWAITING_APPROVAL: " bg-purple-100 text-purple-700 border-purple-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  PROCESSING: " bg-blue-100 text-blue-700 border-blue-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
}

export default function TicketDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({ status: "", priority: "" })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/api/tickets/ticketDetails/${id}`, {
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ticket details")
        return res.json()
      })
      .then((data) => {
        if (!data) {
          throw new Error('No data received from server')
        }
        setTicket(data)
        setForm({ status: data.status, priority: data.priority })
        setLoading(false)
      })
      .catch((e) => {
        console.error('Error fetching ticket:', e)
        setError(e.message || "Failed to fetch ticket details")
        setLoading(false)
      })
  }, [id])

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setEdit(true)
  }

  const handleUpdate = async () => {
    setSaving(true)
    setSuccess(false)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Update failed")
      }
      const updated = await res.json()
      setTicket(updated)
      setEdit(false)
      setSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      console.error('Error updating ticket:', e)
      setError(e.message || "Failed to update ticket")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEdit(false)
    setForm({ status: ticket.status, priority: ticket.priority })
    setError(null)
  }

  const formatStatus = (status) => {
    if (!status) return ''
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatPriority = (priority) => {
    if (!priority) return ''
    return priority.charAt(0) + priority.slice(1).toLowerCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-sm border-slate-200">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading ticket details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-sm border-slate-200">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Ticket</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ticket) return null

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Ticket Details</h1>
              <p className="text-slate-600">Manage and update ticket information</p>
            </div>

            {!edit ? (
              <Button onClick={() => setEdit(true)} className="bg-white text-primary-500  hover:bg-primary-500 hover:text-white">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Ticket
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleUpdate} disabled={saving} className="bg-white text-primary-500 hover:bg-secondary-500 hover:text-white">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving} className="bg-white text-primary-500 hover:bg-secondary-500 hover:text-white">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Ticket updated successfully!</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Primary Information */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 mb-2">{ticket.subject}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        <span className="font-semibold">{ticket._id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 font-semibold">
                    <Badge className={priorityColors[ticket.priority]}>{formatPriority(ticket.priority)}</Badge>
                    <Badge className={statusColors[ticket.status]}>{formatStatus(ticket.status)}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="font-bold text-slate-900">Description</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-slate-700 leading-relaxed min-h-[60px]">
                    {ticket.description}
                  </div>
                </div>

                <Separator />

                {/* Editable Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                    {edit ? (
                      <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    opt === "LOW" ? "bg-green-500" : opt === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
                                  }`}
                                />
                                {formatPriority(opt)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-md">
                        {ticket.priority && (
                          <Badge className={priorityColors[ticket.priority] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                            {formatPriority(ticket.priority)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    {edit ? (
                      <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    opt === "AWAITING_APPROVAL"
                                      ? "bg-blue-500"
                                      : opt === "PENDING"
                                        ? "bg-yellow-500"
                                        : opt === "REJECTED"
                                          ? "bg-red-500"
                                          : opt === "PROCESSING"
                                            ? "bg-purple-500"
                                            : "bg-green-500"
                                  }`}
                                />
                                {formatStatus(opt)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-md">
                        {ticket.status && (
                          <Badge className={statusColors[ticket.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                            {formatStatus(ticket.status)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {ticket.approvalInfo && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Approved By</label>
                        <div className="p-3 bg-slate-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-900">{ticket.approvalInfo.approvedBy}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Approval Date</label>
                        <div className="p-3 bg-slate-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-900">
                              {new Date(ticket.approvalInfo.approvedAt).toLocaleDateString()} at{" "}
                              {new Date(ticket.approvalInfo.approvedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Requester Information */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 font-bold">
                  <User className="w-5 h-5 text-primary-500" />
                  Requester
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-bold text-slate-900">{ticket.userId?.name || "Unknown"}</div>
                  {ticket.userId?.email && (
                    <div className="flex items-center gap-1 text-sm text-primary-400">
                      <Mail className="w-3 h-4" />
                      {ticket.userId.email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 font-bold">
                  <Clock className="w-5 h-5 text-primary-500" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Created</div>
                    <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                    <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ticket.updatedAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <TicketReplyPage />
    </div>
  )
}