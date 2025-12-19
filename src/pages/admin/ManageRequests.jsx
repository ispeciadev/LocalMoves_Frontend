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

// ---------------------------------------------
// PROPERTY ASSESSMENT OPTIONS (matching RefineOptionsPage)
// ---------------------------------------------
const PROPERTY_TYPES = ["House", "Flat", "Office", "A few items"];

const HOUSE_SIZES = ["2 Bed", "3 Bed", "4 Bed", "5 Bed", "6 Bed"];

const FLAT_SIZES = ["Studio", "1 Bed", "2 Bed", "3 Bed", "4 Bed"];

const OFFICE_SIZES = ["2 Workstations", "4 Workstations", "8 Workstations", "15 Workstations", "25 Workstations"];

const VEHICLE_SIZES = ["SWB Van", "MWB Van", "LWB Van"];

const SPACE_REQUIRED = ["Quarter Van", "Half Van", "3/4 Van", "Whole Van"];

const QUANTITY_OPTIONS = ["Some Things", "Half the Contents", "3/4 Most Things", "Everything"];

// 💗 Columns for Table
const columns = [
  { key: "id", label: "Request ID" },
  { key: "user", label: "User" },
  { key: "route", label: "Route" },
  { key: "company", label: "Company" },
  { key: "date", label: "Delivery Date" },
  { key: "status", label: "Status" },
  { key: "estimated_cost", label: "Estimated Cost" },
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
    // Basic Information
    email: "",
    user_email: "",
    user_name: "",
    full_name: "",
    phone: "",
    pickup_address: "",
    pickup_city: "",
    pickup_pincode: "",
    delivery_address: "",
    delivery_city: "",
    delivery_pincode: "",
    distance_miles: "",
    vehicle_type: "SWB Van",
    delivery_date: "",
    company_name: "",
    status: "Assigned",
    payment_status: "Pending",

    // Property Assessment
    property_type: "House",

    // For "A few items"
    vehicle_size: "SWB Van",
    space_required: "Whole Van",

    // For House
    house_size: "2 Bed",
    house_quantity: "Everything",

    // For Flat
    flat_size: "1 Bed",
    flat_quantity: "Everything",

    // For Office
    office_size: "2 Workstations",
    office_quantity: "Everything",

    estimated_cost: 0
  });

  // EDIT FORM
  const [editForm, setEditForm] = useState({
    status: "Assigned",
    company_name: "",
    payment_status: "Pending"
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
      console.log("✅ Fetch Requests Response:", res.data);
      const data = res.data?.message?.data || [];
      setRequests(data);
    } catch (error) {
      console.error("❌ Fetch Requests Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
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
      console.log("✅ Fetch Companies Response:", res.data);
      setCompanies(res.data?.message?.data || []);
    } catch (error) {
      console.error("❌ Fetch Companies Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCompanies();
  }, []);

  // ===== PAGINATION =====
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  // ---------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setAddForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }));

      // Auto-fill user_email when email changes
      if (name === "email") {
        setAddForm((prev) => ({ ...prev, user_email: value }));
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------------
  // OPEN MODALS
  // ---------------------------------------------
  const openAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setAddForm({
      // Basic Information
      email: "",
      user_email: "",
      user_name: "",
      full_name: "",
      phone: "",
      pickup_address: "",
      pickup_city: "",
      pickup_pincode: "",
      delivery_address: "",
      delivery_city: "",
      delivery_pincode: "",
      distance_miles: "",
      vehicle_type: "SWB Van",
      delivery_date: today,
      company_name: "",
      status: "Assigned",
      payment_status: "Pending",

      // Property Assessment
      property_type: "House",

      // For "A few items"
      vehicle_size: "SWB Van",
      space_required: "Whole Van",

      // For House
      house_size: "2 Bed",
      house_quantity: "Everything",

      // For Flat
      flat_size: "1 Bed",
      flat_quantity: "Everything",

      // For Office
      office_size: "2 Workstations",
      office_quantity: "Everything",

      estimated_cost: 0
    });
    setShowAddModal(true);
  };

  const openEditModal = (req) => {
    setSelectedRequest(req);
    setEditForm({
      status: req.status || "Assigned",
      company_name: req.company_name || "",
      payment_status: req.payment_status || "Pending"
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
      // Validate required fields
      const requiredFields = ['email', 'full_name', 'phone', 'pickup_address', 'delivery_address', 'delivery_date'];
      const missingFields = requiredFields.filter(field => !addForm[field]);

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Prepare payload
      const payload = {
        // Basic information
        email: addForm.email,
        user_email: addForm.user_email || addForm.email,
        user_name: addForm.user_name || addForm.full_name,
        full_name: addForm.full_name,
        phone: addForm.phone,
        pickup_address: addForm.pickup_address,
        pickup_city: addForm.pickup_city,
        pickup_pincode: addForm.pickup_pincode || "",
        delivery_address: addForm.delivery_address,
        delivery_city: addForm.delivery_city,
        delivery_pincode: addForm.delivery_pincode || "",
        distance_miles: parseFloat(addForm.distance_miles) || 0,
        vehicle_type: addForm.vehicle_type,
        delivery_date: addForm.delivery_date,
        company_name: addForm.company_name || "",
        status: addForm.status,
        payment_status: addForm.payment_status,

        // Property assessment data
        property_type: addForm.property_type,

        // Property type specific data
        ...(addForm.property_type === "A few items" && {
          vehicle_size: addForm.vehicle_size,
          space_required: addForm.space_required
        }),

        ...(addForm.property_type === "House" && {
          house_size: addForm.house_size,
          house_quantity: addForm.house_quantity
        }),

        ...(addForm.property_type === "Flat" && {
          flat_size: addForm.flat_size,
          flat_quantity: addForm.flat_quantity
        }),

        ...(addForm.property_type === "Office" && {
          office_size: addForm.office_size,
          office_quantity: addForm.office_quantity
        }),

        estimated_cost: addForm.estimated_cost || 0
      };

      console.log("📤 Create Request Payload:", payload);
      const res = await api.post("localmoves.api.dashboard.create_request", payload);
      console.log("✅ Create Request Response:", res.data);
      toast.success("Request created successfully!");
      setShowAddModal(false);
      setCurrentPage(1); // Reset to first page
      fetchRequests();
    } catch (error) {
      console.error("❌ Create Request Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || "Failed to create request.");
    }
  };

  // ---------------------------------------------
  // UPDATE REQUEST
  // ---------------------------------------------
  const handleUpdate = async () => {
    if (!selectedRequest) return;

    try {
      const payload = { request_id: selectedRequest.name };

      if (editForm.status !== selectedRequest.status) {
        payload.status = editForm.status;
      }

      if (editForm.company_name !== selectedRequest.company_name) {
        payload.company_name = editForm.company_name;
      }

      if (editForm.payment_status !== selectedRequest.payment_status) {
        payload.payment_status = editForm.payment_status;
      }

      if (!payload.status && !payload.company_name && !payload.payment_status) {
        toast.info("Nothing to update.");
        return;
      }

      console.log("📤 Update Request Payload:", payload);
      const res = await api.post("localmoves.api.dashboard.update_request", payload);
      console.log("✅ Update Request Response:", res.data);
      toast.success("Request updated successfully!");

      setShowEditModal(false);
      setCurrentPage(1); // Reset to first page
      setTimeout(() => fetchRequests(), 300);
    } catch (error) {
      console.error("❌ Update Request Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || "Failed to update request.");
    }
  };

  // ---------------------------------------------
  // DELETE REQUEST - FIXED WITH CASCADE PARAMETER
  // ---------------------------------------------
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      const payload = {
        request_id: selectedRequest.name,
        cascade: true  // ADDED: This will delete linked payment transactions
      };
      console.log("📤 Delete Request Payload:", payload);
      const res = await api.post("localmoves.api.dashboard.delete_request", payload);
      console.log("✅ Delete Request Response:", res.data);

      toast.success("Request deleted successfully!");
      setShowDeleteModal(false);
      setCurrentPage(1); // Reset to first page
      fetchRequests();
    } catch (error) {
      console.error("❌ Delete Request Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        request_id: selectedRequest.name
      });
      toast.error(error.response?.data?.message || "Failed to delete request.");
      setShowDeleteModal(false);
    }
  };

  // ---------------------------------------------
  // TABLE ROWS - UPDATED TO USE PAGINATED REQUESTS
  // ---------------------------------------------
  const rows = paginatedRequests.map((r) => {
    const statusColorClasses =
      r.status === "Assigned"
        ? "bg-green-50 text-green-600 border border-green-100"
        : r.status === "Pending"
          ? "bg-yellow-50 text-yellow-600 border border-yellow-100"
          : r.status === "Completed"
            ? "bg-blue-50 text-blue-600 border border-blue-100"
            : "bg-gray-50 text-gray-600 border border-gray-100";

    const isCompleted = r.status === "Completed";

    return {
      id: r.name,
      user: r.full_name || r.user_name || r.user_email || "-",
      route: `${r.pickup_city || r.pickup_pincode || "-"} → ${r.delivery_city || r.delivery_pincode || "-"}`,
      company: r.company_name || "Not assigned",
      date: formatDateShort(r.delivery_date || r.creation),
      status: (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColorClasses}`}
        >
          {r.status || "-"}
        </span>
      ),
      vehicle_type: r.vehicle_type || "-",
      estimated_cost: (
        <span className="font-semibold text-green-600">
          ₹{r.estimated_cost ? parseInt(r.estimated_cost).toLocaleString() : "0"}
        </span>
      ),
      actions: (
        <div className="flex items-center gap-3">
          <button
            disabled={isCompleted}
            className={`transition ${isCompleted
              ? "text-gray-400 cursor-not-allowed"
              : "text-pink-600 hover:text-pink-700"
              }`}
            onClick={() => !isCompleted && openEditModal(r)}
          >
            <FaEdit />
          </button>

          <button
            disabled={isCompleted}
            className={`transition ${isCompleted
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
      <style>{`
        /* Hide scrollbar but keep functionality */
        .modal-scroll-container {
          overflow-y: auto;
        }
        
        .modal-scroll-container::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
        
        .modal-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .modal-scroll-container::-webkit-scrollbar-thumb {
          background: transparent;
        }
        
        /* For Firefox */
        .modal-scroll-container {
          scrollbar-width: none;
        }
        
        /* For Edge and IE */
        .modal-scroll-container {
          -ms-overflow-style: none;
        }
        
        /* Smooth scrolling */
        .modal-scroll-container {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for light mode */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f472b6;
          border-radius: 9999px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ec4899;
        }
      `}</style>

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
            Requests
          </h1>
          <p className={`text-xs sm:text-sm md:text-base mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
            Track and manage all movement requests.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={fetchRequests}
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
            onClick={openAddModal}
            className={`inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-full px-4 sm:px-5 py-3 sm:py-2 text-xs sm:text-xs font-semibold shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition ${isDarkMode
              ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white"
              : "bg-gradient-to-r from-pink-500 to-pink-600 text-white"
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
              className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${isDarkMode
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
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getStatusColor(
                      r.status
                    )}`}
                  >
                    {r.status || "-"}
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    ₹{r.estimated_cost ? parseInt(r.estimated_cost).toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              {/* ROUTE */}
              <div className={`mb-3 pb-3 border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
                <p className={`text-[11px] font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Route
                </p>
                <p className={`text-sm ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                  {r.pickup_city || r.pickup_pincode || "-"} → {r.delivery_city || r.delivery_pincode || "-"}
                </p>
              </div>

              {/* DETAILS */}
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
                    Vehicle
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    {r.vehicle_type || "-"}
                  </p>
                </div>
                <div>
                  <p className={`text-[11px] font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Delivery Date
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    {formatDateShort(r.delivery_date)}
                  </p>
                </div>
                <div>
                  <p className={`text-[11px] font-medium mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                    Priority
                  </p>
                  <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                    {r.priority || "Medium"}
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
                  className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition ${r.status === "Completed"
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
                  className={`flex-1 rounded-lg py-2 px-3 text-xs font-semibold transition ${r.status === "Completed"
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
          <div className={`rounded-xl border p-8 text-center ${isDarkMode
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
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
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
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${currentPage === page
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
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
              ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ========================== */}
      {/* ADD MODAL WITH COMPREHENSIVE COST CALCULATION */}
      {/* ========================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl sm:rounded-2xl border ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-pink-100 bg-white"} p-2.5 sm:p-3.5 shadow-2xl max-h-[85vh] flex flex-col`}>
            <div className={`mb-4 flex items-center justify-between sticky top-0 ${isDarkMode ? "bg-slate-800" : "bg-white"} pb-3 border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
              <h2 className={`text-base font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"} pr-2`}>
                Create New Request
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className={`shrink-0 inline-flex items-center justify-center w-8 h-8 text-xl ${isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"} rounded-full transition`}
              >
                ✕
              </button>
            </div>

            <div className="modal-scroll-container flex-1 custom-scrollbar pr-1">
              <div className="space-y-2.5 text-sm">
                {/* SECTION 1: BASIC INFORMATION */}
                <div className={`space-y-1.5 p-2 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} rounded-xl`}>
                  <h3 className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>1. Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div>
                      <label className={`block text-sm font-medium mb-0.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={addForm.full_name}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={addForm.email}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        required
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={addForm.phone}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ADDRESS & ROUTE */}
                <div className={`space-y-1.5 p-2 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} rounded-xl`}>
                  <h3 className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>2. Address & Route</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div className="lg:col-span-3">
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Pickup Address *
                      </label>
                      <input
                        type="text"
                        name="pickup_address"
                        value={addForm.pickup_address}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Pickup City
                      </label>
                      <input
                        type="text"
                        name="pickup_city"
                        value={addForm.pickup_city}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Pickup Pincode
                      </label>
                      <input
                        type="text"
                        name="pickup_pincode"
                        value={addForm.pickup_pincode}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        name="delivery_address"
                        value={addForm.delivery_address}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Delivery City
                      </label>
                      <input
                        type="text"
                        name="delivery_city"
                        value={addForm.delivery_city}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Delivery Pincode
                      </label>
                      <input
                        type="text"
                        name="delivery_pincode"
                        value={addForm.delivery_pincode}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Distance (Miles)
                      </label>
                      <input
                        type="number"
                        name="distance_miles"
                        value={addForm.distance_miles}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        name="delivery_date"
                        value={addForm.delivery_date}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-2.5 py-1 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PROPERTY TYPE ASSESSMENT */}
                <div className={`space-y-1.5 p-2 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} rounded-xl`}>
                  <h3 className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>3. Property Type Assessment</h3>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                      What are you moving? *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddForm(prev => ({ ...prev, property_type: type }))}
                          className={`py-2 px-3 rounded-lg border transition ${addForm.property_type === type
                            ? isDarkMode
                              ? "bg-pink-900/30 border-pink-600 text-pink-300"
                              : "bg-pink-50 border-pink-300 text-pink-700"
                            : isDarkMode
                              ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                              : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HOUSE ASSESSMENT */}
                  {addForm.property_type === "House" && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          House Size
                        </label>
                        <select
                          name="house_size"
                          value={addForm.house_size}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {HOUSE_SIZES.map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Quantity
                        </label>
                        <select
                          name="house_quantity"
                          value={addForm.house_quantity}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {QUANTITY_OPTIONS.map(qty => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* FLAT ASSESSMENT */}
                  {addForm.property_type === "Flat" && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Flat Size
                        </label>
                        <select
                          name="flat_size"
                          value={addForm.flat_size}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {FLAT_SIZES.map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Quantity
                        </label>
                        <select
                          name="flat_quantity"
                          value={addForm.flat_quantity}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {QUANTITY_OPTIONS.map(qty => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* OFFICE ASSESSMENT */}
                  {addForm.property_type === "Office" && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Office Size
                        </label>
                        <select
                          name="office_size"
                          value={addForm.office_size}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {OFFICE_SIZES.map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Quantity
                        </label>
                        <select
                          name="office_quantity"
                          value={addForm.office_quantity}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {QUANTITY_OPTIONS.map(qty => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* A FEW ITEMS ASSESSMENT */}
                  {addForm.property_type === "A few items" && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Vehicle Size Needed
                        </label>
                        <select
                          name="vehicle_size"
                          value={addForm.vehicle_size}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {VEHICLE_SIZES.map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                          Space Required
                        </label>
                        <select
                          name="space_required"
                          value={addForm.space_required}
                          onChange={handleAddChange}
                          className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                        >
                          {SPACE_REQUIRED.map(space => (
                            <option key={space} value={space}>
                              {space}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 4: REQUEST DETAILS */}
                <div className={`space-y-1.5 p-2 border ${isDarkMode ? "border-slate-700" : "border-gray-200"} rounded-xl`}>
                  <h3 className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>4. Request Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Vehicle Type
                      </label>
                      <select
                        name="vehicle_type"
                        value={addForm.vehicle_type}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      >
                        <option value="SWB Van">SWB Van</option>
                        <option value="MWB Van">MWB Van</option>
                        <option value="LWB Van">LWB Van</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Company
                      </label>
                      <select
                        name="company_name"
                        value={addForm.company_name}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      >
                        <option value="">Select Company</option>
                        {companies.map((c) => (
                          <option key={c.name} value={c.company_name}>
                            {c.company_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Status
                      </label>
                      <select
                        name="status"
                        value={addForm.status}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      >
                        <option value="Assigned">Assigned</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                        Payment Status
                      </label>
                      <select
                        name="payment_status"
                        value={addForm.payment_status}
                        onChange={handleAddChange}
                        className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-white text-gray-900"} px-4 py-2.5 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Fully Paid">Fully Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className={`mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sticky bottom-0 ${isDarkMode ? "bg-slate-800" : "bg-white"} pt-4 border-t ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
              <button
                onClick={() => setShowAddModal(false)}
                className={`rounded-lg sm:rounded-full px-5 py-3 sm:py-2 text-sm sm:text-base font-semibold ${isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} active:scale-95 transition`}
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="rounded-lg sm:rounded-full px-5 py-3 sm:py-2 text-sm sm:text-base font-semibold text-white shadow transition active:scale-95 bg-pink-600 hover:bg-pink-700 hover:shadow-md"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================== */}
      {/* EDIT MODAL - COMPACT VERSION */}
      {/* ========================== */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
          <div className={`w-full max-w-md rounded-2xl border ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-pink-100 bg-white"} p-4 sm:p-5 shadow-2xl max-h-[85vh] flex flex-col`}>
            <div className={`mb-4 flex items-center justify-between sticky top-0 ${isDarkMode ? "bg-slate-800" : "bg-white"} pb-3 border-b ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
              <h2 className={`text-lg font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"} pr-2`}>
                Update Request
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={`shrink-0 inline-flex items-center justify-center w-7 h-7 text-lg ${isDarkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"} rounded-full transition`}
              >
                ✕
              </button>
            </div>

            {/* COMPACT REQUEST INFO */}
            <div className={`mb-4 rounded-xl ${isDarkMode ? "bg-pink-900/20" : "bg-pink-50/60"} p-3 text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-xs truncate ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                    {selectedRequest.name}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                    {selectedRequest.full_name || "-"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-green-600">
                    ₹{selectedRequest.estimated_cost ? parseInt(selectedRequest.estimated_cost).toLocaleString() : "0"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedRequest.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : selectedRequest.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"}`}>
                    {selectedRequest.status || "-"}
                  </span>
                </div>
              </div>
              <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                {selectedRequest.pickup_city || selectedRequest.pickup_pincode || "-"} → {selectedRequest.delivery_city || selectedRequest.delivery_pincode || "-"}
              </p>
            </div>

            <div className="modal-scroll-container flex-1 custom-scrollbar pr-1">
              <div className="space-y-4">
                {/* STATUS */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-gray-50 text-gray-900"} px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300 transition`}
                    disabled={selectedRequest.status === "Completed"}
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* PAYMENT STATUS */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Payment Status
                  </label>
                  <select
                    name="payment_status"
                    value={editForm.payment_status}
                    onChange={handleEditChange}
                    className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-gray-50 text-gray-900"} px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300 transition`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {/* COMPANY */}
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Assign Company
                  </label>
                  <select
                    name="company_name"
                    value={editForm.company_name}
                    onChange={handleEditChange}
                    className={`w-full rounded-lg border ${isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-gray-300 bg-gray-50 text-gray-900"} px-3 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-300 transition`}
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
            </div>

            {/* ACTIONS */}
            <div className={`mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sticky bottom-0 ${isDarkMode ? "bg-slate-800" : "bg-white"} pt-4 border-t ${isDarkMode ? "border-slate-700" : "border-gray-100"}`}>
              <button
                onClick={() => setShowEditModal(false)}
                className={`rounded-lg px-4 py-2 text-xs font-medium ${isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} active:scale-95 transition`}
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={selectedRequest.status === "Completed"}
                className={`rounded-lg px-4 py-2 text-xs font-medium text-white shadow transition active:scale-95 ${selectedRequest.status === "Completed"
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
          <div className={`w-full max-w-sm rounded-2xl border ${isDarkMode ? "border-red-900/50 bg-slate-800" : "border-red-200 bg-white"} p-4 sm:p-5 shadow-2xl`}>
            <h2 className={`text-lg font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
              Delete Request?
            </h2>
            <p className={`mt-3 text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
              You are about to delete{" "}
              <span className={`font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{selectedRequest.name}</span>.
            </p>
            <p className={`mt-2 text-xs text-red-500 font-medium`}>
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`rounded-lg px-4 py-2 text-xs font-medium ${isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} active:scale-95 transition`}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={selectedRequest.status === "Completed"}
                className={`rounded-lg px-4 py-2 text-xs font-medium text-white shadow transition active:scale-95 ${selectedRequest.status === "Completed"
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