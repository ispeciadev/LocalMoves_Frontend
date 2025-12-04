// src/pages/admin/ManagePayments.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSync,
  FaEdit,
  FaTrash,
  FaDownload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";
import AdminStatsCard from "../../components/admin/AdminStatsCard";
import AdminChart from "../../components/admin/AdminChart";
import AdminTable from "../../components/admin/AdminTable";

// ================== TABLE COLUMNS ==================
const columns = [
  { key: "name", label: "Payment ID" },
  { key: "company_name", label: "Company" },
  { key: "subscription_plan", label: "Plan" },
  { key: "amount_display", label: "Amount" },
  { key: "payment_date_display", label: "Date" },
  { key: "payment_status", label: "Status" },
];

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount, currency = "INR") => {
  if (amount == null) return "-";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const getPaymentDate = (p) => {
  const raw =
    p.paid_date || p.payment_date || p.created_at || p.creation || null;
  const d = raw ? new Date(raw) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return d;
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const res = new Date(d);
  res.setDate(d.getDate() - diff);
  return startOfDay(res);
};

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const aggregatePayments = (payments, range) => {
  const paid = payments.filter((p) => p.payment_status === "Paid");
  if (!paid.length) return [];

  const buckets = new Map();

  paid.forEach((p) => {
    const d = getPaymentDate(p);
    if (!d) return;

    let bucketKey;
    let label;

    if (range === "week") {
      const s = startOfWeek(d);
      bucketKey = s.getTime();
      label = "Week of " + s.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    } else if (range === "month") {
      const s = startOfMonth(d);
      bucketKey = s.getTime();
      label = s.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      });
    } else {
      const s = startOfDay(d);
      bucketKey = s.getTime();
      label = s.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    }

    const prev = buckets.get(bucketKey) || { name: label, amount: 0 };
    prev.amount += p.amount || 0;
    buckets.set(bucketKey, prev);
  });

  const sorted = Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v);

  if (range === "day") return sorted.slice(-7);
  if (range === "week") return sorted.slice(-8);
  return sorted.slice(-6);
};

