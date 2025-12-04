// src/pages/admin/ManageCompanies.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaSyncAlt } from "react-icons/fa";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";



const ManageCompanies = () => {
  const { isDarkMode } = useAdminThemeStore();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State (Add/Edit)
  const [form, setForm] = useState({
    company_name: "",
    manager_email: "",
    phone: "",
    address: "",
    location: "",
    pincode: "",
    subscription_plan: "Free",
    is_active: 1,
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ------------------------------
  // FETCH COMPANIES
  // ------------------------------
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("localmoves.api.dashboard.get_all_companies");
      const data = res.data?.message?.data || [];
      setCompanies(data);
    } catch {
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ------------------------------
  // ADD / UPDATE COMPANY
  // ------------------------------
  const handleSubmit = async () => {
    try {
      if (editMode) {
        // ✅ FIXED UPDATE PAYLOAD (using your latest API)
        const payload = {
          company_name: selectedCompany.company_name,
          manager_email: form.manager_email,
          phone: form.phone,
          address: form.address,
          location: form.location,
          pincode: form.pincode,
          subscription_plan: form.subscription_plan,
          is_active: form.is_active,
        };

        await api.post("localmoves.api.dashboard.update_company", payload);
        toast.success("Company updated successfully!");
      } else {
        await api.post("localmoves.api.dashboard.create_company", form);
        toast.success("Company created successfully!");
      }

      setShowModal(false);
      fetchCompanies();
    } catch (error) {
      console.error("Failed to submit company:", error);
      toast.error("Something went wrong.");
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
      phone: "",
      address: "",
      location: "",
      pincode: "",
      subscription_plan: "Free",
      is_active: 1,
    });
    setEditMode(false);
    setShowModal(true);
  };

  // ------------------------------
  // OPEN EDIT MODAL
  // ------------------------------
  const openEditModal = (row) => {
    setSelectedCompany(row);
    setForm({
      company_name: row.company_name,
      manager_email: row.manager_email,
      phone: row.phone,
      address: row.address,
      location: row.location,
      pincode: row.pincode,
      subscription_plan: row.subscription_plan,
      is_active: row.is_active,
    });
    setEditMode(true);
    setShowModal(true);
  };

  // ------------------------------
  // OPEN DELETE MODAL
  // ------------------------------
  const confirmDelete = (row) => {
    setSelectedCompany(row);
    setShowDeleteModal(true);
  };

  // ======================================================================
  // UI BEGINS HERE — EXACT SAME RESPONSIVENESS YOU ALREADY HAVE
  // ======================================================================
  return (
    <div
      className={`space-y-4 pb-6 transition-colors ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
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
      `}</style>

      {/* HEADER */}
      <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className={`text-lg md:text-xl font-semibold ${
              isDarkMode ? "text-slate-100" : "text-gray-900"
            }`}
          >
            Companies
          </h1>
          <p
            className={`text-xs md:text-sm ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            View and manage partner logistics companies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchCompanies}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] md:text-xs font-medium shadow-sm hover:shadow ${
              isDarkMode
                ? "border-slate-700 bg-slate-700/50 text-pink-300 hover:bg-slate-700"
                : "border-pink-200 bg-pink-100 text-pink-700 hover:bg-pink-200"
            }`}
          >
            <FaSyncAlt className="w-3 h-3" />
            Refresh
          </button>

          <button
            className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-[11px] md:text-xs font-semibold text-white shadow ${
              isDarkMode
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

      {/* TABLE */}
      <div
        className={`rounded-2xl border p-0 shadow-sm backdrop-blur ${
          isDarkMode
            ? "border-slate-700 bg-slate-800/50"
            : "border-pink-100 bg-white/80"
        }`}
      >
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent border-pink-400" />
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-400"
                }`}
              >
                Loading companies…
              </p>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div
            className={`flex h-40 items-center justify-center px-4 text-center text-xs md:text-sm ${
              isDarkMode ? "text-slate-400" : "text-gray-400"
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
                  {companies.map((c, idx) => {
                    const isActive = !!c.is_active;
                    return (
                      <tr
                        key={c.company_name + c.manager_email}
                        className={`border-t ${
                          isDarkMode
                            ? `border-slate-700 ${
                                idx % 2
                                  ? "bg-slate-700/30"
                                  : "bg-slate-700/10"
                              } hover:bg-slate-700/50`
                            : `border-gray-100 ${
                                idx % 2 ? "bg-gray-50/40" : "bg-white/60"
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
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isDarkMode
                                ? "bg-pink-900/30 text-pink-300"
                                : "bg-pink-50 text-pink-600"
                            }`}
                          >
                            {c.subscription_plan || "-"}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-[11px] md:text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isActive
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
                              className="inline-flex items-center rounded-full border border-pink-100 bg-white px-2.5 py-1 text-[10px] font-medium text-pink-600 hover:bg-pink-50"
                            >
                              <FaEdit className="mr-1 h-3 w-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(c)}
                              className="inline-flex items-center rounded-full border border-red-100 bg-white px-2.5 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
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
              {companies.map((c) => {
                const isActive = !!c.is_active;
                return (
                  <div
                    key={c.company_name + c.manager_email}
                    className={`px-3 py-3 flex flex-col gap-2 ${
                      isDarkMode ? "bg-slate-900/40" : "bg-white/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-[11px] font-semibold break-all ${
                            isDarkMode ? "text-slate-100" : "text-gray-900"
                          }`}
                        >
                          {c.company_name}
                        </p>
                        <p
                          className={`text-xs mt-0.5 break-all ${
                            isDarkMode ? "text-slate-300" : "text-gray-800"
                          }`}
                        >
                          {c.manager_email || "-"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isActive
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
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isDarkMode
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
                          className={`${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Phone: {c.phone || "-"}
                        </span>

                        <span
                          className={`${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Address: {c.address || "-"}
                        </span>

                        <span
                          className={`${
                            isDarkMode ? "text-slate-400" : "text-gray-500"
                          }`}
                        >
                          Location: {c.location || "-"}
                          {c.pincode ? `, ${c.pincode}` : ""}
                        </span>
                      </div>

                      <div className="flex justify-end gap-1.5 w-full xs:w-auto">
                        <button
                          onClick={() => openEditModal(c)}
                          className="flex-1 xs:flex-none inline-flex items-center justify-center rounded-full border border-pink-100 bg-white px-2.5 py-1 text-[10px] font-medium text-pink-600 hover:bg-pink-50"
                        >
                          <FaEdit className="mr-1 h-3 w-3" />
                          Edit
                        </button>

                        <button
                          onClick={() => confirmDelete(c)}
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
          </>
        )}
      </div>

      {/* ===================== ADD / EDIT MODAL ===================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-2xl space-y-6 border border-pink-100">
            <h2 className="text-lg font-semibold text-gray-800">
              {editMode ? "Edit Company" : "Add New Company"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editMode && (
                <div className="relative">
                  <input
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                    placeholder=" "
                  />
                  <label className="floating-label">Company Name</label>
                </div>
              )}

              <div className="relative">
                <input
                  name="manager_email"
                  value={form.manager_email}
                  onChange={handleChange}
                  className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                  placeholder=" "
                />
                <label className="floating-label">Manager Email</label>
              </div>

              <div className="relative">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                  placeholder=" "
                />
                <label className="floating-label">Phone</label>
              </div>

              <div className="relative">
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                  placeholder=" "
                />
                <label className="floating-label">Address</label>
              </div>

              <div className="relative">
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                  placeholder=" "
                />
                <label className="floating-label">Location</label>
              </div>

              <div className="relative">
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                  placeholder=" "
                />
                <label className="floating-label">Pincode</label>
              </div>

              <div className="relative md:col-span-2">
                <select
                  name="subscription_plan"
                  value={form.subscription_plan}
                  onChange={handleChange}
                  className="peer h-12 w-full rounded-xl border border-gray-300 px-4 pt-4 text-sm outline-none focus:border-pink-500"
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
                <label className="floating-label">Subscription Plan</label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-gray-200 px-5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-2 text-xs font-medium text-white shadow hover:opacity-90"
              >
                {editMode ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE MODAL ===================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-md border border-pink-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Delete Company?
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              This company cannot be deleted if linked with payments.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl bg-gray-200 px-5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-5 py-2 text-xs font-medium text-white shadow hover:bg-red-600"
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
