// src/pages/logistic-dashboard/AvailableRequests.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";  

const AvailableRequests = () => {
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await api.get("localmoves.api.request.get_manager_requests");
      const msg = res.data?.message || {};
      setAvailable(msg.available_requests?.data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error("Failed to load available requests.");   
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (reqName) => {
    try {
      const res = await api.post(
        "localmoves.api.request.accept_available_request",
        { request_id: reqName }
      );

      const msg = res.data?.message;

      if (msg?.success) {
        toast.success("Request accepted successfully!");  
        fetchRequests();
      } else {
        toast.warning(msg?.message || "Failed to accept request."); 
      }
    } catch (err) {
      console.error("❌ Accept error:", err);
      toast.error("Server Error: Please check backend logs.");  
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-pink-700 mb-4">
        Other Available Requests In Your Pincode
      </h2>

      {available.length === 0 && (
        <p className="text-gray-600">No available requests.</p>
      )}

      {available.map((req) => (
        <div
          key={req.name}
          className="relative rounded-lg p-4 border bg-pink-50 mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
        >
          {/*  BLURRED INFO */}
          <div className="blur-sm opacity-60 pointer-events-none">
            <p className="font-semibold text-gray-800">{req.item_description}</p>

            <p className="text-sm text-gray-700">
              {req.pickup_city} ({req.pickup_pincode}) →{" "}
              {req.delivery_city} ({req.delivery_pincode})
            </p>

            <p className="text-xs text-gray-500">
              {req.created_at?.slice(0, 16)}
            </p>
          </div>

          {/* ACCEPT BUTTON */}
          <button
            onClick={() => acceptRequest(req.name)}
            className="px-4 py-1 rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            Accept
          </button>

          {/* LOCK OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center text-pink-600 pointer-events-none">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      ))}

      {/*  BACK BUTTON */}
      <button
        onClick={() => navigate("/logistic-dashboard")}
        className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
      >
        Back
      </button>
    </div>
  );
};

export default AvailableRequests;
