import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import ReplyList from "@/components/ticketReplies/ReplyList"
import ReplyInput from "@/components/ticketReplies/ReplyInput"
import { ArrowLeft } from "lucide-react"

const TicketReplyPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/tickets/ticketReply/${id}`)
      .then((res) => {
        setTicket(res.data.ticket || res.data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load ticket")
        setLoading(false)
      })
  }, [id])

  const handleRefresh = () => setRefreshKey((prev) => prev + 1)

  if (loading) return <p className="p-6">Loading ticket...</p>
  if (error) return <p className="p-6 text-red-500">{error}</p>

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
      <p className="text-slate-700">{ticket.description}</p>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold">Replies</h2>
      <ReplyList ticketId={id} refreshKey={refreshKey} />

      <ReplyInput ticketId={id} onReplySent={handleRefresh} />
    </div>
  )
}

export default TicketReplyPage
