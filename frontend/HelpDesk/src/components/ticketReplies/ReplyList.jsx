// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import ReplyMessage from './ReplyMessage';

// export default function ReplyList({ ticketId, refreshKey }) {
//   const [replies, setReplies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchReplies = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://localhost:5000/api/tickets/ticketReply/${ticketId}`);
//         const sortedReplies = (response.data.ticket.replies || []).sort(
//           (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//         );
//         setReplies(sortedReplies);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load replies');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReplies();
//   }, [ticketId, refreshKey]);

//   if (loading) {
//     return <div className="text-center text-gray-500 py-4">Loading replies...</div>;
//   }

//   if (error) {
//     return <div className="text-center text-red-500 py-4">{error}</div>;
//   }

//   if (replies.length === 0) {
//     return <div className="text-center text-gray-500 py-4">No replies yet.</div>;
//   }

//   return (
//     <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
//       {replies.map((reply) => (
//         <ReplyMessage
//           key={reply._id}
//           reply={reply}
//           isAdmin={reply.isAdmin}
//         />
//       ))}
//     </div>
//   );
// }
// src/components/ticketReplies/ReplyList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

// Props: ticketId (string), refreshKey (number)
export default function ReplyList({ ticketId, refreshKey }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReplies() {
      setLoading(true);
      setError(null);
      try {
        // **Must** call /api/tickets/ticketReply/:ticketId
        // This endpoint returns { ticket: {...}, replies: [ ... ] }
        const res = await axios.get(
          `http://localhost:5000/api/tickets/ticketReply/${ticketId}`
        );
        setReplies(res.data.replies || []);
      } catch (err) {
        console.error("Failed to load replies:", err);
        setError("Could not load replies.");
      } finally {
        setLoading(false);
      }
    }
    fetchReplies();
    // Re-run whenever ticketId or refreshKey changes:
  }, [ticketId, refreshKey]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading replies…</div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">{error}</div>
    );
  }
  if (replies.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No replies yet.</div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((r) => (
        <div
          key={r._id}
          className="p-4 bg-gray-100 rounded-lg"
        >
          <p className="text-gray-800">{r.message}</p>
          <p className="mt-1 text-xs text-gray-600">
            {new Date(r.createdAt).toLocaleString()} &nbsp;—&nbsp;{" "}
            {r.senderId?.name || "Unknown User"}
          </p>
        </div>
      ))}
    </div>
  );
}
