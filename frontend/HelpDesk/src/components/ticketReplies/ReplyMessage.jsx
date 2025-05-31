export default function ReplyMessage({ reply, isAdmin }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isAdmin ? 'order-1' : 'order-2'}`}>
        <div className={`flex items-start gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
            ${isAdmin ? 'bg-blue-500' : 'bg-gray-500'}`}>
            {isAdmin ? 'A' : 'U'}
          </div>
          <div>
            <div className={`rounded-lg p-3 ${
              isAdmin 
                ? 'bg-blue-100 text-blue-900' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${
              isAdmin ? 'text-right' : 'text-left'
            }`}>
              {formatDate(reply.createdAt)}
              <span className="ml-2">
                {isAdmin ? '- Admin' : `- ${reply.userName || 'User'}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 