// src/pages/admin/ManageCompanies.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaSyncAlt, FaSearch } from "react-icons/fa";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const toArray = (val) =>
  Array.isArray(val)
    ? val
    : String(val || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

const ManageCompanies = () => {
  const { isDarkMode } = useAdminThemeStore();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form State (Add/Edit)
  const [form, setForm] = useState({
    company_name: "",
    manager_email: "",
    personal_contact_name: "",
    phone: "",
    address: "",
    location: "",
    pincode: "",
    description: "",
    services_offered: "",
    areas_covered: "",
    company_gallery: "",
    includes: "",
    material: "",
    protection: "",
    furniture: "",
    appliances: "",
    swb_van_quantity: 0,
    mwb_van_quantity: 0,
    lwb_van_quantity: 0,
    swb_van_images: "",
    mwb_van_images: "",
    lwb_van_images: "",
    loading_cost_per_m3: 0,
    packing_cost_per_box: 0,
    assembly_cost_per_item: 0,
    cost_per_mile_under_25: 0,
    cost_per_mile_over_25: 0,
    subscription_plan: "Free",
    subscription_start_date: "",
    subscription_end_date: "",
    is_active: 1,
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ------------------------------
  // FETCH COMPANIES
  // ------------------------------
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching companies...');
      const res = await api.get("localmoves.api.dashboard.get_all_companies");
      console.log('✅ Get companies response:', res);
      console.log('📦 Response data:', res.data);
      const data = res.data?.message?.data || [];
      console.log('🏢 Parsed companies:', data);
      console.log('📊 Number of companies:', data.length);
      setCompanies(data);
    } catch (error) {
      console.error("❌ Failed to load companies:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ------------------------------
  // INPUT CHANGE
  // ------------------------------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: e.target.checked ? 1 : 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ------------------------------
  // ADD / UPDATE COMPANY
  // ------------------------------
  const handleSubmit = async () => {
    try {
      // Convert comma-separated strings to arrays for API
      const payload = {
        ...form,
        areas_covered: toArray(form.areas_covered),
        company_gallery: toArray(form.company_gallery),
        includes: toArray(form.includes),
        material: toArray(form.material),
        protection: toArray(form.protection),
        furniture: toArray(form.furniture),
        appliances: toArray(form.appliances),
        swb_van_images: toArray(form.swb_van_images),
        mwb_van_images: toArray(form.mwb_van_images),
        lwb_van_images: toArray(form.lwb_van_images),
      };

      console.log('📤 Submitting payload:', payload);

      if (editMode) {
        // For update, use the original company_name from selectedCompany
        console.log('✏️ Updating company:', selectedCompany.company_name);
        const updateRes = await api.post("localmoves.api.dashboard.update_company", {
          ...payload,
          company_name: selectedCompany.company_name,
        });
        console.log('✅ Update response:', updateRes);
        toast.success("Company updated successfully!");
      } else {
        console.log('➕ Creating new company');
        const createRes = await api.post("localmoves.api.dashboard.create_company", payload);
        console.log('✅ Create response:', createRes);
        console.log('📦 Create response data:', createRes.data);
        toast.success("Company created successfully!");
      }

      setShowModal(false);
      console.log('🔄 Refreshing companies list...');
      await fetchCompanies();
    } catch (error) {
      console.error("❌ Failed to submit company:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  // ------------------------------
  // DELETE COMPANY
  // ------------------------------
  const handleDelete = async () => {
    try {
      await api.post("localmoves.api.dashboard.delete_company", {
        company_name: selectedCompany.company_name,
      });

      toast.success("Company deleted!");
      setShowDeleteModal(false);
      fetchCompanies();
    } catch (error) {
      console.error("Failed to delete company:", error);
      toast.error(
        "Company cannot be deleted because it is linked with payments."
      );
      setShowDeleteModal(false);
    }
  };

  // ------------------------------
  // OPEN ADD MODAL
  // ------------------------------
  const openAddModal = () => {
    setForm({
      company_name: "",
      manager_email: "",
      personal_contact_name: "",
      phone: "",
      address: "",
      location: "",
      pincode: "",
      description: "",
      services_offered: "",
      areas_covered: "",
      company_gallery: "",
      includes: "",
      material: "",
      protection: "",
      furniture: "",
      appliances: "",
      swb_van_quantity: 0,
      mwb_van_quantity: 0,
      lwb_van_quantity: 0,
      swb_van_images: "",
      mwb_van_images: "",
      lwb_van_images: "",
      loading_cost_per_m3: 0,
      packing_cost_per_box: 0,
      assembly_cost_per_item: 0,
      cost_per_mile_under_25: 0,
      cost_per_mile_over_25: 0,
      subscription_plan: "Free",
      subscription_start_date: "",
      subscription_end_date: "",
      is_active: 1,
    });
    setEditMode(false);
    setSelectedCompany(null);
    setShowModal(true);
  };

  // ------------------------------
  // OPEN EDIT MODAL
  // ------------------------------
  const openEditModal = (row) => {
    setForm({
      company_name: row.company_name || "",
      manager_email: row.manager_email || "",
      personal_contact_name: row.personal_contact_name || "",
      phone: row.phone || "",
      address: row.address || "",
      location: row.location || "",
      pincode: row.pincode || "",
      description: row.description || "",
      services_offered: row.services_offered || "",
      areas_covered: Array.isArray(row.areas_covered) ? row.areas_covered.join(", ") : row.areas_covered || "",
      company_gallery: Array.isArray(row.company_gallery) ? row.company_gallery.join(", ") : row.company_gallery || "",
      includes: Array.isArray(row.includes) ? row.includes.join(", ") : row.includes || "",
      material: Array.isArray(row.material) ? row.material.join(", ") : row.material || "",
      protection: Array.isArray(row.protection) ? row.protection.join(", ") : row.protection || "",
      furniture: Array.isArray(row.furniture) ? row.furniture.join(", ") : row.furniture || "",
      appliances: Array.isArray(row.appliances) ? row.appliances.join(", ") : row.appliances || "",
      swb_van_quantity: row.swb_van_quantity || 0,
      mwb_van_quantity: row.mwb_van_quantity || 0,
      lwb_van_quantity: row.lwb_van_quantity || 0,
      swb_van_images: Array.isArray(row.swb_van_images) ? row.swb_van_images.join(", ") : row.swb_van_images || "",
      mwb_van_images: Array.isArray(row.mwb_van_images) ? row.mwb_van_images.join(", ") : row.mwb_van_images || "",
      lwb_van_images: Array.isArray(row.lwb_van_images) ? row.lwb_van_images.join(", ") : row.lwb_van_images || "",
      loading_cost_per_m3: row.loading_cost_per_m3 || 0,
      packing_cost_per_box: row.packing_cost_per_box || 0,
      assembly_cost_per_item: row.assembly_cost_per_item || 0,
      cost_per_mile_under_25: row.cost_per_mile_under_25 || 0,
      cost_per_mile_over_25: row.cost_per_mile_over_25 || 0,
      subscription_plan: row.subscription_plan || "Free",
      subscription_start_date: row.subscription_start_date || "",
      subscription_end_date: row.subscription_end_date || "",
      is_active: row.is_active ?? 1,
    });
    setEditMode(true);
    setSelectedCompany(row);
    setShowModal(true);
  };

  // ------------------------------
  // OPEN DELETE MODAL
  // ------------------------------
  const confirmDelete = (row) => {
    setSelectedCompany(row);
    setShowDeleteModal(true);
  };

  return (
    <div
      className={`space-y-4 pb-6 transition-colors overflow-x-hidden ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
        }`}
    >
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
        
        .floating-label {
          position: absolute;
          top: 12px;
          left: 16px;
          font-size: 12px;
          transition: all 0.2s;
          pointer-events: none;
        }
        
        .peer:focus ~ .floating-label,
        .peer:not(:placeholder-shown) ~ .floating-label {
          top: 4px;
          font-size: 10px;
          color: #ec4899;
          font-weight: 500;
        }
        
        .peer:focus ~ .floating-label {
          color: #ec4899;
        }
        
        /* Improve number input appearance */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
        
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
      `}</style>

      {/* HEADER */}
      <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className={`text-lg md:text-xl font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}
          >
            Companies
          </h1>
          <p
            className={`text-xs md:text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
          >
            View and manage partner logistics companies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchCompanies}
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
            className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] md:text-xs font-semibold text-white shadow ${isDarkMode
              ? "bg-pink-600 hover:bg-pink-700"
              : "bg-gradient-to-r from-pink-500 to-pink-600 hover:brightness-110"
              }`}
            onClick={openAddModal}
          >
            <FaPlus className="w-3 h-3" />
            Add Company
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div
        className={`rounded-2xl border p-3 md:p-4 shadow-sm backdrop-blur transition-colors ${isDarkMode
          ? "border-slate-700 bg-slate-800/50"
          : "border-pink-100 bg-white/80"
          }`}
      >
        <div className="relative max-w-md">
          <span
            className={`pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
              }`}
          >
            <FaSearch className="h-3 w-3" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or manager email..."
            className={`w-full rounded-full border py-2 pl-8 pr-3 text-xs outline-none focus:ring-2 transition-colors ${isDarkMode
              ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:ring-pink-500/20"
              : "border-pink-100 bg-white text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-pink-100"
              }`}
          />
        </div>
      </div>

      {/* TABLE */}
      <div
        className={`rounded-2xl border p-0 shadow-sm backdrop-blur ${isDarkMode
          ? "border-slate-700 bg-slate-800/50"
          : "border-pink-100 bg-white/80"
          }`}
      >
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent border-pink-400" />
              <p
                className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`}
              >
                Loading companies…
              </p>
            </div>
          </div>
        ) : companies.filter((c) => {
          const matchesSearch =
            !search ||
            (c.company_name || "")
              .toLowerCase()
              .includes(search.trim().toLowerCase()) ||
            (c.manager_email || "")
              .toLowerCase()
              .includes(search.trim().toLowerCase());
          return matchesSearch;
        }).length === 0 ? (
          <div
            className={`flex h-40 items-center justify-center px-4 text-center text-xs md:text-sm ${isDarkMode ? "text-slate-400" : "text-gray-400"
              }`}
          >
            No companies found.
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto scroll-thin-pink rounded-2xl">
              <table className="min-w-full text-xs md:text-sm">
                <thead
                  className={
                    isDarkMode
                      ? "bg-slate-700/50 text-slate-300"
                      : "bg-pink-50/70 text-gray-600"
                  }
                >
                  <tr>
                    <th className="py-2.5 px-3 text-left font-medium">
                      Company
                    </th>
                    <th className="py-2.5 px-3 text-left font-medium">
                      Manager
                    </th>
                    <th className="py-2.5 px-3 text-left font-medium hidden lg:table-cell">
                      Phone
                    </th>
                    <th className="py-2.5 px-3 text-left font-medium">Plan</th>
                    <th className="py-2.5 px-3 text-left font-medium">
                      Status
                    </th>
                    <th className="py-2.5 px-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {companies.filter((c) => {
                    const matchesSearch =
                      !search ||
                      (c.company_name || "")
                        .toLowerCase()
                        .includes(search.trim().toLowerCase()) ||
                      (c.manager_email || "")
                        .toLowerCase()
                        .includes(search.trim().toLowerCase());
                    return matchesSearch;
                  }).map((c, idx) => {
                    const isActive = !!c.is_active;
                    return (
                      <tr
                        key={c.company_name + c.manager_email}
                        className={`border-t ${isDarkMode
                          ? `border-slate-700 ${idx % 2
                            ? "bg-slate-700/30"
                            : "bg-slate-700/10"
                          } hover:bg-slate-700/50`
                          : `border-gray-100 ${idx % 2 ? "bg-gray-50/40" : "bg-white/60"
                          } hover:bg-pink-50/80`
                          }`}
                      >
                        <td className="py-2.5 px-3 text-[11px] md:text-xs font-medium">
                          {c.company_name}
                        </td>

                        <td className="py-2.5 px-3 text-[11px] md:text-xs">
                          {c.manager_email || "-"}
                        </td>

                        <td className="py-2.5 px-3 hidden lg:table-cell text-[11px] md:text-xs">
                          {c.phone || "-"}
                        </td>

                        <td className="py-2.5 px-3 text-[11px] md:text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isDarkMode
                              ? "bg-pink-900/30 text-pink-300"
                              : "bg-pink-50 text-pink-600"
                              }`}
                          >
                            {c.subscription_plan || "-"}
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

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(c)}
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${isDarkMode
                                ? "border-slate-600 bg-slate-700 text-pink-300 hover:bg-slate-600"
                                : "border-pink-100 bg-white text-pink-600 hover:bg-pink-50"
                                }`}
                            >
                              <FaEdit className="mr-1 h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(c)}
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${isDarkMode
                                ? "border-red-900/50 bg-red-900/20 text-red-300 hover:bg-red-900/30"
                                : "border-red-100 bg-white text-red-500 hover:bg-red-50"
                                }`}
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

            {/* MOBILE CARDS */}
            <div className="block md:hidden divide-y divide-gray-100">
              {companies.filter((c) => {
                const matchesSearch =
                  !search ||
                  (c.company_name || "")
                    .toLowerCase()
                    .includes(search.trim().toLowerCase()) ||
                  (c.manager_email || "")
                    .toLowerCase()
                    .includes(search.trim().toLowerCase());
                return matchesSearch;
              }).map((c) => {
                const isActive = !!c.is_active;
                return (
                  <div
                    key={c.company_name + c.manager_email}
                    className={`px-3 py-3 flex flex-col gap-2 ${isDarkMode ? "bg-slate-900/40" : "bg-white/90"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-[11px] font-semibold break-all ${isDarkMode ? "text-slate-100" : "text-gray-900"
                            }`}
                        >
                          {c.company_name}
                        </p>
                        <p
                          className={`text-xs mt-0.5 break-all ${isDarkMode ? "text-slate-300" : "text-gray-800"
                            }`}
                        >
                          {c.manager_email || "-"}
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
                          {c.subscription_plan || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2 text-[11px]">
                      <div className="flex flex-col">
                        <span
                          className={`${isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
                          Phone: {c.phone || "-"}
                        </span>

                        <span
                          className={`${isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
                          Address: {c.address || "-"}
                        </span>

                        <span
                          className={`${isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
                          Location: {c.location || "-"}
                          {c.pincode ? `, ${c.pincode}` : ""}
                        </span>
                      </div>

                      <div className="flex justify-end gap-1.5 w-full xs:w-auto">
                        <button
                          onClick={() => openEditModal(c)}
                          className={`flex-1 xs:flex-none inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${isDarkMode
                            ? "border-slate-600 bg-slate-700 text-pink-300 hover:bg-slate-600"
                            : "border-pink-100 bg-white text-pink-600 hover:bg-pink-50"
                            }`}
                        >
                          <FaEdit className="mr-1 h-3 w-3" />
                          Edit
                        </button>

                        <button
                          onClick={() => confirmDelete(c)}
                          className={`flex-1 xs:flex-none inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${isDarkMode
                            ? "border-red-900/50 bg-red-900/20 text-red-300 hover:bg-red-900/30"
                            : "border-red-100 bg-white text-red-500 hover:bg-red-50"
                            }`}
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
          </>
        )}
      </div>

      {/* ===================== ADD / EDIT MODAL ===================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className={`rounded-2xl shadow-xl p-3 sm:p-4 w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl border max-h-[85vh] flex flex-col my-4 ${isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-pink-100"
            }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg md:text-xl font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"
                }`}>
                {editMode ? "Edit Company" : "Add New Company"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`text-lg ${isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                ×
              </button>
            </div>

            <div className="modal-scroll-container flex-1 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {!editMode && (
                  <div className="relative">
                    <input
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                        ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500 placeholder:text-slate-500"
                        : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 placeholder:text-gray-400"
                        }`}
                      placeholder=" "
                    />
                    <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}>Company Name *</label>
                  </div>
                )}

                <div className="relative">
                  <input
                    name="manager_email"
                    type="email"
                    value={form.manager_email}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Manager Email *</label>
                </div>

                <div className="relative">
                  <input
                    name="personal_contact_name"
                    value={form.personal_contact_name}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Contact Person</label>
                </div>

                <div className="relative">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Phone</label>
                </div>

                <div className="relative md:col-span-2">
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={`peer h-14 w-full rounded-xl border px-4 pt-4 text-sm outline-none transition-colors resize-none ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                    rows="2"
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Address</label>
                </div>

                <div className="relative">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Location</label>
                </div>

                <div className="relative">
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Pincode</label>
                </div>

                <div className="relative md:col-span-2">
                  <select
                    name="subscription_plan"
                    value={form.subscription_plan}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                  >
                    <option value="Free">Free</option>
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Subscription Plan</label>
                </div>

                <div className="relative">
                  <input
                    name="swb_van_quantity"
                    type="number"
                    value={form.swb_van_quantity}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>SWB Van Quantity</label>
                </div>

                <div className="relative">
                  <input
                    name="mwb_van_quantity"
                    type="number"
                    value={form.mwb_van_quantity}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>MWB Van Quantity</label>
                </div>

                <div className="relative">
                  <input
                    name="lwb_van_quantity"
                    type="number"
                    value={form.lwb_van_quantity}
                    onChange={handleChange}
                    className={`peer h-9 w-full rounded-xl border px-4 pt-2.5 text-sm outline-none transition-colors ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>LWB Van Quantity</label>
                </div>

                <div className="relative md:col-span-2">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={`peer h-14 w-full rounded-xl border px-4 pt-4 text-sm outline-none transition-colors resize-none ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                    rows="2"
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Description</label>
                </div>

                <div className="relative md:col-span-2">
                  <textarea
                    name="services_offered"
                    value={form.services_offered}
                    onChange={handleChange}
                    className={`peer h-14 w-full rounded-xl border px-4 pt-4 text-sm outline-none transition-colors resize-none ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                    rows="2"
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Services Offered (comma separated)</label>
                </div>

                <div className="relative md:col-span-2">
                  <textarea
                    name="areas_covered"
                    value={form.areas_covered}
                    onChange={handleChange}
                    className={`peer h-14 w-full rounded-xl border px-4 pt-4 text-sm outline-none transition-colors resize-none ${isDarkMode
                      ? "border-slate-600 bg-slate-700/50 text-slate-100 focus:border-pink-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                      }`}
                    placeholder=" "
                    rows="2"
                  />
                  <label className={`floating-label ${isDarkMode ? "text-slate-400" : "text-gray-600"
                    }`}>Areas Covered (comma separated)</label>
                </div>

                <div className="relative md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active === 1}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked ? 1 : 0 })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label className={`ml-2 text-sm ${isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}>
                      Active Company
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4" style={isDarkMode ? { borderColor: '#475569' } : { borderColor: '#f3f4f6' }}>
              <button
                onClick={() => setShowModal(false)}
                className={`rounded-xl px-5 py-2.5 text-xs md:text-sm font-medium transition-colors ${isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-2.5 text-xs md:text-sm font-medium text-white shadow hover:opacity-90 transition-opacity"
              >
                {editMode ? "Save Changes" : "Create Company"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE MODAL ===================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl p-6 w-full max-w-md border ${isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-pink-200"
            }`}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"
              }`}>
              Delete Company?
            </h2>
            <p className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
              Are you sure you want to delete{" "}
              <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-900"
                }`}>{selectedCompany?.company_name}</span>?
              This company cannot be deleted if linked with payments.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`rounded-xl px-5 py-2.5 text-xs md:text-sm font-medium transition-colors ${isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-xs md:text-sm font-medium text-white shadow hover:bg-red-600 transition-colors"
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

export default ManageCompanies;