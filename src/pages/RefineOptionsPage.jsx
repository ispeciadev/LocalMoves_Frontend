// src/pages/RefineOptionsPage.jsx
import React, { useState } from "react";
import { ChevronDown, Route } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// --------------------------------------------------------------
//  LEAFLET MAP BUILDER
// --------------------------------------------------------------
const generateCustomMap = (pickupCoords, dropoffCoords, routeGeometry) => {
  if (!pickupCoords && !dropoffCoords) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Move Route Map</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style> body { margin: 0; padding: 0; } #map { height: 100%; width: 100%; } </style>
      </head>
      <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
              var map = L.map('map').setView([20.5937, 78.9629], 5);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors'
              }).addTo(map);
          </script>
      </body>
      </html>
    `;
  }

  let centerLat, centerLon, zoom;
  let markers = [];
  let polyline = null;

  if (pickupCoords && dropoffCoords) {
    centerLat = (pickupCoords.lat + dropoffCoords.lat) / 2;
    centerLon = (pickupCoords.lon + dropoffCoords.lon) / 2;
    zoom = 10;

    markers.push(
      { lat: pickupCoords.lat, lon: pickupCoords.lon, text: "Pickup" },
      { lat: dropoffCoords.lat, lon: dropoffCoords.lon, text: "Dropoff" }
    );

    polyline = routeGeometry
      ? routeGeometry.coordinates.map(([lon, lat]) => [lat, lon])
      : [
          [pickupCoords.lat, pickupCoords.lon],
          [dropoffCoords.lat, dropoffCoords.lon],
        ];
  } else if (pickupCoords) {
    centerLat = pickupCoords.lat;
    centerLon = pickupCoords.lon;
    zoom = 12;
    markers.push({ lat: pickupCoords.lat, lon: pickupCoords.lon, text: "Pickup" });
  } else {
    centerLat = dropoffCoords.lat;
    centerLon = dropoffCoords.lon;
    zoom = 12;
    markers.push({ lat: dropoffCoords.lat, lon: dropoffCoords.lon, text: "Dropoff" });
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style> body { margin: 0; padding: 0; } #map { height: 520px; width: 100%; } </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            var map = L.map('map').setView([${centerLat}, ${centerLon}], ${zoom});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

            ${markers
              .map(
                (m) => `
                L.marker([${m.lat}, ${m.lon}])
                  .addTo(map)
                  .bindPopup('${m.text}');
              `
              )
              .join("")}

            ${
              polyline
                ? `
                var pinkRoute = L.polyline(${JSON.stringify(polyline)}, {
                  color: '#ec4899', weight: 6, opacity: 0.8, dashArray: '10, 10'
                }).addTo(map);

                map.fitBounds(pinkRoute.getBounds());
              `
                : ""
            }
        </script>
    </body>
    </html>
  `;
};

// --------------------------------------------------------------
//  FULL INVENTORY (grouped by category)
//  — This is the inventory you provided, now grouped for the UI
// --------------------------------------------------------------
const INVENTORY_DATA = [
  // Living Room Items
  { category: "Living Room", item_name: 'TV up to 45"', average_volume: 0.10 },
  { category: "Living Room", item_name: 'TV up to 75"', average_volume: 0.20 },
  { category: "Living Room", item_name: "TV Stand", average_volume: 0.30 },
  { category: "Living Room", item_name: "Desk Standard", average_volume: 0.50 },
  { category: "Living Room", item_name: "Desk Large", average_volume: 0.75 },
  { category: "Living Room", item_name: "Armchair", average_volume: 1.0 },
  { category: "Living Room", item_name: "2 Seater Sofa", average_volume: 1.5 },
  { category: "Living Room", item_name: "3 Seater Sofa", average_volume: 2.0 },
  { category: "Living Room", item_name: "4 Seater Sofa", average_volume: 2.5 },
  { category: "Living Room", item_name: "Corner Sofa", average_volume: 3.5 },
  { category: "Living Room", item_name: "Cabinet Large", average_volume: 1.0 },
  { category: "Living Room", item_name: "Bookcase Large", average_volume: 0.8 },
  { category: "Living Room", item_name: "Grandfather Clock", average_volume: 0.6 },
  { category: "Living Room", item_name: "Other Medium Item LR", average_volume: 0.5 },
  { category: "Living Room", item_name: "Other Large Item LR", average_volume: 1.0 },
  { category: "Living Room", item_name: "Dining Table 4 Seater", average_volume: 1.0 },
  { category: "Living Room", item_name: "Dining Table 6 Seater", average_volume: 1.5 },
  { category: "Living Room", item_name: "Dining Table 8 Seater", average_volume: 2.0 },
  { category: "Living Room", item_name: "Dining Chair", average_volume: 0.15 },
  { category: "Living Room", item_name: "Misc Chairs LR", average_volume: 0.25 },
  { category: "Living Room", item_name: "Sideboard LR", average_volume: 1.2 },
  { category: "Living Room", item_name: "Coffee Table", average_volume: 0.3 },
  { category: "Living Room", item_name: "Cabinet Small", average_volume: 0.4 },
  { category: "Living Room", item_name: "Bookcase Small LR", average_volume: 0.5 },
  { category: "Living Room", item_name: "Shelves Contents Only", average_volume: 0.1 },
  { category: "Living Room", item_name: "Ornaments Fragile LR", average_volume: 0.1 },
  { category: "Living Room", item_name: "Plant Small LR", average_volume: 0.05 },
  { category: "Living Room", item_name: "Plant Tall LR", average_volume: 0.15 },
  { category: "Living Room", item_name: "Piano Upright", average_volume: 2.0 },

  // Kitchen Items
  { category: "Kitchen", item_name: "Fridge Under Counter", average_volume: 0.4 },
  { category: "Kitchen", item_name: "Fridge Freezer Upright", average_volume: 0.7 },
  { category: "Kitchen", item_name: "Fridge Freezer American", average_volume: 1.2 },
  { category: "Kitchen", item_name: "Freezer Under Counter", average_volume: 0.4 },
  { category: "Kitchen", item_name: "Freezer Chest", average_volume: 0.8 },
  { category: "Kitchen", item_name: "Washing Machine", average_volume: 0.6 },
  { category: "Kitchen", item_name: "Tumble Dryer", average_volume: 0.6 },
  { category: "Kitchen", item_name: "Cooker Standard", average_volume: 0.5 },
  { category: "Kitchen", item_name: "Dishwasher", average_volume: 0.6 },
  { category: "Kitchen", item_name: "Other Medium Item Kitchen", average_volume: 0.5 },
  { category: "Kitchen", item_name: "Other Large Item Kitchen", average_volume: 1.0 },
  { category: "Kitchen", item_name: "Kitchen Dining Table 4 Seater", average_volume: 1.0 },
  { category: "Kitchen", item_name: "Kitchen Dining Table 6 Seater", average_volume: 1.5 },
  { category: "Kitchen", item_name: "Kitchen Dining Table 8 Seater", average_volume: 2.0 },
  { category: "Kitchen", item_name: "Kitchen Dining Chair", average_volume: 0.15 },
  { category: "Kitchen", item_name: "Misc Chairs Kitchen", average_volume: 0.25 },
  { category: "Kitchen", item_name: "Ornaments Kitchen", average_volume: 0.1 },
  { category: "Kitchen", item_name: "Plant Small Kitchen", average_volume: 0.05 },
  { category: "Kitchen", item_name: "Plant Tall Kitchen", average_volume: 0.15 },
  { category: "Kitchen", item_name: "Kitchen Bin", average_volume: 0.1 },
  { category: "Kitchen", item_name: "General Small Medium Kitchen", average_volume: 0.2 },

  // Bathroom/Hallway Items
  { category: "Other / Bathroom / Hallway", item_name: "Sideboard Bathroom", average_volume: 1.2 },
  { category: "Other / Bathroom / Hallway", item_name: "Other Medium Bathroom", average_volume: 0.5 },
  { category: "Other / Bathroom / Hallway", item_name: "Other Large Bathroom", average_volume: 1.0 },
  { category: "Other / Bathroom / Hallway", item_name: "Bookcase Large Bathroom", average_volume: 0.8 },
  { category: "Other / Bathroom / Hallway", item_name: "Exercise Bike Hallway", average_volume: 0.8 },
  { category: "Other / Bathroom / Hallway", item_name: "Piano Upright Hallway", average_volume: 2.0 },
  { category: "Other / Bathroom / Hallway", item_name: "Cross Trainer Hallway", average_volume: 1.5 },
  { category: "Other / Bathroom / Hallway", item_name: "Treadmill Hallway", average_volume: 1.5 },
  { category: "Other / Bathroom / Hallway", item_name: "Bookcase Small Bathroom", average_volume: 0.5 },
  { category: "Other / Bathroom / Hallway", item_name: "Ornaments Bathroom", average_volume: 0.1 },
  { category: "Other / Bathroom / Hallway", item_name: "Plant Small Bathroom", average_volume: 0.05 },
  { category: "Other / Bathroom / Hallway", item_name: "Plant Tall Bathroom", average_volume: 0.15 },
  { category: "Other / Bathroom / Hallway", item_name: "General Small Bathroom", average_volume: 0.2 },

  // Garden/Garage Items
  { category: "Garden / Garage / Loft", item_name: "Garden Table", average_volume: 0.8 },
  { category: "Garden / Garage / Loft", item_name: "Garden Storage Box", average_volume: 1.0 },
  { category: "Garden / Garage / Loft", item_name: "Other Medium Garden", average_volume: 0.5 },
  { category: "Garden / Garage / Loft", item_name: "Other Large Garden", average_volume: 1.0 },
  { category: "Garden / Garage / Loft", item_name: "Shelving Unit Large", average_volume: 0.7 },
  { category: "Garden / Garage / Loft", item_name: "Exercise Bike Garden", average_volume: 0.8 },
  { category: "Garden / Garage / Loft", item_name: "Cross Trainer Garden", average_volume: 1.5 },
  { category: "Garden / Garage / Loft", item_name: "Treadmill Garden", average_volume: 1.5 },
  { category: "Garden / Garage / Loft", item_name: "Lawnmower", average_volume: 0.4 },
  { category: "Garden / Garage / Loft", item_name: "Fridge Freezer Garden", average_volume: 0.7 },
  { category: "Garden / Garage / Loft", item_name: "Freezer Chest Garden", average_volume: 0.8 },
  { category: "Garden / Garage / Loft", item_name: "BBQ Standard", average_volume: 0.6 },
  { category: "Garden / Garage / Loft", item_name: "Garden Tools Small", average_volume: 0.1 },
  { category: "Garden / Garage / Loft", item_name: "Garden Tools Large", average_volume: 0.25 },
  { category: "Garden / Garage / Loft", item_name: "Bookcase Small Garden", average_volume: 0.5 },
  { category: "Garden / Garage / Loft", item_name: "Garden Ornaments", average_volume: 0.15 },
  { category: "Garden / Garage / Loft", item_name: "Plant Small Garden", average_volume: 0.05 },
  { category: "Garden / Garage / Loft", item_name: "Plant Tall Garden", average_volume: 0.15 },
  { category: "Garden / Garage / Loft", item_name: "General Small Garden", average_volume: 0.2 },
  { category: "Garden / Garage / Loft", item_name: "Garden Shed Dismantled", average_volume: 5.0 },

  // Bedroom Items
  { category: "Bedroom", item_name: "Single Bed", average_volume: 1.0 },
  { category: "Bedroom", item_name: "Double Bed", average_volume: 1.5 },
  { category: "Bedroom", item_name: "KingSize Bed", average_volume: 2.0 },
  { category: "Bedroom", item_name: "Mattress Single", average_volume: 0.6 },
  { category: "Bedroom", item_name: "Mattress Double", average_volume: 0.8 },
  { category: "Bedroom", item_name: "Mattress KingSize", average_volume: 1.0 },
  { category: "Bedroom", item_name: "Cot", average_volume: 0.4 },
  { category: "Bedroom", item_name: "Bunk Bed", average_volume: 2.5 },
  { category: "Bedroom", item_name: "Bedside Table", average_volume: 0.3 },
  { category: "Bedroom", item_name: "TV 45 Bedroom", average_volume: 0.1 },
  { category: "Bedroom", item_name: "TV 75 Bedroom", average_volume: 0.2 },
  { category: "Bedroom", item_name: "Misc Chairs Bedroom", average_volume: 0.25 },
  { category: "Bedroom", item_name: "Desk Standard Bedroom", average_volume: 0.5 },
  { category: "Bedroom", item_name: "Desk Large Bedroom", average_volume: 0.75 },
  { category: "Bedroom", item_name: "Chest Of 4 Drawers", average_volume: 0.7 },
  { category: "Bedroom", item_name: "Chest Of 6 Drawers", average_volume: 0.9 },
  { category: "Bedroom", item_name: "Chest Drawers Double", average_volume: 1.2 },
  { category: "Bedroom", item_name: "Wardrobe Single", average_volume: 1.0 },
  { category: "Bedroom", item_name: "Wardrobe Double", average_volume: 1.5 },
  { category: "Bedroom", item_name: "Wardrobe Triple", average_volume: 2.0 },
  { category: "Bedroom", item_name: "Wardrobe Quad", average_volume: 2.5 },
  { category: "Bedroom", item_name: "Sideboard Bedroom", average_volume: 1.2 },
  { category: "Bedroom", item_name: "Other Medium Bedroom", average_volume: 0.5 },
  { category: "Bedroom", item_name: "Other Large Bedroom", average_volume: 1.0 },
  { category: "Bedroom", item_name: "Bookcase Large Bedroom", average_volume: 0.8 },
  { category: "Bedroom", item_name: "Bookcase Small Bedroom", average_volume: 0.5 },
  { category: "Bedroom", item_name: "Suitcases", average_volume: 0.2 },
  { category: "Bedroom", item_name: "Ornaments Bedroom", average_volume: 0.1 },
  { category: "Bedroom", item_name: "Other Bedroom", average_volume: 0.2 },
];

