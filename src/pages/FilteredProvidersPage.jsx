// src/pages/FilteredProvidersPage.jsx
import React, { useState, useEffect } from "react";
import {
  Check,
  Image as ImageIcon,
  MapPin,
  ChevronDown,
  Star,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";

const FALLBACK_IMAGE =
  "https://dummyimage.com/200x150/e5e7eb/000&text=No+Image";

const FALLBACK_LOGO =
  "https://dummyimage.com/80x80/e5e7eb/000&text=Logo";

const resolveImage = (img) => {
  if (!img) return FALLBACK_IMAGE;
  if (img.startsWith("blob:")) return FALLBACK_IMAGE;
  if (img.trim() === "") return FALLBACK_IMAGE;
  return img;
};

const FilteredProvidersPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const pickupPincode = state?.pickupPincode || "";
  const dropoffPincode = state?.dropoffPincode || "";
  const distanceKm = state?.distanceKm || null;
  const distanceMilesExact = distanceKm
    ? (distanceKm * 0.621371).toFixed(1)
    : null;

  const providersRaw = state?.providers;

  const apiProviders = Array.isArray(providersRaw)
    ? providersRaw
    : Array.isArray(providersRaw?.data)
    ? providersRaw.data
    : [];

  // ⭐ SUBSCRIPTION FILTER ADDED — NOTHING ELSE CHANGED
  const subscribedProviders = apiProviders.filter(
    (company) =>
      company.subscription_plan &&
      company.subscription_plan.toLowerCase() !== "free"
  );

  const searchParams = providersRaw?.search_parameters || {};
  const pickupCity = state?.pickup || "Your Area";
  const displayCity = pickupCity.split(",")[0];

  const companiesList = subscribedProviders.map((company) => {
    const galleryArray = company.company_gallery?.length
      ? company.company_gallery
      : [];

    return {
      name: company.company_name,
      logo:
        resolveImage(company.company_gallery?.[0]) || FALLBACK_LOGO,

      distanceMiles:
        distanceMilesExact !== null
          ? `${distanceMilesExact} miles`
          : `${searchParams.distance_miles || 0} miles`,

      distanceText: "From Collection Address",
      price: company.cost_calculation?.removal_price || 0,
      packing: `£${company.cost_calculation?.add_packing || 0}`,
      insurance: `£${company.cost_calculation?.assembly_cost || 0}`,

      features: [
        ...(company.includes || []),
        ...(company.protection || []),
        ...(company.material || []),
        ...(company.furniture || []),
        ...(company.appliances || []),
      ].slice(0, 5),

      gallery:
        galleryArray.length > 0
          ? galleryArray.map((g) => resolveImage(g))
          : [FALLBACK_IMAGE, FALLBACK_IMAGE, FALLBACK_IMAGE],

      original: company,
    };
  });

  const [companies, setCompanies] = useState(companiesList);
  const [sortOrder, setSortOrder] = useState("low-to-high");
  const [openGallery, setOpenGallery] = useState({});
  const [ratings, setRatings] = useState({});

  const toggleGallery = (idx) =>
    setOpenGallery((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const fetchCompanyRatings = async (companyName) => {
    try {
      const res = await api.post(
        "localmoves.api.rating_review.get_company_ratings_and_reviews",
        { company_name: companyName }
      );

      const msg = res.data?.message;

      if (!msg?.success) {
        return { avg: 0, total: 0 };
      }

      return {
        avg: msg.rating_summary?.average_rating || 0,
        total: msg.rating_summary?.total_ratings || 0,
      };
    } catch {
      return { avg: 0, total: 0 };
    }
  };

  useEffect(() => {
    const loadRatings = async () => {
      const result = {};

      for (let c of companiesList) {
        const ratingData = await fetchCompanyRatings(c.name);
        result[c.name] = ratingData;
      }

      setRatings(result);
    };

    loadRatings();
  }, [companiesList]);

  const handleSort = () => {
    let sorted = [...companies];

    if (sortOrder === "low-to-high") {
      sorted.sort((a, b) => a.price - b.price);
      setSortOrder("high-to-high");
    } else {
      sorted.sort((a, b) => b.price - a.price);
      setSortOrder("low-to-high");
    }

    setCompanies(sorted);
  };

  return (
    <section className="bg-[#fffefe] min-h-screen pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-[26px] sm:text-[30px] lg:text-[34px] leading-tight font-extrabold text-pink-600">
              Filter Removal Providers In{" "}
              <span className="text-black">{displayCity}</span>
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              From <b>{pickupPincode}</b> to <b>{dropoffPincode}</b>
            </p>
          </div>

          <button
            onClick={handleSort}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500 bg-white text-pink-600 text-sm font-semibold hover:bg-pink-50 transition"
          >
            {sortOrder === "low-to-high"
              ? "Price (Low to High)"
              : "Price (High to Low)"}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* HEADERS */}
        <div className="hidden lg:flex bg-white border border-gray-200 px-6 py-4 rounded-xl items-center justify-between">
          <span className="w-[22%] font-bold text-[#333]">Removal Company</span>
          <div className="w-[15%] text-center">
            <span className="font-bold text-[#333]">Removal Price</span>
            <span className="text-[11px] text-gray-500 block">Fixed Rate</span>
          </div>
          <span className="w-[12%] font-bold text-[#333] text-center">
            Add Packing
          </span>
          <span className="w-[15%] font-bold text-[#333] text-center">
            Assembly Price
          </span>
          <span className="w-[18%] font-bold text-[#333] text-right">
            Action
          </span>
        </div>

        {/* COMPANY CARDS */}
        {companies.map((p, index) => {
          const rating = ratings[p.name] || { avg: 0, total: 0 };

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md mt-6 border border-gray-200"
            >
              <div className="px-4 sm:px-6 pt-6 pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* COMPANY DETAILS */}
                <div className="w-full lg:w-[22%] flex items-center gap-4">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-md object-cover border"
                  />

                  <div className="flex flex-col">
                    <p className="text-[16px] sm:text-[18px] font-semibold">
                      {p.name}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(rating.avg)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill={
                            star <= Math.round(rating.avg)
                              ? "#facc15"
                              : "none"
                          }
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating.total > 0 ? `(${rating.total})` : "No Ratings"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-[12px] font-semibold text-pink-600">
                        {p.distanceMiles}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {p.distanceText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRICE */}
                <div className="w-full lg:w-[15%] text-pink-600 font-bold text-[20px] text-center">
                  £{p.price}
                </div>

                {/* PACKING */}
                <div className="w-full lg:w-[12%] text-center text-[16px] font-semibold">
                  {p.packing}
                </div>

                {/* ASSEMBLY */}
                <div className="w-full lg:w-[15%] text-center text-[16px] font-semibold">
                  {p.insurance}
                </div>

                {/* BOOK SERVICE BUTTON — FIXED */}
                <div className="w-full lg:w-[18%] flex justify-center lg:justify-end">
                  <button
                    onClick={() => {
                      if (
                        !isAuthenticated ||
                        ["Admin", "Administrator", "System Manager", "Logistics Manager"].includes(user?.role)
                      ) {
                        toast.error(
                          "Only users can book service. Please login as a user to continue."
                        );
                        return;
                      }
navigate("/book-service", {
  state: {
    provider: p.original,
    companyName: p.name,
    pickupPincode,
    dropoffPincode,
    distanceMiles: distanceMilesExact,
    distanceKm,
    pickup: state?.pickup,
    dropoff: state?.dropoff,
    pickupCoords: state?.pickupCoords,
    dropoffCoords: state?.dropoffCoords,
    routeGeometry: state?.routeGeometry,

    // ⭐ NEW VALUES YOU WANT
    totalVolume: p.original.cost_calculation?.total_volume_m3,
    assemblyItems: p.original.cost_calculation?.assembly_items,
  },
});

                    }}
                    className="px-7 py-2 bg-pink-600 text-white font-semibold rounded-full shadow hover:bg-pink-700 transition w-full lg:w-auto"
                  >
                    Book Service
                  </button>
                </div>
              </div>

              {/* INCLUDED SECTION */}
              <div className="mt-2 pt-3">
                <button
                  onClick={() => toggleGallery("inc-" + index)}
                  className="w-full flex items-center justify-between bg-pink-600 hover:bg-pink-700 transition text-white px-5 py-3 rounded-xl font-semibold shadow-sm"
                >
                  <span className="text-[15px]">What's Included?</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      openGallery["inc-" + index] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openGallery["inc-" + index] && (
                  <div className="bg-white p-6 border border-gray-200 rounded-xl mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">

                    {/* Includes */}
                    <div>
                      <h4 className="font-bold text-pink-600 text-[15px] mb-2">
                        Includes:
                      </h4>
                      <ul className="space-y-2">
                        {(p.original.includes || []).map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="h-4 w-4 text-pink-600 mt-0.5 " />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Protection */}
                    <div>
                      <h4 className="font-bold text-pink-600 text-[15px] mb-2">
                        Protection:
                      </h4>
                      <ul className="space-y-2">
                        {(p.original.protection || []).map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="h-4 w-4 text-pink-600 mt-0.5" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Materials */}
                    <div>
                      <h4 className="font-bold text-pink-600 text-[15px] mb-2">
                        Materials:
                      </h4>
                      <ul className="space-y-2">
                        {(p.original.material || []).map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="h-4 w-4 text-pink-600 mt-0.5" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Furniture */}
                    <div>
                      <h4 className="font-bold text-pink-600 text-[15px] mb-2">
                        Furniture:
                      </h4>
                      <ul className="space-y-2">
                        {(p.original.furniture || []).map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="h-4 w-4 text-pink-600  mt-0.5" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Appliances */}
                    <div>
                      <h4 className="font-bold text-pink-600 text-[15px] mb-2">
                        Appliances:
                      </h4>
                      <ul className="space-y-2">
                        {(p.original.appliances || []).map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <Check className="h-4 w-4 text-pink-600 mt-0.5" />
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="font-bold text-pink-600 text-[15px] mb-2">
                        Summary:
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-[14px]">
                        {p.original.summary?.trim()
                          ? p.original.summary
                          : p.original.description?.trim()
                          ? p.original.description
                          : p.original.company_description?.trim()
                          ? p.original.company_description
                          : "Summary not provided"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* GALLERY SECTION */}
              <div className="px-4 sm:px-6 py-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleGallery(index)}
                    className="flex items-center gap-2 text-pink-600 font-semibold hover:underline"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Gallery
                  </button>
                </div>

                {openGallery[index] && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {p.gallery.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="rounded-lg border object-cover w-full h-28 sm:h-32 lg:h-36"
                        alt="company"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FilteredProvidersPage;
