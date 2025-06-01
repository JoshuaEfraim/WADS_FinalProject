// src/pages/Admin/ManageUsers.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search } from "lucide-react";

// Helper to format a Date string as DD/MM/YYYY
function formatDateToDDMMYYYY(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const ManageUsers = () => {
  // ─── State Hooks ───────────────────────────────────────────────────────────────
  const [users, setUsers]           = useState([]);  // actual user array
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Track which rows are currently animating out (being deleted)
  const [deletingIds, setDeletingIds] = useState(new Set());

  // ─── Base URL from .env ─────────────────────────────────────────────────────────
  // Make sure your `.env` (in the FRONTEND root) has:
  //    VITE_API_BASE_URL=http://localhost:5000
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  const API_URL  = `${BASE_URL}/api/admin/users`;

  // ─── Fetch users whenever page, limit, or searchTerm changes ────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit,
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
        };

        const res = await axios.get(API_URL, { params });
        const data = res.data;
        const fetchedArr = Array.isArray(data.users) ? data.users : [];
        setUsers(fetchedArr);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_URL, page, limit, searchTerm]);

  // ─── Delete Handler with Animation ─────────────────────────────────────────────
  const handleDelete = (userId) => {
    // 1) Mark this ID as “deleting” so we can apply CSS transition
    setDeletingIds((prev) => new Set(prev).add(userId));

    // 2) After animation (~300ms), call backend DELETE and remove from state
    setTimeout(async () => {
      try {
        await axios.delete(`${BASE_URL}/api/admin/users/${userId}`);
        // Remove from the users array
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        // Regardless of outcome, remove ID from deletingIds set
        setDeletingIds((prev) => {
          const copy = new Set(prev);
          copy.delete(userId);
          return copy;
        });
      }
    }, 300);
  };

  // ─── Filter client‐side (in addition to server‐side search) ────────────────────
  const filteredUsers = users.filter((u) => {
    const lower = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(lower) ||
      u.email.toLowerCase().includes(lower) ||
      (u.phoneNumber || "").includes(lower) ||
      (u.department || "").toLowerCase().includes(lower)
    );
  });

  // ─── Simple Pagination Controls ─────────────────────────────────────────────────
  const goToPrevPage = () => setPage((p) => (p > 1 ? p - 1 : p));
  const goToNextPage = () => setPage((p) => (p < totalPages ? p + 1 : p));

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <Card className="shadow-lg">
        {/* ─── Header: Title + Search Bar ───────────────────────────────────────────── */}
        <CardHeader className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl">Users</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search username, email, phone, or department"
              className="max-w-sm"
            />
            <Button variant="outline" className="p-2">
              <Search size={18} />
            </Button>
          </div>
        </CardHeader>

        {/* ─── Content: Loading, Error, or Table ───────────────────────────────────── */}
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users…</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PHONE NUMBER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DEPARTMENT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CREATED DATE
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, idx) => {
                    const isDeleting = deletingIds.has(user._id);
                    return (
                      <tr
                        key={user._id}
                        className={`transition-all duration-300 ease-in-out ${
                          isDeleting ? "opacity-0 h-0 overflow-hidden" : ""
                        }`}
                      >
                        {/* ID (row index) */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {(page - 1) * limit + idx + 1}
                        </td>
                        {/* NAME */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {user.name}
                        </td>
                        {/* EMAIL */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {user.email}
                        </td>
                        {/* PHONE NUMBER */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {user.phoneNumber || "-"}
                        </td>
                        {/* DEPARTMENT */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {user.department || "-"}
                        </td>
                        {/* CREATED DATE */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatDateToDDMMYYYY(user.createdAt)}
                        </td>
                        {/* DELETE BUTTON */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user._id)}
                            disabled={isDeleting}
                          >
                            <Trash2
                              size={16}
                              className={`transition-colors duration-200 ${
                                isDeleting ? "text-gray-300" : "text-red-500 hover:text-red-700"
                              }`}
                            />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ─── Pagination Controls ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={goToPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={goToNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
