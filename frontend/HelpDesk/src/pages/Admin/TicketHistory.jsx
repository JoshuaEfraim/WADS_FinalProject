import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";

function getPriorityClass(priority) {
  const classes = {
    HIGH: "priority-high",
    MEDIUM: "priority-medium",
    LOW: "priority-low",
  };
  return classes[priority] || "priority-low";
}

function getStatusClass(status) {
  // We only show "Resolved" in Ticket History
  return "status-resolved";
}

export default function TicketHistory() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Pagination state ─────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // ─── Search & sort state ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = "https://e2425-wads-l4ccg1-server.csbihub.id"

  const handleViewTicket = (ticketId) => {
    // Check if we're in the admin section based on the current URL path
    const isAdminRoute = location.pathname.startsWith('/admin');
    const path = isAdminRoute ? `/admin/tickets/${ticketId}` : `/user/tickets/${ticketId}`;
    navigate(path);
  };

  // ─── Whenever `page` changes, reload history ─────────────────────────
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ─── Fetch "Ticket History" from backend with ?page & ?limit ─────────
  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/tickets/history?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      // Backend now returns { tickets, currentPage, totalPages, totalTickets, hasNextPage, hasPrevPage }
      if (Array.isArray(data.tickets)) {
        setTickets(data.tickets);
        setTotalPages(data.totalPages);
        setTotalTickets(data.totalTickets);
      } else {
        // In case something unexpected comes back
        setTickets([]);
        setTotalPages(1);
        setTotalTickets(0);
      }
    } catch (e) {
      console.error("Error loading ticket history:", e);
      setTickets([]);
      setTotalPages(1);
      setTotalTickets(0);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }

  // Apply search + sort on the current page's tickets
  const filteredTickets = tickets
    .filter((t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey]?.toString().toLowerCase() || "";
      const bVal = b[sortKey]?.toString().toLowerCase() || "";
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading ticket history…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Search & Sort Row ────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md">
          <Input
            type="text"
            placeholder="Search by subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative inline-block text-left">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort by
            <ChevronDown className="w-4 h-4" />
          </Button>
          {showSortDropdown && (
            <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md">
              {[
                { key: "createdAt", label: "Created Date" },
                { key: "updatedAt", label: "Resolved Date" },
                { key: "priority", label: "Priority" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    handleSort(key);
                    setShowSortDropdown(false);
                  }}
                  className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                    sortKey === key ? "font-semibold text-primary-600" : ""
                  }`}
                >
                  {label}{" "}
                  {sortKey === key ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Desktop Table ──────────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs text-gray-700 w-12 text-center">
                ID
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Requested By
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Subject
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Priority
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Status
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Created
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Resolved
              </TableHead>
              <TableHead className="text-xs text-gray-700 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  No matching ticket history found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((t) => (
                <TableRow
                  key={t._id}
                  className="hover:bg-gray-50 border-gray-100"
                >
                  <TableCell className="text-center text-sm font-medium">
                    {t._id}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                          {t.userId?.name?.[0] ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {t.userId?.name ?? "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-900">
                    {t.subject}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityClass(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusClass(
                        t.status
                      )}`}
                    >
                      Resolved
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-900">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-900">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTicket(t._id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Mobile Cards ───────────────────────────────────────────────────── */}
      <div className="md:hidden space-y-4">
        {filteredTickets.map((t) => (
          <div
            key={t._id}
            className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold truncate max-w-[100px]">
                  #{t._id}
                </span>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                    {t.userId?.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[100px]">
                  {t.userId?.name ?? "Unknown"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewTicket(t._id)}
              >
                View
              </Button>
            </div>
            <p className="text-sm font-medium truncate">{t.subject}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded font-medium border ${getPriorityClass(
                  t.priority
                )}`}
              >
                {t.priority}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded font-medium border ${getStatusClass(
                  t.status
                )}`}
              >
                Resolved
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <strong>Created:</strong>{" "}
                {new Date(t.createdAt).toLocaleDateString()}
              </div>
              <div>
                <strong>Resolved:</strong>{" "}
                {new Date(t.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Pagination Controls ─────────────────────────────────────────────── */}
      {totalTickets > 0 && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft />
          </Button>

          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(i + 1)}
              className="mx-1 w-8"
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
