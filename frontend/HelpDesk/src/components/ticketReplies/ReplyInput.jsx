import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export default function ReplyInput({ ticketId, onReplySent }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "https://e2425-wads-l4ccg1-server.csbihub.id"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSending(true);
      setError(null);

      // POST with replyMessage to match backend expectation
      const res = await axios.post(
        `${API_URL}/api/tickets/ticketReply/${ticketId}`,
        { replyMessage: message.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // If backend returns 200 or 201, clear the textarea and notify parent
      if (res.status === 200 || res.status === 201) {
        setMessage("");
        if (onReplySent) {
          onReplySent();
        }
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (err) {
      console.error("Reply error:", err);
      setError(err.response?.data?.message || "Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    // Pressing Enter (without Shift) also submits
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your reply… (Press Enter to send)"
          className="pr-24 min-h-[80px] resize-none"
          disabled={sending}
        />
        <Button
          type="submit"
          disabled={!message.trim() || sending}
          className="absolute bottom-2 right-2 px-3 py-1 h-8 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {sending ? (
            "Sending…"
          ) : (
            <>
              <Send className="w-4 h-4 mr-1" />
              Send
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
