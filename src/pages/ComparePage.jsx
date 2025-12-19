// src/pages/ComparePage.jsx
import React, { useState, useEffect } from "react";
import HappyStories from "../components/HappyStoriesSection";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Image as ImageIcon, Quote, Package, Layers, Boxes, Truck, Home, Briefcase, Building2, MapPin } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";
import MoveDetailsModal from "../components/MoveDetailsModal";
import env from "../config/env";

// Vehicle Icon Components (matching HeroSection)
const SwbIcon = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚐</span>;
const TruckIconEmoji = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚚</span>;

// ------------------------------
// FROM FilteredProvidersPage
// ------------------------------
const FALLBACK_IMAGE =
  "https://dummyimage.com/200x150/e5e7eb/000&text=No+Image";

const resolveImage = (img) => {
  if (!img) return FALLBACK_IMAGE;
  if (img.startsWith("blob:")) return FALLBACK_IMAGE;
  if (img.trim() === "") return FALLBACK_IMAGE;
  return img;
};

// Icon mapping for property types
const getPropertyTypeIcon = (type) => {
  const typeMap = {
    "House": { icon: Home, color: "text-green-600" },
    "Flat": { icon: Building2, color: "text-blue-600" },
    "Office": { icon: Briefcase, color: "text-purple-600" },
    "Few Items": { icon: Package, color: "text-orange-600" }
  };
  return typeMap[type] || { icon: Home, color: "text-gray-600" };
};

// Icon mapping for property sizes
const getPropertySizeIcon = (size) => {
  // For vehicles (SWB Van, MWB Van, LWB Van)
  if (size.toLowerCase().includes('van')) {
    const vanMap = {
      "swb van": { icon: SwbIcon, color: "text-blue-500" },
      "mwb van": { icon: SwbIcon, color: "text-indigo-500" },
      "lwb van": { icon: SwbIcon, color: "text-purple-500" }
    };
    return vanMap[size.toLowerCase()] || { icon: SwbIcon, color: "text-blue-500" };
  }
  // For bedrooms
  if (size.toLowerCase().includes('bhk')) {
    return { icon: Home, color: "text-emerald-600" };
  }
  // For workstations
  if (size.toLowerCase().includes('workstations')) {
    return { icon: Briefcase, color: "text-indigo-600" };
  }
  return { icon: Building2, color: "text-gray-600" };
};

// Icon mapping for quantities
const getQuantityIcon = (quantity) => {
  const quantityMap = {
    "some_things": { icon: Package, color: "text-amber-500" },
    "some things": { icon: Package, color: "text-amber-500" },
    "quarter van": { icon: Package, color: "text-amber-500" },
    "half_contents": { icon: Layers, color: "text-orange-500" },
    "half contents": { icon: Layers, color: "text-orange-500" },
    "half the contents": { icon: Layers, color: "text-orange-500" },
    "half van": { icon: Layers, color: "text-orange-500" },
    "most_things": { icon: Boxes, color: "text-red-500" },
    "most things": { icon: Boxes, color: "text-red-500" },
    "3/4 most things": { icon: Boxes, color: "text-red-500" },
    "3/4 van": { icon: Boxes, color: "text-red-500" },
    "everything": { icon: Truck, color: "text-blue-600" },
    "whole van": { icon: Truck, color: "text-blue-600" }
  };
  return quantityMap[quantity.toLowerCase()] || { icon: Boxes, color: "text-gray-600" };
};

