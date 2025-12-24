
// HeroSection.jsx (CLEANED VERSION - DEBUGGERS REMOVED)
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { MapPin, Check, Truck, Route, Boxes, Layers, Package, Home, Briefcase, Building2 } from "lucide-react";
import axios from "axios";
import env from "../config/env";
import CustomIconSelect from "./CustomIconSelect";

// Emoji Icon Wrappers
const SwbIcon = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚐</span>;
const TruckIconEmoji = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚚</span>;
const LorryIconEmoji = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚛</span>;

const HeroSection = () => {
  const navigate = useNavigate();



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
  const [_loadingCount, setLoadingCount] = useState(false);
  const [companyCount, setCompanyCount] = useState(null);

  // Track if email has been sent to prevent duplicates
  const [emailSent, setEmailSent] = useState(false);

  // Save to localStorage helper
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(`move_${key} `, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage: ${key} `, error);
    }
  };

  // Save all form data to localStorage
  const saveFormData = useCallback(() => {
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
  }, [pickupPincode, pickupCity, dropoffPincode, dropoffCity, serviceType, propertySize, quantity, additionalSpaces, distanceKm, distanceMiles]);

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

  // Property type configurations
  const propertyConfigs = {
    "a_few_items": {
      label: "A few items",
      sizes: [
        { value: "swb_van", label: "SWB Van", icon: SwbIcon, iconClass: "text-blue-500" },
        { value: "mwb_van", label: "MWB Van", icon: SwbIcon, iconClass: "text-indigo-500" },
        { value: "lwb_van", label: "LWB Van", icon: SwbIcon, iconClass: "text-purple-500" }
      ],
      quantities: [
        { value: "quarter_van", label: "Quarter Van", icon: Package, iconClass: "text-amber-500" },
        { value: "half_van", label: "Half Van", icon: Layers, iconClass: "text-orange-500" },
        { value: "three_quarter_van", label: "3/4 Van", icon: Boxes, iconClass: "text-red-500" },
        { value: "whole_van", label: "Whole Van", icon: Truck, iconClass: "text-blue-600" }
      ]
    },
    "house": {
      label: "House",
      sizes: [
        { value: "2_bed", label: "2 Bed", icon: Home, iconClass: "text-green-500" },
        { value: "3_bed", label: "3 Bed", icon: Home, iconClass: "text-green-600" },
        { value: "4_bed", label: "4 Bed", icon: Home, iconClass: "text-green-700" },
        { value: "5_bed", label: "5 Bed", icon: Home, iconClass: "text-green-800" },
        { value: "6_bed", label: "6 Bed", icon: Home, iconClass: "text-emerald-900" }
      ],
      quantities: [
        { value: "some_things", label: "Some Things", icon: Package, iconClass: "text-amber-500" },
        { value: "half_contents", label: "Half the Contents", icon: Layers, iconClass: "text-orange-500" },
        { value: "most_things", label: "3/4 Most Things", icon: Boxes, iconClass: "text-red-500" },
        { value: "everything", label: "Everything", icon: Truck, iconClass: "text-blue-600" }
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
        { value: "studio", label: "Studio", icon: Building2, iconClass: "text-cyan-500" },
        { value: "1_bed", label: "1 Bed", icon: Building2, iconClass: "text-cyan-600" },
        { value: "2_bed", label: "2 Bed", icon: Building2, iconClass: "text-cyan-700" },
        { value: "3_bed", label: "3 Bed", icon: Building2, iconClass: "text-cyan-800" },
        { value: "4_bed", label: "4 Bed", icon: Building2, iconClass: "text-blue-900" }
      ],
      quantities: [
        { value: "some_things", label: "Some Things", icon: Package, iconClass: "text-amber-500" },
        { value: "half_contents", label: "Half the Contents", icon: Layers, iconClass: "text-orange-500" },
        { value: "three_quarter", label: "3/4 Most Things", icon: Boxes, iconClass: "text-red-500" },
        { value: "everything", label: "Everything", icon: Truck, iconClass: "text-blue-600" }
      ]
    },
    "office": {
      label: "Office",
      sizes: [
        { value: "2_workstations", label: "2 Workstations", icon: Briefcase, iconClass: "text-purple-500" },
        { value: "4_workstations", label: "4 Workstations", icon: Briefcase, iconClass: "text-purple-600" },
        { value: "8_workstations", label: "8 Workstations", icon: Briefcase, iconClass: "text-purple-700" },
        { value: "15_workstations", label: "15 Workstations", icon: Briefcase, iconClass: "text-fuchsia-600" },
        { value: "25_workstations", label: "25 Workstations", icon: Briefcase, iconClass: "text-fuchsia-700" }
      ],
      quantities: [
        { value: "some_things", label: "Some Things", icon: Package, iconClass: "text-amber-500" },
        { value: "half_contents", label: "Half the Contents", icon: Layers, iconClass: "text-orange-500" },
        { value: "three_quarter", label: "3/4 Most Things", icon: Boxes, iconClass: "text-red-500" },
        { value: "everything", label: "Everything", icon: Truck, iconClass: "text-blue-600" }
      ]
    }
  };

  const PROPERTY_TYPE_OPTIONS = [
    { value: "a_few_items", label: "A Few Items", icon: Package, iconClass: "text-orange-500" },
    { value: "flat", label: "Flat", icon: Building2, iconClass: "text-cyan-600" },
    { value: "house", label: "House", icon: Home, iconClass: "text-green-600" },
    { value: "office", label: "Office", icon: Briefcase, iconClass: "text-purple-600" },
  ];

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
        `${env.API_BASE_URL}localmoves.api.company.search_number_of_companies_by_pincode`,
        { pincode }
      );
      const msg = res.data?.message;
      if (msg?.success) {
        setCompanyCount(msg.count ?? 0);
      } else {
        setCompanyCount(0);
      }
    } catch {
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
    } catch {
      return null;
    }
  };

  // Route API - Gets actual road distance
  const getRoute = async (pickup, dropoff) => {
    try {
      // Try OSRM first (European routing)
      const osrmResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson&steps=true`
      );

      if (osrmResponse.ok) {
        const osrmData = await osrmResponse.json();
        if (osrmData.routes && osrmData.routes.length > 0 && osrmData.routes[0].distance) {
          const distanceInKm = (osrmData.routes[0].distance / 1000).toFixed(1);
          setDistanceKm(distanceInKm);
          console.log("OSRM Road Distance:", distanceInKm, "km");
          return osrmData.routes[0].geometry;
        }
      }

      // If OSRM fails, try OpenRouteService API (alternative routing service)
      const orsResponse = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?start=${pickup.lon},${pickup.lat}&end=${dropoff.lon},${dropoff.lat}`,
        {
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          }
        }
      );

      if (orsResponse.ok) {
        const orsData = await orsResponse.json();
        if (orsData.features && orsData.features.length > 0) {
          const distanceInMeters = orsData.features[0].properties.segments[0].distance;
          const distanceInKm = (distanceInMeters / 1000).toFixed(1);
          setDistanceKm(distanceInKm);
          console.log("ORS Road Distance:", distanceInKm, "km");
          return orsData.features[0].geometry;
        }
      }

      // Last resort: calculate straight-line distance
      console.warn("All routing APIs failed, using straight line distance");
      return calculateHaversineDistance(pickup, dropoff);
    } catch (error) {
      console.error("Route calculation error:", error);
      // Fallback to Haversine distance calculation
      return calculateHaversineDistance(pickup, dropoff);
    }
  };

  // Haversine distance calculation (straight-line distance as fallback)
  const calculateHaversineDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return null;

    const R = 6371; // Earth's radius in kilometers
    const lat1 = coord1.lat * Math.PI / 180;
    const lat2 = coord2.lat * Math.PI / 180;
    const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const deltaLon = (coord2.lon - coord1.lon) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Add 20% to approximate road distance from straight-line distance
    const approximateRoadDistance = (distance * 1.2).toFixed(1);
    setDistanceKm(approximateRoadDistance);
    console.log("Approximate road distance (straight-line + 20%):", approximateRoadDistance, "km");

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
                #map { height: 100vh; width: 100%; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script>
                var map = L.map('map').setView([54.5, -2.5], 6);
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
              #map { height: 100vh; width: 100%; }
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

              ${polyline
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

  // API call for companies
  const fetchCompaniesByPincode = useCallback(
    async (pincode, shouldSendEmail = true) => {
      setLoadingCompanies(true);

      try {
        if (!quantity) {
          showToast("Please select a quantity first", "warning");
          return [];
        }

        const userEmail = localStorage.getItem("user_email") || localStorage.getItem("email");

        // DEBUG: Log email retrieval
        console.log("🔍 Email Debug:");
        console.log("  - user_email from localStorage:", localStorage.getItem("user_email"));
        console.log("  - email from localStorage:", localStorage.getItem("email"));
        console.log("  - Final userEmail:", userEmail);
        console.log("  - Email already sent:", emailSent);
        console.log("  - Should send email:", shouldSendEmail);

        // Validate email exists
        if (!userEmail) {
          showToast("Please log in to receive quotes via email", "warning");
          console.warn("⚠️ No email found in localStorage");
        }

        // Only send email if it hasn't been sent yet and shouldSendEmail is true
        const sendEmailNow = shouldSendEmail && !emailSent && userEmail;

        const payload = {
          pincode: pincode,
          property_type: serviceType,
          property_size: propertySize,
          distance_miles: distanceMiles ? Number(distanceMiles) : 1,
          quantity: quantity,
          additional_spaces: additionalSpaces || [],
          user_email: userEmail,
          send_email: sendEmailNow ? "True" : "False",
        };

        // DEBUG: Log complete payload
        console.log("📤 API Payload:", JSON.stringify(payload, null, 2));

        const res = await axios.post(
          `${env.API_BASE_URL}localmoves.api.company.search_companies_by_pincode`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            timeout: 10000
          }
        );

        // DEBUG: Log API response
        console.log("📥 API Response:", res.data);

        const msg = res.data?.message;
        const data = msg?.success && Number(msg?.count) > 0 ? msg.data : [];

        setCompanies(data || []);

        // Show success message if email was sent
        if (sendEmailNow && msg?.success) {
          showToast(`Quotes sent to ${userEmail}`, "success");
          setEmailSent(true); // Mark email as sent
        }

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

  // Reset emailSent flag when search criteria changes
  useEffect(() => {
    setEmailSent(false);
  }, [pickupPincode, serviceType, propertySize, quantity]);

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
    } catch {
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
        // Don't send email again when clicking Compare (email already sent during auto-fetch)
        companyList = await fetchCompaniesByPincode(pickupPincode, false);
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
      saveFormData,
    ]
  );



  return (
    <section className={`relative bg-white overflow-hidden transition-all duration-500 ${distanceKm ? 'min-h-screen' : 'min-h-[70vh]'}`}>
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-pink-200 opacity-40 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-pink-300 opacity-30 blur-3xl rounded-full pointer-events-none"></div>

      {/* Map Background - Positioned on right side, behind everything */}
      <Motion.div
        className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="relative w-full h-full">
          {/* Map iframe */}
          <iframe
            srcDoc={generateCustomMap()}
            width="100%"
            height="100%"
            style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title="Move Route Map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          {/* Left side fade overlay - makes map fade out toward the form */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white pointer-events-none"></div>
        </div>
      </Motion.div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between pt-6 md:pt-10 lg:pt-14 pb-16 px-6 md:px-16 lg:px-20">
        {/* LEFT SIDE - Form Card */}
        <Motion.div
          className="lg:w-[50%] w-full space-y-6 relative flex flex-col order-1 lg:pr-8"
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
            <div className="absolute -top-7 -left-7 w-32 h-32 bg-pink-200 opacity-20 blur-2xl rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-7 -right-7 w-32 h-32 bg-pink-200 opacity-20 blur-2xl rounded-full pointer-events-none"></div>

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

              {/* Show additional fields only when distance is calculated */}
              {distanceKm && (
                <>
                  {/* PROPERTY TYPE */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      What are you moving?
                    </label>

                    <CustomIconSelect
                      value={serviceType}
                      onChange={(val) => handleServiceTypeChange(val)}
                      options={PROPERTY_TYPE_OPTIONS}
                      placeholder="Choose Property Type"
                    />
                  </div>

                  {/* PROPERTY SIZE */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      {serviceType === "a_few_items" ? (
                        <>
                          <Truck className="h-4 w-4 text-pink-600" />
                          What size vehicle will you need?
                        </>
                      ) : (
                        "Property Size"
                      )}
                    </label>

                    <CustomIconSelect
                      value={propertySize}
                      onChange={(val) => handlePropertySizeChange(val)}
                      options={serviceType ? propertyConfigs[serviceType]?.sizes || [] : []}
                      placeholder={serviceType ? "Choose Property Size" : "Select Property Type First"}
                    />
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Approx how much space will your items take? (How much to move)
                    </label>

                    <CustomIconSelect
                      value={quantity}
                      onChange={(val) => handleQuantityChange(val)}
                      options={serviceType ? propertyConfigs[serviceType]?.quantities || [] : []}
                      placeholder={serviceType ? "Choose Quantity" : "Select Property Type First"}
                    />
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
                </>
              )}

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

        {/* RIGHT SIDE - Empty space for map to show through */}
        <div className="lg:w-[50%] w-full mt-10 lg:mt-0 order-2"></div>
      </div>
    </section>
  );
};

export default HeroSection;