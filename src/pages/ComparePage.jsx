// src/pages/ComparePage.jsx
import React, { useState, useEffect } from "react";
import HappyStories from "../components/HappyStoriesSection";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Image as ImageIcon, Quote } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";
import MoveDetailsModal from "../components/MoveDetailsModal";

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

      <div className="p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

        {/* Company Name - Left Aligned */}
        <div className="text-center sm:text-left font-semibold text-gray-900 text-lg sm:text-xl">
          {provider.company_name}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 place-items-center w-full">

          {/* USER MOVE DETAILS - Left Column */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs sm:text-sm text-gray-700 font-semibold">
              Your Move Details
            </div>

            <div className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-tight">
              {provider.user_property_type}<br />
              {provider.user_property_size}<br />
              
              {/* Add Quantity Display */}
              {provider.user_quantity && (
                <>
                  Quantity: {provider.user_quantity.replace(/_/g, " ")}<br />
                </>
              )}

              {provider.user_additional_spaces?.length > 0 && (
                <>
                  {provider.user_additional_spaces.join(", ")}<br />
                </>
              )}

              {provider.user_distance ? `${provider.user_distance} miles` : ""}
            </div>
          </div>

          {/* Estimated Cost - Right Column */}
          <div className="flex flex-col items-center">
            <div className="text-xs sm:text-sm text-gray-700">Estimated Cost</div>

            {provider.estimated_min ? (
              <div className="text-center mt-1">
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  £{provider.estimated_min.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  *Based on distance & property details
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm mt-1">Not Available</div>
            )}
          </div>

        </div>
      </div>

      {/* DROPDOWN HEADER */}
      <div
        onClick={() => setOpen(!open)}
        className="bg-pink-600 cursor-pointer px-5 py-3 flex items-center justify-between text-white font-semibold"
      >
        <span>What's Included?</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* DROPDOWN CONTENT */}
      <div className={`transition-all ${open ? "max-h-[2000px] py-4" : "max-h-0"}`}>
        <div className="bg-white px-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {cards.map((card, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-pink-600 mb-2">{card.title}</h4>
                {card.content}
              </div>
            ))}
          </div>

          {/* ⭐ GALLERY BUTTON — MATCH FILTER PAGE EXACTLY */}
          <div className="mt-6 border-t pt-4">
            <button
              onClick={() => setOpenGallery(!openGallery)}
              className="flex items-center gap-2 text-pink-600 font-semibold hover:underline"
            >
              <ImageIcon className="h-4 w-4" />
              Gallery
            </button>

            {openGallery && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className="w-full h-28 sm:h-32 md:h-36 rounded-lg overflow-hidden border bg-gray-100"
                  >
                    <img
                      src={img}
                      alt="company"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
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
          quantity: location.state?.quantity || "everything", // ✅ FIXED: Added quantity parameter
          additional_spaces: location.state?.additionalSpaces || [],
          user_email: localStorage.getItem("user_email") || localStorage.getItem("email"),
          send_email: "True",
        };

        console.log("🚀 ComparePage API Payload:", payload);

        const res = await axios.post(
          "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_by_pincode",
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

          // Add quantity to display
          user_quantity: location.state?.quantity || "everything",
          
          user_property_type:
            location.state?.serviceType === "house"
              ? "House"
              : location.state?.serviceType === "flat"
              ? "Flat"
              : location.state?.serviceType === "office"
              ? "Office"
              : "Few Items",
          user_property_size:
            location.state?.propertySize?.replace("_bed", " BHK") ||
            location.state?.propertySize?.replace("_workstations", " Workstations") ||
            location.state?.propertySize?.replace("_", " ") ||
            "",

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
      const savedFormData = loadFromStorage("compare_formData", {});

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
    <div className="min-h-screen flex flex-col bg:white relative">

      <MoveDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => setShowModal(false)}
        companyCount={providers.length}
      />

      <header className="bg-pink-600 text-white py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                Compare Moving Services
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  From: {pickupPincode}
                </span>
                <span className="text-pink-200">→</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  To: {destinationPincode}
                </span>
                {/* {location.state?.quantity && (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Quantity: {location.state.quantity.replace(/_/g, " ")}
                  </span>
                )} */}
              </div>
            </div>
            
            {/* Single Get Final Quote Button - Only shows when providers exist */}
            {!loading && providers.length > 0 && (
              <button
                onClick={handleGetQuote}
                className="px-5 py-3 sm:px-6 sm:py-3 rounded-full font-semibold bg-white text-pink-600 hover:bg-gray-100 flex items-center gap-2 shadow-lg transition-all hover:scale-105 min-w-[180px] justify-center"
              >
                <Quote size={18} />
                Get Final Quote
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 mb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Stats Bar */}
          {!loading && providers.length > 0 && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {providers.length} Companies Found
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Compare services, prices, and reviews to find your perfect match
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{providers.length}</div>
                    <div className="text-xs text-gray-500">Providers</div>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {providers.length > 0 ? '£' + Math.min(...providers.map(p => p.estimated_min || 0)).toLocaleString() : '0'}
                    </div>
                    <div className="text-xs text-gray-500">Lowest Estimate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6">

            {loading ? (
              <div className="text-center text-gray-600 py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-4"></div>
                <p>Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                <p className="text-lg mb-2">No companies found for pincode {pickupPincode}.</p>
                <p className="text-sm">Try a different location or check back later.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {providers.map((p) => (
                  <ProviderRowDesktop
                    key={p.id}
                    provider={p}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Bottom Fixed Get Quote Button for Mobile */}
          {!loading && providers.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 sm:hidden">
              <button
                onClick={handleGetQuote}
                className="w-full py-3 rounded-full font-semibold bg-pink-600 text-white hover:bg-pink-700 flex items-center gap-2 justify-center"
              >
                <Quote size={18} />
                Get Final Quote
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="pt-12 pb-8">
        <HappyStories />
      </div>
    </div>
  );
};

export default ComparePage;