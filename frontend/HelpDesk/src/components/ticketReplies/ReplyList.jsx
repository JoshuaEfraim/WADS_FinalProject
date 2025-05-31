// src/components/ticketReplies/ReplyList.jsx
import React, { useEffect, useState } from "react"
import axios from "axios"
import ReplyMessage from "./ReplyMessage"

const ReplyList = ({ ticketId, refreshKey }) => {
  const [replies, setReplies] = useState([])

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tickets/${ticketId}`)
        setReplies(res.data.replies || [])
      } catch (err) {
        console.error("Failed to fetch replies:", err)
      }
    }

    fetchReplies()
  }, [ticketId, refreshKey])

  return (
    <div className="space-y-4 mt-4">
      {replies.length === 0 ? (
        <p className="text-sm text-gray-500">No replies yet.</p>
      ) : (
        replies.map((reply) => (
          <ReplyMessage key={reply._id} reply={reply} />
        ))
      )}
    </div>
  )
}

export default ReplyList
