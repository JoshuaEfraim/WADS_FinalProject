// // src/components/ticketReplies/ReplyInput.jsx
// import { useState } from "react"
// import axios from "axios"
// import { Button } from "@/components/ui/button"

// const ReplyInput = ({ ticketId, onReplySent }) => {
//   const [message, setMessage] = useState("")
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async () => {
//     if (!message.trim()) return
//     setLoading(true)

//     try {
//       await axios.post(`http://localhost:5000/api/tickets/reply/${ticketId}`, {
//         replyMessage: message,
//         senderRole: "ADMIN", // mock role for now
//         senderId: "664a5fa4c3105ae4b0971f87" // mock ID for now
//       })
//       setMessage("")
//       onReplySent()
//     } catch (err) {
//       console.error("Failed to send reply:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-2">
//       <textarea
//         className="w-full border rounded p-2 text-sm"
//         rows={4}
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Write your reply..."
//       />
//       <Button onClick={handleSubmit} disabled={loading}>
//         {loading ? "Sending..." : "Send Reply"}
//       </Button>
//     </div>
//   )
// }

// export default ReplyInput
import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const ReplyInput = ({ ticketId, onReplySent }) => {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)

    try {
      await axios.post(`http://localhost:5000/api/tickets/reply/${ticketId}`, {
        replyMessage: message
      })
      setMessage("")
      onReplySent()
    } catch (err) {
      console.error("Failed to send reply:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Type your reply..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px] resize-none"
      />
      <Button 
        onClick={handleSubmit} 
        disabled={loading || !message.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Reply"
        )}
      </Button>
    </div>
  )
}

export default ReplyInput 