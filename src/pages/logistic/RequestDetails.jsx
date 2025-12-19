// src/pages/logistic-dashboard/RequestDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Package, Truck, DollarSign, Star, User, Phone, Mail, Building, Clock, Navigation, X, Wrench, Home, Briefcase, Building2, Boxes, Layers } from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/useAuthStore";

// Vehicle Icon Components (matching HeroSection)
const SwbIcon = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚐</span>;
const TruckIconEmoji = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚚</span>;

// ⭐ Allowed Status Options
const STATUS_OPTIONS = [
  "Assigned",
  "Accepted",
  "In Progress",
  "Completed",
];

// ⭐ Status index for progress calculation
const STATUS_INDEX = {
  Assigned: 0,
  Accepted: 1,
  "In Progress": 2,
  Completed: 3,
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

// Format text to proper case for UK addresses
const formatUKText = (text) => {
  if (!text || text === "N/A") return "N/A";

  // Special handling for common UK address terms
  const exceptions = {
    "uk": "UK",
    "gb": "GB",
    "england": "England",
    "scotland": "Scotland",
    "wales": "Wales",
    "northern ireland": "Northern Ireland",
    "london": "London",
    "manchester": "Manchester",
    "birmingham": "Birmingham",
    "leeds": "Leeds",
    "glasgow": "Glasgow",
    "liverpool": "Liverpool",
    "bristol": "Bristol",
    "newcastle": "Newcastle",
    "sheffield": "Sheffield"
  };

  const lowerText = text.toLowerCase();
  if (exceptions[lowerText]) {
    return exceptions[lowerText];
  }

  // Handle postcodes (convert to uppercase)
  if (/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(text.trim())) {
    return text.trim().toUpperCase();
  }

  // Handle general text - proper case
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Keep acronyms uppercase
      if (word.length <= 3 && /^[a-z]+$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const pretty = (v) => {
  if (v === null || v === undefined || v === "") return "N/A";
  if (typeof v === "string") {
    return formatUKText(v);
  }
  return v;
};

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

// Icon mapping for property types
const getPropertyTypeIcon = (type) => {
  const typeMap = {
    "House": { icon: Home, color: "text-green-600" },
    "Flat": { icon: Building2, color: "text-blue-600" },
    "Office": { icon: Briefcase, color: "text-purple-600" },
    "Few Items": { icon: Package, color: "text-orange-600" },
    "A Few Items": { icon: Package, color: "text-orange-600" }
  };
  return typeMap[type] || { icon: Home, color: "text-gray-600" };
};

// Icon mapping for property sizes
const getPropertySizeIcon = (size) => {
  if (!size) return { icon: Home, color: "text-gray-600" };

  const sizeStr = String(size).toLowerCase();

  // For vehicles (SWB Van, MWB Van, LWB Van)
  if (sizeStr.includes('van')) {
    const vanMap = {
      "swb_van": { icon: SwbIcon, color: "text-blue-500" },
      "swb van": { icon: SwbIcon, color: "text-blue-500" },
      "mwb_van": { icon: SwbIcon, color: "text-indigo-500" },
      "mwb van": { icon: SwbIcon, color: "text-indigo-500" },
      "lwb_van": { icon: SwbIcon, color: "text-purple-500" },
      "lwb van": { icon: SwbIcon, color: "text-purple-500" }
    };
    return vanMap[sizeStr] || { icon: SwbIcon, color: "text-blue-500" };
  }

  // For bedrooms
  if (sizeStr.includes('bhk')) {
    return { icon: Home, color: "text-emerald-600" };
  }
  // For workstations
  if (sizeStr.includes('workstations')) {
    return { icon: Briefcase, color: "text-indigo-600" };
  }
  return { icon: Building2, color: "text-gray-600" };
};

// Icon mapping for quantities
const getQuantityIcon = (quantity) => {
  if (!quantity) return { icon: Boxes, color: "text-gray-600" };

  const quantityStr = String(quantity).toLowerCase();
  const quantityMap = {
    "some_things": { icon: Package, color: "text-amber-500" },
    "some things": { icon: Package, color: "text-amber-500" },
    "quarter_van": { icon: Package, color: "text-amber-500" },
    "quarter van": { icon: Package, color: "text-amber-500" },
    "half_contents": { icon: Layers, color: "text-orange-500" },
    "half contents": { icon: Layers, color: "text-orange-500" },
    "half the contents": { icon: Layers, color: "text-orange-500" },
    "half_van": { icon: Layers, color: "text-orange-500" },
    "half van": { icon: Layers, color: "text-orange-500" },
    "most_things": { icon: Boxes, color: "text-red-500" },
    "most things": { icon: Boxes, color: "text-red-500" },
    "3/4 most things": { icon: Boxes, color: "text-red-500" },
    "three_quarter_van": { icon: Boxes, color: "text-red-500" },
    "3/4 van": { icon: Boxes, color: "text-red-500" },
    "everything": { icon: Truck, color: "text-blue-600" },
    "whole_van": { icon: Truck, color: "text-blue-600" },
    "whole van": { icon: Truck, color: "text-blue-600" }
  };
  return quantityMap[quantityStr] || { icon: Boxes, color: "text-gray-600" };
};

// Property size formatting function
const formatPropertySize = (size, serviceType) => {
  if (!size) return "";

  const sizeStr = String(size);

  if (serviceType === "a_few_items") {
    // Format vehicle sizes properly
    const vehicleMap = {
      'swb_van': 'SWB Van',
      'mwb_van': 'MWB Van',
      'lwb_van': 'LWB Van'
    };
    return vehicleMap[sizeStr] || sizeStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (serviceType === "house") {
    return sizeStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (serviceType === "flat") {
    return sizeStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (serviceType === "office") {
    return sizeStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return sizeStr;
};

// Quantity formatting function
const formatQuantity = (quantity, serviceType) => {
  if (!quantity) return "";

  const quantityStr = String(quantity);

  // ✅ A FEW ITEMS → VAN LOAD QUANTITY
  if (serviceType === "a_few_items") {
    const vanQuantityMap = {
      quarter_van: "Quarter Van",
      half_van: "Half Van",
      three_quarter_van: "3/4 Van",
      whole_van: "Whole Van",
    };

    return vanQuantityMap[quantityStr] || quantityStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ✅ HOUSE / FLAT / OFFICE → CONTENT QUANTITY
  const contentQuantityMap = {
    some_things: "Some Things",
    half_contents: "Half the Contents",
    three_quarter: "3/4 Contents",
    everything: "Everything",
  };

  return (
    contentQuantityMap[quantityStr] ||
    quantityStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

// Service type formatting function
const formatServiceType = (serviceType) => {
  if (!serviceType) return "";

  const serviceTypeStr = String(serviceType).toLowerCase();
  const serviceTypeMap = {
    "house": "HOUSE",
    "flat": "FLAT",
    "office": "OFFICE",
    "a_few_items": "A FEW ITEMS"
  };

  return serviceTypeMap[serviceTypeStr] || serviceTypeStr.replace(/_/g, " ").toUpperCase();
};

const DetailCard = ({ icon, title, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
    <div className="flex items-center gap-2 md:gap-3 mb-4 pb-3 border-b border-gray-100">
      <div className="p-2 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
        {icon && React.createElement(icon, { className: "w-4 h-4 md:w-5 md:h-5 text-pink-700" })}
      </div>
      <h3 className="font-bold text-gray-900 text-sm md:text-lg tracking-tight">{title.toUpperCase()}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const DetailItem = ({ label, value, icon: Icon, className = "", fullWidth = false }) => (
  <div className={`${fullWidth ? "col-span-2" : ""} ${className}`}>
    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
      {Icon && <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />}
      {label}
    </div>
    <div
      className={`text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 min-h-[44px] flex items-center break-all ${className}`}
    >
      {value}
    </div>


  </div>
);

const ProgressStep = ({ label, active, completed, index, onClick }) => (
  <div className="flex flex-col items-center relative w-full">
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-3 z-10 transition-all duration-300 shadow-sm ${completed
          ? "bg-gradient-to-br from-green-500 to-green-600 border-green-700 text-white cursor-pointer hover:from-green-600 hover:to-green-700 hover:shadow-md transform hover:scale-105"
          : active
            ? "bg-white border-pink-500 text-pink-600 shadow-md"
            : "bg-gray-50 border-gray-300 text-gray-400"
          }`}
        onClick={onClick}
      >
        {completed ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
        )}
      </div>
      <span className={`mt-2 sm:mt-3 text-xs sm:text-sm font-bold text-center px-1 tracking-tight ${active ? "text-pink-700" : completed ? "text-green-700" : "text-gray-500"
        }`}>
        {label.toUpperCase()}
      </span>
    </div>
    {index < STATUS_OPTIONS.length - 1 && (
      <div className={`absolute top-4 left-1/2 w-full h-1.5 ${completed ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-200"
        }`} />
    )}
  </div>
);

const ReviewPopup = ({ isOpen, onClose, onReviewClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 p-4 sm:p-6 md:p-8 animate-fadeIn shadow-2xl border border-gray-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>

        <div className="text-center mb-5 sm:mb-7">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 border-4 border-white shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">MOVE COMPLETED!</h3>
          <p className="text-sm sm:text-base text-gray-700 font-medium">
            Your move has been successfully completed. How was your experience?
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-300 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white rounded-xl border border-pink-300">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-pink-700" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base sm:text-lg">SHARE YOUR FEEDBACK</h4>
                <p className="text-xs sm:text-sm text-gray-700 font-medium mt-1">Help us improve by rating your experience</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5 border-2 border-gray-400 text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 tracking-wide uppercase text-xs sm:text-sm"
            >
              MAYBE LATER
            </button>
            <button
              onClick={onReviewClick}
              className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-md hover:shadow-lg tracking-wide uppercase text-xs sm:text-sm"
            >
              WRITE A REVIEW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format assessment values
const _formatAssessmentValue = (value) => {
  if (!value || value === "N/A" || value === "null" || value === "undefined") {
    return "";
  }
  return pretty(value);
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
  const [refineData, setRefineData] = useState(null);
  const [depositPercentage, setDepositPercentage] = useState(null); // New state
  const [paymentStatus, setPaymentStatus] = useState("PAID (10%)"); // Updated state

  // Fetch deposit percentage from backend
  useEffect(() => {
    const fetchDepositPercentage = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.token || "";
        const response = await api.get(
          "localmoves.api.dashboard.get_current_deposit_percentage",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.message?.success) {
          const percentage = response.data.message.deposit_percentage;
          setDepositPercentage(percentage);
          setPaymentStatus(`PAID (${percentage}%)`);
        } else {
          // Fallback to 10% if API fails
          setDepositPercentage(10.0);
          setPaymentStatus("PAID (10%)");
        }
      } catch (error) {
        console.error("Failed to fetch deposit percentage:", error);
        // Fallback to 10% if API fails
        setDepositPercentage(10.0);
        setPaymentStatus("PAID (10%)");
      }
    };

    fetchDepositPercentage();
  }, []);

  // Load RefineOptionsPage data from localStorage
  useEffect(() => {
    try {
      const storedRefineData = localStorage.getItem("move_refineData");
      if (storedRefineData) {
        const parsedRefineData = JSON.parse(storedRefineData);
        setRefineData(parsedRefineData);
      }
    } catch (error) {
      console.error("Error loading refine data:", error);
    }
  }, []);

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
      } catch { /* empty */ }
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-3 border-pink-600 mx-auto"></div>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-gray-700 font-semibold tracking-wide">LOADING REQUEST DETAILS...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-6 sm:p-8 md:p-10 bg-white rounded-2xl border border-gray-300 shadow-xl mx-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-white shadow-lg">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">REQUEST NOT FOUND</h3>
          <p className="text-sm sm:text-base text-gray-700 font-medium mb-6 sm:mb-8">The request you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-bold rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-md hover:shadow-lg tracking-wide uppercase text-sm sm:text-base"
          >
            GO BACK
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
    _special_instructions,
    company_name,
    company_email,
    _estimated_cost,
    _actual_cost,
    status,
    priority,
    distance_miles,
    rating,
    remaining_amount,
    review_comment,
  } = request;

  const {
    pricing_data,
    _collection_assessment,
    _delivery_assessment,
    move_date_data,
    price_breakdown,
  } = parsed;

  // ⭐ User payment split (read-only display)
  const finalTotal = price_breakdown?.final_total;
  const balanceAmount = remaining_amount;
  const depositPercentageToUse = depositPercentage || 10.0;

  // Calculate paid amount based on dynamic deposit percentage
  const paidAmount = finalTotal && balanceAmount
    ? Number(finalTotal) - Number(balanceAmount)
    : finalTotal
      ? (Number(finalTotal) * (depositPercentageToUse / 100)).toFixed(2)
      : null;


  const fixedPaymentGateway = "PAYPAL";

  // Calculate which steps should show checkmarks
  const currentStatusIndex = STATUS_INDEX[status];
  const isCompleted = status === "Completed";

  // Get property details
  const propertyType = refineData?.pricingForm?.property_type || pricing_data?.property_type;
  const propertySize = refineData?.pricingForm?.house_size || pricing_data?.house_size;
  const quantity = refineData?.pricingForm?.quantity || pricing_data?.quantity;
  const additionalSpaces = refineData?.pricingForm?.additional_spaces || pricing_data?.additional_spaces || [];

  // Format values
  const formattedPropertySize = formatPropertySize(propertySize, propertyType);
  const formattedQuantity = formatQuantity(quantity, propertyType);
  const formattedServiceType = formatServiceType(propertyType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-9 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-300"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  REQUEST #{pretty(name)}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
                    {pretty(status)}
                  </span>
                  {priority && (
                    <span className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 ${priority === "High"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                      }`}>
                      {pretty(priority)} PRIORITY
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logistics Manager Status Selector */}
            {["Logistics Manager"].includes(userRole) && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-50 to-pink-100 px-4 py-3 sm:px-5 sm:py-3 rounded-xl border border-pink-300 shadow-sm mt-3 sm:mt-0">
                <span className="text-xs sm:text-sm font-bold text-pink-800 uppercase tracking-wide">UPDATE STATUS:</span>
                <select
                  className="
                    w-full sm:w-auto
                    bg-white 
                    border-2 border-pink-400 
                    rounded-lg 
                    px-3 sm:px-4
                    py-2 sm:py-2.5 
                    text-xs sm:text-sm 
                    font-bold 
                    text-gray-900 
                    hover:border-pink-600
                    focus:ring-3 
                    focus:ring-pink-300 
                    transition-all 
                    cursor-pointer
                    outline-none
                    shadow-sm
                    tracking-wide
                    uppercase
                  "
                  value={status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;

                    try {
                      toast.info("UPDATING STATUS...", { autoClose: 700 });

                      const res = await updateStatus(name, newStatus);

                      if (res?.success) {
                        setRequest((prev) => ({ ...prev, status: newStatus }));
                        toast.success(`STATUS CHANGED TO "${newStatus.toUpperCase()}"`, {
                          autoClose: 1200,
                        });
                      } else {
                        toast.error("FAILED TO UPDATE STATUS", {
                          autoClose: 1500,
                        });
                      }
                    } catch {
                      toast.error("SOMETHING WENT WRONG!", {
                        autoClose: 1500,
                      });
                    }
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="text-gray-900 font-bold">
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-9 py-4 sm:py-5 md:py-7">
        {/* Progress Tracker for Users */}
        {userRole === "User" && (
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-4 sm:p-6 md:p-7 mb-4 sm:mb-6 md:mb-7 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 mb-4 sm:mb-5 md:mb-7">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">DELIVERY PROGRESS</h2>
                <p className="text-xs sm:text-sm text-gray-700 font-medium mt-1 sm:mt-1.5">Track your move in real-time</p>
              </div>
              <div className="text-right mt-2 sm:mt-0">
                <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">CURRENT STATUS</div>
                <div className="text-base sm:text-lg font-bold text-pink-700 tracking-tight mt-1">{pretty(status)}</div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 mb-3">
                {STATUS_OPTIONS.map((step, index) => {
                  const isStepCompleted = isCompleted
                    ? true
                    : currentStatusIndex > index;

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
              <div className="mt-6 sm:mt-7 md:mt-9">
                <div className="relative h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full transition-all duration-700 ease-out shadow-md"
                    style={{
                      width: `${(currentStatusIndex / (STATUS_OPTIONS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7">
            {/* Customer & Service Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
              <DetailCard icon={User} title="Customer Details">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <DetailItem label="Full Name" value={pretty(full_name)} icon={User} />
                  <DetailItem label="Email" value={user_email?.toLowerCase()} icon={Mail} />
                  <DetailItem label="Phone" value={pretty(phone)} icon={Phone} />
                  <DetailItem label="Reference" value={`#${pretty(name)}`} icon={Package} />
                </div>
              </DetailCard>

              <DetailCard icon={Truck} title="Service Information">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <DetailItem label="Service Type" value={pretty(service_type)} icon={Truck} />
                  <DetailItem label="Distance" value={`${pretty(distance_miles)} MILES`} icon={Navigation} />
                  <DetailItem label="Delivery Date" value={pretty(delivery_date)} icon={Calendar} />
                  <DetailItem label="Priority" value={pretty(priority)} icon={Clock} />
                </div>
                <div className="pt-4 border-t border-gray-200 mt-3 sm:mt-4">
                  <DetailItem label="Item Description" value={pretty(item_description)} fullWidth />
                </div>
              </DetailCard>
            </div>

            {/* Pickup & Delivery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
              <DetailCard icon={MapPin} title="Pickup Details">
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">ADDRESS</div>
                    <div className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 space-y-1">
                      <div>{pretty(pickup_address)}</div>
                      <div>{pretty(pickup_city)}</div>
                      <div className="font-bold">{pretty(pickup_pincode)}</div>
                    </div>
                  </div>
                </div>
              </DetailCard>

              <DetailCard icon={MapPin} title="Delivery Details">
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">ADDRESS</div>
                    <div className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 space-y-1">
                      <div>{pretty(delivery_address)}</div>
                      <div>{pretty(delivery_city)}</div>
                      <div className="font-bold">{pretty(delivery_pincode)}</div>
                    </div>
                  </div>
                </div>
              </DetailCard>
            </div>

            {/* Payment & Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
              <DetailCard icon={DollarSign} title="Payment Details">
                <div className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                    <DetailItem label="Gateway" value={fixedPaymentGateway} />
                    <DetailItem label="Status" value={paymentStatus} />
                  </div>
                </div>
              </DetailCard>

              <DetailCard icon={Star} title="Rating & Review">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= (rating || 0)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      {rating ? `${rating}/5` : "NO RATING"}
                    </span>
                  </div>
                  {review_comment && (
                    <div className="pt-4 sm:pt-5 border-t border-gray-200">
                      <div className="text-xs font-bold text-gray-600 uppercase mb-2 sm:mb-3 tracking-wide">REVIEW COMMENT</div>
                      <p className="text-sm font-medium text-gray-700 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 italic">"{pretty(review_comment)}"</p>
                    </div>
                  )}
                </div>
              </DetailCard>
            </div>

            {/* Optional Extras, Move Date Preferences, and Price Breakdown in same line */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
              {/* Optional Extras */}
              {refineData?.pricingForm && (refineData.pricingForm.include_packing || refineData.pricingForm.include_dismantling || refineData.pricingForm.include_reassembly) && (
                <DetailCard icon={Wrench} title="Optional Extras">
                  <div className="space-y-2 sm:space-y-3">
                    {refineData.pricingForm.include_packing && (
                      <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900">PACKING SERVICE</div>
                          {refineData.pricingForm.packing_volume_m3 && (
                            <div className="text-xs font-medium text-gray-700 mt-0.5">VOLUME: {refineData.pricingForm.packing_volume_m3} M³</div>
                          )}
                        </div>
                        <span className="text-xs px-2 sm:px-2.5 py-1 bg-green-200 text-green-900 rounded-full font-bold border border-green-300">INCLUDED</span>
                      </div>
                    )}
                    {refineData.pricingForm.include_dismantling && (
                      <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900">DISMANTLING SERVICE</div>
                          {refineData.pricingForm.dismantling_items > 0 && (
                            <div className="text-xs font-medium text-gray-700 mt-0.5">{refineData.pricingForm.dismantling_items} ITEMS</div>
                          )}
                        </div>
                        <span className="text-xs px-2 sm:px-2.5 py-1 bg-green-200 text-green-900 rounded-full font-bold border border-green-300">INCLUDED</span>
                      </div>
                    )}
                    {refineData.pricingForm.include_reassembly && (
                      <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900">REASSEMBLY SERVICE</div>
                          {refineData.pricingForm.reassembly_items > 0 && (
                            <div className="text-xs font-medium text-gray-700 mt-0.5">{refineData.pricingForm.reassembly_items} ITEMS</div>
                          )}
                        </div>
                        <span className="text-xs px-2 sm:px-2.5 py-1 bg-green-200 text-green-900 rounded-full font-bold border border-green-300">INCLUDED</span>
                      </div>
                    )}
                  </div>
                </DetailCard>
              )}

              {/* Move Date Preferences */}
              {move_date_data && (
                <DetailCard icon={Calendar} title="Move Date Preferences">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">NOTICE PERIOD</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(move_date_data.notice_period)}</div>
                      </div>
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">PREFERRED DAYS</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(move_date_data.move_day)}</div>
                      </div>
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">COLLECTION TIME</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(move_date_data.collection_time)}</div>
                      </div>
                    </div>
                  </div>
                </DetailCard>
              )}

              {/* Price Breakdown */}
              {price_breakdown && (
                <DetailCard icon={DollarSign} title="Price Breakdown">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide">DISTANCE</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">{pretty(price_breakdown.distance_miles)} MILES</span>
                      </div>
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">FINAL TOTAL</span>
                          {userRole === "Logistics Manager" ? (
                            <span className="text-base sm:text-lg font-bold text-pink-700 tracking-tight">
                              {money(pretty(remaining_amount))}
                            </span>
                          ) : (
                            <span className="text-base sm:text-lg font-bold text-pink-700 tracking-tight">
                              {money(price_breakdown.final_total)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* User Paid & Balance Breakdown */}
                      {userRole === "User" && finalTotal && (
                        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 border-t border-gray-200 pt-2 sm:pt-3">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="font-medium text-gray-600 uppercase tracking-wide">
                              Paid ({depositPercentageToUse}%)
                            </span>
                            <span className="font-bold text-green-700">
                              {money(paidAmount)}
                            </span>
                          </div>

                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="font-medium text-gray-600 uppercase tracking-wide">
                              Balance Due
                            </span>
                            <span className="font-bold text-red-600">
                              {money(balanceAmount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </DetailCard>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7">
            {/* Company Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-300 p-4 sm:p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-300">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6 text-pink-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg tracking-tight">ASSIGNED COMPANY</h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mt-0.5">SERVICE PROVIDER</p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1 tracking-wide">COMPANY NAME</div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">{pretty(company_name)}</div>
                </div>
                <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1 tracking-wide">CONTACT EMAIL</div>
                  <div className="text-xs sm:text-sm font-bold text-pink-700">{pretty(company_email)}</div>
                </div>
              </div>
            </div>

            {/* Property Details - Updated to match ComparePage.jsx */}
            {(propertyType || propertySize || quantity) && (
              <DetailCard icon={Package} title="Property Details">
                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Property Type */}
                    {propertyType && (() => {
                      const propertyTypeDisplay = formattedServiceType.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                      const propertyTypeForIcon = propertyTypeDisplay === "A Few Items" ? "Few Items" : propertyTypeDisplay;
                      const { icon: Icon, color } = getPropertyTypeIcon(propertyTypeForIcon);
                      const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                      return (
                        <div className="flex items-center gap-1 sm:gap-2 p-2 bg-gray-50 rounded-lg">
                          {isEmoji ? (
                            <Icon className={color} style={{ fontSize: '0.875rem' }} />
                          ) : (
                            <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
                          )}
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500">Property</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                              {formattedServiceType}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Property Size */}
                    {propertySize && (() => {
                      const { icon: Icon, color } = getPropertySizeIcon(propertySize);
                      const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                      return (
                        <div className="flex items-center gap-1 sm:gap-2 p-2 bg-gray-50 rounded-lg">
                          {isEmoji ? (
                            <Icon className={color} style={{ fontSize: '0.875rem' }} />
                          ) : (
                            <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
                          )}
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500">Size</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                              {formattedPropertySize}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quantity */}
                    {quantity && (() => {
                      const { icon: Icon, color } = getQuantityIcon(formattedQuantity.toLowerCase());
                      return (
                        <div className="flex items-center gap-1 sm:gap-2 p-2 bg-gray-50 rounded-lg">
                          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${color} flex-shrink-0`} />
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500">Quantity</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                              {formattedQuantity}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Additional Spaces */}
                  {additionalSpaces && additionalSpaces.length > 0 && (
                    <div className="mt-2 sm:mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Boxes className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Additional Spaces:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {additionalSpaces.map((space, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white rounded-md text-blue-700 border">
                            {space.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DetailCard>
            )}

            {/* Selected Items */}
            {refineData?.itemQuantities && Object.keys(refineData.itemQuantities).length > 0 && (
              <DetailCard icon={Package} title="Selected Items">
                <div className="space-y-1 sm:space-y-2 max-h-48 sm:max-h-56 md:max-h-64 overflow-y-auto pr-2">
                  {Object.entries(refineData.itemQuantities).map(([itemName, quantity]) => (
                    <div key={itemName} className="flex justify-between items-center py-1.5 sm:py-2 px-2 sm:px-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{pretty(itemName)}</span>
                      <span className="text-xs sm:text-sm font-bold text-pink-700 bg-pink-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">×{quantity}</span>
                    </div>
                  ))}
                </div>
              </DetailCard>
            )}

            {/* Collection Property Assessment */}
            {refineData?.pricingForm && (
              <DetailCard icon={MapPin} title="Collection Assessment">
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    {refineData.pricingForm.collection_parking && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">PARKING TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(refineData.pricingForm.collection_parking)}</div>
                      </div>
                    )}
                    {refineData.pricingForm.collection_parking_distance && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">PARKING DISTANCE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(refineData.pricingForm.collection_parking_distance.replace(/_/g, ' '))}</div>
                      </div>
                    )}
                    {refineData.pricingForm.collection_internal_access && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">INTERNAL ACCESS</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(refineData.pricingForm.collection_internal_access.replace(/_/g, ' '))}</div>
                      </div>
                    )}
                    {(refineData.pricingForm.collection_is_standard_house || refineData.pricingForm.collection_is_bungalow || refineData.pricingForm.collection_is_town_house) && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">HOUSE TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {refineData.pricingForm.collection_is_standard_house ? "STANDARD HOUSE" :
                            refineData.pricingForm.collection_is_bungalow ? "BUNGALOW" :
                              refineData.pricingForm.collection_is_town_house ? "TOWN HOUSE" : ""}
                        </div>
                      </div>
                    )}
                    {(refineData.pricingForm.collection_stairs_only || refineData.pricingForm.collection_has_lift) && (
                      <div className="col-span-2 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">ACCESS TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {refineData.pricingForm.collection_stairs_only ? "STAIRS ONLY" :
                            refineData.pricingForm.collection_has_lift ? "LIFT ACCESS" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DetailCard>
            )}

            {/* Delivery Property Assessment */}
            {refineData?.pricingForm && (refineData.pricingForm.delivery_parking || refineData.pricingForm.delivery_property_type) && (
              <DetailCard icon={MapPin} title="Delivery Assessment">
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    {refineData.pricingForm.delivery_property_type && (
                      <div className="col-span-2 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">DELIVERY PROPERTY TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{formatServiceType(refineData.pricingForm.delivery_property_type)}
                        </div>
                      </div>
                    )}
                    {refineData.pricingForm.delivery_parking && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">PARKING TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(refineData.pricingForm.delivery_parking)}</div>
                      </div>
                    )}
                    {refineData.pricingForm.delivery_parking_distance && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">PARKING DISTANCE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(refineData.pricingForm.delivery_parking_distance.replace(/_/g, ' '))}</div>
                      </div>
                    )}
                    {refineData.pricingForm.delivery_internal_access && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">INTERNAL ACCESS</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">{pretty(refineData.pricingForm.delivery_internal_access.replace(/_/g, ' '))}</div>
                      </div>
                    )}
                    {(refineData.pricingForm.delivery_is_standard_house || refineData.pricingForm.delivery_is_bungalow || refineData.pricingForm.delivery_is_town_house) && (
                      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">HOUSE TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {refineData.pricingForm.delivery_is_standard_house ? "STANDARD HOUSE" :
                            refineData.pricingForm.delivery_is_bungalow ? "BUNGALOW" :
                              refineData.pricingForm.delivery_is_town_house ? "TOWN HOUSE" : ""}
                        </div>
                      </div>
                    )}
                    {(refineData.pricingForm.delivery_stairs_only || refineData.pricingForm.delivery_has_lift) && (
                      <div className="col-span-2 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">ACCESS TYPE</div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {refineData.pricingForm.delivery_stairs_only ? "STAIRS ONLY" :
                            refineData.pricingForm.delivery_has_lift ? "LIFT ACCESS" : ""}
                        </div>
                      </div>
                    )}
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
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RequestDetails;