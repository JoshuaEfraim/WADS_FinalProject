// import { useEffect, useState } from "react"
// import { useParams } from "react-router-dom"
// import axios from "axios"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
// import { Button } from "@/components/ui/button"
// import { Loader2 } from "lucide-react"

// export default function TicketReply() {
//   const { id } = useParams()
//   const [ticket, setTicket] = useState(null)
//   const [replies, setReplies] = useState([])
//   const [message, setMessage] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [sending, setSending] = useState(false)
//   const [error, setError] = useState(null)

//   // 1) On mount: fetch ticket + replies
//   useEffect(() => {
//     const fetchReplies = async () => {
//       setLoading(true)
//       try {
//         const response = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
//           withCredentials: true,
//         })
//         setTicket(response.data.ticket)
//         setReplies(response.data.replies)
//       } catch (err) {
//         console.error("❌ Failed to load replies:", err)
//         setError("Failed to load replies")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchReplies()
//   }, [id])

//   // 2) “Send” button handler
//   const handleSend = async () => {
//     if (!message.trim()) return
//     setSending(true)
//     setError(null)

//     try {
//       // Send exactly { message: "..."} to match backend logic
//       await axios.post(
//         `http://localhost:5000/api/tickets/reply/${id}`,
//         { message: message.trim() },
//         { withCredentials: true }
//       )

//       // Clear textarea
//       setMessage("")

//       // Re‐fetch ticket + replies so the new reply appears
//       const res = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
//         withCredentials: true,
//       })
//       setReplies(res.data.replies)
//     } catch (err) {
//       console.error("❌ Failed to send reply:", err)
//       setError("Failed to send reply. Please try again.")
//     } finally {
//       setSending(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-6 h-6 animate-spin" />
//         <span className="ml-2 text-gray-600">Loading ticket replies...</span>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Ticket: {ticket?.subject}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p>{ticket?.description}</p>
//         </CardContent>
//       </Card>

//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Replies</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {replies.length === 0 ? (
//             <p className="text-center text-gray-500">No replies yet.</p>
//           ) : (
//             replies.map((r) => (
//               <div key={r._id} className={`p-3 rounded-lg bg-gray-100`}>
//                 <p className="text-sm text-gray-700">{r.message}</p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {new Date(r.createdAt).toLocaleString()} – {r.senderId?.name || "Unknown User"}
//                 </p>
//               </div>
//             ))
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Post a Reply</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-2">
//           <Textarea
//             placeholder="Type your reply here..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
//           <Button
//             onClick={handleSend}
//             disabled={sending || !message.trim()}
//             className="inline-flex items-center gap-2"
//           >
//             {sending ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Sending...
//               </>
//             ) : (
//               "Send Reply"
//             )}
//           </Button>
//           {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
// src/pages/Admin/TicketReply.jsx
// src/pages/Admin/TicketReply.jsx
// src/pages/Admin/TicketReply.jsx

// src/pages/Admin/TicketReply.jsx
// src/pages/Admin/TicketReply.jsx

// src/pages/Admin/TicketReply.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function TicketReply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      try {
        // Fetch ticket & its replies
        const response = await axios.get(
          `http://localhost:5000/api/tickets/ticketReply/${id}`,
          { withCredentials: true }
        );
        setTicket(response.data.ticket);
        setReplies(response.data.replies);
      } catch (err) {
        console.error("❌ Failed to load replies:", err);
        setError("Failed to load replies");
      } finally {
        setLoading(false);
      }
    };
    fetchReplies();
  }, [id]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);

    try {
      // POST { message } to /reply/:id
      await axios.post(
        `http://localhost:5000/api/tickets/reply/${id}`,
        { message: message.trim() },
        { withCredentials: true }
      );

      // Clear input
      setMessage("");

      // Re-fetch updated replies
      const res = await axios.get(
        `http://localhost:5000/api/tickets/ticketReply/${id}`,
        { withCredentials: true }
      );
      setReplies(res.data.replies);
    } catch (err) {
      console.error("❌ Failed to send reply:", err);
      setError("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-gray-600">Loading ticket replies…</span>
      </div>
    );
  }

  // If ticket loaded but status is RESOLVED, disable the reply form
  const isResolved = ticket?.status === "RESOLVED";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Ticket Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ticket: {ticket?.subject}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{ticket?.description}</p>
          <div className="mt-4 flex gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              {ticket?.priority}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isResolved
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-purple-100 text-purple-800 border-purple-200"
              }`}
            >
              {ticket?.status}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Replies List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Replies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {replies.length === 0 ? (
            <p className="text-center text-gray-500">No replies yet.</p>
          ) : (
            replies.map((r) => (
              <div key={r._id} className="p-3 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-700">{r.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleString()} –{" "}
                  {r.senderId?.name || "Unknown"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* If ticket is already resolved, do not show the reply textarea */}
      {isResolved ? (
        <Card>
          <CardHeader>
            <CardTitle>This ticket has been resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
                No more replies
            </p>
            <Button
              onClick={() => navigate("/admin/tickets")}
              className="mt-4"
            >
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Post a New Reply */
        <Card>
          <CardHeader>
            <CardTitle>Post a Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Type your reply here."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="inline-flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Reply"
              )}
            </Button>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
