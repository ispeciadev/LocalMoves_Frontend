// src/pages/admin/ManageRequests.jsx
import React, { useEffect, useState } from "react";
import AdminTable from "../../components/admin/AdminTable";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaSync } from "react-icons/fa";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

// ---------------------------------------------
// DATE HELPER
// ---------------------------------------------
function formatDateShort(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// 💗 Columns for Table
const columns = [
  { key: "id", label: "Request ID" },
  { key: "user", label: "User" },
  { key: "route", label: "Route" },
  { key: "company", label: "Company" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const ManageRequests = () => {
  const { isDarkMode } = useAdminThemeStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ADD FORM STATE
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    pickup_address: "",
    pickup_city: "",
    pickup_pincode: "",
    delivery_address: "",
    delivery_city: "",
    delivery_pincode: "",
    service_type: "Standard",
    priority: "Medium",
    item_description: "",
    special_instructions: "",
    property_size: "",
  });

  // EDIT FORM
  const [editForm, setEditForm] = useState({
    status: "Pending",
    company_name: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ---------------------------------------------
  // FETCH REQUESTS
  // ---------------------------------------------
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("localmoves.api.dashboard.get_all_requests");
      const data = res.data?.message?.data || [];
      setRequests(data);
    } catch (error) {
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // FETCH COMPANY LIST
  // ---------------------------------------------
  const fetchCompanies = async () => {
    try {
      const res = await api.get("localmoves.api.dashboard.get_all_companies");
      setCompanies(res.data?.message?.data || []);
    } catch (error) {
      console.log("Company fetch failed");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCompanies();
  }, []);

  // ---------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------------
  // OPEN MODALS
  // ---------------------------------------------
  const openAddModal = () => {
    setAddForm({
      full_name: "",
      email: "",
      phone: "",
      pickup_address: "",
      pickup_city: "",
      pickup_pincode: "",
      delivery_address: "",
      delivery_city: "",
      delivery_pincode: "",
      service_type: "Standard",
      priority: "Medium",
      item_description: "",
      special_instructions: "",
      property_size: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (req) => {
    setSelectedRequest(req);
    setEditForm({
      status: req.status || "Pending",
      company_name: req.company_name || "",
    });
    setShowEditModal(true);
  };

  const confirmDelete = (req) => {
    setSelectedRequest(req);
    setShowDeleteModal(true);
  };

  // ---------------------------------------------
  // CREATE REQUEST
  // ---------------------------------------------
  const handleCreate = async () => {
    try {
      const payload = {
        full_name: addForm.full_name,
        email: addForm.email,
        phone: addForm.phone,
        user_email: addForm.email,
        pickup_pincode: addForm.pickup_pincode,
        pickup_address: addForm.pickup_address,
        pickup_city: addForm.pickup_city,
        delivery_pincode: addForm.delivery_pincode,
        delivery_address: addForm.delivery_address,
        delivery_city: addForm.delivery_city,
        service_type: addForm.service_type,
        priority: addForm.priority,
        item_description: addForm.item_description || null,
        special_instructions: addForm.special_instructions || null,
        property_size: addForm.property_size || null,
      };

      await api.post("localmoves.api.dashboard.create_request", payload);
      toast.success("Request created successfully!");
      setShowAddModal(false);
      fetchRequests();
    } catch (error) {
      toast.error("Failed to create request.");
    }
  };

  // ---------------------------------------------
  // UPDATE REQUEST (Status + Company)
  // ---------------------------------------------
  const handleUpdate = async () => {
    if (!selectedRequest) return;

    try {
      // MANDATORY COMPANY FOR PENDING REQUESTS
      if (editForm.status === "Pending" && !editForm.company_name) {
        toast.error("Please assign a company before updating a pending request.");
        return;
      }

      const payload = { request_id: selectedRequest.name };

      // Only send changed values
      if (editForm.status !== selectedRequest.status) {
        payload.status = editForm.status;
      }

      if (editForm.company_name !== selectedRequest.company_name) {
        payload.company_name = editForm.company_name;
      }

      if (!payload.status && !payload.company_name) {
        toast.info("Nothing to update.");
        return;
      }

      await api.post("localmoves.api.dashboard.update_request", payload);
      toast.success("Request updated successfully!");

      setShowEditModal(false);
      setTimeout(() => fetchRequests(), 300);
    } catch (error) {
      toast.error("Failed to update request.");
    }
  };

  // ---------------------------------------------
  // DELETE REQUEST
  // ---------------------------------------------
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      await api.post("localmoves.api.dashboard.delete_request", {
        request_id: selectedRequest.name,
      });

      toast.success("Request deleted successfully!");
      setShowDeleteModal(false);
      fetchRequests();
    } catch (error) {
      toast.error("Failed to delete request.");
      setShowDeleteModal(false);
    }
  };

  // ---------------------------------------------
  // TABLE ROWS
  // ---------------------------------------------
  const rows = requests.map((r) => {
    const statusColorClasses =
      r.status === "Assigned"
        ? "bg-green-50 text-green-600 border border-green-100"
        : r.status === "Pending"
        ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
        : "bg-gray-50 text-gray-600 border border-gray-100";

    const isCompleted = r.status === "Completed";

    return {
      id: r.name,
      user: r.full_name || r.user_email || "-",
      route: `${r.pickup_city || "-"} → ${r.delivery_city || "-"}`,
      company: r.company_name || "Not assigned",
      date: formatDateShort(r.delivery_date || r.created_at || r.creation),
      status: (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColorClasses}`}
        >
          {r.status || "-"}
        </span>
      ),
      actions: (
        <div className="flex items-center gap-3">

          {/* EDIT BUTTON (DISABLED FOR COMPLETED) */}
          <button
            disabled={isCompleted}
            className={`transition ${
              isCompleted
                ? "text-gray-400 cursor-not-allowed"
                : "text-pink-600 hover:text-pink-700"
            }`}
            onClick={() => !isCompleted && openEditModal(r)}
          >
            <FaEdit />
          </button>

          {/* DELETE BUTTON (DISABLED FOR COMPLETED) */}
          <button
            disabled={isCompleted}
            className={`transition ${
              isCompleted
                ? "text-gray-300 cursor-not-allowed"
                : "text-red-500 hover:text-red-600"
            }`}
            onClick={() => !isCompleted && confirmDelete(r)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    };
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case "Assigned":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`space-y-4 p-3 sm:p-4 md:p-6 transition-colors ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"}`}>

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
            Requests
          </h1>
          <p className={`text-xs sm:text-sm md:text-base mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
            Track all movement requests across companies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={fetchRequests}
            className={`inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-full border px-4 sm:px-4 py-3 sm:py-2 text-xs sm:text-[11px] font-medium active:scale-95 transition shadow-sm hover:shadow ${
              isDarkMode
                ? "border-pink-900/30 bg-pink-900/10 text-pink-400 hover:bg-pink-900/20"
                : "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100"
            }`}
          >
            <FaSync className="text-base sm:text-xs shrink-0" />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className={`inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-full px-4 sm:px-5 py-3 sm:py-2 text-xs sm:text-xs font-semibold shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition ${
              isDarkMode
                ? "bg-linear-to-r from-pink-600 to-pink-700 text-white"
                : "bg-linear-to-r from-pink-500 to-pink-600 text-white"
            }`}
          >
            <FaPlus className="text-base sm:text-xs shrink-0" />
            Add Request
          </button>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="block sm:hidden space-y-3">
        {paginatedRequests.length > 0 ? (
          paginatedRequests.map((r) => (
            <div
              key={r.name}
              className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${
                isDarkMode
                  ? "border-slate-700 bg-slate-800/50 hover:shadow-slate-900/50"
                  : "border-gray-200 bg-white hover:shadow-gray-200"
              }`}
            >
              {/* HEADER ROW */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate text-sm ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                    {r.name}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                    {r.full_name || r.user_email || "-"}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getStatusColor(
                    r.status
                  )}`}
                >
                  {r.status || "-"}
                </span>
              </div>

              {/* ROUTE */}
              <div className={`mb-3 pb-3 border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
                <p className={`text-[11px] font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Route
                </p>
                <p className={`text-sm ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                  {r.pickup_city || "-"} → {r.delivery_city || "-"}
                </p>
              </div>

              {/* COMPANY & DATE */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className={`text-[11px] font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Company
                  </p>
                  <p className={`text-xs font-medium ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                    {r.company_name || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className={`text-[11px] font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Date
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    {formatDateShort(
                      r.delivery_date || r.created_at || r.creation
                    )}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                <button
                  disabled={r.status === "Completed"}
                  onClick={() =>
                    r.status !== "Completed" && openEditModal(r)
                  }
                  className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition ${
                    r.status === "Completed"
                      ? isDarkMode
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-pink-900/20 text-pink-400 hover:bg-pink-900/30 active:scale-95"
                      : "bg-pink-50 text-pink-600 hover:bg-pink-100 active:scale-95"
                  }`}
                >
                  Edit
                </button>
                <button
                  disabled={r.status === "Completed"}
                  onClick={() =>
                    r.status !== "Completed" && confirmDelete(r)
                  }
                  className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition ${
                    r.status === "Completed"
                      ? isDarkMode
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-red-900/20 text-red-400 hover:bg-red-900/30 active:scale-95"
                      : "bg-red-50 text-red-600 hover:bg-red-100 active:scale-95"
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={`rounded-xl border p-8 text-center ${
            isDarkMode
              ? "border-slate-700 bg-slate-800/50"
              : "border-gray-200 bg-gray-50"
          }`}>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              No requests found
            </p>
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden sm:block">
        <AdminTable
          title="All Requests"
          columns={columns}
          rows={rows}
          loading={loading}
        />
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pb-4 flex-wrap">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentPage === page
                  ? "bg-pink-600 text-white"
                  : isDarkMode
                  ? "border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ========================== */}
      {/* EDIT MODAL */}
      {/* ========================== */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-3xl sm:rounded-2xl border border-pink-100 bg-white p-4 sm:p-6 shadow-2xl max-h-[85vh] overflow-y-auto">

            <div className="mb-4 flex items-center justify-between sticky top-0 bg-white pb-3 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-2">
                Update Request
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="shrink-0 inline-flex items-center justify-center w-8 h-8 text-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* BASIC */}
            <div className="mb-5 rounded-2xl bg-pink-50/60 p-4 sm:p-5 text-sm sm:text-base text-gray-700">
              <p className="font-semibold text-gray-900 wrap-break-word">
                {selectedRequest.name} • {selectedRequest.full_name}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600">
                {selectedRequest.pickup_city || "-"} → {selectedRequest.delivery_city || "-"}
              </p>
              <p className="mt-3 text-sm sm:text-base text-gray-600">
                Current Status: <span className="font-semibold text-gray-900">{selectedRequest.status || "-"}</span>
              </p>
            </div>

            <div className="space-y-4 text-sm sm:text-base">
              {/* STATUS */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-800">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 sm:py-2.5 text-sm sm:text-base focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                  disabled={selectedRequest.status === "Completed"}
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                </select>
              </div>

              {/* COMPANY */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-gray-800">
                  Assign Company
                </label>
                <select
                  name="company_name"
                  value={editForm.company_name}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 sm:py-2.5 text-sm sm:text-base focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                  disabled={selectedRequest.status === "Completed"}
                >
                  <option value="">Not Assigned</option>
                  {companies.map((c) => (
                    <option key={c.name} value={c.company_name}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg sm:rounded-full bg-gray-100 px-5 py-3 sm:py-2 text-sm sm:text-base font-semibold text-gray-700 hover:bg-gray-200 active:scale-95 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={selectedRequest.status === "Completed"}
                className={`rounded-lg sm:rounded-full px-5 py-3 sm:py-2 text-sm sm:text-base font-semibold text-white shadow transition active:scale-95 ${
                  selectedRequest.status === "Completed"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700 hover:shadow-md"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-sm rounded-3xl sm:rounded-2xl border border-red-200 bg-white p-4 sm:p-6 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Delete Request?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-700">
              You are about to delete{" "}
              <span className="font-bold text-gray-900">{selectedRequest.name}</span>.
            </p>
            <p className="mt-3 text-sm sm:text-base text-red-600 font-semibold">
              This action cannot be undone.
            </p>

            <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg sm:rounded-full bg-gray-100 px-5 py-3 sm:py-2 text-sm sm:text-base font-semibold text-gray-700 hover:bg-gray-200 active:scale-95 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={selectedRequest.status === "Completed"}
                className={`rounded-lg sm:rounded-full px-5 py-3 sm:py-2 text-sm sm:text-base font-semibold text-white shadow transition active:scale-95 ${
                  selectedRequest.status === "Completed"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 hover:shadow-md"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageRequests;
