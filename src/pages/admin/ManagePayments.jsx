// src/pages/admin/ManagePayments.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaDownload,
  FaPercent,
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
    payment_status: "Paid",
    notes: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chartRange, setChartRange] = useState("day");
  const [recentRequestPayments, setRecentRequestPayments] = useState([]);
  const [requestPaymentsPage, setRequestPaymentsPage] = useState(1);
  const requestPaymentsPerPage = 10;

  // States for deleting request payments
  const [showDeleteRequestPaymentModal, setShowDeleteRequestPaymentModal] = useState(false);
  const [editingRequestPayment, setEditingRequestPayment] = useState(null);

  // ================== DEPOSIT PERCENTAGE STATES ==================
  const [depositPercentage, setDepositPercentage] = useState(10.0);
  const [editingDeposit, setEditingDeposit] = useState(false);
  const [tempDepositValue, setTempDepositValue] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("GBP");
  const [authError, setAuthError] = useState(false);

  // ================== FETCH PAYMENTS ==================
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      const res = await api.get("localmoves.api.dashboard.get_all_payments");
      const data = res.data?.message?.data || [];
      setPayments(data);
      setCurrentPage(1);
      setAuthError(false);

      await fetchRecentRequestPayments();

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsedTime));
      }
    } catch (error) {
      console.error("Payment fetch error:", error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setAuthError(true);
        toast.error("Authentication error. Please check your login.");
      } else if (error.response?.status === 404) {
        toast.error("API endpoint not found.");
      } else {
        toast.error("Failed to load payments.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================== FETCH ALL REQUEST PAYMENTS ==================
  const fetchRecentRequestPayments = async () => {
    try {
      const res = await api.get("localmoves.api.dashboard.get_all_requests");
      const data = res.data?.message?.data || [];

      const paymentData = data.map(req => {
        let status = req.payment_status || "Pending";
        if (status === "Deposit Paid") status = "Paid";
        if (!["Paid", "Refunded", "Failed", "Pending"].includes(status)) {
          status = "Pending";
        }

        return {
          name: req.name,
          company_name: req.company_name,
          total_amount: req.estimated_cost || 0,
          deposit_amount: (req.estimated_cost || 0) * (depositPercentage / 100),
          remaining_amount: (req.estimated_cost || 0) * (1 - (depositPercentage / 100)),
          payment_status: status,
          request_id: req.name,
        };
      });
      setRecentRequestPayments(paymentData);
      setRequestPaymentsPage(1);
    } catch (error) {
      console.error("Failed to load request payments:", error);
    }
  };

  // ================== FETCH DEPOSIT PERCENTAGE ==================
  const fetchDepositPercentage = async () => {
    try {
      const res = await api.get("localmoves.api.dashboard.get_current_deposit_percentage");
      const data = res.data?.message;
      if (data?.success) {
        setDepositPercentage(data.deposit_percentage);
        setDepositCurrency(data.currency || "GBP");
      }
    } catch (error) {
      console.error("Failed to fetch deposit percentage:", error);
    }
  };

  // ================== UPDATE DEPOSIT PERCENTAGE ==================
  const updateDepositPercentage = async () => {
    if (!tempDepositValue || isNaN(parseFloat(tempDepositValue))) {
      toast.warn("Please enter a valid percentage");
      return;
    }

    const newValue = parseFloat(tempDepositValue);
    if (newValue < 0 || newValue > 100) {
      toast.warn("Percentage must be between 0 and 100");
      return;
    }

    try {
      const res = await api.post(
        "localmoves.api.dashboard.update_deposit_percentage_quick",
        { deposit_percentage: newValue }
      );
      const data = res.data?.message;

      if (data?.success) {
        toast.success(data.message || "Deposit percentage updated");
        setDepositPercentage(newValue);
        setEditingDeposit(false);
        setTempDepositValue("");
        fetchRecentRequestPayments();
      }
    } catch (error) {
      console.error("Failed to update deposit percentage:", error);
      toast.error(error.response?.data?.message || "Failed to update deposit percentage");
    }
  };

  useEffect(() => {
    const loadInitialPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get("localmoves.api.dashboard.get_all_payments");
        const data = res.data?.message?.data || [];
        setPayments(data);
        await fetchDepositPercentage();
      } catch (error) {
        console.error("Failed to load initial payments:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          setAuthError(true);
        }
        toast.error("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialPayments();
    fetchRecentRequestPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        if (
          selectedPayment.payment_status === "Paid" &&
          form.payment_status !== "Paid"
        ) {
          toast.error("Paid payments are locked. Only notes can be changed.");
          return;
        }

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

  // ================== REQUEST PAYMENT HANDLERS ==================
  const confirmDeleteRequestPayment = (payment) => {
    setEditingRequestPayment(payment);
    setShowDeleteRequestPaymentModal(true);
  };

  const handleDeleteRequestPayment = async () => {
    if (!editingRequestPayment?.request_id) {
      toast.error("Invalid request selected.");
      return;
    }

    try {
      await api.post("localmoves.api.dashboard.delete_request", {
        request_id: editingRequestPayment.request_id,
      });
      toast.success("Request payment deleted successfully.");
      setShowDeleteRequestPaymentModal(false);
      fetchRecentRequestPayments();
    } catch (error) {
      console.error("Failed to delete request payment:", error);
      toast.error(error.response?.data?.message || "Failed to delete request payment.");
      setShowDeleteRequestPaymentModal(false);
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

  // ================== PAGINATION FOR ALL PAYMENTS ==================
  const [allPaymentsPage, setAllPaymentsPage] = useState(1);
  const allPaymentsPerPage = 10;

  // ================== TABLE ROWS ==================
  const rows = payments
    .slice(
      (allPaymentsPage - 1) * allPaymentsPerPage,
      allPaymentsPage * allPaymentsPerPage
    )
    .map((p) => ({
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
            className={`${p.payment_status === "Paid"
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

  // ================== RENDER CONTENT ==================
  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center py-12 md:py-20">
          <div className="flex flex-col items-center gap-3">
            <div
              className={`h-8 w-8 border-2 border-t-transparent rounded-full animate-spin transition-colors ${isDarkMode ? "border-pink-400" : "border-pink-600"
                }`}
            />
            <p
              className={`text-sm transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
                }`}
            >
              Loading payments…
            </p>
          </div>
        </div>
      );
    }

    if (authError) {
      return (
        <div className={`rounded-2xl border p-8 text-center transition ${isDarkMode
          ? "border-red-900/30 bg-slate-900"
          : "border-red-200 bg-white"
          }`}>
          <div className="flex flex-col items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isDarkMode ? "bg-red-900/30" : "bg-red-100"}`}>
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
              Authentication Required
            </h3>
            <p className={`text-sm max-w-md ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
              You don't have permission to access payments data. Please check your login.
            </p>
            <button
              onClick={fetchPayments}
              className={`mt-4 rounded-full px-4 py-2 text-sm transition ${isDarkMode
                ? "bg-pink-900/20 border border-pink-700/50 text-pink-300 hover:bg-pink-900/30"
                : "bg-pink-100 border border-pink-300 text-pink-900 hover:bg-pink-200"
                }`}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4">
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

          {/* DEPOSIT PERCENTAGE CARD */}
          <div className={`rounded-2xl border p-4 shadow-sm transition ${isDarkMode
            ? "border-pink-900/30 bg-slate-900"
            : "border-pink-100 bg-white"
            }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FaPercent className={`text-xs ${isDarkMode ? "text-pink-400" : "text-pink-600"}`} />
                  <h3 className={`text-xs font-medium transition ${isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>Deposit Percentage</h3>
                </div>

                {editingDeposit ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={tempDepositValue}
                        onChange={(e) => setTempDepositValue(e.target.value)}
                        className={`w-24 rounded-lg border px-3 py-1 text-sm transition outline-none ${isDarkMode
                          ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                          : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                          }`}
                        placeholder="Enter %"
                        autoFocus
                      />
                      <span className="text-sm">%</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={updateDepositPercentage}
                        className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full hover:bg-pink-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingDeposit(false);
                          setTempDepositValue("");
                        }}
                        className={`text-xs px-3 py-1 rounded-full transition ${isDarkMode
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-2xl font-bold mt-1 transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}>
                      {depositPercentage}%
                    </p>
                    <p className={`text-xs transition ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}>
                      Currency: {depositCurrency}
                    </p>
                  </>
                )}
              </div>

              {!editingDeposit && (
                <button
                  onClick={() => {
                    setTempDepositValue(depositPercentage.toString());
                    setEditingDeposit(true);
                  }}
                  className={`text-xs px-3 py-1 rounded-full transition ${isDarkMode
                    ? "bg-pink-900/20 text-pink-400 hover:bg-pink-900/30"
                    : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                    }`}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CHART */}
        {stats.chartData.length > 0 && (
          <div className={`rounded-2xl border p-4 shadow-sm transition ${isDarkMode
            ? "border-pink-900/30 bg-slate-900"
            : "border-pink-100 bg-white"
            }`}>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
              <h2 className={`text-sm font-semibold transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
                }`}>
                Payment Overview {chartRangeLabel}
              </h2>

              <div className={`flex rounded-full p-1 text-[11px] transition ${isDarkMode
                ? "bg-slate-800 border border-slate-700"
                : "bg-pink-50"
                }`}>
                <button
                  onClick={() => setChartRange("day")}
                  className={`px-3 py-1 rounded-full transition ${chartRange === "day"
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
                  className={`px-3 py-1 rounded-full transition ${chartRange === "week"
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
                  className={`px-3 py-1 rounded-full transition ${chartRange === "month"
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
        )}

        {/* RECENT REQUEST PAYMENTS */}
        <div className={`rounded-2xl border p-4 shadow-sm transition ${isDarkMode
          ? "border-pink-900/30 bg-slate-900"
          : "border-pink-100 bg-white"
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <h2 className={`text-sm font-semibold transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}>
              Request Payments
            </h2>
            <span className={`text-xs transition ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
              {recentRequestPayments.length} total records
            </span>
          </div>

          <div className={`overflow-x-auto rounded-xl border transition ${isDarkMode ? "border-slate-700" : "border-gray-100"
            }`}>
            <table className="min-w-full text-xs">
              <thead className={`transition ${isDarkMode
                ? "bg-slate-800 text-slate-200"
                : "bg-pink-50 text-gray-700"
                }`}>
                <tr>
                  <th className="py-2 px-3 text-left">ID</th>
                  <th className="py-2 px-3 text-left hidden sm:table-cell">Company</th>
                  <th className="py-2 px-3 text-left">Total</th>
                  <th className="py-2 px-3 text-left hidden md:table-cell">Deposit</th>
                  <th className="py-2 px-3 text-left hidden md:table-cell">Balance</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRequestPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`py-4 px-3 text-center text-xs transition ${isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}>
                      No request payments found.
                    </td>
                  </tr>
                ) : (
                  recentRequestPayments
                    .slice(
                      (requestPaymentsPage - 1) * requestPaymentsPerPage,
                      requestPaymentsPage * requestPaymentsPerPage
                    )
                    .map((p, idx) => {
                      const total = Number(p.total_amount || 0);
                      const deposit = Number(p.deposit_amount || 0);
                      const balance = Number(p.remaining_amount || 0);

                      return (
                        <tr
                          key={p.name}
                          className={`border-t transition ${idx % 2 === 1
                            ? isDarkMode
                              ? "bg-slate-800/30"
                              : "bg-gray-50/60"
                            : ""
                            } ${isDarkMode
                              ? "hover:bg-slate-800/50"
                              : "hover:bg-pink-50/80"
                            }`}
                        >
                          <td className={`py-2 px-3 font-medium transition truncate max-w-[100px] ${isDarkMode ? "text-slate-100" : "text-gray-900"
                            }`}>
                            {p.name}
                          </td>
                          <td className={`py-2 px-3 hidden sm:table-cell transition truncate max-w-[120px] ${isDarkMode ? "text-slate-300" : "text-gray-700"
                            }`}>
                            {p.company_name || "-"}
                          </td>
                          <td className={`py-2 px-3 font-semibold transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
                            }`}>
                          €{total.toLocaleString("en-IN")}
                          </td>
                          <td className={`py-2 px-3 hidden md:table-cell transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                            }`}>
                          €{deposit.toLocaleString("en-IN")}
                          </td>
                          <td className={`py-2 px-3 hidden md:table-cell transition ${isDarkMode ? "text-slate-300" : "text-gray-700"
                            }`}>
                          €{balance.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition ${p.payment_status === "Paid"
                              ? isDarkMode
                                ? "bg-green-900/30 text-green-300 border border-green-800"
                                : "bg-green-50 text-green-700 border border-green-200"
                              : p.payment_status === "Refunded"
                                ? isDarkMode
                                  ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                                : p.payment_status === "Failed"
                                  ? isDarkMode
                                    ? "bg-red-900/30 text-red-300 border border-red-800"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                  : p.payment_status === "Pending"
                                    ? isDarkMode
                                      ? "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
                                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    : isDarkMode
                                      ? "bg-gray-900/30 text-gray-300 border border-gray-800"
                                      : "bg-gray-50 text-gray-700 border border-gray-200"
                              }`}>
                              {p.payment_status || "-"}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => confirmDeleteRequestPayment(p)}
                                className={`transition ${isDarkMode
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-red-500 hover:text-red-600"
                                  }`}
                                title="Delete Request"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOR REQUEST PAYMENTS */}
          {recentRequestPayments.length > requestPaymentsPerPage && (
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setRequestPaymentsPage(Math.max(1, requestPaymentsPage - 1))}
                disabled={requestPaymentsPage === 1}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                  ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Previous
              </button>

              <span className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}>
                Page {requestPaymentsPage} of {Math.ceil(recentRequestPayments.length / requestPaymentsPerPage)}
              </span>

              <button
                onClick={() =>
                  setRequestPaymentsPage(
                    Math.min(
                      Math.ceil(recentRequestPayments.length / requestPaymentsPerPage),
                      requestPaymentsPage + 1
                    )
                  )
                }
                disabled={requestPaymentsPage === Math.ceil(recentRequestPayments.length / requestPaymentsPerPage)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                  ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* ALL PAYMENTS TABLE */}
        {payments.length > 0 && (
          <div className="hidden sm:block">
            <AdminTable
              title="All Payments"
              columns={[...columns, { key: "actions", label: "Actions" }]}
              rows={rows}
              loading={loading}
            />

            {/* PAGINATION FOR ALL PAYMENTS TABLE */}
            {payments.length > allPaymentsPerPage && (
              <div className="flex items-center justify-center gap-3 mt-6 pb-4">
                <button
                  onClick={() => setAllPaymentsPage(Math.max(1, allPaymentsPage - 1))}
                  disabled={allPaymentsPage === 1}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Previous
                </button>

                <span className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}>
                  Page {allPaymentsPage} of {Math.ceil(payments.length / allPaymentsPerPage)}
                </span>

                <button
                  onClick={() =>
                    setAllPaymentsPage(
                      Math.min(
                        Math.ceil(payments.length / allPaymentsPerPage),
                        allPaymentsPage + 1
                      )
                    )
                  }
                  disabled={allPaymentsPage === Math.ceil(payments.length / allPaymentsPerPage)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* MOBILE VIEW */}
        {payments.length > 0 && (
          <div className={`block sm:hidden space-y-3 p-3 sm:p-4 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                All Payments
              </h2>
            </div>

            {paginatedPayments.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border p-4 shadow-sm transition ${isDarkMode
                  ? "border-slate-700 bg-slate-800/50 text-slate-200"
                  : "border-gray-200 bg-white text-gray-900"
                  }`}
              >
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

                <div className={`border-t pt-3 flex gap-2 transition ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                  <button
                    onClick={() => openEditModal(p)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${isDarkMode
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
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${p.payment_status === "Paid"
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
              <div className="flex items-center justify-center gap-3 mt-6 pb-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Previous
                </button>

                <span className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATE */}
        {payments.length === 0 && !loading && !authError && (
          <div className={`rounded-2xl border p-8 text-center transition ${isDarkMode
            ? "border-pink-900/30 bg-slate-900"
            : "border-pink-100 bg-white"
            }`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isDarkMode ? "bg-pink-900/30" : "bg-pink-100"}`}>
                <span className="text-2xl">💰</span>
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                No Payments Found
              </h3>
              <p className={`text-sm max-w-md ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                There are no payment records yet. Create your first payment.
              </p>
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    company_name: "",
                    invoice_number: "",
                    subscription_plan: "Standard",
                    amount: "",
                    payment_status: "Paid",
                    notes: "",
                  });
                  setShowModal(true);
                }}
                className={`mt-4 rounded-full px-4 py-2 text-sm transition ${isDarkMode
                  ? "bg-pink-600 hover:bg-pink-700 text-white"
                  : "bg-pink-600 hover:bg-pink-700 text-white"
                  }`}
              >
                Create Payment
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`space-y-5 p-3 sm:p-4 md:p-6 transition-colors ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
      }`}>
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className={`text-lg font-semibold transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-900"
            }`}>Payments</h1>
          <p className={`text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}>
            Monitor subscription payments and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {authError && (
            <div className={`rounded-full border px-3 py-2 text-xs flex items-center gap-2 ${isDarkMode
              ? "bg-red-900/20 border-red-700/50 text-red-300"
              : "bg-red-100 border-red-300 text-red-900"
              }`}>
              <span className="h-2 w-2 bg-red-400 rounded-full animate-pulse" />
              Auth Error
            </div>
          )}

          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
            className={`rounded-full border px-3 py-2 text-xs flex items-center gap-2 transition-colors ${isDarkMode
              ? "bg-pink-900/20 border-pink-700/50 text-pink-300 hover:bg-pink-900/30"
              : "bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200"
              } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <div className="h-2 w-2 border-2 border-t-transparent border-current rounded-full animate-spin flex-shrink-0" />
            ) : (
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            )}
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={() => {
              if (payments.length === 0) {
                toast.warn("No payments to export");
                return;
              }
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
            disabled={payments.length === 0}
            className={`rounded-full px-4 py-2 text-xs flex items-center gap-2 transition-colors ${payments.length === 0
              ? isDarkMode
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
              : isDarkMode
                ? "bg-pink-600 hover:bg-pink-700 text-white"
                : "bg-pink-600 hover:bg-pink-700 text-white"
              }`}
          >
            <FaDownload className="text-[10px]" />
            CSV
          </button>
        </div>
      </div>

      {renderContent()}

      {/* EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[95%] max-w-2xl rounded-2xl p-6 border shadow-xl space-y-4 transition ${isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-pink-100 bg-white"
            }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-semibold transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
                }`}>
                {editMode ? "Edit Payment" : "Add New Payment"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`text-xs transition ${isDarkMode
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}>Company Name *</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    }`}
                  disabled={editMode}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}>Invoice Number *</label>
                <input
                  name="invoice_number"
                  value={form.invoice_number}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    }`}
                  disabled={editMode}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}>Subscription Plan *</label>
                <select
                  name="subscription_plan"
                  value={form.subscription_plan}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${isDarkMode
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

              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-medium transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}>Amount (INR) *</label>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    }`}
                  disabled={editMode}
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className={`text-[11px] font-medium transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}>Payment Status</label>
                <select
                  name="payment_status"
                  value={form.payment_status}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none disabled:opacity-50 ${isDarkMode
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
                  <span className={`text-[10px] mt-1 transition ${isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}>
                    Paid payments are locked — only internal notes allowed.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className={`text-[11px] font-medium transition ${isDarkMode ? "text-slate-200" : "text-gray-700"
                  }`}>Notes (Internal)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className={`rounded-lg border px-3 py-2 text-sm transition outline-none min-h-[90px] ${isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowModal(false)}
                className={`text-sm px-4 py-2 rounded-full transition ${isDarkMode
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

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[95%] max-w-md rounded-2xl p-6 border shadow-xl transition ${isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-pink-100 bg-white"
            }`}>
            <h2 className={`text-lg font-semibold transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}>Delete Payment?</h2>
            <p className={`mt-2 text-sm transition ${isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}>
              Delete payment <b>{selectedPayment?.name}</b>?{" "}
              Paid payments cannot be deleted.
            </p>

            <div className="flex justify-end gap-2 mt-5 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 text-xs rounded-full transition ${isDarkMode
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

      {/* DELETE REQUEST PAYMENT MODAL */}
      {showDeleteRequestPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`w-[95%] max-w-md rounded-2xl p-6 border shadow-xl transition ${isDarkMode
            ? "border-slate-700 bg-slate-900"
            : "border-pink-100 bg-white"
            }`}>
            <h2 className={`text-lg font-semibold transition ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}>Delete Request Payment?</h2>
            <p className={`mt-2 text-sm transition ${isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}>
              Are you sure you want to delete request <b>{editingRequestPayment?.name}</b>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-5 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setShowDeleteRequestPaymentModal(false)}
                className={`px-4 py-2 text-xs rounded-full transition ${isDarkMode
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteRequestPayment}
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