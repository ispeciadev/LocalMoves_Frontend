import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Customers = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ UPDATED — Pagination count changed to 7
  const [page, setPage] = useState(1);
  const perPage = 7;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get(
          "localmoves.api.request.get_manager_requests"
        );

        const msg = res.data?.message || {};

        const visible = msg.visible_requests?.data || [];
        const blurred = msg.blurred_requests?.data || [];
        const available = msg.available_requests?.data || [];

        // ⭐ MERGE ALL REQUESTS
        const merged = [...visible, ...blurred, ...available];

        // ⭐ SORT — Latest first
        merged.sort((a, b) => {
          const t1 = new Date(a.creation || a.created_at || 0).getTime();
          const t2 = new Date(b.creation || b.created_at || 0).getTime();
          return t2 - t1;
        });

        setAllRequests(merged);
      } catch (err) {
        console.error("❌ Error loading customer requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading customer requests...
      </div>
    );
  }

  // ⭐ PAGINATION LOGIC
  const start = (page - 1) * perPage;
  const paginated = allRequests.slice(start, start + perPage);
  const totalPages = Math.ceil(allRequests.length / perPage);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md w-full overflow-x-hidden overflow-y-auto scroll-smooth">
      
      {/* ⭐ UPDATED — ADDED TOTAL CUSTOMERS */}
      <h2 className="text-lg font-semibold text-pink-600 mb-4">
        All Customer Requests <span className="text-gray-600">(Total: {allRequests.length})</span>
      </h2>

      <div className="space-y-3">
        {paginated.length > 0 ? (
          paginated.map((req) => (
            <Link
              key={req.name}
              to={`/logistic-dashboard/customers/${req.name}`}
              state={{ requestData: req }}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 border rounded-lg hover:bg-pink-50 transition-all overflow-x-hidden"
            >
              {/* Left Section */}
              <div className="w-full sm:w-auto">
                <p className="font-medium">
                  {req.full_name || "Customer"}
                </p>

                <p className="text-sm text-gray-600">
                  {req.pickup_city} → {req.delivery_city}
                </p>
              </div>

              {/* Right Section */}
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-sm text-gray-500">
                  {req.delivery_date || "No Date"}
                </p>

                {(req.creation || req.created_at) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const ts = String(req.creation || req.created_at);
                      let d;

                      if (ts.includes("T")) {
                        d = new Date(ts);
                      } else {
                        d = new Date(ts.replace(" ", "T"));
                      }

                      return d.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "America/New_York",
                      });
                    })()}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No customer requests available.
          </p>
        )}
      </div>

      {/* ⭐ PAGINATION BUTTONS (UNCHANGED) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-gray-200 rounded-md"
            disabled={page === 1}
          >
            Prev
          </button>

          <span className="px-3 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 bg-gray-200 rounded-md"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Customers;
