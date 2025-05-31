// // src/pages/Admin/TicketReply.jsx

// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";

// export default function TicketReply() {
//   const { id } = useParams();
//   const [ticket, setTicket] = useState(null);
//   const [replies, setReplies] = useState([]);
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState(null);

//   const MOCK_USER_ID = "6834640aabde44e25db92257"; // use existing user ID from MongoDB
//   const MOCK_ROLE = "Admin"; // or "User" depending on context

//   useEffect(() => {
//     const fetchReplies = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/tickets/ticketReply/${id}`);
//         setTicket(response.data.ticket);
//         setReplies(response.data.replies);
//       } catch (err) {
//         setError("Failed to load replies");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchReplies();
//   }, [id]);

//   const handleSend = async () => {
//     if (!message.trim()) return;
//     setSending(true);
//     try {
//       await axios.post(`http://localhost:5000/api/tickets/reply/${id}`, {
//         replyMessage: message,
//         senderId: MOCK_USER_ID,
//         senderRole: MOCK_ROLE,
//       });
//       setMessage("");
//       const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
//       setReplies(res.data.replies);
//     } catch (err) {
//       setError("Failed to send reply");
//     } finally {
//       setSending(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="w-6 h-6 animate-spin" />
//         <span className="ml-2 text-gray-600">Loading ticket replies...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-red-500 font-semibold">{error}</p>
//       </div>
//     );
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
//           {replies.map((r) => (
//             <div
//               key={r._id}
//               className={`p-3 rounded-lg ${
//                 r.senderId._id === MOCK_USER_ID ? "bg-blue-100" : "bg-gray-100"
//               }`}
//             >
//               <p className="text-sm text-gray-700">{r.message}</p>
//               <p className="text-xs text-gray-500 mt-1">
//                 {new Date(r.createdAt).toLocaleString()} - {r.senderId.name}
//               </p>
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//      {ticket?.status !== "RESOLVED" ? (
//     <Card>
//         <CardHeader>
//             <CardTitle>Post a Reply</CardTitle>
//         </CardHeader>
//      <CardContent className="space-y-2">
//       <Textarea
//         placeholder="Type your reply here..."
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <Button onClick={handleSend} disabled={sending || !message.trim()}>
//         {sending ? (
//           <>
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             Sending...
//           </>
//         ) : (
//           "Send Reply"
//         )}
//       </Button>
//     </CardContent>
//   </Card>
// ) : (
//   <Card className="opacity-60 cursor-not-allowed">
//     <CardHeader>
//       <CardTitle>Post a Reply</CardTitle>
//     </CardHeader>
//     <CardContent className="text-gray-500">
//       This ticket has been resolved. You can no longer reply.
//     </CardContent>
//   </Card>
// )}

//     </div>
//   );
// }
// src/pages/Admin/TicketReply.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function TicketReply() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tickets/ticketReply/${id}`);
        setTicket(response.data.ticket);
        setReplies(response.data.replies || []);
      } catch (err) {
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
    try {
      const response = await axios.post(`http://localhost:5000/api/tickets/reply/${id}`, {
        replyMessage: message
      });
      
      // Refresh replies after sending
      const updatedReplies = await axios.get(`http://localhost:5000/api/tickets/ticketReply/${id}`);
      setReplies(updatedReplies.data.replies || []);
      setMessage("");
    } catch (err) {
      setError("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-gray-600">Loading ticket replies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ticket: {ticket?.subject}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{ticket?.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            <p>Status: {ticket?.status}</p>
            <p>Priority: {ticket?.priority}</p>
            <p>Created by: {ticket?.userId?.name || 'Unknown'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Replies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {replies.length === 0 ? (
            <p className="text-sm text-gray-500">No replies yet.</p>
          ) : (
            replies.map((reply) => (
              <div
                key={reply._id}
                className={`p-3 rounded-lg ${
                  reply.senderId.role === 'ADMIN' ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <p className="text-sm text-gray-700">{reply.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(reply.createdAt).toLocaleString()} - {reply.senderId.name} ({reply.senderId.role})
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {ticket?.status !== "RESOLVED" && (
        <Card>
          <CardHeader>
            <CardTitle>Post a Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Type your reply..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}