// ---------------------------------
// Property size formatting function
// ---------------------------------
const formatPropertySize = (size, serviceType) => {
  if (!size) return "";

  if (serviceType === "a_few_items") {
    // ✅ FIXED: Format vehicle sizes properly
    const vehicleMap = {
      'swb_van': 'SWB Van',
      'mwb_van': 'MWB Van',
      'lwb_van': 'LWB Van'
    };
    return vehicleMap[size] || size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (serviceType === "house") {
    return size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (serviceType === "flat") {
    return size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (serviceType === "office") {
    return size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return size;
};

// ---------------------------------
// Quantity formatting function (FINAL, CORRECT)
// ---------------------------------
const formatQuantity = (quantity, serviceType) => {
  if (!quantity) return "";

  // ✅ A FEW ITEMS → VAN LOAD QUANTITY
  if (serviceType === "a_few_items") {
    const vanQuantityMap = {
      quarter_van: "Quarter Van",
      half_van: "Half Van",
      three_quarter_van: "3/4 Van",
      whole_van: "Whole Van",
    };

    return vanQuantityMap[quantity] || quantity;
  }

  // ✅ HOUSE / FLAT / OFFICE → CONTENT QUANTITY
  const contentQuantityMap = {
    some_things: "Some Things",
    half_contents: "Half the Contents",
    three_quarter: "3/4 Contents",
    everything: "Everything",
  };

  return (
    contentQuantityMap[quantity] ||
    quantity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};


// ---------------------------------
// Service type formatting function
// ---------------------------------
const formatServiceType = (serviceType) => {
  if (!serviceType) return "";

  const serviceTypeMap = {
    "house": "HOUSE",
    "flat": "FLAT",
    "office": "OFFICE"
  };

  return serviceTypeMap[serviceType] || serviceType.replace(/_/g, " ").toUpperCase();
};

// ---------------------------------
// Provider Row Component
// ---------------------------------

const ProviderRowDesktop = ({ provider }) => {
  const [open, setOpen] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);

  const galleryImages =
    provider.company_gallery && provider.company_gallery.length > 0
      ? provider.company_gallery.map((g) => resolveImage(g))
      : [FALLBACK_IMAGE, FALLBACK_IMAGE, FALLBACK_IMAGE];

  const cards = [
    {
      title: "Includes:",
      content: (
        <ul className="space-y-1 text-xs text-gray-700 break-all">
          {(provider.includes || []).map((it, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-gray-800 leading-relaxed whitespace-pre-wrap"
            >
              <span className="text-pink-600 font-bold shrink-0">✔</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Protection:",
      content: (
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
          {(provider.protection || []).join(", ")}
        </p>
      ),
    },
    {
      title: "Materials:",
      content: (
        <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
          {(provider.material || []).map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </div>
      ),
    },
    {
      title: "Furniture:",
      content: (
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
          {(provider.furniture || []).join(", ")}
        </p>
      ),
    },
    {
      title: "Appliances:",
      content: (
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
          {(provider.appliances || []).join(", ")}
        </p>
      ),
    },
    {
      title: "Summary:",
      content: (
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
          {provider.description || "No description available"}
        </p>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all mb-6">

      {/* TOP SECTION - Professional Layout */}
      <div className="p-4 sm:px-6 sm:py-5">
        {/* Company Name Row */}
        <div className="mb-4 sm:mb-5 pb-3 border-b border-gray-100">
          <h3 className="text-center sm:text-left font-bold text-gray-900 text-lg sm:text-xl">
            {provider.company_name}
          </h3>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* USER MOVE DETAILS - Left Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-6 bg-pink-600 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">
                Your Move Details
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Property Type */}
              {provider.user_service_type && (() => {
                const propertyTypeDisplay = formatServiceType(provider.user_service_type).toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                const propertyTypeForIcon = propertyTypeDisplay === "A Few Items" ? "Few Items" : propertyTypeDisplay;
                const { icon: Icon, color } = getPropertyTypeIcon(propertyTypeForIcon);
                const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                return (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {isEmoji ? (
                      <Icon className={color} style={{ fontSize: '1rem' }} />
                    ) : (
                      <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">Property</span>
                      <span className="text-xs font-medium text-gray-800">
                        {formatServiceType(provider.user_service_type)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Property Size */}
              {provider.user_property_size && (() => {
                const { icon: Icon, color } = getPropertySizeIcon(provider.user_property_size);
                const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                return (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    {isEmoji ? (
                      <Icon className={color} style={{ fontSize: '1rem' }} />
                    ) : (
                      <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">Size</span>
                      <span className="text-xs font-medium text-gray-800">
                        {provider.user_property_size}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Quantity */}
              {provider.user_quantity && (() => {
                const formattedQuantity = formatQuantity(provider.user_quantity, provider.user_service_type);
                const { icon: Icon, color } = getQuantityIcon(formattedQuantity.toLowerCase());
                return (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">Quantity</span>
                      <span className="text-xs font-medium text-gray-800">
                        {formattedQuantity}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Distance */}
              {provider.user_distance && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-pink-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500">Distance</span>
                    <span className="text-xs font-medium text-gray-800">
                      {provider.user_distance} miles
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Spaces */}
            {provider.user_additional_spaces?.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Additional Spaces:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {provider.user_additional_spaces.map((space, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-white rounded-md text-blue-700 border">
                      {space.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ESTIMATED COST - Right Column */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100">
            <div className="text-center mb-2">
              <div className="text-sm text-gray-600 mb-1 font-medium">Estimated Cost</div>
              {provider.estimated_min ? (
                <>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    £{provider.estimated_min.toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm mt-1">Not Available</div>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center gap-1">
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DROPDOWN HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="bg-gradient-to-r from-pink-600 to-pink-500 cursor-pointer px-5 py-3 flex items-center justify-between text-white font-semibold"
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
          What's Included?
        </span>
        <span className="text-xs font-normal opacity-90">
          Click to {open ? 'collapse' : 'expand'}
        </span>
      </div>

      {/* DROPDOWN CONTENT */}
      <div className={`transition-all duration-300 ${open ? "max-h-[2000px] py-4" : "max-h-0"}`}>
        <div className="bg-white px-5">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map((card, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="font-semibold text-pink-600 mb-2 text-sm">{card.title}</h4>
                {card.content}
              </div>
            ))}
          </div>

          {/* GALLERY SECTION */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => setOpenGallery(!openGallery)}
              className="flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-700 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
              View Company Gallery
              <ChevronDown
                size={16}
                className={`transition-transform ${openGallery ? "rotate-180" : ""}`}
              />
            </button>

            {openGallery && (
              <div className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {galleryImages.map((img, i) => (
                    <div
                      key={i}
                      className="w-full h-32 rounded-lg overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={img}
                        alt={`${provider.company_name} gallery ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Showing {galleryImages.length} images from {provider.company_name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------
// Compare Page Component
// ---------------------------------

const ComparePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [pickupPincode, setPickupPincode] = useState("");
  const [destinationPincode, setDestinationPincode] = useState("");
  const [loading, setLoading] = useState(true);

  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  const { isAuthenticated } = useAuthStore();

  // Load from localStorage helper
  const loadFromStorage = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(`move_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save to localStorage helper
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(`move_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error);
    }
  };

  // Save compare page data
  const saveCompareData = () => {
    const compareData = {
      providers,
      pickupPincode,
      destinationPincode,
      pickupCoords,
      dropoffCoords,
      routeGeometry,
      loading,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem("move_compareData", JSON.stringify(compareData));
    } catch (error) {
      console.error("Error saving compare data to localStorage:", error);
    }
  };

  const safeParse = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val);
    } catch {
      return String(val)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  // Load state from HeroSection
  useEffect(() => {
    const state = location.state;
    if (!state) {
      toast.error("Please enter pickup & dropoff details first.");
      navigate("/");
      return;
    }

    setPickupPincode(state.pickupPincode);
    setDestinationPincode(state.dropoffPincode);
    setPickupCoords(state.pickupCoords || null);
    setDropoffCoords(state.dropoffCoords || null);
    setRouteGeometry(state.routeGeometry || null);

    // Save to localStorage
    saveToStorage("compare_pickupPincode", state.pickupPincode);
    saveToStorage("compare_destinationPincode", state.dropoffPincode);
    saveToStorage("compare_pickupCoords", state.pickupCoords || null);
    saveToStorage("compare_dropoffCoords", state.dropoffCoords || null);
    saveToStorage("compare_routeGeometry", state.routeGeometry || null);

    // Also save the form data from state
    const formData = {
      serviceType: state.serviceType,
      propertySize: state.propertySize,
      quantity: state.quantity,
      additionalSpaces: state.additionalSpaces,
      distanceKm: state.distanceKm,
      distanceMiles: state.distanceMiles,
      pickup: state.pickup,
      dropoff: state.dropoff
    };
    saveToStorage("compare_formData", formData);
  }, [location.state, navigate]);

  // Add debug logging for location state
  useEffect(() => {
    console.log("🔍 ComparePage Location State:", {
      quantity: location.state?.quantity,
      serviceType: location.state?.serviceType,
      propertySize: location.state?.propertySize,
      distanceMiles: location.state?.distanceMiles,
      additionalSpaces: location.state?.additionalSpaces,
      hasQuantity: !!location.state?.quantity,
      quantityValue: location.state?.quantity
    });
  }, [location.state]);

  // Fetch Providers
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const payload = {
          pincode: pickupPincode,
          property_type: location.state?.serviceType,
          property_size: location.state?.propertySize,
          distance_miles: location.state?.distanceMiles || 1,
          quantity: location.state?.quantity || "some_things",
          additional_spaces: location.state?.additionalSpaces || [],
          user_email: localStorage.getItem("user_email") || localStorage.getItem("email"),
          send_email: "True",
        };

        console.log("🚀 ComparePage API Payload:", payload);

        const res = await axios.post(
          `${env.API_BASE_URL}localmoves.api.company.search_companies_by_pincode`,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ ComparePage API Response:", res.data?.message?.search_parameters);

        const companiesRaw = res.data?.message?.data || [];

        // Debug log for quantity from API
        if (companiesRaw.length > 0) {
          console.log("📊 First Company Quantity:", companiesRaw[0]?.cost_estimation?.quantity);
          console.log("📊 API Search Parameters Quantity:", res.data?.message?.search_parameters?.quantity);
        }

        const mapped = companiesRaw.map((c, idx) => ({
          id: idx + 1,
          company_name: c.company_name,
          description: c.description,

          estimated_min: c.cost_estimation?.base_total ?? null,

          // Service Type - Use the actual service type from state
          user_service_type: location.state?.serviceType || "a_few_items",

          // Quantity - Use the actual quantity from state
          user_quantity: location.state?.quantity || "some_things",

          // Property Size - Format based on service type
          user_property_size: formatPropertySize(
            location.state?.propertySize,
            location.state?.serviceType
          ),

          user_additional_spaces: location.state?.additionalSpaces || [],

          user_distance:
            Number(
              String(location.state?.distanceMiles || "").replace(/[^0-9.]/g, "")
            ) || null,

          includes: safeParse(c.includes),
          protection: safeParse(c.protection),
          material: safeParse(c.material),
          furniture: safeParse(c.furniture),
          appliances: safeParse(c.appliances),

          company_gallery: (c.company_gallery || []).map((g) => resolveImage(g)),
        }));

        setProviders(mapped);

        // Save providers to localStorage
        saveToStorage("compare_providers", mapped);

        // Save complete compare data
        saveCompareData();
      } catch (error) {
        console.error("❌ ComparePage API Error:", error);
        setProviders([]);

        // Save empty providers on error
        saveToStorage("compare_providers", []);
        saveCompareData();
      } finally {
        setLoading(false);

        // Save loading state
        saveToStorage("compare_loading", false);
      }
    };

    if (pickupPincode) fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupPincode, location.state]);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && providers.length > 0 && !isAuthenticated) {
      setShowModal(true);
    } else setShowModal(false);
  }, [loading, providers, isAuthenticated]);

  // Save modal state changes
  useEffect(() => {
    saveToStorage("compare_showModal", showModal);
  }, [showModal]);

  const handleGetQuote = () => {
    if (providers.length > 0) {
      // Save navigation data
      const navigationData = {
        selectedProvider: providers[0],
        providers,
        pickupPincode,
        dropoffPincode: destinationPincode,
        pickup: location.state?.pickup || "",
        dropoff: location.state?.dropoff || "",
        pickupCoords,
        dropoffCoords,
        routeGeometry,
        distanceKm: location.state?.distanceKm || null,
        distanceMiles: location.state?.distanceMiles || null,
        serviceType: location.state?.serviceType,
        propertySize: location.state?.propertySize,
        quantity: location.state?.quantity,
        additionalSpaces: location.state?.additionalSpaces,
        timestamp: new Date().toISOString()
      };

      saveToStorage("compare_navigationData", navigationData);

      navigate("/refine-options", {
        state: navigationData,
      });
    }
  };

  // Load initial data from localStorage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const savedProviders = loadFromStorage("compare_providers", []);
      const savedPickupPincode = loadFromStorage("compare_pickupPincode", "");
      const savedDestinationPincode = loadFromStorage("compare_destinationPincode", "");
      const savedPickupCoords = loadFromStorage("compare_pickupCoords", null);
      const savedDropoffCoords = loadFromStorage("compare_dropoffCoords", null);
      const savedRouteGeometry = loadFromStorage("compare_routeGeometry", null);
      const savedShowModal = loadFromStorage("compare_showModal", false);
      const savedLoading = loadFromStorage("compare_loading", true);
      const _savedFormData = loadFromStorage("compare_formData", {});

      // Only set if we don't have location state
      if (!location.state) {
        setProviders(savedProviders);
        setPickupPincode(savedPickupPincode);
        setDestinationPincode(savedDestinationPincode);
        setPickupCoords(savedPickupCoords);
        setDropoffCoords(savedDropoffCoords);
        setRouteGeometry(savedRouteGeometry);
        setShowModal(savedShowModal);
        setLoading(savedLoading);

        // If we have saved providers but no location state, we can still show the page
        if (savedProviders.length > 0) {
          console.log("📁 Loaded compare data from localStorage");
        }
      }
    };

    loadSavedData();
  }, [location.state]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">

      <MoveDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => setShowModal(false)}
        companyCount={providers.length}
      />

      {/* HEADER - Professional Layout */}
      <header className="bg-gradient-to-r from-pink-600 to-pink-500 text-white py-6 sm:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Section - Title and Route */}
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                Compare Moving Services
              </h1>

              {/* Route Badges */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="text-left">
                    <div className="text-xs opacity-80">From</div>
                    <div className="font-semibold">{pickupPincode}</div>
                  </div>
                  <div className="h-6 w-px bg-white/30"></div>
                  <div className="text-left">
                    <div className="text-xs opacity-80">To</div>
                    <div className="font-semibold">{destinationPincode}</div>
                  </div>
                  <div className="ml-2 px-2 py-1 bg-white/20 rounded-md text-xs">
                    {providers.length} options
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - CTA Button */}
            {!loading && providers.length > 0 && (
              <div className="flex flex-col items-center lg:items-end gap-3">
                <button
                  onClick={handleGetQuote}
                  className="px-6 py-3 rounded-xl font-semibold bg-white text-pink-600 hover:bg-gray-50 flex items-center gap-3 shadow-lg transition-all hover:scale-[1.02] min-w-[220px] justify-center group"
                >
                  <Quote size={20} className="group-hover:scale-110 transition-transform" />
                  <span>Get Final Quote</span>
                </button>
                <p className="text-xs text-white/80 text-center lg:text-right">
                  Compare all {providers.length} providers below
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Summary Stats Card */}
          {!loading && providers.length > 0 && (
            <div className="mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">
                    Compare Your Options
                  </h2>
                  <p className="text-sm text-gray-600">
                    Review services, pricing, and inclusions from top-rated UK moving companies
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <div className="text-xl font-bold text-pink-600">{providers.length}</div>
                    <div className="text-xs text-gray-600">Providers</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      £{providers.length > 0 ? Math.min(...providers.map(p => p.estimated_min || 0)).toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-gray-600">Lowest Price</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      £{providers.length > 0 ? Math.max(...providers.map(p => p.estimated_min || 0)).toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-gray-600">Highest Price</div>
                  </div>
                </div>
              </div>

              {/* Comparison Tips */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <span>Tip: Compare included services, protection coverage, and company reviews</span>
                </div>
              </div>
            </div>
          )}

          {/* PROVIDERS LIST */}
          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6">

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Providers</h3>
                  <p className="text-sm text-gray-500">Searching for the best moving companies in your area...</p>
                </div>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Companies Found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any moving companies serving {pickupPincode}.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Try Different Location
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sort/Label Bar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="text-sm text-gray-500">
                    Showing {providers.length} of {providers.length} providers
                  </div>
                  <div className="text-sm text-gray-500">
                    Sorted by: <span className="font-semibold text-gray-700">Best Match</span>
                  </div>
                </div>

                {/* Provider Cards */}
                {providers.map((p) => (
                  <ProviderRowDesktop
                    key={p.id}
                    provider={p}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Info */}
          {!loading && providers.length > 0 && (
            <div className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-gray-800 mb-1">Ready to proceed?</h4>
                  <p className="text-sm text-gray-600">
                    Select "Get Final Quote" to receive detailed pricing from your preferred provider
                  </p>
                </div>
                <button
                  onClick={handleGetQuote}
                  className="px-6 py-3 rounded-lg font-semibold bg-pink-600 text-white hover:bg-pink-700 flex items-center gap-2 shadow-md transition-colors"
                >
                  <Quote size={18} />
                  Continue to Quote
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Fixed Button for Mobile */}
      {!loading && providers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl p-4 z-50 sm:hidden transform transition-transform duration-300">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleGetQuote}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600 flex items-center justify-center gap-2 shadow-lg"
            >
              <Quote size={18} />
              Get Final Quote
            </button>
          </div>
        </div>
      )}

      {/* HAPPY STORIES SECTION */}
      <div className="pt-12 pb-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HappyStories />
        </div>
      </div>
    </div>
  );
};

export default ComparePage;