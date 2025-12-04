// src/pages/ComparePage.jsx
import React, { useState, useEffect } from "react";
import HappyStories from "../components/HappyStoriesSection";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Image as ImageIcon } from "lucide-react";   // <-- ADDED ImageIcon here
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

const ProviderRowDesktop = ({ provider, onBook }) => {
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

        <div className="text-center sm:text-left font-semibold text-gray-900 text-lg whitespace-nowrap">
          {provider.company_name}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 place-items-center w-full">

          {/* USER MOVE DETAILS */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs sm:text-sm text-gray-700 font-semibold">
              Your Move Details
            </div>

            <div className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-tight">
              {provider.user_property_type}<br />
              {provider.user_property_size}<br />

              {provider.user_additional_spaces?.length > 0 && (
                <>
                  {provider.user_additional_spaces.join(", ")}<br />
                </>
              )}

              {provider.user_distance ? `${provider.user_distance} miles` : ""}
            </div>
          </div>

          {/* Estimated Cost */}
          <div className="flex flex-col items-center">
            <div className="text-xs sm:text-sm text-gray-700">Estimated Cost</div>

            {provider.estimated_min ? (
              <div className="text-center mt-1">
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  €{provider.estimated_min.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  *Based on distance & property details
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm mt-1">Not Available</div>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1 flex justify-center w-full">
            <button
              onClick={() => onBook(provider)}
              className="px-5 py-2 text-sm sm:text-base rounded-full font-semibold bg-pink-600 text-white hover:bg-pink-700"
            >
              Book Service
            </button>
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
  }, [location.state, navigate]);

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
          additional_spaces: location.state?.additionalSpaces || [],
        };

        const res = await axios.post(
          "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_by_pincode",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        const companiesRaw = res.data?.message?.data || [];

        const mapped = companiesRaw.map((c, idx) => ({
          id: idx + 1,
          company_name: c.company_name,
          description: c.description,

          estimated_min: c.cost_estimation?.estimated_range?.min ?? null,


          user_property_type:
            location.state?.serviceType === "house"
              ? "House"
              : "Office",
          user_property_size:
            location.state?.propertySize?.replace("_bed", " BHK") ||
            location.state?.propertySize?.replace("_workstations", " Workstations") ||
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
      } catch {
        setProviders([]);
      } finally {
        setLoading(false);
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

  const handleBook = (provider) => {
    navigate("/refine-options", {
      state: {
        selectedProvider: provider,
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
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg:white relative">

      <MoveDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => setShowModal(false)}
        companyCount={providers.length}
      />

      <header className="bg-pink-600 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Compare Moving Services
          </h1>
          <p className="mt-2 text-sm">
            From: {pickupPincode} → To: {destinationPincode}
          </p>
        </div>
      </header>

      <main className="flex-1 -mt-8 mb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6">

            {loading ? (
              <div className="text-center text-gray-600 py-10">
                Loading providers...
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                No companies found for pincode {pickupPincode}.
              </div>
            ) : (
              providers.map((p) => (
                <ProviderRowDesktop
                  key={p.id}
                  provider={p}
                  onBook={handleBook}
                />
              ))
            )}

          </div>
        </div>
      </main>

      <HappyStories />
    </div>
  );
};

export default ComparePage;
