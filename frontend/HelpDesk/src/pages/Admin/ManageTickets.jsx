import { useState } from "react"
import AllTickets from "@/components/AllTickets"

import TicketHistory from "./TicketHistory"
const ManageTickets = () => {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="space-y-6 min-h-screen font-regular">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-500 px-2">Tickets</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "all" 
              ? "text-primary-500 border-b-2 border-primary-500" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Tickets
        </button>
        <button 
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "history" 
              ? "text-primary-500 border-b-2 border-primary-500" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Ticket History
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "all" ? (
        <AllTickets />
      ) : (
        // Ticket History View
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
          <div className="text-center text-gray-500">
            <TicketHistory/>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageTickets;