// HeroSection.jsx (FINAL FIXED WITH COUNT API + NO OTHER CHANGES)
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { MapPin, Check, Truck, Route } from "lucide-react";
import axios from "axios";

const HeroSection = () => {
  const navigate = useNavigate();

  // STATES
  const [pickupPincode, setPickupPincode] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [dropoffPincode, setDropoffPincode] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [propertySize, setPropertySize] = useState("");

  const [companies, setCompanies] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDrop, setLoadingDrop] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  const [distanceKm, setDistanceKm] = useState(null);
  const distanceMiles = distanceKm ? (distanceKm * 0.621371).toFixed(1) : null;

  const [additionalSpaces, _setAdditionalSpaces] = useState([]); // FIXED unused setter

  // ⭐ NEW STATE FOR COMPANY COUNT
  const [_loadingCount, setLoadingCount] = useState(false); // FIXED unused state
  const [companyCount, setCompanyCount] = useState(null);

  // TOAST
  const showToast = (message) => {
    if (document.querySelector(".toast-msg")) return;
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "toast-msg";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: "#dc2626",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      zIndex: "9999",
      fontWeight: "500",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      opacity: "0",
      transform: "translateY(20px)",
    });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 10);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  const isValidPincode = (pincode) => /^[A-Za-z0-9]{3,10}$/.test(pincode);

  // ⭐ COUNT API
  const fetchCompanyCount = async (pincode) => {
    try {
      setLoadingCount(true);
      const res = await axios.post(
        "http://127.0.0.1:8000/api/method/localmoves.api.company.search_number_of_companies_by_pincode",
        { pincode }
      );
      const msg = res.data?.message;
      if (msg?.success) {
        setCompanyCount(msg.count ?? 0);
      } else {
        setCompanyCount(0);
      }
    } catch (error) {
      console.error("Count error:", error);
      setCompanyCount(0);
    } finally {
      setLoadingCount(false);
    }
  };

  // GET COORDS
  const getCoordinatesFromPincode = async (pincode) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&countrycodes=in&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          address: data[0].display_name,
        };
      }

      const intlResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&limit=1`
      );
      const intlData = await intlResponse.json();

      if (intlData && intlData.length > 0) {
        return {
          lat: parseFloat(intlData[0].lat),
          lon: parseFloat(intlData[0].lon),
          address: intlData[0].display_name,
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // ROUTE API
  const getRoute = async (pickup, dropoff) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        setDistanceKm((data.routes[0].distance / 1000).toFixed(1));
        return data.routes[0].geometry;
      }
      return null;
    } catch (error) {
      console.error("Routing error:", error);
      return null;
    }
  };

  // MAP BUILDER
  const generateCustomMap = () => {
    if (!pickupCoords && !dropoffCoords) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Move Route Map</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 350px; width: 100%; }
            </style>
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
        </html>`;
    }

    let centerLat, centerLon, zoom;
    let markers = [];
    let polyline = null;

    if (pickupCoords && dropoffCoords) {
      centerLat = (pickupCoords.lat + dropoffCoords.lat) / 2;
      centerLon = (pickupCoords.lon + dropoffCoords.lon) / 2;
      zoom = 10;

      markers.push({
        lat: pickupCoords.lat,
        lon: pickupCoords.lon,
        color: "green",
        text: "Pickup",
      });

      markers.push({
        lat: dropoffCoords.lat,
        lon: dropoffCoords.lon,
        color: "red",
        text: "Dropoff",
      });

      if (routeGeometry) {
        polyline = routeGeometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);
      } else {
        polyline = [
          [pickupCoords.lat, pickupCoords.lon],
          [dropoffCoords.lat, dropoffCoords.lon],
        ];
      }
    } else if (pickupCoords) {
      centerLat = pickupCoords.lat;
      centerLon = pickupCoords.lon;
      zoom = 12;
      markers.push({
        lat: pickupCoords.lat,
        lon: pickupCoords.lon,
        color: "green",
        text: "Pickup",
      });
    } else if (dropoffCoords) {
      centerLat = dropoffCoords.lat;
      centerLon = dropoffCoords.lon;
      zoom = 12;
      markers.push({
        lat: dropoffCoords.lat,
        lon: dropoffCoords.lon,
        color: "red",
        text: "Dropoff",
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Move Route Map</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
              body { margin: 0; padding: 0; }
              #map { height: 350px; width: 100%; }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
              var map = L.map('map').setView([${centerLat}, ${centerLon}], ${zoom});

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors'
              }).addTo(map);

              ${markers
                .map(
                  (marker) => `
                L.marker([${marker.lat}, ${marker.lon}])
                  .addTo(map)
                  .bindPopup('${marker.text}')`
                )
                .join("")}

              ${
                polyline
                  ? `
                var pinkRoute = L.polyline(${JSON.stringify(polyline)}, {
                  color: '#ec4899',
                  weight: 6,
                  opacity: 0.8,
                  lineJoin: 'round',
                  dashArray: '10, 10'
                }).addTo(map);

                map.fitBounds(pinkRoute.getBounds());`
                  : ""
              }
          </script>
      </body>
      </html>`;
  };

  // API CALL FOR COMPANIES
  const fetchCompaniesByPincode = useCallback(
    async (pincode) => {
      setLoadingCompanies(true);

      try {
        const payload = {
          pincode: pincode,
          property_type: serviceType,
          property_size: propertySize,
          distance_miles: distanceMiles ? Number(distanceMiles) : 1,
          additional_spaces: additionalSpaces || [],
          user_email: localStorage.getItem("user_email") || localStorage.getItem("email"),
          send_email: "True",
        };

        const res = await axios.post(
          "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_by_pincode",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        const msg = res.data?.message;
        const data = msg?.success && Number(msg?.count) > 0 ? msg.data : [];

        setCompanies(data || []);
        return data;
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompanies([]);
        return [];
      } finally {
        setLoadingCompanies(false);
      }
    },
    [serviceType, propertySize, distanceMiles, additionalSpaces]
  );

  const fetchCityFromPincode = async (
    pincode,
    setCity,
    setLoading,
    isPickup = false
  ) => {
    if (!isValidPincode(pincode)) {
      setCity("");
      if (isPickup) setPickupCoords(null);
      else setDropoffCoords(null);
      showToast("Please enter a valid pincode.");
      return;
    }

    setLoading(true);
    let cityFound = "";
    let coordinates = null;

    try {
      if (/^[1-9][0-9]{5}$/.test(pincode)) {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );
        const data = await res.json();
        if (data?.[0]?.Status === "Success") {
          const po = data[0].PostOffice?.[0];
          if (po) {
            cityFound = `${po.Name}, ${po.District}, ${po.State}`;
            coordinates = await getCoordinatesFromPincode(pincode);
          }
        }
      }

      if (cityFound) {
        setCity(cityFound);

        if (isPickup) {
          setPickupCoords(coordinates);

          if (/^[1-9][0-9]{5}$/.test(pincode)) {
            await fetchCompaniesByPincode(pincode);

            // ⭐ CALL COMPANY COUNT API
            fetchCompanyCount(pincode);
          }
        } else {
          setDropoffCoords(coordinates);
        }

        if (isPickup && dropoffCoords && coordinates) {
          const route = await getRoute(coordinates, dropoffCoords);
          setRouteGeometry(route);
        } else if (!isPickup && pickupCoords && coordinates) {
          const route = await getRoute(pickupCoords, coordinates);
          setRouteGeometry(route);
        }
      } else {
        setCity("");
        if (isPickup) setPickupCoords(null);
        else setDropoffCoords(null);
        showToast("Please enter a valid pincode.");
      }
    } catch (err) {
      console.error("Pincode lookup error:", err);
      setCity("");
      if (isPickup) setPickupCoords(null);
      else setDropoffCoords(null);
      showToast("Please enter a valid pincode.");
    } finally {
      setLoading(false);
    }
  };

  // COMPARE HANDLER
  const handleCompare = useCallback(
    async (e) => {
      e.preventDefault();

      if (!pickupCoords || !dropoffCoords) {
        showToast("Please enter valid pincodes and wait for lookup.");
        return;
      }

      let companyList = companies;

      if (!companyList.length && /^[1-9][0-9]{5}$/.test(pickupPincode)) {
        companyList = await fetchCompaniesByPincode(pickupPincode);
      }

      navigate("/compare", {
        state: {
          pickupPincode,
          pickup: pickupCity,
          dropoffPincode,
          dropoff: dropoffCity,

          serviceType,
          propertySize,
          distanceKm,
          distanceMiles,

          companies: companyList,
          pickupCoords,
          dropoffCoords,
          routeGeometry,
        },
      });
    },
    [
      pickupPincode,
      pickupCity,
      dropoffPincode,
      dropoffCity,
      serviceType,
      propertySize,
      companies,
      fetchCompaniesByPincode,
      navigate,
      pickupCoords,
      dropoffCoords,
      routeGeometry,
      distanceKm,
      distanceMiles,
    ]
  );

  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-between bg-white overflow-hidden pt-6 md:pt-10 lg:pt-14 pb-16 px-6 md:px-16 lg:px-20">
      <div className="absolute top-0 left-0 w-[260px] h-[260px] bg-pink-300 opacity-30 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[260px] h-[260px] bg-pink-300 opacity-30 blur-3xl rounded-full pointer-events-none"></div>

      {/* LEFT SIDE */}
      <Motion.div
        className="lg:w-[55%] w-full space-y-6 relative z-10 flex flex-col order-1 lg:pr-0"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-pink-600">
            The Complete <br /> Moving Service
          </h1>
          <p className="text-gray-700 text-lg mt-2">
            Compare Removal Providers In{" "}
            <span className="text-pink-500 font-semibold">
              {pickupCity || "Your Area"}
            </span>
          </p>
        </div>

        <Motion.form
          onSubmit={handleCompare}
          className="relative bg-white border border-gray-200 rounded-2xl shadow-lg px-8 py-6 z-10 w-full max-w-2xl mt-8"
        >
          <div className="absolute -top-7 -left-7 w-32 h-32 bg-pink-300 opacity-30 blur-2xl rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-7 -right-7 w-32 h-32 bg-pink-300 opacity-30 blur-2xl rounded-full pointer-events-none"></div>

          <h3 className="font-semibold text-gray-800 mb-5 text-center lg:text-left">
            Search for Moving Services
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            {/* PICKUP */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="text-pink-600 h-4 w-4" /> Pickup Pincode
              </label>

              <input
                type="text"
                placeholder="Enter Pickup Pincode"
                value={pickupPincode}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setPickupPincode(val);

                  if (val.length >= 3) {
                    fetchCityFromPincode(
                      val,
                      setPickupCity,
                      setLoadingPickup,
                      true
                    );

                    // ⭐ CALL COMPANY COUNT API ON CHANGE
                    fetchCompanyCount(val);
                  } else {
                    setPickupCity("");
                    setPickupCoords(null);
                    setCompanies([]);
                    setRouteGeometry(null);
                    setDistanceKm(null);
                    setCompanyCount(null);
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 
                focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                required
              />

              <p className="text-xs text-gray-600 mt-1 h-5">
                {loadingPickup
                  ? "Fetching city..."
                  : pickupCity && `📍 ${pickupCity}`}
              </p>

              <div className="mt-2 text-sm text-gray-700">
                {loadingCompanies ? (
                  <div className="flex items-center gap-2 text-pink-600">
                    <Truck size={16} /> Fetching available companies...
                  </div>
                ) : /^[1-9][0-9]{5}$/.test(pickupPincode) ? (
                  companyCount > 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Truck size={16} /> {companyCount} companies found near
                      you!
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center gap-2">
                      <Truck size={16} /> No companies found in this area.
                    </div>
                  )
                ) : null}
              </div>
            </div>

            {/* PROPERTY TYPE */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Property Type
              </label>

              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white
                  focus:border-pink-500 focus:ring-2 focus:ring-pink-300 outline-none transition-all
                  text-gray-700 cursor-pointer"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              >
                <option value="" disabled className="text-gray-700">
                  Choose Property Type
                </option>
              <option value="a_few_items">A Few Items</option>
              <option value="flat">Flat</option>
             <option value="house">House</option>
            <option value="office">Office</option>

              </select>
            </div>

            {/* PROPERTY SIZE */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Property Size
              </label>

              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 
                  focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                value={propertySize}
                onChange={(e) => setPropertySize(e.target.value)}
                required
              >
                <option value="" disabled className="text-gray-400">
                  Choose Property Size
                </option>
              {serviceType === "a_few_items" && (
  <>
    <option value="swb_van">Small Van (SWB)</option>
    <option value="mwb_van">Medium Van (MWB)</option>
    <option value="lwb_van">Large Van (LWB)</option>
  </>
)}

{serviceType === "flat" && (
  <>
    <option value="studio">Studio</option>
    <option value="1_bed">1 Bed</option>
    <option value="2_bed">2 Bed</option>
    <option value="3_bed">3 Bed</option>
    <option value="4_bed">4 Bed</option>
  </>
)}

{serviceType === "house" && (
  <>
    <option value="2_bed">2 Bed</option>
    <option value="3_bed">3 Bed</option>
    <option value="4_bed">4 Bed</option>
    <option value="5_bed">5 Bed</option>
    <option value="6_bed">6 Bed</option>
  </>
)}

{serviceType === "office" && (
  <>
    <option value="2_workstations">2 Workstations</option>
    <option value="4_workstations">4 Workstations</option>
    <option value="8_workstations">8 Workstations</option>
    <option value="15_workstations">15 Workstations</option>
    <option value="25_workstations">25 Workstations</option>
  </>
)}

                
              </select>
            </div>

            {/* DISTANCE */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Distance (miles)
              </label>

              <input
                type="text"
                value={distanceMiles || ""}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 
                  text-gray-600 cursor-not-allowed outline-none"
                placeholder="Distance auto-calculated"
              />
            </div>

            {/* DROPOFF */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="text-gray-400 h-4 w-4" /> Dropoff Pincode
              </label>

              <input
                type="text"
                placeholder="Enter Destination Pincode"
                value={dropoffPincode}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setDropoffPincode(val);

                  if (val.length >= 3) {
                    fetchCityFromPincode(
                      val,
                      setDropoffCity,
                      setLoadingDrop,
                      false
                    );
                  } else {
                    setDropoffCity("");
                    setDropoffCoords(null);
                    setRouteGeometry(null);
                    setDistanceKm(null);
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 
                focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                required
              />

              <p className="text-xs text-gray-600 mt-1 h-5">
                {loadingDrop
                  ? "Fetching city..."
                  : dropoffCity && `📍 ${dropoffCity}`}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <ul className="space-y-1 text-sm text-gray-700">
              {[
                "Instant Prices",
                "On Screen Comparison",
                "Dedicated Move Manager",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-pink-600" /> {f}
                </li>
              ))}
            </ul>

            <Motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8 py-3 font-semibold flex items-center gap-2 shadow-md transition-all duration-200"
            >
              Compare Prices →
            </Motion.button>
          </div>
        </Motion.form>
      </Motion.div>

      {/* RIGHT SIDE MAP */}
      <Motion.div
        className="lg:w-[45%] w-full justify-center mt-10 lg:mt-0 flex order-2 relative"
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      >
        <div className="absolute -top-7 -right-7 w-32 h-32 bg-pink-300 opacity-30 blur-2xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-7 -left-7 w-32 h-32 bg-pink-300 opacity-30 blur-2xl rounded-full pointer-events-none"></div>

        <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-lg lg:-ml-8 border border-gray-200 bg-white">
          <div className="bg-pink-600 text-white p-4">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Move Route</h3>
            </div>

            <div className="mt-2 text-sm space-y-1">
              {pickupCity && dropoffCity ? (
                <div className="flex items-center justify-between">
                  <span className="truncate flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {pickupCity.split(",")[0]}
                  </span>
                  <span className="mx-2 text-pink-300">━━━━━━●</span>
                  <span className="truncate flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    {dropoffCity.split(",")[0]}
                  </span>
                </div>
              ) : pickupCity ? (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Pickup: {pickupCity.split(",")[0]}
                </span>
              ) : (
                <span>Enter pincodes to see route</span>
              )}

              {distanceKm && (
                <div className="text-pink-200 text-xs flex items-center gap-2">
                  <div className="w-3 h-1 bg-white/80 rounded-full"></div>
                  <span>
                    <strong>
                      {distanceMiles} miles ({distanceKm} km)
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <iframe
              srcDoc={generateCustomMap()}
              width="100%"
              height="350"
              style={{ border: 0 }}
              title="Move Route Map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
              <div className="text-white text-sm">
                {distanceKm ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-pink-400 rounded-full"></div>
                    <span>
                      {distanceMiles} miles ({distanceKm} km) route calculated
                    </span>
                  </div>
                ) : routeGeometry ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-pink-500 rounded-full"></div>
                    <span>Optimal route calculated</span>
                  </div>
                ) : pickupCoords && dropoffCoords ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-pink-500 rounded-full"></div>
                    <span>Direct path shown</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {pickupCoords && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Pickup Set</span>
                      </div>
                    )}
                    {dropoffCoords && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Dropoff Set</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 text-center text-xs text-gray-600 border-t">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Pickup</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-1 bg-pink-500 rounded-full"></div>
                <span>Route</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Dropoff</span>
              </div>
            </div>
          </div>
        </div>
      </Motion.div>
    </section>
  );
};

export default HeroSection;
