// // src/components/ticketReplies/ReplyMessage.jsx
// import React from "react"
// import clsx from "clsx"

// const ReplyMessage = ({ reply }) => {
//   const isAdmin = reply.senderRole === "ADMIN"

//   return (
//     <div
//       className={clsx(
//         "rounded-xl px-4 py-3 w-fit max-w-[75%]",
//         isAdmin ? "ml-auto bg-blue-100 text-blue-900" : "mr-auto bg-gray-100 text-gray-900"
//       )}
//     >
//       <p className="text-sm whitespace-pre-wrap">{reply.replyMessage}</p>
//       <p className="text-xs text-muted-foreground mt-1">
//         {new Date(reply.createdAt).toLocaleString()}
//       </p>
//     </div>
//   )
// }

// export default ReplyMessage
import React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const ReplyMessage = ({ reply }) => {
  const isAdmin = reply.senderId.role === "ADMIN"

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[80%]`}>
        {!isAdmin && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {reply.senderId.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-lg px-4 py-2 ${
            isAdmin ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{reply.senderId.name}</span>
            <span>•</span>
            <span>{new Date(reply.createdAt).toLocaleString()}</span>
          </div>
        </div>
        {isAdmin && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {reply.senderId.name?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

export default ReplyMessage 