// src/pages/logistic-dashboard/RequestDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Package, Truck, DollarSign, Star, User, Phone, Mail, Building, Clock, Navigation, X } from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/useAuthStore";

// ⭐ Allowed Status Options
const STATUS_OPTIONS = [
  "Pending",
  "Assigned",
  "Accepted",
  "In Progress",
  "Completed",
];

// ⭐ Status index for progress calculation
const STATUS_INDEX = {
  Pending: 0,
  Assigned: 1,
  Accepted: 2,
  "In Progress": 3,
  Completed: 4,
};

// ⭐ Status Colors
const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Assigned: "bg-blue-100 text-blue-800 border-blue-200",
  Accepted: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
};

// ⭐ API call to update status
const updateStatus = async (requestId, newStatus) => {
  try {
    const res = await api.post("localmoves.api.request.update_request_status", {
      request_id: requestId,
      status: newStatus,
    });
    return res.data?.message;
  } catch (err) {
    console.error("Failed to update status:", err);
    return null;
  }
};

// GBP currency formatter
const money = (v) =>
  v === null || v === undefined
    ? "N/A"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(Number(v));

const pretty = (v) =>
  v === null || v === undefined || v === "" ? "N/A" : v;

// SAFE JSON PARSER
const parseJSONSafe = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    try {
      const cleaned = str.replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
};

const DetailCard = ({ icon: Icon, title, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 bg-pink-50 rounded-lg">
        <Icon className="w-4 h-4 text-pink-600" />
      </div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailItem = ({ label, value, icon: Icon, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
    <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
  </div>
);

const ProgressStep = ({ label, active, completed, index, onClick }) => (
  <div className="flex flex-col items-center relative w-full">
    <div className="flex flex-col items-center">
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
          completed 
            ? "bg-pink-500 border-pink-600 text-white cursor-pointer hover:bg-pink-600 hover:scale-110 transform" 
            : active 
            ? "bg-white border-pink-500 text-pink-600" 
            : "bg-gray-100 border-gray-300 text-gray-400"
        }`}
        onClick={onClick}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-xs font-semibold">{index + 1}</span>
        )}
      </div>
      <span className={`mt-2 text-xs font-medium text-center px-1 ${
        active ? "text-pink-600" : "text-gray-500"
      }`}>
        {label}
      </span>
    </div>
    {index < STATUS_OPTIONS.length - 1 && (
      <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
        completed ? "bg-pink-500" : "bg-gray-200"
      }`} />
    )}
  </div>
);