const ManagePayments = () => {
  const { isDarkMode } = useAdminThemeStore();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    invoice_number: "",
    subscription_plan: "Standard",
    amount: "",
    payment_status: "Paid", // Paid / Refunded / Failed
    notes: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chartRange, setChartRange] = useState("day");

  // ================== FETCH PAYMENTS ==================
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("localmoves.api.dashboard.get_all_payments");
      const data = res.data?.message?.data || [];
      setPayments(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load only
    const loadInitialPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get("localmoves.api.dashboard.get_all_payments");
        const data = res.data?.message?.data || [];
        setPayments(data);
      } catch (error) {
        console.error("Failed to load initial payments:", error);
        toast.error("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialPayments();
  }, []);

  // ================== STATS ==================
  const stats = useMemo(() => {
    const totalPaid = payments
      .filter((p) => p.payment_status === "Paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const successfulCount = payments.filter(
      (p) => p.payment_status === "Paid"
    ).length;

    const refundedCount = payments.filter(
      (p) => p.payment_status === "Refunded"
    ).length;

    const chartData = aggregatePayments(payments, chartRange);

    return {
      totalRevenue: totalPaid,
      successfulCount,
      refundedCount,
      chartData,
    };
  }, [payments, chartRange]);

  // ================== FORM HANDLING ==================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? value.replace(/[^\d]/g, "") : value,
    }));
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedPayment(null);
    setForm({
      company_name: "",
      invoice_number: "",
      subscription_plan: "Standard",
      amount: "",
      payment_status: "Paid",
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (row) => {
    setEditMode(true);
    setSelectedPayment(row);
    setForm({
      company_name: row.company_name || "",
      invoice_number: row.invoice_number || "",
      subscription_plan: row.subscription_plan || "Standard",
      amount: row.amount || "",
      payment_status: row.payment_status || "Paid",
      notes: row.notes || "",
    });
    setShowModal(true);
  };

  // ================== SUBMIT ==================
  const handleSubmit = async () => {
    try {
      if (editMode) {
        if (!selectedPayment?.name) {
          toast.error("Invalid payment selected.");
          return;
        }

        // Only PAID is locked from changing status
        if (
          selectedPayment.payment_status === "Paid" &&
          form.payment_status !== "Paid"
        ) {
          toast.error("Paid payments are locked. Only notes can be changed.");
          return;
        }

        // Send both `status` and `payment_status` so it matches your API either way
        const payload = {
          payment_id: selectedPayment.name,
          status: form.payment_status,
          payment_status: form.payment_status,
          notes: form.notes || "",
        };

        await api.post("localmoves.api.dashboard.update_payment", payload);
        toast.success("Payment updated successfully!");
      } else {
        if (
          !form.company_name.trim() ||
          !form.invoice_number.trim() ||
          !form.subscription_plan.trim() ||
          !form.amount
        ) {
          toast.warn("All fields are required.");
          return;
        }

        const amountNumber = Number(form.amount);
        if (!amountNumber || amountNumber <= 0) {
          toast.warn("Amount must be a positive number.");
          return;
        }

        const payload = {
          company_name: form.company_name.trim(),
          invoice_number: form.invoice_number.trim(),
          subscription_plan: form.subscription_plan,
          amount: amountNumber,
          status: form.payment_status,
          payment_status: form.payment_status,
        };

        await api.post("localmoves.api.dashboard.create_payment", payload);
        toast.success("Payment created successfully!");
      }

      setShowModal(false);
      fetchPayments();
    } catch (error) {
      const serverMsg =
        error.response?.data?.message?.error ||
        error.response?.data?._server_messages;

      console.error("Failed to save payment:", error);
      toast.error(serverMsg || "Failed to save payment.");
    }
  };

  // ================== DELETE ==================
  const confirmDelete = (row) => {
    setSelectedPayment(row);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedPayment?.name) {
      toast.error("Invalid payment selected.");
      return;
    }

    try {
      await api.post("localmoves.api.dashboard.delete_payment", {
        payment_id: selectedPayment.name,
      });
      toast.success("Payment deleted successfully.");
      setShowDeleteModal(false);
      fetchPayments();
    } catch (error) {
      const msg =
        error.response?.data?.message?.error ||
        "Unable to delete payment.";
      console.error("Failed to delete payment:", error);
      toast.error(msg);
      setShowDeleteModal(false);
    }
  };

  // ================== PAGINATION ==================
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  // ================== TABLE ROWS ==================
  const rows = payments.map((p) => ({
    ...p,
    amount_display: formatCurrency(p.amount, "INR"),
    payment_date_display: formatDateTime(p.payment_date),
    actions: (
      <div className="flex justify-end gap-3">
        <button
          className="text-pink-600 hover:text-pink-700"
          onClick={() => openEditModal(p)}
        >
          <FaEdit />
        </button>

        <button
          disabled={p.payment_status === "Paid"}
          className={`${
            p.payment_status === "Paid"
              ? "text-gray-300 cursor-not-allowed"
              : "text-red-500 hover:text-red-600"
          }`}
          onClick={() =>
            p.payment_status !== "Paid" ? confirmDelete(p) : null
          }
        >
          <FaTrash />
        </button>
      </div>
    ),
  }));

  const chartRangeLabel =
    chartRange === "day" ? "by Day" : chartRange === "week" ? "by Week" : "by Month";

  // ================== STATUS COLOR ==================
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "Refunded":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={`space-y-5 p-3 sm:p-4 md:p-6 transition-colors ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
    }`}>
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className={`text-lg font-semibold transition-colors ${
            isDarkMode ? "text-slate-100" : "text-gray-900"
          }`}>Payments</h1>
          <p className={`text-xs transition-colors ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
            Monitor subscription payments and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchPayments}
            className={`rounded-full border px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
              isDarkMode
                ? "border-pink-900/30 text-pink-400 hover:bg-pink-900/20"
                : "border-pink-200 text-pink-600 hover:bg-pink-50"
            }`}
          >
            <FaSync className="text-[10px]" />
            Refresh
          </button>

          <button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                rows
                  .map(
                    (r) =>
                      `${r.name},${r.company_name},${r.subscription_plan},${r.amount},${r.payment_status}`
                  )
                  .join("\n");
              const a = document.createElement("a");
              a.href = encodeURI(csvContent);
              a.download = "payments.csv";
              a.click();
            }}
            className={`rounded-full px-4 py-2 text-xs text-white flex items-center gap-2 transition-colors ${
              isDarkMode
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-linear-to-r from-pink-500 to-pink-600 hover:opacity-90"
            }`}
          >
            <FaDownload className="text-[10px]" />
            CSV
          </button>

          <button
            onClick={openAddModal}
            className={`rounded-full px-4 py-2 text-xs text-white flex items-center gap-2 transition-colors ${
              isDarkMode
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-linear-to-r from-pink-500 to-pink-600 hover:opacity-90"
            }`}
          >
            <FaPlus className="text-[10px]" />
            Add Payment
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <AdminStatsCard
          title="Total Revenue (Paid)"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="All cleared payments"
          badge="Revenue"
        />
        <AdminStatsCard
          title="Successful Payments"
          value={stats.successfulCount.toString()}
          subtitle="Payments marked as Paid"
          badge="Success"
        />
        <AdminStatsCard
          title="Refunded Payments"
          value={stats.refundedCount.toString()}
          subtitle="Payments marked as Refunded"
          badge="Low"
        />
      </div>

      {/* CHART */}
      <div className={`rounded-2xl border p-4 shadow-sm transition ${
        isDarkMode
          ? "border-pink-900/30 bg-slate-900"
          : "border-pink-100 bg-white"
      }`}>
        <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
          <h2 className={`text-sm font-semibold transition ${
            isDarkMode ? "text-slate-100" : "text-gray-900"
          }`}>
            Payment Overview {chartRangeLabel}
          </h2>

          <div className={`flex rounded-full p-1 text-[11px] transition ${
            isDarkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-pink-50"
          }`}>
            <button
              onClick={() => setChartRange("day")}
              className={`px-3 py-1 rounded-full transition ${
                chartRange === "day"
                  ? isDarkMode
                    ? "bg-pink-600 text-white"
                    : "bg-white shadow text-pink-600"
                  : isDarkMode
                  ? "text-slate-400"
                  : "text-gray-600"
              }`}
            >
              D
            </button>
            <button
              onClick={() => setChartRange("week")}
              className={`px-3 py-1 rounded-full transition ${
                chartRange === "week"
                  ? isDarkMode
                    ? "bg-pink-600 text-white"
                    : "bg-white shadow text-pink-600"
                  : isDarkMode
                  ? "text-slate-400"
                  : "text-gray-600"
              }`}
            >
              W
            </button>
            <button
              onClick={() => setChartRange("month")}
              className={`px-3 py-1 rounded-full transition ${
                chartRange === "month"
                  ? isDarkMode
                    ? "bg-pink-600 text-white"
                    : "bg-white shadow text-pink-600"
                  : isDarkMode
                  ? "text-slate-400"
                  : "text-gray-600"
              }`}
            >
              M
            </button>
          </div>
        </div>

        <AdminChart type="bar" data={stats.chartData} dataKey="amount" />
      </div>

      {/* TABLE */}
      <div className="hidden sm:block">
        <AdminTable
          title="All Payments"
          columns={[...columns, { key: "actions", label: "Actions" }]}
          rows={rows}
          loading={loading}
        />
      </div>

      {/* MOBILE CARD VIEW */}
      <div className={`block sm:hidden space-y-3 p-3 sm:p-4 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
            All Payments
          </h2>
        </div>

        {paginatedPayments.length === 0 ? (
          <div className={`rounded-xl border p-8 text-center transition ${
            isDarkMode
              ? "border-slate-700 bg-slate-800/50 text-slate-400"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }`}>
            No payments found.
          </div>
        ) : (
          <>
            {paginatedPayments.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border p-4 shadow-sm transition ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-800/50 text-slate-200"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                {/* Header: Payment ID + Company + Status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                      Payment ID
                    </p>
                    <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                      {p.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.payment_status)}`}>
                    {p.payment_status}
                  </span>
                </div>

                {/* Company & Plan */}
                <div className={`border-t pt-3 pb-3 transition ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Company</p>
                      <p className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
                        {p.company_name}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Plan</p>
                      <p className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
                        {p.subscription_plan}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount & Date */}
                <div className={`border-t pt-3 pb-3 transition ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Amount</p>
                      <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                        {formatCurrency(p.amount)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Date</p>
                      <p className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-gray-900"}`}>
                        {formatDateTime(p.payment_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`border-t pt-3 flex gap-2 transition ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => openEditModal(p)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isDarkMode
                        ? "bg-pink-900/20 text-pink-400 hover:bg-pink-900/30"
                        : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                    }`}
                  >
                    <FaEdit className="inline mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => p.payment_status !== "Paid" && confirmDelete(p)}
                    disabled={p.payment_status === "Paid"}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      p.payment_status === "Paid"
                        ? isDarkMode
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-red-900/20 text-red-400 hover:bg-red-900/30"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <FaTrash className="inline mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
          </>
        )}
      </div>

      {/* ================== ADD / EDIT MODAL ================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className={`w-[95%] max-w-2xl rounded-2xl p-6 border shadow-xl space-y-4 transition ${
            isDarkMode
              ? "border-slate-700 bg-slate-900"
              : "border-pink-100 bg-white"
          }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold transition ${
                isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}>
                {editMode ? "Edit Payment" : "Add New Payment"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`text-xs transition ${
                  isDarkMode
                    ? "text-slate-400 hover:text-slate-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ✕
              </button>
            </div>

            <p className={`text-[11px] transition ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}>
              {editMode
                ? "Only status & notes can be updated. Billing details are locked."
                : "Fill details carefully. Invoice & amount cannot be edited later."}
            </p>

            <div className="grid md:grid-cols-2 gap-3">
              {/* Company Name */}
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${
                  isDarkMode ? "text-slate-200" : "text-gray-700"
                }`}>Company Name *</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                  }`}
                  disabled={editMode}
                />
              </div>

              {/* Invoice Number */}
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${
                  isDarkMode ? "text-slate-200" : "text-gray-700"
                }`}>Invoice Number *</label>
                <input
                  name="invoice_number"
                  value={form.invoice_number}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                  }`}
                  disabled={editMode}
                />
              </div>

              {/* Subscription Plan */}
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${
                  isDarkMode ? "text-slate-200" : "text-gray-700"
                }`}>Subscription Plan *</label>
                <select
                  name="subscription_plan"
                  value={form.subscription_plan}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                  }`}
                  disabled={editMode}
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${
                  isDarkMode ? "text-slate-200" : "text-gray-700"
                }`}>Amount (INR) *</label>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                  }`}
                  disabled={editMode}
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className={`text-[11px] font-medium transition ${
                  isDarkMode ? "text-slate-200" : "text-gray-700"
                }`}>Payment Status</label>
                <select
                  name="payment_status"
                  value={form.payment_status}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                  }`}
                  disabled={editMode && selectedPayment?.payment_status === "Paid"}
                >
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </select>

                {editMode && selectedPayment?.payment_status === "Paid" && (
                  <span className={`text-[10px] mt-1 transition ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}>
                    Paid payments are locked — only internal notes allowed.
                  </span>
                )}
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className={`text-[11px] font-medium transition ${
                  isDarkMode ? "text-slate-200" : "text-gray-700"
                }`}>Notes (Internal)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none min-h-[90px] ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                      : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowModal(false)}
                className={`text-sm px-4 py-2 rounded-full transition ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="bg-pink-600 text-white text-sm px-5 py-2 rounded-full hover:bg-pink-700 transition"
              >
                {editMode ? "Save Changes" : "Create Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== DELETE MODAL ================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className={`w-[95%] max-w-md rounded-2xl p-6 border shadow-xl transition ${
            isDarkMode
              ? "border-slate-700 bg-slate-900"
              : "border-pink-100 bg-white"
          }`}>
            <h2 className={`text-lg font-semibold transition ${
              isDarkMode ? "text-slate-100" : "text-gray-900"
            }`}>Delete Payment?</h2>
            <p className={`mt-2 text-sm transition ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}>
              Delete payment <b>{selectedPayment?.name}</b>?{" "}
              Paid payments cannot be deleted.
            </p>

            <div className="flex justify-end gap-2 mt-5 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 text-xs rounded-full transition ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 px-4 py-2 text-xs text-white rounded-full hover:bg-red-600 transition"
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

export default ManagePayments;
