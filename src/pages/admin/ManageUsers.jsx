// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaSync,
  FaUserEdit,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

// ---------- Helpers ----------
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROLE_OPTIONS = ["Admin", "Logistics Manager", "User"];

// ---------- User Form Modal ----------
function UserFormModal({
  isOpen,
  mode, // "create" | "edit"
  initialData,
  onClose,
  onSubmit,
  loading,
}) {
  const { isDarkMode } = useAdminThemeStore();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "User",
    is_active: true,
  });


  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setForm({
          full_name: initialData.full_name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          role: initialData.role || "User",
          is_active: Boolean(initialData.is_active),
        });

      } else {
        setForm({
          full_name: "",
          email: "",
          phone: "",
          role: "User",
          is_active: true,
        });

      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2">
      <div
        className={`w-full max-w-lg rounded-2xl p-5 shadow-xl border transition-colors ${isDarkMode
            ? "bg-slate-800/95 border-slate-700"
            : "bg-white/95 border-pink-100"
          }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            className={`text-base md:text-lg font-semibold transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-800"
              }`}
          >
            {mode === "create" ? "Add New User" : "Edit User"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`text-xs transition-colors ${isDarkMode
                ? "text-slate-400 hover:text-slate-300"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-600"
                  }`}
              >
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-pink-100 transition-colors ${isDarkMode
                    ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-pink-500"
                    : "border-pink-100 bg-white text-gray-900 placeholder-gray-400 focus:border-pink-400"
                  }`}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label
                className={`block text-[11px] font-medium mb-1 transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-600"
                  }`}
              >
                Email (User ID)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={mode === "edit"}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-2 transition-colors ${mode === "edit"
                    ? isDarkMode
                      ? "bg-slate-600 border-slate-600 text-slate-400 cursor-not-allowed"
                      : "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                    : isDarkMode
                      ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:ring-pink-100"
                      : "border-pink-100 bg-white text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-100"
                  }`}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-600"
                  }`}
              >
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-pink-100 transition-colors ${isDarkMode
                    ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-pink-500"
                    : "border-pink-100 bg-white text-gray-900 placeholder-gray-400 focus:border-pink-400"
                  }`}
                placeholder="10-digit phone"
              />
            </div>

            <div>
              <label
                className={`block text-[11px] font-medium mb-1 transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-600"
                  }`}
              >
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-pink-100 transition-colors ${isDarkMode
                    ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-pink-500"
                    : "border-pink-100 bg-white text-gray-900 focus:border-pink-400"
                  }`}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-4 md:mt-6">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-3 w-3 rounded border-pink-300 text-pink-600 focus:ring-pink-400"
              />
              <label
                htmlFor="is_active"
                className={`text-[11px] font-medium transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
              >
                Active user
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${isDarkMode
                  ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow transition-colors ${isDarkMode
                  ? "bg-pink-600 hover:bg-pink-700 disabled:opacity-70"
                  : "bg-gradient-to-r from-pink-600 to-pink-500 hover:brightness-110 disabled:opacity-70"
                }`}
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create User"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Confirm Delete ----------
function ConfirmDeleteModal({ isOpen, user, onClose, onConfirm, loading }) {
  const { isDarkMode } = useAdminThemeStore();
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2">
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-xl border transition-colors ${isDarkMode
            ? "bg-slate-800/95 border-slate-700"
            : "bg-white/95 border-pink-100"
          }`}
      >
        <h2
          className={`text-sm md:text-base font-semibold mb-2 transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-800"
            }`}
        >
          Delete User
        </h2>
        <p
          className={`text-xs md:text-sm mb-4 transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
        >
          Are you sure you want to delete{" "}
          <span
            className={`font-semibold transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}
          >
            {user.full_name || user.email}
          </span>{" "}
          ({user.email})? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${isDarkMode
                ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow transition-colors ${isDarkMode
                ? "bg-red-600 hover:bg-red-700 disabled:opacity-70"
                : "bg-red-500 hover:bg-red-600 disabled:opacity-70"
              }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN PAGE ----------
const ManageUsers = () => {
  const { isDarkMode } = useAdminThemeStore();
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [selectedUser, setSelectedUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 🔥 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("localmoves.api.dashboard.get_all_users");
      const message = res.data?.message || {};
      const data = message.data || [];
      setUsers(data);
      setCount(message.count ?? data.length ?? 0);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Please check the server.");
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedUser(null);
    setShowFormModal(true);
  };

  const openEditModal = (user) => {
    setFormMode("edit");
    setSelectedUser(user);
    setShowFormModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      setActionLoading(true);

      if (formMode === "create") {
        const payload = {
          email: formData.email.toLowerCase().trim(),
          full_name: formData.full_name.trim(),
          phone: formData.phone,
          role: formData.role,
          is_active: formData.is_active ? 1 : 0,

          // REQUIRED by backend
          password: "Temp@12345",
        };



        const res = await api.post(
          "localmoves.api.dashboard.create_user",
          payload
        );
        const created = res.data?.message?.data;
        toast.success(res.data?.message?.message || "User created successfully");
        if (created) {
          setUsers((prev) => [created, ...prev]);
        } else {
          fetchUsers();
        }
      } else if (formMode === "edit" && selectedUser) {
        const payload = {
          user_id: selectedUser.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          is_active: formData.is_active ? 1 : 0,
        };

        const res = await api.post(
          "localmoves.api.dashboard.update_user",
          payload
        );
        const updated = res.data?.message?.data;
        toast.success(res.data?.message?.message || "User updated successfully");

        if (updated) {
          setUsers((prev) =>
            prev.map((u) =>
              u.email === updated.email ? { ...u, ...updated } : u
            )
          );
        } else {
          fetchUsers();
        }
      }

      setShowFormModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await api.post("localmoves.api.dashboard.delete_user", {
        user_id: selectedUser.email,
      });
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.email !== selectedUser.email));
      setCount((prev) => (prev > 0 ? prev - 1 : 0));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const status = u.is_active ? "active" : "inactive";
    const matchesSearch =
      !search ||
      (u.full_name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.trim().toLowerCase());
    const matchesRole =
      roleFilter === "all" || (u.role || "").toLowerCase() === roleFilter;
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 🔥 PAGINATION FUNCTIONS
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  return (
    <div
      className={`space-y-4 pb-6 transition-colors ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
        }`}
    >
      {/* Local scrollbar style */}
      <style>{`
        .scroll-thin-pink::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scroll-thin-pink::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll-thin-pink::-webkit-scrollbar-thumb {
          background: #ec4899;
          border-radius: 9999px;
        }
        .scroll-thin-pink::-webkit-scrollbar-thumb:hover {
          background: #be185d;
        }
        .scroll-thin-pink {
          scrollbar-width: thin;
          scrollbar-color: #ec4899 transparent;
        }
      `}</style>

      {/* Header */}
      <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className={`text-lg md:text-xl font-semibold transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}
          >
            Users
          </h1>
          <p
            className={`text-xs md:text-sm transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
          >
            Manage all registered users on the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchUsers}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm hover:transition flex items-center gap-2 transition-colors flex-shrink-0 ${isDarkMode
                ? "bg-pink-900/20 border-pink-700/50 text-pink-300 hover:bg-pink-900/30"
                : "bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200"
              }`}
          >
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">Refresh data</span>
            <span className="sm:hidden">Refresh</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] md:text-xs font-semibold text-white shadow transition-colors ${isDarkMode
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-gradient-to-r from-pink-600 to-pink-500 hover:brightness-110"
              }`}
          >
            <FaPlus className="h-3 w-3" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div
        className={`rounded-2xl border p-3 md:p-4 shadow-sm backdrop-blur transition-colors ${isDarkMode
            ? "border-slate-700 bg-slate-800/50"
            : "border-pink-100 bg-white/80"
          }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <span
                className={`pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`}
              >
                <FaSearch className="h-3 w-3" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name or email..."
                className={`w-full rounded-full border py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 transition-colors ${isDarkMode
                    ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:ring-pink-500/20"
                    : "border-pink-100 bg-white text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-100"
                  }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-full border px-3 py-2 text-[11px] outline-none focus:ring-2 transition-colors ${isDarkMode
                  ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-pink-500 focus:ring-pink-500/20"
                  : "border-pink-100 bg-white text-gray-900 focus:border-pink-400 focus:ring-pink-100"
                }`}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="logistics manager">Logistics Manager</option>
              <option value="user">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-full border px-3 py-2 text-[11px] outline-none focus:ring-2 transition-colors ${isDarkMode
                  ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-pink-500 focus:ring-pink-500/20"
                  : "border-pink-100 bg-white text-gray-900 focus:border-pink-400 focus:ring-pink-100"
                }`}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div
              className={`rounded-full px-3 py-2 text-[11px] font-medium transition-colors ${isDarkMode ? "bg-pink-900/30 text-pink-300" : "bg-pink-50 text-pink-700"
                }`}
            >
              Total: {count}
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {!loading && error && (
        <div
          className={`rounded-2xl border p-3 text-xs md:text-sm transition-colors ${isDarkMode
              ? "border-red-900/30 bg-red-900/20 text-red-300"
              : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          {error}
        </div>
      )}

      {/* Table + Mobile cards */}
      <div
        className={`rounded-2xl border p-0 shadow-sm backdrop-blur transition-colors ${isDarkMode
            ? "border-slate-700 bg-slate-800/50"
            : "border-pink-100 bg-white/80"
          }`}
      >
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`h-7 w-7 animate-spin rounded-full border-2 border-t-transparent ${isDarkMode ? "border-pink-400" : "border-pink-400"
                  }`}
              />
              <p
                className={`text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`}
              >
                Loading users…
              </p>
            </div>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div
            className={`flex h-40 items-center justify-center px-4 text-center text-xs md:text-sm transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
              }`}
          >
            No users found for the selected filters.
          </div>
        ) : (
          <>
            {/* Desktop / Tablet TABLE */}
            <div className="hidden md:block overflow-x-auto scroll-thin-pink rounded-2xl">
              <table className="min-w-full text-xs md:text-sm">
                <thead
                  className={`transition-colors ${isDarkMode
                      ? "bg-slate-700/50 text-slate-300"
                      : "bg-pink-50/70 text-gray-600"
                    }`}
                >
                  <tr>
                    <th className="py-2.5 px-3 text-left font-medium">User ID</th>
                    <th className="py-2.5 px-3 text-left font-medium">Name</th>
                    <th className="py-2.5 px-3 text-left font-medium hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="py-2.5 px-3 text-left font-medium">Role</th>
                    <th className="py-2.5 px-3 text-left font-medium">Status</th>
                    <th className="py-2.5 px-3 text-left font-medium hidden xl:table-cell">
                      Last Login
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((u, idx) => {
                    const isActive = !!u.is_active;

                    return (
                      <tr
                        key={u.email}
                        className={`border-t transition-colors ${isDarkMode
                            ? `border-slate-700 ${idx % 2 === 1
                              ? "bg-slate-700/30"
                              : "bg-slate-700/10"
                            } hover:bg-slate-700/50`
                            : `border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/40" : "bg-white/60"
                            } hover:bg-pink-50/80`
                          }`}
                      >
                        <td
                          className={`py-2.5 px-3 text-[11px] md:text-xs font-medium ${isDarkMode ? "text-slate-200" : "text-gray-800"
                            }`}
                        >
                          {u.email}
                        </td>

                        <td
                          className={`py-2.5 px-3 text-[11px] md:text-xs ${isDarkMode ? "text-slate-300" : "text-gray-800"
                            }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {u.full_name || "-"}
                            </span>
                            <span
                              className={`text-[10px] ${isDarkMode ? "text-slate-400" : "text-gray-500"
                                }`}
                            >
                              {u.city || "-"}
                              {u.state ? `, ${u.state}` : ""}
                            </span>
                          </div>
                        </td>

                        <td
                          className={`py-2.5 px-3 text-[11px] md:text-xs hidden lg:table-cell ${isDarkMode ? "text-slate-300" : "text-gray-700"
                            }`}
                        >
                          {u.phone || "-"}
                        </td>

                        <td className="py-2.5 px-3 text-[11px] md:text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isDarkMode
                                ? "bg-pink-900/30 text-pink-300"
                                : "bg-pink-50 text-pink-600"
                              }`}
                          >
                            {u.role || "-"}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-[11px] md:text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive
                                ? isDarkMode
                                  ? "bg-green-900/30 text-green-300"
                                  : "bg-green-50 text-green-600"
                                : isDarkMode
                                  ? "bg-yellow-900/30 text-yellow-300"
                                  : "bg-yellow-50 text-yellow-600"
                              }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-[10px] md:text-xs text-gray-500 hidden xl:table-cell">
                          {formatDateTime(u.last_login)}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="inline-flex items-center justify-center rounded-full border border-pink-100 bg-white px-2.5 py-1 text-[10px] font-medium text-pink-600 hover:bg-pink-50"
                            >
                              <FaUserEdit className="mr-1 h-3 w-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(u)}
                              className="inline-flex items-center justify-center rounded-full border border-red-100 bg-white px-2.5 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
                            >
                              <FaTrash className="mr-1 h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden divide-y divide-gray-100">
              {paginatedUsers.map((u) => {
                const isActive = !!u.is_active;
                return (
                  <div
                    key={u.email}
                    className={`px-3 py-3 flex flex-col gap-2 ${isDarkMode
                        ? "bg-slate-900/40"
                        : "bg-white/90"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-[11px] font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"
                            } break-all`}
                        >
                          {u.email}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-300" : "text-gray-800"
                            }`}
                        >
                          {u.full_name || "-"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isActive
                              ? isDarkMode
                                ? "bg-green-900/30 text-green-300"
                                : "bg-green-50 text-green-600"
                              : isDarkMode
                                ? "bg-yellow-900/30 text-yellow-300"
                                : "bg-yellow-50 text-yellow-600"
                            }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isDarkMode
                              ? "bg-pink-900/30 text-pink-300"
                              : "bg-pink-50 text-pink-600"
                            }`}
                        >
                          {u.role || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-col">
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }
                        >
                          Phone: {u.phone || "-"}
                        </span>
                        <span
                          className={
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }
                        >
                          Location:{" "}
                          {u.city || "-"}
                          {u.state ? `, ${u.state}` : ""}
                        </span>
                        <span
                          className={
                            isDarkMode ? "text-slate-500" : "text-gray-500"
                          }
                        >
                          Last login: {formatDateTime(u.last_login)}
                        </span>
                      </div>

                      <div className="flex justify-end gap-1.5 w-full xs:w-auto">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="flex-1 xs:flex-none inline-flex items-center justify-center rounded-full border border-pink-100 bg-white px-2.5 py-1 text-[10px] font-medium text-pink-600 hover:bg-pink-50"
                        >
                          <FaUserEdit className="mr-1 h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(u)}
                          className="flex-1 xs:flex-none inline-flex items-center justify-center rounded-full border border-red-100 bg-white px-2.5 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
                        >
                          <FaTrash className="mr-1 h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div
              className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"
                }`}
            >
              <div>
                Showing{" "}
                <b>
                  {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                </b>{" "}
                of <b>{filteredUsers.length}</b>
              </div>

              <div className="flex flex-wrap items-center gap-1 justify-end">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded border text-[11px] ${isDarkMode
                      ? "border-slate-700 bg-slate-800 disabled:opacity-50"
                      : "border-pink-200 bg-white disabled:opacity-50"
                    }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i + 1)}
                    className={`px-2 py-1 rounded border text-[11px] ${currentPage === i + 1
                        ? isDarkMode
                          ? "bg-pink-700 text-white border-pink-700"
                          : "bg-pink-600 text-white border-pink-600"
                        : isDarkMode
                          ? "border-slate-700 bg-slate-800 text-slate-300"
                          : "border-pink-200 bg-white text-gray-700"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded border text-[11px] ${isDarkMode
                      ? "border-slate-700 bg-slate-800 disabled:opacity-50"
                      : "border-pink-200 bg-white disabled:opacity-50"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showFormModal}
        mode={formMode}
        initialData={selectedUser}
        onClose={() => {
          if (!actionLoading) {
            setShowFormModal(false);
            setSelectedUser(null);
          }
        }}
        onSubmit={handleCreateOrUpdate}
        loading={actionLoading}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        user={selectedUser}
        onClose={() => {
          if (!actionLoading) {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }
        }}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManageUsers;
