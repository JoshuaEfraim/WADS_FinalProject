// src/components/ticketReplies/TicketReplyPage.jsx

import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import ReplyList from "@/components/ticketReplies/ReplyList"
import ReplyInput from "@/components/ticketReplies/ReplyInput"

export default function TicketReplyPage() {
  const { id } = useParams()                      // id = ticket ID from URL
  const [ticket, setTicket] = useState(null)       // will hold { subject, description, … }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)  // bump to force ReplyList to re‐fetch

  const API_URL = "https://e2425-wads-l4ccg1-server.csbihub.id"

  useEffect(() => {
    // Fetch the ticket's main data (subject + description)
    setLoading(true)
    axios
      .get(`${API_URL}/api/tickets/ticketReply/${id}`,{
        withCredentials:true
      })
      .then((res) => {
        // backend returns: { ticket: { … }, replies: [ … ] }
        // we only need ticket details here
        const payload = res.data.ticket || res.data
        setTicket(payload)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load ticket")
        setLoading(false)
      })
  }, [id])

  // Called by <ReplyInput> after a new reply is created
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <p className="text-gray-500">Loading ticket…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    )
  }

  const isResolved = ticket?.status === "RESOLVED";

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-4">
      {/* ────────── Replies Section ────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Replies</h2>
        <Card className="border bg-white shadow-sm">
          <CardContent className="p-4 space-y-4">
            <ReplyList ticketId={id} refreshKey={refreshKey} />
          </CardContent>
        </Card>
      </div>

      {/* ────────── Reply Input Section ────────── */}
      {isResolved ? (
        <Card className="border bg-gray-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="w-5 h-5" />
              <p>This ticket is resolved. No further replies can be added.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Post a Reply</h2>
          <Card className="border bg-white shadow-sm">
            <CardContent className="p-4">
              <ReplyInput ticketId={id} onReplySent={handleRefresh} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

