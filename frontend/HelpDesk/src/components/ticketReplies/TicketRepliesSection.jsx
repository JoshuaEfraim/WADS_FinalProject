import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReplyList from './ReplyList';
import ReplyInput from './ReplyInput';
import axios from 'axios';

export default function TicketRepliesSection({ ticketId, ticketStatus }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "https://e2425-wads-l4ccg1-server.csbihub.id"

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/tickets/ticketReply/${ticketId}`);
        setReplies(response.data.ticket.replies || []);
        setError(null);
      } catch (err) {
        setError('Failed to load replies');
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
  }, [ticketId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-slate-600">Loading replies...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <Card className="shadow-sm border-slate-200 mt-6">
      <CardContent className="space-y-6 pt-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-medium text-slate-900">Replies</span>
          </div>
          <Separator className="my-4" />
          <div className="space-y-4">
            <ReplyList ticketId={ticketId} refreshKey={refreshKey} />
            {ticketStatus !== "RESOLVED" && (
              <div className="mt-6">
                <ReplyInput ticketId={ticketId} onReplySent={handleRefresh} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 