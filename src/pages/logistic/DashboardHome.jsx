// src/pages/logistic-dashboard/DashboardHome.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Icons
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

// Format Date + AM/PM
const formatTime = (dateString) => {
  const d = new Date(dateString);
  const date = d.toISOString().slice(0, 10);

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${date} ${hours}:${minutes} ${ampm}`;
};

const DashboardHome = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  // METRICS
  const [pending, setPending] = useState(0);
  const [completed, setCompleted] = useState(0); // FIXED HERE
  const [avgPrice, setAvgPrice] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const PER_PAGE = 7;

  const [activeFilter, setActiveFilter] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("localmoves.api.request.get_manager_requests");
      const msg = res.data?.message || {};

      const list = msg.visible_requests?.data || [];

      // Apply sorting → latest first (as you requested earlier)
      const sorted = [...list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRequests(sorted);

      setSubscriptionInfo(msg.subscription_info || null);

      const stats = msg.statistics || {};
      setPending(stats.pending_count || 0);
      setAvgPrice(stats.overall_avg_remaining || 0);
      setTotalRequests(stats.total_requests || 0);

      // ⭐ FIX: Calculate Confirmed count on frontend
      const frontendConfirmed = sorted.filter((r) =>
        ["Assigned", "Accepted", "Completed"].includes(r.status)
      ).length;

      setCompleted(frontendConfirmed);

    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchData]);

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading dashboard…</div>;

  const plan = subscriptionInfo?.plan || "Free";
  const exceeded = subscriptionInfo?.exceeded;

  const freeLimit =
    subscriptionInfo?.limit === -1 ? "Unlimited" : subscriptionInfo?.limit || 0;

  const remaining =
    subscriptionInfo?.remaining === -1
      ? "Unlimited"
      : subscriptionInfo?.remaining ?? "-";

  const isFreeUser = plan === "Free";

  // Filter based on card selection
  const filteredRequests = activeFilter
    ? requests.filter((req) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Pending") return req.status === "Pending";
        if (activeFilter === "Confirmed")
          return ["Assigned", "Accepted", "Completed"].includes(req.status);
        return false;
      })
    : [];

  const totalPages = Math.max(1, Math.ceil(requests.length / PER_PAGE));
  const paginated = requests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 overflow-auto h-full p-2 md:p-6 dashboard-scrollbar">
      <style>{`.dashboard-scrollbar::-webkit-scrollbar { display: none; }`}</style>

      {/* CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <CardClickable
          title="Pending"
          value={pending}
          icon={ExclamationCircleIcon}
          onClick={() => setActiveFilter("Pending")}
        />

        <CardClickable
          title="Confirmed"
          value={completed} // FIXED
          icon={CheckCircleIcon}
          onClick={() => setActiveFilter("Confirmed")}
        />

        <CardClickable
          title="Total Requests"
          value={totalRequests}
          icon={RectangleStackIcon}
          onClick={() => setActiveFilter("All")}
        />

        <Card
          title="Avg Quoted"
          value={`₹${avgPrice.toFixed(0)}`}
          icon={CurrencyRupeeIcon}
        />

        <Card title="Free Entries Left" value={remaining} icon={RectangleStackIcon} />
        <Card title="Plan" value={plan} icon={ShieldCheckIcon} />
      </div>

      {/* FILTERED LIST */}
      {activeFilter && (
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-pink-600">
              {activeFilter} Requests ({filteredRequests.length})
            </h3>

            <button
              onClick={() => setActiveFilter(null)}
              className="text-sm text-gray-500 hover:text-pink-600"
            >
              ✕ Close
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No {activeFilter} requests found.
            </p>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.name}
                className="p-4 mb-2 border rounded-lg hover:bg-pink-50 transition cursor-pointer flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {req.full_name || "Customer"}
                  </p>

                  <p className="text-sm text-gray-600">
                    {req.pickup_city} → {req.delivery_city}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(req.created_at)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/logistic-dashboard/customers/${req.name}`, {
                      state: { requestData: req },
                    })
                  }
                  className="px-3 py-1 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-xs"
                >
                  Details
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* FREE PLAN WARNING */}
      {isFreeUser && exceeded && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl text-center p-6">
          <p className="text-pink-700 font-semibold mb-3 text-md">
            You’ve reached your free limit of {freeLimit} requests.
          </p>

          <button
            onClick={() => navigate("/logistic-dashboard/subscription-plan")}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 text-md"
          >
            🎉 Upgrade Plan
          </button>
        </div>
      )}

      {/* RECENT REQUESTS */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <h3 className="text-md font-semibold text-pink-600 mb-4">
          Recent Requests
        </h3>

        {paginated.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No requests available.</p>
        ) : (
          paginated.map((req) => (
            <div
              key={req.name}
              className="relative rounded-lg p-4 border mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center 
              gap-3 hover:bg-pink-50 transition-all bg-white"
            >
              <div>
                <p className="font-medium">{req.full_name || "Customer"}</p>

                <p className="text-sm text-gray-600">
                  {req.pickup_city} → {req.delivery_city}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {req.created_at ? formatTime(req.created_at) : ""}
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/logistic-dashboard/customers/${req.name}`, {
                    state: { requestData: req },
                  })
                }
                className="px-3 py-1 rounded-md text-white font-medium bg-pink-600 hover:bg-pink-700 text-xs"
              >
                Details
              </button>
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40 text-xs"
          >
            ◀
          </button>

          <span className="text-sm font-semibold">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40 text-xs"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

/* CLICKABLE CARD */
const CardClickable = ({ title, value, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="p-3 md:p-4 rounded-2xl shadow-sm bg-white border border-gray-100 
    hover:border-pink-400 hover:shadow-md transition-all duration-200 flex flex-col 
    items-center text-center cursor-pointer"
  >
    {Icon && (
      <div className="mb-1">
        <Icon className="h-5 w-5 text-pink-600" />
      </div>
    )}

    <h4 className="text-[10px] font-medium text-gray-600 mb-1">{title}</h4>

    <p className="text-xl font-bold text-pink-600">{value}</p>
  </div>
);

/* NORMAL CARD */
const Card = ({ title, value, icon: Icon }) => (
  <div
    className="p-4 md:p-5 rounded-2xl shadow-sm bg-white border border-gray-100 
    hover:border-pink-400 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
  >
    {Icon && (
      <div className="mb-2">
        <Icon className="h-6 w-6 text-pink-600" />
      </div>
    )}

    <h4 className="text-xs font-medium text-gray-600 mb-1">{title}</h4>

    <p className="text-xl font-bold text-pink-600">{value}</p>
  </div>
);

export default DashboardHome;
