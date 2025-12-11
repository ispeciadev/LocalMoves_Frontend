// HeroSection.jsx (CLEANED VERSION - DEBUGGERS REMOVED)
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { MapPin, Check, Truck, Route } from "lucide-react";
import axios from "axios";

const HeroSection = () => {
  const navigate = useNavigate();

  // Load initial state from localStorage (but we won't use it for initial values)
  const loadFromStorage = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(`move_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // STATES - Start with empty values instead of loading from localStorage
  const [pickupPincode, setPickupPincode] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [dropoffPincode, setDropoffPincode] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [additionalSpaces, setAdditionalSpaces] = useState([]);

  const [companies, setCompanies] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDrop, setLoadingDrop] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  const [distanceKm, setDistanceKm] = useState(null);
  const distanceMiles = distanceKm ? (distanceKm * 0.621371).toFixed(1) : null;

  // Company count state
  const [loadingCount, setLoadingCount] = useState(false);
  const [companyCount, setCompanyCount] = useState(null);

  // Save to localStorage helper
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(`move_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage: ${key}`, error);
    }
  };

  // Save all form data to localStorage
  const saveFormData = () => {
    const formData = {
      pickupPincode,
      pickupCity,
      dropoffPincode,
      dropoffCity,
      serviceType,
      propertySize,
      quantity,
      additionalSpaces,
      distanceKm,
      distanceMiles
    };
    
    try {
      localStorage.setItem("move_formData", JSON.stringify(formData));
    } catch (error) {
      console.error("Error saving form data to localStorage:", error);
    }
  };

  // Save individual fields to localStorage when they change
  useEffect(() => {
    saveToStorage("pickupPincode", pickupPincode);
  }, [pickupPincode]);

  useEffect(() => {
    saveToStorage("pickupCity", pickupCity);
  }, [pickupCity]);

  useEffect(() => {
    saveToStorage("dropoffPincode", dropoffPincode);
  }, [dropoffPincode]);

  useEffect(() => {
    saveToStorage("dropoffCity", dropoffCity);
  }, [dropoffCity]);

  useEffect(() => {
    saveToStorage("serviceType", serviceType);
  }, [serviceType]);

  useEffect(() => {
    saveToStorage("propertySize", propertySize);
  }, [propertySize]);

  useEffect(() => {
    saveToStorage("quantity", quantity);
  }, [quantity]);

  useEffect(() => {
    saveToStorage("additionalSpaces", additionalSpaces);
  }, [additionalSpaces]);

  // Property type configurations (unchanged)
  const propertyConfigs = {
    "a_few_items": {
      label: "A few items",
      sizes: [
        { value: "swb_van", label: "SWB Van" },
        { value: "mwb_van", label: "MWB Van" },
        { value: "lwb_van", label: "LWB Van" }
      ],
      quantities: [
        { value: "some_things", label: "Quarter Van" },
        { value: "half_contents", label: "Half Van" },
        { value: "most_things", label: "3/4 Van" },
        { value: "everything", label: "Whole Van" }
      ]
    },
    "house": {
      label: "House",
      sizes: [
        { value: "2_bed", label: "2 Bed" },
        { value: "3_bed", label: "3 Bed" },
        { value: "4_bed", label: "4 Bed" },
        { value: "5_bed", label: "5 Bed" },
        { value: "6_bed", label: "6 Bed" }
      ],
      quantities: [
        { value: "some_things", label: "Some Things" },
        { value: "half_contents", label: "Half the Contents" },
        { value: "most_things", label: "3/4 Most Things" },
        { value: "everything", label: "Everything" }
      ],
      additionalSpaces: [
        { value: "shed", label: "Shed" },
        { value: "loft", label: "Loft" },
        { value: "basement", label: "Basement" },
        { value: "single_garage", label: "Single Garage" },
        { value: "double_garage", label: "Double Garage" }
      ]
    },
    "flat": {
      label: "Flat",
      sizes: [
        { value: "studio", label: "Studio" },
        { value: "1_bed", label: "1 Bed" },
        { value: "2_bed", label: "2 Bed" },
        { value: "3_bed", label: "3 Bed" },
        { value: "4_bed", label: "4 Bed" }
      ],
      quantities: [
        { value: "some_things", label: "Some Things" },
        { value: "half_contents", label: "Half the Contents" },
        { value: "most_things", label: "3/4 Most Things" },
        { value: "everything", label: "Everything" }
      ]
    },
    "office": {
      label: "Office",
      sizes: [
        { value: "2_workstations", label: "2 Workstations" },
        { value: "4_workstations", label: "4 Workstations" },
        { value: "8_workstations", label: "8 Workstations" },
        { value: "15_workstations", label: "15 Workstations" },
        { value: "25_workstations", label: "25 Workstations" }
      ],
      quantities: [
        { value: "some_things", label: "Some Things" },
        { value: "half_contents", label: "Half the Contents" },
        { value: "most_things", label: "3/4 Most Things" },
        { value: "everything", label: "Everything" }
      ]
    }
  };

  // Toast notification function (unchanged)
  const showToast = (message, type = "error") => {
    if (document.querySelector(".toast-msg")) return;
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = "toast-msg";
    const bgColor = type === "error" ? "#dc2626" : type === "success" ? "#10b981" : "#f59e0b";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: bgColor,
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

  // Count API (unchanged)
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
      setCompanyCount(0);
    } finally {
      setLoadingCount(false);
    }
  };

  // Get coordinates from pincode (unchanged)
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
      return null;
    }
  };

  // Route API - FIXED VERSION
  const getRoute = async (pickup, dropoff) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.routes && data.routes.length > 0 && data.routes[0].distance) {
        const distanceInKm = (data.routes[0].distance / 1000).toFixed(1);
        setDistanceKm(distanceInKm);
        return data.routes[0].geometry;
      } else {
        // If OSRM fails, calculate Haversine distance
        return calculateHaversineDistance(pickup, dropoff);
      }
    } catch (error) {
      console.warn("OSRM route API failed, using straight line distance:", error);
      // Fallback to Haversine distance calculation
      return calculateHaversineDistance(pickup, dropoff);
    }
  };

  // Haversine distance calculation (accurate straight-line distance)
  const calculateHaversineDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return null;
    
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coord1.lat * Math.PI / 180;
    const lat2 = coord2.lat * Math.PI / 180;
    const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const deltaLon = (coord2.lon - coord1.lon) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    setDistanceKm(distance.toFixed(1));
    
    // Create a simple straight line geometry for display
    return {
      type: "LineString",
      coordinates: [
        [coord1.lon, coord1.lat],
        [coord2.lon, coord2.lat]
      ]
    };
  };

  // Map builder (unchanged)
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

  // API call for companies (unchanged)
  const fetchCompaniesByPincode = useCallback(
    async (pincode) => {
      setLoadingCompanies(true);

      try {
        if (!quantity) {
          showToast("Please select a quantity first", "warning");
          return [];
        }

        const payload = {
          pincode: pincode,
          property_type: serviceType,
          property_size: propertySize,
          distance_miles: distanceMiles ? Number(distanceMiles) : 1,
          quantity: quantity,
          additional_spaces: additionalSpaces || [],
          user_email: localStorage.getItem("user_email") || localStorage.getItem("email"),
          send_email: "True",
        };

        const res = await axios.post(
          "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_by_pincode",
          payload,
          { 
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            timeout: 10000
          }
        );

        const msg = res.data?.message;
        const data = msg?.success && Number(msg?.count) > 0 ? msg.data : [];

        setCompanies(data || []);
        return data;
      } catch (err) {
        if (err.response) {
          showToast(`API Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`, "error");
        } else if (err.request) {
          showToast("Network error. Please check your connection.", "error");
        } else {
          showToast("Error fetching companies. Please try again.", "error");
        }
        setCompanies([]);
        return [];
      } finally {
        setLoadingCompanies(false);
      }
    },
    [serviceType, propertySize, distanceMiles, quantity, additionalSpaces]
  );

  // Auto-fetch companies when all required fields are filled
  useEffect(() => {
    const fetchIfReady = async () => {
      if (pickupPincode && serviceType && propertySize && quantity) {
        await fetchCompaniesByPincode(pickupPincode);
      }
    };
    
    fetchIfReady();
  }, [pickupPincode, serviceType, propertySize, quantity, fetchCompaniesByPincode]);

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
            fetchCompanyCount(pincode);
          }
        } else {
          setDropoffCoords(coordinates);
        }

        // Calculate distance and route only when BOTH coordinates are available
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
      setCity("");
      if (isPickup) setPickupCoords(null);
      else setDropoffCoords(null);
      showToast("Please enter a valid pincode.");
    } finally {
      setLoading(false);
    }
  };

  // Handle additional spaces selection
  const handleAdditionalSpaceChange = (space) => {
    setAdditionalSpaces(prev => {
      const newSpaces = prev.includes(space)
        ? prev.filter(s => s !== space)
        : [...prev, space];
      
      return newSpaces;
    });
  };

  // Handle service type change
  const handleServiceTypeChange = (value) => {
    setServiceType(value);
    setPropertySize("");
    setQuantity("");
    setAdditionalSpaces([]);
    setCompanies([]);
  };

  // Handle property size change
  const handlePropertySizeChange = (value) => {
    setPropertySize(value);
    
    if (serviceType && propertyConfigs[serviceType]?.quantities?.length > 0) {
      setQuantity(propertyConfigs[serviceType].quantities[0].value);
    }
    
    setCompanies([]);
  };

  // Handle quantity change
  const handleQuantityChange = (value) => {
    setQuantity(value);
    
    if (pickupPincode && serviceType && propertySize) {
      setTimeout(() => {
        fetchCompaniesByPincode(pickupPincode);
      }, 300);
    }
  };

  // Compare handler - also save form data before navigating
  const handleCompare = useCallback(
    async (e) => {
      e.preventDefault();

      if (!pickupCoords || !dropoffCoords) {
        showToast("Please enter valid pincodes and wait for lookup.");
        return;
      }

      if (!quantity) {
        showToast("Please select a quantity (how much to move).");
        return;
      }

      // Save complete form data before navigation
      saveFormData();

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
          quantity,
          additionalSpaces,
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
      quantity,
      additionalSpaces,
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

  // Clear form data function (optional, can be called if needed)
  const clearFormData = () => {
    localStorage.removeItem("move_pickupPincode");
    localStorage.removeItem("move_pickupCity");
    localStorage.removeItem("move_dropoffPincode");
    localStorage.removeItem("move_dropoffCity");
    localStorage.removeItem("move_serviceType");
    localStorage.removeItem("move_propertySize");
    localStorage.removeItem("move_quantity");
    localStorage.removeItem("move_additionalSpaces");
    localStorage.removeItem("move_formData");
    
    // Reset states
    setPickupPincode("");
    setPickupCity("");
    setDropoffPincode("");
    setDropoffCity("");
    setServiceType("");
    setPropertySize("");
    setQuantity("");
    setAdditionalSpaces([]);
    setCompanies([]);
    setPickupCoords(null);
    setDropoffCoords(null);
    setRouteGeometry(null);
    setDistanceKm(null);
    setCompanyCount(null);
  };

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
                onChange={(e) => handleServiceTypeChange(e.target.value)}
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
                onChange={(e) => handlePropertySizeChange(e.target.value)}
                required
                disabled={!serviceType}
              >
                <option value="" disabled className="text-gray-400">
                  {serviceType ? "Choose Property Size" : "Select Property Type First"}
                </option>
                {serviceType && propertyConfigs[serviceType]?.sizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* QUANTITY */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Quantity (How much to move)
              </label>

              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 
                  focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                disabled={!serviceType}
              >
                <option value="" disabled className="text-gray-400">
                  {serviceType ? "Choose Quantity" : "Select Property Type First"}
                </option>
                {serviceType && propertyConfigs[serviceType]?.quantities.map((qty) => (
                  <option key={qty.value} value={qty.value}>
                    {qty.label}
                  </option>
                ))}
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

            {/* ADDITIONAL SPACES (Only for House) */}
            {serviceType === "house" && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional Spaces (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {propertyConfigs.house.additionalSpaces.map((space) => (
                    <div key={space.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`space-${space.value}`}
                        checked={additionalSpaces.includes(space.value)}
                        onChange={() => handleAdditionalSpaceChange(space.value)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`space-${space.value}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {space.label}
                      </label>
                    </div>
                  ))}
                </div>
                {additionalSpaces.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {additionalSpaces.map(s => 
                      propertyConfigs.house.additionalSpaces.find(as => as.value === s)?.label
                    ).join(", ")}
                  </p>
                )}
              </div>
            )}
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
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8 py-3 font-semibold flex items-center gap-2 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!quantity || loadingCompanies}
            >
              {loadingCompanies ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Compare Prices →"
              )}
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