// Build grouped structure for UI
const INVENTORY_BY_CATEGORY = INVENTORY_DATA.reduce((acc, it) => {
  if (!acc[it.category]) acc[it.category] = [];
  acc[it.category].push(it);
  return acc;
}, {});

// --------------------------------------------------------------
//  MAIN COMPONENT
// --------------------------------------------------------------
const RefineOptionsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const providers = state?.providers || [];
  const providersCount = providers.length;

  const pickupCoords = state?.pickupCoords;
  const dropoffCoords = state?.dropoffCoords;
  const routeGeometry = state?.routeGeometry;

  const pickupPincode = state?.pickupPincode || "";
  const dropoffPincode = state?.dropoffPincode || "";

  const pickup = state?.pickup || "";
  const dropoff = state?.dropoff || "";

  const distanceMiles = state?.distanceMiles;
  const distanceKm = state?.distanceKm;

 const [open, setOpen] = useState({
    availability: false,
    extras: false,
    booking: false,
    freebies: false,
});

  const [filters, setFilters] = useState({
    availability: [],
    extras: [],
    booking: [],
    freebies: [],
    items: [],
  });

  // itemQuantities stores { "<item_name>": number }
  const [itemQuantities, setItemQuantities] = useState({});
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);
  const [apiError, setApiError] = useState(null);

  const toggleSection = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFilter = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((i) => i !== value)
        : [...prev[group], value],
    }));
  };

  // updateItemQuantity now works with category items and keeps UI state
  const updateItemQuantity = (key, newQtyRaw) => {
    const parsed = Number(newQtyRaw);
    const newQty = isNaN(parsed) ? 0 : Math.max(0, parsed);

    setItemQuantities((prev) => {
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[key];
      } else {
        updated[key] = newQty;
      }
      return updated;
    });

    setFilters((prev) => {
      const exists = prev.items.includes(key);
      if (newQty > 0 && !exists) return { ...prev, items: [...prev.items, key] };
      if (newQty <= 0 && exists)
        return { ...prev, items: prev.items.filter((i) => i !== key) };
      return prev;
    });
  };

  const resetAll = () => {
    setFilters({
      availability: [],
      extras: [],
      booking: [],
      freebies: [],
      items: [],
    });
    setItemQuantities({});
    setApiError(null);
  };

  // ⭐ ONLY FIX — Go to Filtered Providers Page
  const applyFilters = async () => {
    setIsLoadingCosts(true);
    setApiError(null);

    // payload expects selected_items mapping
    const selected_items = {};
    Object.entries(itemQuantities).forEach(([k, v]) => {
      if (v > 0) selected_items[k] = v;
    });

    try {
      const payload = {
        pincode: String(pickupPincode),
        distance_miles: distanceMiles,
        selected_items,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_with_cost",
        payload
      );

      const msg = response?.data?.message;
      const apiProviders = msg?.companies || msg?.providers || msg || providers;

      navigate("/filtered-providers", {
        state: {
          ...state,
          refineFilters: filters,
          itemQuantities,
          providers: apiProviders,

          pickup,
          dropoff,
          pickupPincode,
          dropoffPincode,

          pickupCoords,
          dropoffCoords,
          routeGeometry,

          distanceMiles,
          distanceKm,
        },
      });
    } catch (err) {
      console.error("Error applying filters, navigating with local data:", err);
      // If API fails, still navigate with the local providers list (graceful)
      navigate("/filtered-providers", {
        state: {
          ...state,
          refineFilters: filters,
          itemQuantities,
          providers,

          pickup,
          dropoff,
          pickupPincode,
          dropoffPincode,

          pickupCoords,
          dropoffCoords,
          routeGeometry,

          distanceMiles,
          distanceKm,
        },
      });
    } finally {
      setIsLoadingCosts(false);
    }
  };

  return (
    <section className="w-full min-h-screen bg-white px-4 md:px-10 py-10 flex flex-col lg:flex-row gap-10">
      {/* LEFT PANEL */}
      <div className="lg:w-[45%] w-full flex justify-center">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-200">
          <div className="absolute -top-8 right-6 bg-pink-600 w-16 h-16 rounded-full text-white flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{providersCount}</span>
            <span className="text-[10px]">Providers</span>
          </div>

          {/* Header */}
          <div className="px-6 pt-8 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
              Refine Your Options Further
            </h1>
            <p className="text-gray-700 text-sm mt-2">
              Select features you value and filter providers accordingly.
            </p>
          </div>

          {/* Reset */}
          <div className="px-6 pb-2 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="font-semibold text-pink-600 text-sm">Best Features</span>
            <button
              onClick={resetAll}
              className="text-[11px] text-gray-500 hover:text-pink-600"
            >
              Reset All
            </button>
          </div>

          {/* Accordions */}
          <div className="border-t border-gray-100">
            <AccordionSection
              title="Availability"
              open={open.availability}
              onToggle={() => toggleSection("availability")}
              options={["Weekdays", "Weekends", "Same Day Service"]}
              group="availability"
              filters={filters}
              toggleFilter={toggleFilter}
            />

            <AccordionSection
              title="Extras"
              open={open.extras}
              onToggle={() => toggleSection("extras")}
              options={["Storage Service", "Packing Materials", "Deep Cleaning"]}
              group="extras"
              filters={filters}
              toggleFilter={toggleFilter}
            />

            <AccordionSection
              title="Booking"
              open={open.booking}
              onToggle={() => toggleSection("booking")}
              options={["Pay in Installments", "Instant Booking"]}
              group="booking"
              filters={filters}
              toggleFilter={toggleFilter}
            />

            <AccordionSection
              title="Freebies"
              open={open.freebies}
              onToggle={() => toggleSection("freebies")}
              options={["Free Packing Tape", "Free Boxes"]}
              group="freebies"
              filters={filters}
              toggleFilter={toggleFilter}
            />
          </div>

          {/* Items - NEW: grouped categories with quantities */}
          <div className="px-6 pt-5 pb-4 border-t border-gray-100">
            <h3 className="text-pink-600 font-semibold text-sm mb-1">
              What do you need help moving?
            </h3>
            <p className="text-[11px] text-gray-500 mb-3">
              Set quantities for each item (use +/- or type number).
            </p>

            <div className="space-y-4">
              {Object.keys(INVENTORY_BY_CATEGORY).map((category) => (
                <div key={category} className="border rounded-lg">
                  <details className="group">
                    <summary className="px-4 py-2 flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-sm">{category}</span>
                      <span className="text-xs text-gray-500 group-open:rotate-0 transition-transform">
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </summary>

                    <div className="px-3 pb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {INVENTORY_BY_CATEGORY[category].map((item) => {
                          const key = item.item_name;
                          const qty = itemQuantities[key] || 0;
                          const isActive = qty > 0;
                          return (
                            <div
                              key={key}
                              className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                                isActive
                                  ? "bg-pink-50 border-pink-500 text-pink-700"
                                  : "border-gray-300 text-gray-700"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-[12px] font-medium">{item.item_name}</span>
                                <span className="text-[11px] text-gray-500">
                                  Vol: {item.average_volume} m³
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="w-7 h-7 rounded-full border border-gray-300 text-xs flex items-center justify-center"
                                  onClick={() => updateItemQuantity(key, (qty || 0) - 1)}
                                  aria-label={`Decrease ${item.item_name}`}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={qty}
                                  onChange={(e) => updateItemQuantity(key, e.target.value)}
                                  className="w-14 h-7 text-xs border border-gray-300 rounded text-center"
                                />
                                <button
                                  type="button"
                                  className="w-7 h-7 rounded-full border border-gray-300 text-xs flex items-center justify-center"
                                  onClick={() => updateItemQuantity(key, (qty || 0) + 1)}
                                  aria-label={`Increase ${item.item_name}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* APPLY */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={applyFilters}
              disabled={isLoadingCosts}
              className={`w-full border-2 border-pink-500 rounded-full py-3 text-sm font-semibold ${
                isLoadingCosts
                  ? "bg-pink-100 text-pink-400 cursor-not-allowed"
                  : "text-pink-600 hover:bg-pink-600 hover:text-white"
              }`}
            >
              {isLoadingCosts ? "Updating Results..." : "Update Results"}
            </button>
            {apiError && (
              <p className="text-[11px] text-red-500 mt-2 text-center">
                {apiError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: MAP */}
      <div className="lg:flex-1 w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
        <div className="bg-pink-600 text-white p-4 flex items-center gap-2">
          <Route className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Move Route</h3>
        </div>

        {/* Pickup → Dropoff */}
        <div className="px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {pickupPincode}
            </span>
            <span className="text-pink-400">━━━━●━━━━</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {dropoffPincode}
            </span>
          </div>

          {/* ⭐ TOP DISTANCE LIKE HERO */}
          {distanceMiles && distanceKm && (
            <div className="text-pink-600 text-xs mt-1 flex items-center gap-2">
              <div className="w-3 h-1 bg-pink-400 rounded-full"></div>
              <span>
                {distanceMiles} miles ({distanceKm} km)
              </span>
            </div>
          )}
        </div>

        {/* MAP + OVERLAY */}
        <div style={{ height: "520px" }} className="relative">
          <iframe
            title="Route Map"
            srcDoc={generateCustomMap(pickupCoords, dropoffCoords, routeGeometry)}
            className="w-full h-full border-0"
          ></iframe>

          {distanceMiles && distanceKm && (
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
              <div className="text-white text-sm flex items-center gap-2">
                <div className="w-3 h-1 bg-pink-400 rounded-full"></div>
                <span>
                  {distanceMiles} miles ({distanceKm} km) route calculated
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RefineOptionsPage;

// --------------------------------------------------------------
//  ACCORDION SECTION
// --------------------------------------------------------------
const AccordionSection = ({
  title,
  open,
  onToggle,
  options,
  group,
  filters,
  toggleFilter,
}) => (
  <div className="border-b border-gray-100">
    <button
      className="w-full flex items-center justify-between px-6 py-3 font-semibold text-sm text-gray-800 hover:bg-pink-50"
      onClick={onToggle}
      type="button"
    >
      <span>{title}</span>
      <ChevronDown className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`} />
    </button>

    {open && (
      <div className="px-6 pb-4 space-y-2 text-sm text-gray-700">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-pink-600"
              checked={filters[group].includes(opt)}
              onChange={() => toggleFilter(group, opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    )}
  </div>
);