const ReviewPopup = ({ isOpen, onClose, onReviewClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 p-6 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Move Completed!</h3>
          <p className="text-gray-600">
            Your move has been successfully completed. How was your experience?
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Star className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Share Your Feedback</h4>
                <p className="text-sm text-gray-600">Help us improve by rating your experience</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onReviewClick}
              className="flex-1 px-4 py-3 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700 transition-colors"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const userRole = user?.role;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parsed, setParsed] = useState({});
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // Fetch request initially
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);

        const res = await api.post("localmoves.api.request.get_request_detail", {
          request_id: id,
        });

        const msg = res.data?.message;

        if (msg?.success) {
          const data = msg.data;
          setRequest(data);

          setParsed({
            pricing_data: parseJSONSafe(data.pricing_data),
            collection_assessment: parseJSONSafe(data.collection_assessment),
            delivery_assessment: parseJSONSafe(data.delivery_assessment),
            move_date_data: parseJSONSafe(data.move_date_data),
            price_breakdown: parseJSONSafe(data.price_breakdown),
          });
        } else {
          setRequest(null);
        }
      } catch {
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  // ⭐ USER LIVE STATUS REFRESH (every 5 seconds)
  useEffect(() => {
    if (userRole !== "User") return;

    const interval = setInterval(async () => {
      try {
        const r = await api.post(
          "localmoves.api.request.get_single_request_detail",
          { request_id: id }
        );

        const msg = r.data?.message;
        if (msg?.success) {
          const updatedStatus = msg.data?.request?.status;
          setRequest((prev) => ({ ...prev, status: updatedStatus }));
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [userRole, id]);

  // Show review popup ALWAYS when status is Completed for User
  useEffect(() => {
    if (userRole === "User" && request?.status === "Completed") {
      setShowReviewPopup(true);
    }
  }, [request?.status, userRole]);

  const handleCompletedTickClick = () => {
    if (userRole === "User" && request?.status === "Completed") {
      setShowReviewPopup(true);
    }
  };

  const handleReviewClick = () => {
    setShowReviewPopup(false);
    navigate('/dashboard', { 
      state: { 
        activeSection: 'reviews',
        scrollToReviews: true 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Request Not Found</h3>
          <p className="text-gray-600 mb-6">The request you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Extract fields
  const {
    name,
    user_email,
    full_name,
    phone,
    pickup_pincode,
    pickup_address,
    pickup_city,
    delivery_pincode,
    delivery_address,
    delivery_city,
    delivery_date,
    service_type,
    item_description,
    special_instructions,
    company_name,
    company_email,
    estimated_cost,
    actual_cost,
    status,
    priority,
    distance_miles,
    rating,
    review_comment,
  } = request;

  const {
    pricing_data,
    collection_assessment,
    delivery_assessment,
    move_date_data,
    price_breakdown,
  } = parsed;

  const fixedPaymentGateway = "PayPal";
  const fixedPaymentStatus = "Paid (10%)";

  // Calculate which steps should show checkmarks
  const currentStatusIndex = STATUS_INDEX[status];
  const isCompleted = status === "Completed";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Request #{pretty(name)}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                    {status}
                  </span>
                  {priority && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priority === "High" 
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}>
                      {priority} Priority
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logistics Manager Status Selector */}
            {["Logistics Manager"].includes(userRole) && (
              <div className="flex items-center gap-3 bg-pink-50 px-4 py-2.5 rounded-xl border border-pink-200">
                <span className="text-sm font-medium text-pink-700">Update Status:</span>
                <select
                  className="
                    bg-white 
                    border border-pink-300 
                    rounded-lg 
                    px-3
                    py-1.5 
                    text-sm 
                    font-medium 
                    text-gray-800 
                    hover:border-pink-500
                    focus:ring-2 
                    focus:ring-pink-400 
                    transition-all 
                    cursor-pointer
                    outline-none
                  "
                  value={status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;

                    try {
                      toast.info("Updating status...", { autoClose: 700 });

                      const res = await updateStatus(name, newStatus);

                      if (res?.success) {
                        setRequest((prev) => ({ ...prev, status: newStatus }));
                        toast.success(`Status changed to "${newStatus}"`, {
                          autoClose: 1200,
                        });
                      } else {
                        toast.error("Failed to update status", {
                          autoClose: 1500,
                        });
                      }
                    } catch {
                      toast.error("Something went wrong!", {
                        autoClose: 1500,
                      });
                    }
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="text-gray-800">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Tracker for Users */}
        {userRole === "User" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delivery Progress</h2>
                <p className="text-sm text-gray-600 mt-1">Track your move in real-time</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Status</div>
                <div className="text-base font-semibold text-pink-600">{status}</div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between mb-2">
                {STATUS_OPTIONS.map((step, index) => {
                  // For "Completed" status, ALL steps should show checkmarks
                  const isStepCompleted = isCompleted 
                    ? true  // When status is "Completed", all steps get checkmarks
                    : currentStatusIndex > index; // For other statuses, only previous steps get checkmarks
                  
                  return (
                    <ProgressStep
                      key={step}
                      label={step}
                      active={status === step}
                      completed={isStepCompleted}
                      index={index}
                      onClick={step === "Completed" ? handleCompletedTickClick : undefined}
                    />
                  );
                })}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-8">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(currentStatusIndex / (STATUS_OPTIONS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Service Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard icon={User} title="Customer Details">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Full Name" value={pretty(full_name)} icon={User} />
                  <DetailItem label="Email" value={pretty(user_email)} icon={Mail} />
                  <DetailItem label="Phone" value={pretty(phone)} icon={Phone} />
                  <DetailItem label="Reference" value={`#${pretty(name)}`} icon={Package} />
                </div>
              </DetailCard>

              <DetailCard icon={Truck} title="Service Information">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Service Type" value={pretty(service_type)} icon={Truck} />
                  <DetailItem label="Distance" value={`${pretty(distance_miles)} miles`} icon={Navigation} />
                  <DetailItem label="Delivery Date" value={pretty(delivery_date)} icon={Calendar} />
                  <DetailItem label="Priority" value={pretty(priority)} icon={Clock} />
                </div>
                <div className="pt-3 border-t">
                  <DetailItem label="Item Description" value={pretty(item_description)} />
                  {special_instructions && (
                    <DetailItem label="Special Instructions" value={pretty(special_instructions)} className="mt-2" />
                  )}
                </div>
              </DetailCard>
            </div>

            {/* Pickup & Delivery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard icon={MapPin} title="Pickup Details">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Address</div>
                    <div className="text-sm font-medium text-gray-800">
                      {pretty(pickup_address)}
                      <br />
                      {pretty(pickup_city)}, {pretty(pickup_pincode)}
                    </div>
                  </div>
                  {collection_assessment && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-2">Assessment</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">Parking</div>
                          <div className="text-sm font-medium">{pretty(collection_assessment.parking)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Distance</div>
                          <div className="text-sm font-medium">{pretty(collection_assessment.parking_distance)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Floor Level</div>
                          <div className="text-sm font-medium">{pretty(collection_assessment.floor_level)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Access</div>
                          <div className="text-sm font-medium">{pretty(collection_assessment.internal_access)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DetailCard>

              <DetailCard icon={MapPin} title="Delivery Details">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">Address</div>
                    <div className="text-sm font-medium text-gray-800">
                      {pretty(delivery_address)}
                      <br />
                      {pretty(delivery_city)}, {pretty(delivery_pincode)}
                    </div>
                  </div>
                  {delivery_assessment && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-2">Assessment</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">Parking</div>
                          <div className="text-sm font-medium">{pretty(delivery_assessment.parking)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Distance</div>
                          <div className="text-sm font-medium">{pretty(delivery_assessment.parking_distance)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Floor Level</div>
                          <div className="text-sm font-medium">{pretty(delivery_assessment.floor_level)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Access</div>
                          <div className="text-sm font-medium">{pretty(delivery_assessment.internal_access)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DetailCard>
            </div>

            {/* Payment & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard icon={DollarSign} title="Payment Details">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Gateway" value={fixedPaymentGateway} />
                    <DetailItem label="Status" value={fixedPaymentStatus} />
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">Estimated Cost</div>
                        <div className="text-xl font-semibold text-gray-900">{money(estimated_cost)}</div>
                      </div>
                      {actual_cost && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Actual Cost</div>
                          <div className="text-lg font-semibold text-green-600">{money(actual_cost)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DetailCard>

              <DetailCard icon={Star} title="Rating & Review">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= (rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {rating ? `${rating}/5` : "No rating"}
                    </span>
                  </div>
                  {review_comment && (
                    <div className="pt-3 border-t">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-2">Review Comment</div>
                      <p className="text-sm text-gray-700 italic">"{pretty(review_comment)}"</p>
                    </div>
                  )}
                </div>
              </DetailCard>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Company Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <Building className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assigned Company</h3>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Company Name</div>
                  <div className="text-base font-semibold text-gray-900">{pretty(company_name)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Email</div>
                  <div className="text-sm font-medium text-pink-600">{pretty(company_email)}</div>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            {pricing_data && (
              <DetailCard icon={Package} title="Pricing Details">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Property Type</div>
                      <div className="text-sm font-medium">{pretty(pricing_data.property_type)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Quantity</div>
                      <div className="text-sm font-medium">{pretty(pricing_data.quantity)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Volume</div>
                      <div className="text-sm font-medium">{pretty(pricing_data.packing_volume_m3)} m³</div>
                    </div>
                  </div>
                </div>
              </DetailCard>
            )}

            {/* Move Date Preferences */}
            {move_date_data && (
              <DetailCard icon={Calendar} title="Move Date Preferences">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Notice Period</div>
                      <div className="text-sm font-medium">{pretty(move_date_data.notice_period)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Preferred Days</div>
                      <div className="text-sm font-medium">{pretty(move_date_data.move_day)}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Collection Time</div>
                      <div className="text-sm font-medium">{pretty(move_date_data.collection_time)}</div>
                    </div>
                  </div>
                </div>
              </DetailCard>
            )}

            {/* Price Breakdown */}
            {price_breakdown && (
              <DetailCard icon={DollarSign} title="Price Breakdown">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Volume</span>
                      <span className="text-sm font-medium">{pretty(price_breakdown.total_volume_m3)} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Distance</span>
                      <span className="text-sm font-medium">{pretty(price_breakdown.distance_miles)} miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Base Loading</span>
                      <span className="text-sm font-medium">{money(price_breakdown.base_loading_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mileage Cost</span>
                      <span className="text-sm font-medium">{money(price_breakdown.mileage_cost)}</span>
                    </div>
                    {price_breakdown.optional_extras?.total && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Optional Extras</span>
                        <span className="text-sm font-medium">{money(price_breakdown.optional_extras.total)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Final Total</span>
                        <span className="text-base font-bold text-pink-600">
                          {money(price_breakdown.final_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DetailCard>
            )}
          </div>
        </div>
      </div>

      {/* Review Popup */}
      <ReviewPopup 
        isOpen={showReviewPopup}
        onClose={() => setShowReviewPopup(false)}
        onReviewClick={handleReviewClick}
      />

      {/* Add CSS animation for fadeIn */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RequestDetails;