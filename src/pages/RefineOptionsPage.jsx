
import React, { useState, useEffect } from "react";
import { ChevronDown, Route, Phone, Wrench, Car, MapPin, Info, Package, Layers, Boxes, Truck, Home, Briefcase, Building2 } from "lucide-react";
import CustomIconSelect from "../components/CustomIconSelect";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";

// --------------------------------------------------------------
//  LEAFLET MAP BUILDER (unchanged)
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
    markers.push({
      lat: pickupCoords.lat,
      lon: pickupCoords.lon,
      text: "Pickup",
    });
  } else {
    centerLat = dropoffCoords.lat;
    centerLon = dropoffCoords.lon;
    zoom = 12;
    markers.push({
      lat: dropoffCoords.lat,
      lon: dropoffCoords.lon,
      text: "Dropoff",
    });
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

// Vehicle Icon Components (matching ComparePage)
const SwbIcon = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚐</span>;
const TruckIconEmoji = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚚</span>;

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
  if (size.toLowerCase().includes('bed')) {
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
    "whole van": { icon: Truck, color: "text-blue-600" },
    "quarter_van": { icon: Package, color: "text-amber-500" },
    "half_van": { icon: Layers, color: "text-orange-500" },
    "three_quarter_van": { icon: Boxes, color: "text-red-500" },
    "whole_van": { icon: Truck, color: "text-blue-600" }
  };
  
  // Normalize the quantity string
  const normalizedQuantity = quantity.toLowerCase().replace(/_/g, " ");
  return quantityMap[normalizedQuantity] || { icon: Boxes, color: "text-gray-600" };
};

// --------------------------------------------------------------
//  FULL INVENTORY - Will be populated ONLY from API
// --------------------------------------------------------------
let INVENTORY_DATA = [];

// Build grouped structure for UI - Will be rebuilt when API data loads
let INVENTORY_BY_CATEGORY = {};

// Function to rebuild inventory by category
const rebuildInventoryByCategory = () => {
  INVENTORY_BY_CATEGORY = INVENTORY_DATA.reduce((acc, it) => {
    if (!acc[it.category]) acc[it.category] = [];
    acc[it.category].push(it);
    return acc;
  }, {});
};

// Helper: format item_name as "category-item (variant)" in lowercase
const formatItemNameForDisplay = (category, itemName) => {
  // Simply concatenate category + "-" + item_name exactly as they come from database
  return `${category}-${itemName}`;
};
// --------------------------------------------------------------
//  Property Type Options - Will be populated from API
// --------------------------------------------------------------
// These will be populated dynamically from the API
let PROPERTY_TYPES = [
  { value: "a_few_items", label: "A Few Items" },
  { value: "flat", label: "Flat" },
  { value: "house", label: "House" },
  { value: "office", label: "Office" },
];

// House Sizes - Will be populated from API
let HOUSE_SIZES = [
  { value: "2_bed", label: "2 Bedroom" },
  { value: "3_bed", label: "3 Bedroom" },
  { value: "4_bed", label: "4 Bedroom" },
  { value: "5_bed", label: "5 Bedroom" },
  { value: "6_bed", label: "6 Bedroom" },
];

// Flat Sizes - Will be populated from API
let FLAT_SIZES = [
  { value: "studio", label: "Studio" },
  { value: "1_bed", label: "1 Bedroom" },
  { value: "2_bed", label: "2 Bedroom" },
  { value: "3_bed", label: "3 Bedroom" },
  { value: "4_bed", label: "4 Bedroom" },
];

// Office Sizes - Will be populated from API
let OFFICE_SIZES = [
  { value: "2_workstations", label: "2 Workstations" },
  { value: "4_workstations", label: "4 Workstations" },
  { value: "8_workstations", label: "8 Workstations" },
  { value: "15_workstations", label: "15 Workstations" },
  { value: "25_workstations", label: "25 Workstations" },
];

// Vehicle Sizes for A Few Items - Will be populated from API
let VEHICLE_SIZES = [
  { value: "swb_van", label: "Small Van (SWB)" },
  { value: "mwb_van", label: "Medium Van (MWB)" },
  { value: "lwb_van", label: "Large Van (LWB)" },
];

// Additional Spaces - Will be populated from API
let ADDITIONAL_SPACES = [
  { value: "shed", label: "Shed" },
  { value: "loft", label: "Loft" },
  { value: "basement", label: "Basement" },
  { value: "single_garage", label: "Single Garage" },
  { value: "double_garage", label: "Double Garage" },
];

// Quantity Options - Will be populated from API
let QUANTITY_OPTIONS = [
  { value: "some_things", label: "A Few Things" },
  { value: "half_contents", label: "Half Contents" },
  { value: "three_quarter", label: "Three Quarter" },
  { value: "most_things", label: "Most Things" },
  { value: "everything", label: "Everything" },
  
];

// Parking Options
const PARKING_OPTIONS = [
  { value: "driveway", label: "Driveway", icon: Car, iconClass: "text-blue-500" },
  { value: "roadside", label: "Roadside", icon: MapPin, iconClass: "text-orange-500" },
];

// Parking Distance
const PARKING_DISTANCE_OPTIONS = [
  { value: "less_than_10m", label: "Less Than 10m" },
  { value: "10_to_20m", label: "10–20m" },
  { value: "20m_plus", label: "20m+" },
];

// Parking Distance Descriptions
const PARKING_DISTANCE_DESCRIPTIONS = {
  less_than_10m: "The vehicle can park within 10 meters (approximately 33 feet) of the property entrance. This is the ideal scenario with minimal carrying distance.",
  "10_to_20m": "The vehicle can park between 10 to 20 meters (approximately 33 to 66 feet) from the property entrance. Moderate carrying distance may increase loading time.",
  "20m_plus": "The vehicle must park more than 20 meters (over 66 feet) away from the property entrance. Longer carrying distance may significantly increase loading time and cost.",
};

// Internal Access Options for Houses/Bungalows/Town Houses
const INTERNAL_ACCESS_HOUSE_OPTIONS = [
  { value: "ground_only", label: "Ground Floor Only" },
  { value: "ground_first", label: "Ground & 1st Floor" },
  { value: "ground_first_second", label: "Ground, 1st & 2nd Floor" },
];

// Internal Access Options for Flats/Office/A Few Items
const INTERNAL_ACCESS_FLAT_OPTIONS = [
 
  { value: "ground_floor", label: "Ground Floor" },
  { value: "first_floor", label: "1st Floor" },
  { value: "second_floor", label: "2nd Floor" },
  { value: "third_floor_plus", label: "3rd Floor+" },
 
];

// Notice Period
const NOTICE_PERIOD_OPTIONS = [
  { value: "within_3_days", label: "Within 3 days" },
  { value: "within_week", label: "Within 1 week" },
  { value: "within_2_weeks", label: "Within 2 weeks" },
  { value: "within_month", label: "Within 1 month" },
  { value: "over_month", label: "Over 1 month" },
  { value: "flexible", label: "Im Flexible (save up to 20%)" },
];

// Move Day Options
const MOVE_DAY_OPTIONS = [
  { value: "sun_to_thurs", label: "Sun - Thurs (save 15%)" },
  { value: "fri_sat", label: "Friday - Saturday" },
];

// Collection Time Options
const COLLECTION_TIME_OPTIONS = [
  { value: "flexible", label: "Flexible" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "one_hour_window", label: "1-Hour Window" },
];

// --------------------------------------------------------------
//  HELPER FUNCTION TO SAVE TO LOCALSTORAGE
// --------------------------------------------------------------
const saveToLocalStorage = (key, data, deliveryPincode = "") => {
  try {
    // Add delivery pincode to the data before saving
    const dataWithPincode = {
      ...data,
      deliveryPincode: deliveryPincode || data?.deliveryPincode || "",
      pickupPincode: data?.search_parameters?.pincode || "",
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(key, JSON.stringify(dataWithPincode, null, 2));
    console.log(
      `✅ Saved to localStorage: ${key} with delivery pincode: ${deliveryPincode}`
    );
  } catch (error) {
    console.error(`❌ Failed to save to localStorage: ${key}`, error);
  }
};

// --------------------------------------------------------------
//  LOAD FROM LOCALSTORAGE HELPER
// --------------------------------------------------------------
const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`❌ Failed to load from localStorage: ${key}`, error);
    return defaultValue;
  }
};

// --------------------------------------------------------------
//  MAIN COMPONENT
// --------------------------------------------------------------
const RefineOptionsPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // State for API data
  const [_inventoryDataLoaded, setInventoryDataLoaded] = useState(false);
  const [_apiInventoryData, setApiInventoryData] = useState([]);

  // Fetch inventory data from API on component mount
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        console.log("📦 Fetching inventory items from API...");
        const response = await api.get("localmoves.api.dashboard.get_all_inventory_items");
        console.log("✅ Inventory API Response:", response.data);
        
        const inventoryItems = response.data?.message?.data || [];
        
        if (inventoryItems.length > 0) {
          // Update global INVENTORY_DATA with API data
          INVENTORY_DATA = inventoryItems.map(item => ({
            category: item.category || "Miscellaneous",
            // Display item_name in format: "category-item (variant)" all lowercase
            item_name: formatItemNameForDisplay(item.category, item.item_name),
            average_volume: parseFloat(item.average_volume) || 0
          }));
          
          // Rebuild the grouped inventory
          rebuildInventoryByCategory();
          
          // Update component state to trigger re-render
          setApiInventoryData(INVENTORY_DATA);
          setInventoryDataLoaded(true);
          
          console.log("✅ Inventory data loaded successfully:", INVENTORY_DATA.length, "items");
          console.log("📊 Categories:", Object.keys(INVENTORY_BY_CATEGORY));
        } else {
          console.warn("⚠️ No inventory items found, using default data");
          setInventoryDataLoaded(true);
        }
      } catch (error) {
        console.error("❌ Failed to fetch inventory data:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        // Keep using default INVENTORY_DATA on error
        setInventoryDataLoaded(true);
      }
    };

    fetchInventoryData();
  }, []);

  // Load all previously stored data from localStorage
  const loadStoredData = () => {
    const storedFormData = loadFromLocalStorage("move_formData", {});
    const storedCompareFormData = loadFromLocalStorage("compare_formData", {});
    const storedRefineData = loadFromLocalStorage("move_refineData", {});
    const storedCompareData = loadFromLocalStorage("move_compareData", {});

    // Debug log to see what data is being loaded
    console.log("🔍 DEBUG - Loading stored data for RefineOptions:");
    console.log("move_formData quantity:", storedFormData?.quantity);
    console.log("compare_formData quantity:", storedCompareFormData?.quantity);
    console.log(
      "move_refineData quantity:",
      storedRefineData?.pricingForm?.quantity
    );
    console.log("Location state quantity:", state?.quantity);

    return {
      storedFormData,
      storedCompareFormData,
      storedRefineData,
      storedCompareData,
    };
  };

  const {
    storedFormData,
    storedCompareFormData,
    storedRefineData,
    storedCompareData,
  } = loadStoredData();

  // Function to get quantity with proper priority
  const getQuantityFromSources = () => {
    // Priority order: location state > refine data > compare form data > form data > compare data search > default
    const sources = [
      { source: "location state", value: state?.quantity },
      { source: "refine data", value: storedRefineData?.pricingForm?.quantity },
      { source: "compare form data", value: storedCompareFormData?.quantity },
      { source: "form data", value: storedFormData?.quantity },
      {
        source: "compare data search",
        value: storedCompareData?.search_parameters?.quantity,
      },
      { source: "default", value: "everything" },
    ];

    for (const source of sources) {
      if (source.value) {
        console.log(`✅ Using quantity from ${source.source}: ${source.value}`);
        return source.value;
      }
    }

    return "everything";
  };

  // Function to get property type with proper priority
  const getPropertyTypeFromSources = () => {
    const sources = [
      { source: "location state", value: state?.serviceType },
      {
        source: "refine data",
        value: storedRefineData?.pricingForm?.property_type,
      },
      {
        source: "compare form data",
        value: storedCompareFormData?.serviceType,
      },
      { source: "form data", value: storedFormData?.serviceType },
      {
        source: "compare data search",
        value: storedCompareData?.search_parameters?.property_type,
      },
      { source: "default", value: "house" },
    ];

    for (const source of sources) {
      if (source.value) {
        return source.value;
      }
    }

    return "house";
  };

  // Function to get property size with proper priority - UPDATED
  const getPropertySizeFromSources = () => {
    // Priority order: location state > refine data > compare form data > form data > compare data search > default
    const sources = [
      { source: "location state", value: state?.propertySize },
      {
        source: "refine data",
        value: storedRefineData?.pricingForm?.property_size || 
               storedRefineData?.pricingForm?.house_size, // Try both
      },
      {
        source: "compare form data",
        value: storedCompareFormData?.propertySize,
      },
      { source: "form data", value: storedFormData?.propertySize },
      {
        source: "compare data search",
        value: storedCompareData?.search_parameters?.property_size,
      },
    ];

    for (const source of sources) {
      if (source.value) {
        console.log(`✅ Using property size from ${source.source}: ${source.value}`);
        return source.value;
      }
    }

    // Return default based on property type
    const propertyType = getPropertyTypeFromSources();
    switch (propertyType) {
      case "flat":
        return "studio";
      case "office":
        return "2_workstations";
      case "a_few_items":
        return "swb_van";
      default:
        return "3_bed";
    }
  };

  // Function to get additional spaces with proper priority
  const getAdditionalSpacesFromSources = () => {
    const sources = [
      { source: "location state", value: state?.additionalSpaces },
      {
        source: "refine data",
        value: storedRefineData?.pricingForm?.additional_spaces,
      },
      {
        source: "compare form data",
        value: storedCompareFormData?.additionalSpaces,
      },
      { source: "form data", value: storedFormData?.additionalSpaces },
      {
        source: "compare data search",
        value: storedCompareData?.search_parameters?.additional_spaces,
      },
      { source: "default", value: [] },
    ];

    for (const source of sources) {
      if (
        source.value &&
        Array.isArray(source.value) &&
        source.value.length > 0
      ) {
        return source.value;
      }
    }

    return [];
  };

  // Merge all stored data (priority: state > refineData > compareFormData > formData)
  const _mergedFormData = {
    ...storedFormData,
    ...storedCompareFormData,
    ...(storedRefineData?.pricingForm || {}),
    ...(storedCompareData?.search_parameters || {}),
  };

  // Get providers from state or localStorage
  const providers = state?.providers || storedCompareData?.providers || [];
  const providersCount = providers.length;

  // Get coordinates from state or localStorage
  const pickupCoords =
    state?.pickupCoords || storedCompareData?.pickupCoords || null;
  const dropoffCoords =
    state?.dropoffCoords || storedCompareData?.dropoffCoords || null;
  const routeGeometry =
    state?.routeGeometry || storedCompareData?.routeGeometry || null;

  // Get pincodes from state or localStorage
  const pickupPincode =
    state?.pickupPincode ||
    storedCompareData?.pickupPincode ||
    storedFormData?.pickupPincode ||
    "";
  const dropoffPincode =
    state?.dropoffPincode ||
    storedCompareData?.destinationPincode ||
    storedFormData?.dropoffPincode ||
    "";

  // Get location names from state or localStorage
  const pickup = state?.pickup || storedFormData?.pickup || "";
  const dropoff = state?.dropoff || storedFormData?.dropoff || "";

  // Get distances from state or localStorage
  const distanceMiles =
    state?.distanceMiles ||
    storedFormData?.distanceMiles ||
    storedCompareFormData?.distanceMiles ||
    null;
  const distanceKm =
    state?.distanceKm ||
    storedFormData?.distanceKm ||
    storedCompareFormData?.distanceKm ||
    null;

  const [open, setOpen] = useState({
    propertyDetailsSummary: false,
    propertyDetails: false,
    collectionDetails: false,
    deliveryDetails: false,
    moveDateDetails: false,
  });

  const [filters, setFilters] = useState({
    items: [],
  });

  // IMPORTANT: Don't load itemQuantities and dismantleItems from localStorage
  // Start with empty objects so items don't get pre-filled
  // const storedItemQuantities = storedRefineData?.itemQuantities || {};
  // const storedDismantleItems = storedRefineData?.dismantleItems || {};

  // itemQuantities stores { "<item_name>": number } - START EMPTY
  const [itemQuantities, setItemQuantities] = useState({});

  // State for tracking which items need dismantling - START EMPTY
  const [dismantleItems, setDismantleItems] = useState({});

  // State for tracking which items need reassembly - START EMPTY
  const [reassembleItems, setReassembleItems] = useState({});

  const [isLoadingCosts, setIsLoadingCosts] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Parking distance info tooltip states
  const [showCollectionParkingInfo, setShowCollectionParkingInfo] = useState(false);
  const [showDeliveryParkingInfo, setShowDeliveryParkingInfo] = useState(false);

  // ========== REAL-TIME APPROXIMATE COST CALCULATION ==========
  const [approximateCost, setApproximateCost] = useState(null);
  const [isCalculatingCost, setIsCalculatingCost] = useState(false);
  const [_showCostBreakdown, _setShowCostBreakdown] = useState(false);
  const [_costBreakdown, setCostBreakdown] = useState(null);
  const [selectedMoveDate, setSelectedMoveDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Pricing form state - ONLY keep property type, size, quantity, and additional spaces pre-filled
  const [pricingForm, setPricingForm] = useState({
    // Keep ONLY these 4 fields pre-filled from localStorage:
    property_type: getPropertyTypeFromSources(),
    house_size: getPropertySizeFromSources(),
    additional_spaces: getAdditionalSpacesFromSources(),
    quantity: getQuantityFromSources(),

    // All other fields START EMPTY/with defaults
    user_details: {
      full_name: "",
      email: "",
      phone: "",
    },

    // Optional Extras - default values
    include_packing: true,
    packing_volume_m3: "",
    include_dismantling: false,
    dismantling_items: 0,
    include_reassembly: false,
    reassembly_items: 0,

    // Collection Assessment - default values
    collection_parking: "",
    collection_parking_distance: "",
    collection_internal_access: "",
    collection_flat_internal_access: "",
    // Collection attributes
    collection_is_standard_house: false,
    collection_is_bungalow: false,
    collection_is_town_house: false,
    collection_has_lift: false,
    collection_stairs_only: false,

    // Delivery Assessment - default values
    delivery_property_type: "",
    delivery_parking: "",
    delivery_parking_distance: "",
    delivery_internal_access: "",
    delivery_flat_internal_access: "",
    // Delivery attributes
    delivery_is_standard_house: false,
    delivery_is_bungalow: false,
    delivery_is_town_house: false,
    delivery_has_lift: false,
    delivery_stairs_only: false,

    // Move Date Data - default values
    notice_period: "",
    move_day: "",
    collection_time: "",

    // Address fields - empty
    pickup_address: "",
    pickup_city: "",
    delivery_address: "",
    delivery_city: "",
  });

  // Save all data to localStorage whenever it changes
  useEffect(() => {
    const refineData = {
      pricingForm,
      itemQuantities,
      dismantleItems,
      reassembleItems,
      filters,
      open,
      pickupPincode,
      dropoffPincode,
      pickup,
      dropoff,
      distanceMiles,
      distanceKm,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem("move_refineData", JSON.stringify(refineData));
    } catch (error) {
      console.error("Error saving refine data to localStorage:", error);
    }
  }, [
    pricingForm,
    itemQuantities,
    dismantleItems,
    reassembleItems,
    filters,
    open,
    pickupPincode,
    dropoffPincode,
    pickup,
    dropoff,
    distanceMiles,
    distanceKm,
  ]);

  // Real-time cost calculation effect
  useEffect(() => {
    const calculateApproximateCost = async () => {
      if (
        !pickupPincode ||
        !pricingForm.property_type ||
        !pricingForm.house_size
      ) {
        setApproximateCost(null);
        return;
      }

      setIsCalculatingCost(true);

      try {
        const totalVolume = calculateTotalVolume();
        const dismantlingVolume = calculateDismantlingVolume();
        const reassemblyVolume = calculateReassemblyVolume();
        const _sizeField = getPropertySizeField();

        const pricingPayload = {
          pincode: pickupPincode,
          property_type: pricingForm.property_type,
          ...(_sizeField && { property_size: pricingForm[_sizeField] }),
          quantity: pricingForm.quantity,
          additional_spaces: pricingForm.additional_spaces,
          selected_items: itemQuantities,
          dismantle_items: dismantleItems,
          reassemble_items: reassembleItems,
          distance_miles: distanceMiles,

          // ADD THESE FOR COMPLETE PRICING:
          selected_move_date: selectedMoveDate
            ? selectedMoveDate.toISOString().split("T")[0]
            : null,
          move_day: pricingForm.move_day,
          notice_period: pricingForm.notice_period,
          collection_time: pricingForm.collection_time,

          include_packing: pricingForm.include_packing,
          packing_volume_m3: pricingForm.include_packing ? totalVolume : null,
          include_dismantling: pricingForm.include_dismantling,
          dismantling_volume_m3: pricingForm.include_dismantling
            ? dismantlingVolume
            : null,
          include_reassembly: pricingForm.include_reassembly,
          reassembly_volume_m3: pricingForm.include_reassembly
            ? reassemblyVolume
            : null,

          collection_parking_distance: pricingForm.collection_parking_distance,
          delivery_parking_distance: pricingForm.delivery_parking_distance,

          collection_internal_access: [
            "flat",
            "office",
            "a_few_items",
          ].includes(pricingForm.property_type)
            ? pricingForm.collection_flat_internal_access
            : pricingForm.collection_internal_access,

          delivery_internal_access: ["flat", "office", "a_few_items"].includes(
            pricingForm.property_type
          )
            ? pricingForm.delivery_flat_internal_access
            : pricingForm.delivery_internal_access,
        };

        const response = await axios.post(
          "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_with_cost",
          pricingPayload,
          { headers: { "Content-Type": "application/json" }, timeout: 30000 }
        );

        const apiResponse = response?.data?.message;

        if (apiResponse?.success && apiResponse.data?.length > 0) {
          const prices = apiResponse.data
            .map((c) => c.exact_pricing?.final_total || 0)
            .filter((p) => p > 0);

          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

            setApproximateCost({
              min: minPrice,
              max: maxPrice,
              avg: avgPrice,
              count: apiResponse.count,
              currency: "£",
            });

            const cheapestProvider = apiResponse.data.find(
              (c) => c.exact_pricing?.final_total === minPrice
            );

            if (cheapestProvider?.exact_pricing) {
              setCostBreakdown({
                loading: cheapestProvider.exact_pricing.loading_cost || 0,
                mileage: cheapestProvider.exact_pricing.mileage_cost || 0,
                packing: cheapestProvider.exact_pricing.packing_cost || 0,
                dismantling:
                  cheapestProvider.exact_pricing.dismantling_cost || 0,
                reassembly: cheapestProvider.exact_pricing.reassembly_cost || 0,
                parking: cheapestProvider.exact_pricing.parking_cost || 0,
                access: cheapestProvider.exact_pricing.access_cost || 0,
                dateAdjustment:
                  cheapestProvider.exact_pricing.date_adjustment || 0,
                timeAdjustment:
                  cheapestProvider.exact_pricing.time_adjustment || 0,
                noticeAdjustment:
                  cheapestProvider.exact_pricing.notice_adjustment || 0,
                total: cheapestProvider.exact_pricing.final_total || 0,
              });
            }
          }
        } else {
          setApproximateCost(null);
          setCostBreakdown(null);
        }
      } catch (err) {
        console.log("Cost calculation failed (silent):", err.message);
        setApproximateCost(null);
      } finally {
        setIsCalculatingCost(false);
      }
    };

    const timer = setTimeout(() => {
      calculateApproximateCost();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickupPincode,
    pricingForm.property_type,
    pricingForm.house_size,
    pricingForm.quantity,
    pricingForm.additional_spaces,
    pricingForm.notice_period,
    pricingForm.move_day,
    pricingForm.collection_time,
    pricingForm.collection_parking_distance,
    pricingForm.delivery_parking_distance,
    pricingForm.collection_internal_access,
    pricingForm.collection_flat_internal_access,
    pricingForm.delivery_internal_access,
    pricingForm.delivery_flat_internal_access,
    selectedMoveDate, // ADD THIS
    itemQuantities,
    dismantleItems,
    reassembleItems,
    pricingForm.include_packing,
    pricingForm.include_dismantling,
    pricingForm.include_reassembly,
    distanceMiles,
  ]);

  // Calendar helper functions
  const _getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const _getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const months = [];

    // Generate 6 months starting from current month
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(currentYear, currentMonth + i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();

      const days = [];

      // Add empty cells for days before month starts
      for (let j = 0; j < firstDay; j++) {
        days.push(null);
      }

      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }

      months.push({
        days,
        monthName: monthDate.toLocaleString("default", { month: "long" }),
        year: year,
        monthIndex: month,
      });
    }

    return months;
  };

  const handleDateSelect = (date) => {
    if (date) {
      const priceInfo = calculatePriceForDate(date);

      setSelectedMoveDate(date);
      setShowCalendar(false);

      // Update pricing form
      const dayOfWeek = date.getDay();
      const isFridayOrSaturday = dayOfWeek === 5 || dayOfWeek === 6;
      updatePricingForm(
        "move_day",
        isFridayOrSaturday ? "fri_sat" : "sun_to_thurs"
      );

      // Update notice period based on days until move
      if (priceInfo) {
        const days = priceInfo.daysUntilMove;
        let noticePeriod = "within_month";

        if (days <= 3) noticePeriod = "within_3_days";
        else if (days <= 7) noticePeriod = "within_week";
        else if (days <= 14) noticePeriod = "within_2_weeks";
        else if (days <= 30) noticePeriod = "within_month";
        else noticePeriod = "over_month";

        updatePricingForm("notice_period", noticePeriod);

        // Show price confirmation (optional toast/alert)
        console.log(
          `Selected date price: £${priceInfo.price} (${priceInfo.multiplier}x base)`
        );
      }
    }
  };

  const _isDateDisabled = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const toggleSection = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePricingForm = (field, value) => {
    setPricingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleAdditionalSpace = (space) => {
    setPricingForm((prev) => ({
      ...prev,
      additional_spaces: prev.additional_spaces.includes(space)
        ? prev.additional_spaces.filter((s) => s !== space)
        : [...prev.additional_spaces, space],
    }));
  };

  // Toggle dismantle status for an item
  const toggleDismantleItem = (itemName) => {
    setDismantleItems((prev) => {
      const newState = {
        ...prev,
        [itemName]: !prev[itemName],
      };

      // Count how many items are marked for dismantling
      const dismantleCount = Object.values(newState).filter((v) => v).length;

      // Update the dismantling service toggle and count
      setPricingForm((prevForm) => ({
        ...prevForm,
        include_dismantling: dismantleCount > 0,
        dismantling_items: dismantleCount,
      }));

      // If dismantling is unchecked, also uncheck reassembly for the same item
      if (!newState[itemName] && reassembleItems[itemName]) {
        setReassembleItems((prev) => {
          const newReassemble = { ...prev };
          delete newReassemble[itemName];

          // Update reassembly count
          const reassembleCount = Object.values(newReassemble).filter(
            (v) => v
          ).length;
          setPricingForm((prevForm) => ({
            ...prevForm,
            include_reassembly: reassembleCount > 0,
            reassembly_items: reassembleCount,
          }));

          return newReassemble;
        });
      }

      return newState;
    });
  };

  // Toggle reassembly status for an item
  const toggleReassembleItem = (itemName) => {
    setReassembleItems((prev) => {
      const newState = {
        ...prev,
        [itemName]: !prev[itemName],
      };

      // Count how many items are marked for reassembly
      const reassembleCount = Object.values(newState).filter((v) => v).length;

      // Update the reassembly service toggle and count
      setPricingForm((prevForm) => ({
        ...prevForm,
        include_reassembly: reassembleCount > 0,
        reassembly_items: reassembleCount,
      }));

      // If reassembly is checked, automatically check dismantling for the same item
      if (newState[itemName] && !dismantleItems[itemName]) {
        setDismantleItems((prev) => {
          const newDismantle = { ...prev, [itemName]: true };

          // Update dismantling count
          const dismantleCount = Object.values(newDismantle).filter(
            (v) => v
          ).length;
          setPricingForm((prevForm) => ({
            ...prevForm,
            include_dismantling: dismantleCount > 0,
            dismantling_items: dismantleCount,
          }));

          return newDismantle;
        });
      }

      return newState;
    });
  };

  // updateItemQuantity now works with category items and keeps UI state
  const updateItemQuantity = (key, newQtyRaw) => {
    const parsed = Number(newQtyRaw);
    const newQty = isNaN(parsed) ? 0 : Math.max(0, parsed);

    setItemQuantities((prev) => {
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[key];
        // Also remove from dismantle and reassemble items if quantity is 0
        if (dismantleItems[key]) {
          const newDismantle = { ...dismantleItems };
          delete newDismantle[key];
          setDismantleItems(newDismantle);
        }
        if (reassembleItems[key]) {
          const newReassemble = { ...reassembleItems };
          delete newReassemble[key];
          setReassembleItems(newReassemble);
        }
      } else {
        updated[key] = newQty;
      }
      return updated;
    });

    setFilters((prev) => {
      const exists = prev.items.includes(key);
      if (newQty > 0 && !exists)
        return { ...prev, items: [...prev.items, key] };
      if (newQty <= 0 && exists)
        return { ...prev, items: prev.items.filter((i) => i !== key) };
      return prev;
    });
  };

  const resetAll = () => {
    setFilters({
      items: [],
    });
    setItemQuantities({});
    setDismantleItems({});
    setReassembleItems({});
    setPricingForm({
      property_type: "house",
      house_size: "3_bed",
      additional_spaces: [],
      quantity: "everything",
      include_dismantling: false,
      dismantling_items: 0,
      include_reassembly: false,
      reassembly_items: 0,
      include_packing: true,
      packing_volume_m3: "",
      collection_parking: "",
      collection_parking_distance: "",
      collection_internal_access: "",
      collection_flat_internal_access: "",
      delivery_parking: "",
      delivery_parking_distance: "",
      delivery_internal_access: "",
      delivery_flat_internal_access: "",
      notice_period: "",
      move_day: "",
      collection_time: "",
      pickup_address: "",
      pickup_city: "",
      delivery_address: "",
      delivery_city: "",
      user_details: {
        full_name: "",
        email: "",
        phone: "",
      },
    });
    setApiError(null);

    // Also clear refine data from localStorage
    localStorage.removeItem("move_refineData");
  };

  // Calculate total volume from items (uses INVENTORY_DATA map)
  const itemVolumeMap = React.useMemo(() => {
    const map = {};
    INVENTORY_DATA.forEach((i) => {
      map[i.item_name] = i.average_volume;
    });
    return map;
  }, []);

  const calculateTotalVolume = () => {
    let total = 0;
    Object.entries(itemQuantities).forEach(([itemName, quantity]) => {
      const vol = itemVolumeMap[itemName] || 0;
      total += vol * quantity;
    });
    return parseFloat(total.toFixed(2));
  };

  // Calculate dismantling volume (total volume of items marked for dismantling)
  const calculateDismantlingVolume = () => {
    let total = 0;
    Object.entries(dismantleItems).forEach(([itemName, needsDismantle]) => {
      if (needsDismantle) {
        const vol = itemVolumeMap[itemName] || 0;
        const quantity = itemQuantities[itemName] || 0;
        if (quantity > 0) {
          total += vol * quantity;
        }
      }
    });
    return parseFloat(total.toFixed(2));
  };

  // Calculate reassembly volume (total volume of items marked for reassembly)
  const calculateReassemblyVolume = () => {
    let total = 0;
    Object.entries(reassembleItems).forEach(([itemName, needsReassemble]) => {
      if (needsReassemble) {
        const vol = itemVolumeMap[itemName] || 0;
        const quantity = itemQuantities[itemName] || 0;
        if (quantity > 0) {
          total += vol * quantity;
        }
      }
    });
    return parseFloat(total.toFixed(2));
  };

  // Get the correct property size field based on property type
  const getPropertySizeField = () => {
    switch (pricingForm.property_type) {
      case "flat":
        return "flat_size";
      case "office":
        return "office_size";
      case "bungalow":
        return "bungalow_size";
      case "town_house":
        return "town_house_size";
      case "a_few_items":
        return null;
      default:
        return "house_size";
    }
  };

  // Helper functions to map to new API structure
  function getCollectionHouseType() {
    if (["house", "bungalow", "town_house"].includes(pricingForm.property_type)) {
      if (pricingForm.collection_is_bungalow) {
        return "bungalow_ground";
      } else if (pricingForm.collection_is_town_house) {
        return "townhouse_ground_1st_2nd";
      } else if (pricingForm.collection_is_standard_house) {
        const access = pricingForm.collection_internal_access;
        if (access === "ground_only") return "house_ground_only";
        if (access === "ground_first") return "house_ground_and_1st";
        if (access === "ground_first_second") return "house_ground_1st_2nd";
      }
    }
    return null;
  }
  
  function getCollectionFlatAccess() {
    if (["flat", "office", "a_few_items"].includes(pricingForm.property_type)) {
      if (pricingForm.collection_stairs_only) return "stairs_only";
      if (pricingForm.collection_has_lift) return "lift_access";
    }
    return null;
  }
  
  function getCollectionFloorLevel() {
    if (["flat", "office", "a_few_items"].includes(pricingForm.property_type)) {
      const access = pricingForm.collection_flat_internal_access;
      if (access === "ground_floor") return "ground_floor";
      if (access === "first_floor") return "1st_floor";
      if (access === "second_floor") return "2nd_floor";
      if (access === "third_floor_plus") return "3rd_floor_plus";
    }
    return null;
  }
  
  function getDeliveryHouseType() {
    if (["house", "bungalow", "town_house"].includes(pricingForm.delivery_property_type)) {
      if (pricingForm.delivery_is_bungalow) {
        return "bungalow_ground";
      } else if (pricingForm.delivery_is_town_house) {
        return "townhouse_ground_1st_2nd";
      } else if (pricingForm.delivery_is_standard_house) {
        const access = pricingForm.delivery_internal_access;
        if (access === "ground_only") return "house_ground_only";
        if (access === "ground_first") return "house_ground_and_1st";
        if (access === "ground_first_second") return "house_ground_1st_2nd";
      }
    }
    return null;
  }
  
  function getDeliveryFlatAccess() {
    if (["flat", "office", "a_few_items"].includes(pricingForm.delivery_property_type)) {
      if (pricingForm.delivery_stairs_only) return "stairs_only";
      if (pricingForm.delivery_has_lift) return "lift_access";
    }
    return null;
  }
  
  function getDeliveryFloorLevel() {
    if (["flat", "office", "a_few_items"].includes(pricingForm.delivery_property_type)) {
      const access = pricingForm.delivery_flat_internal_access;
      if (access === "ground_floor") return "ground_floor";
      if (access === "first_floor") return "1st_floor";
      if (access === "second_floor") return "2nd_floor";
      if (access === "third_floor_plus") return "3rd_floor_plus";
    }
    return null;
  }

  // Send pricing request to backend
  const applyFilters = async () => {
    setIsLoadingCosts(true);
    setApiError(null);

    // Calculate volumes
    const totalVolume = calculateTotalVolume();
    const dismantlingVolume = calculateDismantlingVolume();
    const reassemblyVolume = calculateReassemblyVolume();

    // Get the correct size field
    const _sizeField = getPropertySizeField();

    // IMPORTANT: Use packing volume from form or default to total volume if packing is enabled
    let packingVolume = "";

    if (pricingForm.include_packing) {
      packingVolume = pricingForm.packing_volume_m3
        ? pricingForm.packing_volume_m3
        : totalVolume; // Auto-calc only if user didn't type it
    }

    // ========== NEW API PAYLOAD STRUCTURE ==========
    const pricingPayload = {
      // ========== BASIC SEARCH ==========
      pincode: pickupPincode || "",
      distance_miles: distanceMiles || null,
      
      // ========== ADDRESS DETAILS (Optional) ==========
      pickup_address: pricingForm.pickup_address || "",
      pickup_city: pricingForm.pickup_city || "",
      delivery_address: pricingForm.delivery_address || "",
      delivery_city: pricingForm.delivery_city || "",
      
      // ========== PROPERTY INFORMATION ==========
      property_type: pricingForm.property_type || "",
      property_size: pricingForm.house_size || "", // Using house_size field for all property types
      quantity: pricingForm.quantity || "",
      
      // For houses only:
      additional_spaces: pricingForm.additional_spaces || [],
      
      // ========== ITEMS INVENTORY (Optional, alternative to property_type) ==========
      selected_items: itemQuantities || {},
      dismantle_items: dismantleItems || {},
      
      // ========== OPTIONAL EXTRAS ==========
      include_packing: pricingForm.include_packing || false,
      include_dismantling: pricingForm.include_dismantling || false,
      include_reassembly: pricingForm.include_reassembly || false,
      
      // ========== COLLECTION PROPERTY ASSESSMENT ==========
      collection_parking: pricingForm.collection_parking || "",
      collection_parking_distance: pricingForm.collection_parking_distance || "",
      
      // Determine collection house type based on checkboxes and internal access
      ...(getCollectionHouseType() && { collection_house_type: getCollectionHouseType() }),
      
      // For FLATS/OFFICES/A_FEW_ITEMS:
      ...(getCollectionFlatAccess() && { collection_internal_access: getCollectionFlatAccess() }),
      ...(getCollectionFloorLevel() && { collection_floor_level: getCollectionFloorLevel() }),
      
      // ========== DELIVERY PROPERTY ASSESSMENT ==========
      delivery_parking: pricingForm.delivery_parking || "",
      delivery_parking_distance: pricingForm.delivery_parking_distance || "",
      
      // Determine delivery house type based on checkboxes and internal access
      ...(getDeliveryHouseType() && { delivery_house_type: getDeliveryHouseType() }),
      
      // For FLATS/OFFICES/A_FEW_ITEMS:
      ...(getDeliveryFlatAccess() && { delivery_internal_access: getDeliveryFlatAccess() }),
      ...(getDeliveryFloorLevel() && { delivery_floor_level: getDeliveryFloorLevel() }),
      
      // ========== MOVE DATE FACTORS ==========
      notice_period: pricingForm.notice_period || "",
      move_day: pricingForm.move_day || "",
      collection_time: pricingForm.collection_time || "",
      
      // ========== EMAIL NOTIFICATION ==========
      send_email: false,
      user_email: pricingForm.user_details.email || "",
    };

    console.log("=== DEBUG: SENDING TO API ===");
    console.log("Full payload:", JSON.stringify(pricingPayload, null, 2));
    console.log("Delivery Pincode to save:", dropoffPincode);
    console.log("Quantity being sent:", pricingForm.quantity);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_with_cost",
        pricingPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("=== DEBUG: API RESPONSE ===");
      console.log("Response status:", response.status);

      const apiResponse = response?.data?.message;

      if (apiResponse?.success) {
        console.log("Companies found:", apiResponse.count);

        // ⭐ SAVE THE EXACT API RESPONSE TO LOCALSTORAGE WITH DELIVERY PINCODE
        // Pass delivery pincode as third parameter
        saveToLocalStorage(
          "BookServiceResponse",
          response.data.message,
          dropoffPincode
        );

        // ⭐ AUTO-FETCH USER DETAILS WITHOUT UI
        let userDetails = {
          full_name: "",
          email: "",
          phone: "",
        };

        try {
          const userRes = await axios.get(
            "http://127.0.0.1:8000/api/method/localmoves.api.user.get_user_details"
          );

          if (userRes.data?.message) {
            userDetails = {
              full_name: userRes.data.message.full_name,
              email: userRes.data.message.email,
              phone: userRes.data.message.phone,
            };
          }
        } catch (err) {
          console.log("User details fetch failed", err);
        }

        // Navigate to filtered providers with the new API data
        navigate("/filtered-providers", {
          state: {
            ...state,
            refineFilters: filters,
            itemQuantities,
            dismantleItems,
            reassembleItems,

            user_details: userDetails,

            providers: apiResponse.data || [],

            pricingResult: {
              success: true,
              count: apiResponse.count,
              total_companies: apiResponse.total_companies,
              filtered_out: apiResponse.filtered_out,
              pricing_note: apiResponse.pricing_note,
              search_parameters: apiResponse.search_parameters,
            },

            pricingForm,
            pricingPayload,

            pickup,
            dropoff,
            pickupPincode,
            dropoffPincode,

            pickupCoords,
            dropoffCoords,
            routeGeometry,

            distanceMiles,
            distanceKm,
            totalVolume,
            dismantlingVolume,
            reassemblyVolume,
            packingVolume,

            companiesWithPricing:
              apiResponse.data?.map((company) => ({
                company_name: company.company_name || company.name,
                phone: company.phone,
                description: company.description,
                services_offered: company.services_offered,
                includes: company.includes,
                protection: company.protection,
                material: company.material,
                furniture: company.furniture,
                appliances: company.appliances,
                areas_covered: company.areas_covered,
                average_rating: company.average_rating,
                total_ratings: company.total_ratings,
                exact_pricing: company.exact_pricing,
                pricing_rates: company.pricing_rates,
                subscription_info: company.subscription_info,
                total_carrying_capacity: company.total_carrying_capacity,
                company_gallery: company.company_gallery,
                original_company_object: company,
              })) || [],
          },
        });
      } else {
        console.error("API returned unsuccessful:", apiResponse);

        // ⭐ SAVE ERROR RESPONSE TO LOCALSTORAGE WITH DELIVERY PINCODE
        saveToLocalStorage(
          "BookServiceResponse",
          response.data.message || {
            success: false,
            error: "API returned unsuccessful",
          },
          dropoffPincode
        );

        setApiError(
          typeof apiResponse?.message === "string"
            ? apiResponse.message
            : JSON.stringify(
                apiResponse?.message || "Search and pricing calculation failed"
              )
        );
      }
    } catch (err) {
      console.error("=== DEBUG: API ERROR ===");
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);

      // Try to extract error message from response
      let errorMessage =
        "Failed to search companies with pricing. Please check your network connection.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.exception) {
        errorMessage = err.response.data.exception;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // ⭐ SAVE ERROR TO LOCALSTORAGE WITH DELIVERY PINCODE
      saveToLocalStorage(
        "BookServiceResponse",
        {
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
        dropoffPincode
      );

      setApiError(errorMessage);
    } finally {
      setIsLoadingCosts(false);
    }
  };

  // Get size options based on property type - UPDATED
  const getSizeOptions = () => {
    switch (pricingForm.property_type) {
      case "flat":
        return FLAT_SIZES;
      case "office":
        return OFFICE_SIZES;
      case "a_few_items":
        return VEHICLE_SIZES; // Add this line
      case "bungalow":
      case "town_house":
        return HOUSE_SIZES.slice(0, 3);
      default:
        return HOUSE_SIZES;
    }
  };

  // Get internal access options based on property type and checkbox selections
  const getInternalAccessOptions = (isCollection = true) => {
    const propertyType = isCollection ? pricingForm.property_type : pricingForm.delivery_property_type;
    const field = isCollection
      ? "collection_internal_access"
      : "delivery_internal_access";
    const flatField = isCollection
      ? "collection_flat_internal_access"
      : "delivery_flat_internal_access";

    if (["flat", "office", "a_few_items"].includes(propertyType)) {
      return {
        options: INTERNAL_ACCESS_FLAT_OPTIONS,
        value: pricingForm[flatField] || "",
        onChange: (value) => updatePricingForm(flatField, value),
      };
    } else {
      // Determine options based on house type checkboxes
      let houseOptions = INTERNAL_ACCESS_HOUSE_OPTIONS;
      
      if (isCollection) {
        if (pricingForm.collection_is_standard_house) {
          // Standard House: Ground & 1st Floor only
          houseOptions = [
            { value: "ground_only", label: "Ground Floor Only" },
            { value: "ground_first", label: "Ground & 1st Floor" }
          ];
        } else if (pricingForm.collection_is_bungalow) {
          // Bungalow: Ground only
          houseOptions = [
            { value: "ground_only", label: "Ground Floor Only" }
          ];
        } else if (pricingForm.collection_is_town_house) {
          // Town House: Ground, 1st, 2nd
          houseOptions = INTERNAL_ACCESS_HOUSE_OPTIONS;
        }
      } else {
        if (pricingForm.delivery_is_standard_house) {
          // Standard House: Ground & 1st Floor only
          houseOptions = [
            { value: "ground_only", label: "Ground Floor Only" },
            { value: "ground_first", label: "Ground & 1st Floor" }
          ];
        } else if (pricingForm.delivery_is_bungalow) {
          // Bungalow: Ground only
          houseOptions = [
            { value: "ground_only", label: "Ground Floor Only" }
          ];
        } else if (pricingForm.delivery_is_town_house) {
          // Town House: Ground, 1st, 2nd
          houseOptions = INTERNAL_ACCESS_HOUSE_OPTIONS;
        }
      }
      
      return {
        options: houseOptions,
        value: pricingForm[field] || "",
        onChange: (value) => updatePricingForm(field, value),
      };
    }
  };

  const sizeOptions = getSizeOptions();
  const collectionInternalAccess = getInternalAccessOptions(true);
  const deliveryInternalAccess = getInternalAccessOptions(false);

  // Calculate price for a specific date
  const calculatePriceForDate = (date) => {
    if (!approximateCost || !date) return null;

    // Get base price (average from approximateCost)
    const basePrice = approximateCost.avg || approximateCost.min || 0;

    // Determine if weekend
    const dayOfWeek = date.getDay();
    const isFridayOrSaturday = dayOfWeek === 5 || dayOfWeek === 6;

    // Apply weekend multiplier (15% surcharge)
    const weekendMultiplier = isFridayOrSaturday ? 1.15 : 1.0;

    // Calculate notice period multiplier based on days until move
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilMove = Math.floor((date - today) / (1000 * 60 * 60 * 24));

    let noticeMultiplier = 1.0;
    if (daysUntilMove <= 3) {
      noticeMultiplier = 1.3; // Within 3 days
    } else if (daysUntilMove <= 7) {
      noticeMultiplier = 1.2; // Within 1 week
    } else if (daysUntilMove <= 14) {
      noticeMultiplier = 1.1; // Within 2 weeks
    } else if (daysUntilMove <= 30) {
      noticeMultiplier = 1.0; // Within 1 month
    } else {
      noticeMultiplier = 0.9; // Over 1 month
    }

    // Combined multiplier
    const totalMultiplier = weekendMultiplier * noticeMultiplier;

    // Final price
    const finalPrice = basePrice * totalMultiplier;

    return {
      price: Math.round(finalPrice),
      basePrice: Math.round(basePrice),
      multiplier: totalMultiplier,
      isWeekend: isFridayOrSaturday,
      daysUntilMove: daysUntilMove,
      breakdown: {
        weekend: weekendMultiplier,
        notice: noticeMultiplier,
      },
    };
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

            {/* ========== APPROXIMATE COST DISPLAY ========== */}
            {/* {approximateCost && (
              <div className="mt-4 relative">
                <div
                  className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Approximate Move Cost
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-pink-600">
                          {approximateCost.currency}
                          {approximateCost.min.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">-</span>
                        <span className="text-2xl font-bold text-pink-600">
                          {approximateCost.currency}
                          {approximateCost.max.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {approximateCost.count} available provider
                        {approximateCost.count !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isCalculatingCost && (
                        <div className="flex items-center gap-2 text-pink-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent"></div>
                          <span className="text-xs">Updating...</span>
                        </div>
                      )}

                      <button className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
                        {showCostBreakdown ? "Hide" : "View"} breakdown
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            showCostBreakdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-pink-200">
                    <p className="text-xs text-gray-600">
                      💡 <span className="font-medium">Average:</span>{" "}
                      {approximateCost.currency}
                      {Math.round(approximateCost.avg).toLocaleString()}
                      <span className="ml-2 text-gray-500">
                        • Updates as you refine
                      </span>
                    </p>
                  </div>
                </div>

                {showCostBreakdown && costBreakdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl border border-pink-200 shadow-lg z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800">
                        Cost Breakdown (Cheapest)
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCostBreakdown(false);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      {costBreakdown.loading > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Loading & Transport
                          </span>
                          <span className="font-medium">
                            £{costBreakdown.loading.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.mileage > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Mileage ({distanceMiles} miles)
                          </span>
                          <span className="font-medium">
                            £{costBreakdown.mileage.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.packing > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Packing Service</span>
                          <span className="font-medium">
                            £{costBreakdown.packing.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.dismantling > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dismantling</span>
                          <span className="font-medium">
                            £{costBreakdown.dismantling.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.reassembly > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Reassembly</span>
                          <span className="font-medium">
                            £{costBreakdown.reassembly.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.parking > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Parking Distance
                          </span>
                          <span className="font-medium">
                            £{costBreakdown.parking.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.access > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Internal Access</span>
                          <span className="font-medium">
                            £{costBreakdown.access.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.dateAdjustment !== 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {costBreakdown.dateAdjustment > 0
                              ? "Weekend Surcharge"
                              : "Weekday Discount"}
                          </span>
                          <span
                            className={`font-medium ${
                              costBreakdown.dateAdjustment > 0
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {costBreakdown.dateAdjustment > 0 ? "+" : ""}£
                            {Math.abs(
                              costBreakdown.dateAdjustment
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.timeAdjustment !== 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Time Window Adjustment
                          </span>
                          <span className="font-medium">
                            {costBreakdown.timeAdjustment > 0 ? "+" : ""}£
                            {costBreakdown.timeAdjustment.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {costBreakdown.noticeAdjustment !== 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Notice Period Adjustment
                          </span>
                          <span className="font-medium">
                            {costBreakdown.noticeAdjustment > 0 ? "+" : ""}£
                            {costBreakdown.noticeAdjustment.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between text-base font-semibold">
                          <span className="text-gray-800">Total Cost</span>
                          <span className="text-pink-600">
                            £{costBreakdown.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Click "Search Companies" for all prices
                    </p>
                  </div>
                )}
              </div>
            )} */}

            {isCalculatingCost && !approximateCost && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-600 border-t-transparent"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Calculating costs...
                    </p>
                    <p className="text-xs text-gray-500">
                      Based on your selections
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* DEBUG: Show loaded data */}
            {/* <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <p className="text-blue-800 font-medium">DEBUG - Loaded Data:</p>
              <p className="text-blue-600">
                Property Type: {pricingForm.property_type} | 
                Size: {pricingForm.house_size} | 
                Quantity: {pricingForm.quantity} | 
                Additional Spaces: {pricingForm.additional_spaces?.length || 0}
              </p>
            </div> */}

          {/* Reset */}
          <div className="px-6 pb-2 flex items-center justify-between border-t border-gray-100 pt-4">
            
            <button
              onClick={resetAll}
              className="text-[11px] text-gray-500 hover:text-pink-600"
            >
              Reset All
            </button>
          </div>

          {/* Items - What do you need help moving - MOVED HERE */}
          <div className="px-6 pt-5 pb-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-pink-600 font-semibold text-sm mb-1">
                  What do you need help moving?
                </h3>
                <p className="text-[11px] text-gray-500">
                  Set quantities for each item and mark which need
                  dismantling/reassembly.
                </p>
              </div>
              {/* Dismantling/Reassembly Legend */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full">
                  <Wrench className="h-3 w-3 text-pink-600" />
                  <span className="text-[10px] font-medium text-pink-700">
                    {Object.values(dismantleItems).filter((v) => v).length}{" "}
                    dismantle
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <svg
                    className="h-3 w-3 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    ></path>
                  </svg>
                  <span className="text-[10px] font-medium text-blue-700">
                    {Object.values(reassembleItems).filter((v) => v).length}{" "}
                    reassemble
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.keys(INVENTORY_BY_CATEGORY).map((category) => (
                <div
                  key={category}
                  className="border rounded-lg overflow-hidden"
                >
                  <details className="group">
                    <summary className="px-4 py-3 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">
                          {category}
                        </span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                          {INVENTORY_BY_CATEGORY[category].length} items
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                    </summary>

                    <div className="px-3 pb-3 pt-2 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {INVENTORY_BY_CATEGORY[category].map((item) => {
                          const key = item.item_name;
                          const qty = itemQuantities[key] || 0;
                          const needsDismantle = dismantleItems[key] || false;
                          const needsReassemble =
                            reassembleItems[key] || false;
                          const isActive = qty > 0;

                          return (
                            <div
                              key={key}
                              className={`flex flex-col rounded-lg border px-3 py-3 transition-all ${
                                isActive
                                  ? needsDismantle || needsReassemble
                                    ? "border-pink-300 bg-pink-50"
                                    : "border-pink-200 bg-pink-50"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                            >
                              {/* Item Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <span
                                    className={`text-[13px] font-medium block ${
                                      isActive
                                        ? "text-pink-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {item.item_name}
                                  </span>
                                </div>

                                {/* Checkboxes Container */}
                                <div className="flex flex-col items-end gap-1.5">
                                  {/* Dismantle Checkbox */}
                                  <label
                                    className={`flex items-center gap-1.5 cursor-pointer ${
                                      qty === 0
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={needsDismantle}
                                        onChange={() =>
                                          toggleDismantleItem(key)
                                        }
                                        disabled={qty === 0}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                                          needsDismantle
                                            ? "bg-pink-600 border-pink-600"
                                            : "border-gray-300 bg-white"
                                        } ${
                                          qty > 0
                                            ? "hover:border-pink-400"
                                            : ""
                                        }`}
                                      >
                                        {needsDismantle && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="3"
                                              d="M5 13l4 4L19 7"
                                            ></path>
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[10px] font-medium ${
                                        needsDismantle
                                          ? "text-pink-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Dismantle
                                    </span>
                                  </label>

                                  {/* Reassemble Checkbox */}
                                  <label
                                    className={`flex items-center gap-1.5 cursor-pointer ${
                                      qty === 0
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={needsReassemble}
                                        onChange={() =>
                                          toggleReassembleItem(key)
                                        }
                                        disabled={qty === 0}
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                                          needsReassemble
                                            ? "bg-blue-600 border-blue-600"
                                            : "border-gray-300 bg-white"
                                        } ${
                                          qty > 0
                                            ? "hover:border-blue-400"
                                            : ""
                                        }`}
                                      >
                                        {needsReassemble && (
                                          <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="3"
                                              d="M5 13l4 4L19 7"
                                            ></path>
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <span
                                      className={`text-[10px] font-medium ${
                                        needsReassemble
                                          ? "text-blue-700"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Reassemble
                                    </span>
                                  </label>
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex-1">
                                  <span className="text-[11px] text-gray-600">
                                    Quantity:
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition ${
                                      qty > 0
                                        ? "border-pink-300 text-pink-700 hover:bg-pink-100"
                                        : "border-gray-300 text-gray-400 hover:bg-gray-100"
                                    }`}
                                    onClick={() =>
                                      updateItemQuantity(key, qty - 1)
                                    }
                                    aria-label={`Decrease ${item.item_name}`}
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={qty}
                                    onChange={(e) =>
                                      updateItemQuantity(key, e.target.value)
                                    }
                                    className={`w-14 h-8 text-sm border rounded text-center font-medium ${
                                      qty > 0
                                        ? "border-pink-300 text-pink-700"
                                        : "border-gray-300 text-gray-700"
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    className="w-8 h-8 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-100 flex items-center justify-center text-sm transition"
                                    onClick={() =>
                                      updateItemQuantity(key, qty + 1)
                                    }
                                    aria-label={`Increase ${item.item_name}`}
                                  >
                                    +
                                  </button>
                                </div>
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

          {/* Property Details Summary Section - Read-only from localStorage */}
          <div className="border-t border-gray-100">
            <AccordionSection
              title="Property Details"
              open={open.propertyDetailsSummary}
              onToggle={() => toggleSection("propertyDetailsSummary")}
              customContent={
                <div className="px-6 pb-4">
                  {/* Property Details Grid with Icons - Just like ComparePage */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Property Type with Icon */}
                    {pricingForm.property_type && (() => {
                      // Format for display
                      const propertyTypeDisplay = pricingForm.property_type === "house" ? "HOUSE" : 
                                               pricingForm.property_type === "flat" ? "FLAT" :
                                               pricingForm.property_type === "office" ? "OFFICE" :
                                               pricingForm.property_type === "a_few_items" ? "A FEW ITEMS" : 
                                               pricingForm.property_type;
                      
                      // For icon mapping
                      const propertyTypeForIcon = propertyTypeDisplay.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                      const adjustedPropertyType = propertyTypeForIcon === "A Few Items" ? "Few Items" : propertyTypeForIcon;
                      
                      const { icon: Icon, color } = getPropertyTypeIcon(adjustedPropertyType);
                      const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                      
                      return (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          {isEmoji ? (
                            <Icon className={color} style={{ fontSize: '1rem' }} />
                          ) : (
                            <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                          )}
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">Property</span>
                            <span className="text-xs font-medium text-gray-800">
                              {propertyTypeDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Property Size with Icon */}
                    {pricingForm.house_size && (() => {
                      // Format the property size based on property type
                      let displaySize = pricingForm.house_size;
                      if (pricingForm.property_type === "a_few_items") {
                        const vehicleMap = {
                          'swb_van': 'SWB Van',
                          'mwb_van': 'MWB Van',
                          'lwb_van': 'LWB Van'
                        };
                        displaySize = vehicleMap[pricingForm.house_size] || pricingForm.house_size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      } else {
                        displaySize = pricingForm.house_size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      }
                      
                      const { icon: Icon, color } = getPropertySizeIcon(displaySize);
                      const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                      
                      return (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          {isEmoji ? (
                            <Icon className={color} style={{ fontSize: '1rem' }} />
                          ) : (
                            <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                          )}
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">Size</span>
                            <span className="text-xs font-medium text-gray-800">
                              {displaySize}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quantity with Icon */}
                    {pricingForm.quantity && (() => {
                      // Format quantity based on property type
                      let formattedQuantity = "";
                      
                      if (pricingForm.property_type === "a_few_items") {
                        const vanQuantityMap = {
                          quarter_van: "Quarter Van",
                          half_van: "Half Van",
                          three_quarter_van: "3/4 Van",
                          whole_van: "Whole Van",
                        };
                        formattedQuantity = vanQuantityMap[pricingForm.quantity] || 
                                         pricingForm.quantity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      } else {
                        const contentQuantityMap = {
                          some_things: "Some Things",
                          half_contents: "Half the Contents",
                          three_quarter: "3/4 Contents",
                          everything: "Everything",
                        };
                        formattedQuantity = contentQuantityMap[pricingForm.quantity] || 
                                         pricingForm.quantity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      }
                      
                      const { icon: Icon, color } = getQuantityIcon(formattedQuantity.toLowerCase());
                      
                      return (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
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

                    {/* Distance with Icon */}
                    {distanceMiles && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 text-pink-600 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500">Distance</span>
                          <span className="text-xs font-medium text-gray-800">
                            {distanceMiles} miles
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Spaces - Only show if property type is house/bungalow/town_house */}
                  {/* {pricingForm.additional_spaces?.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Boxes className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">Additional Spaces:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pricingForm.additional_spaces.map((space, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white rounded-md text-blue-700 border">
                            {space.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              }
            />
          </div>

          {/* Address Details Section - EVERYTHING INSIDE DROPDOWN */}
          <div className="border-t border-gray-100">
            <AccordionSection
              title="Address Details"
              open={open.propertyDetails}
              onToggle={() => toggleSection("propertyDetails")}
              customContent={
                <div className="px-6 pb-4 space-y-6">
                  {/* ===========================
                      VISIBLE ADDRESS FIELDS
                  ============================ */}
                  <div className="space-y-4">
                    {/* Pickup Address */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Pickup Address
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Enter pickup address"
                            value={pricingForm.pickup_address}
                            onChange={(e) =>
                              updatePricingForm(
                                "pickup_address",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter city"
                            value={pricingForm.pickup_city}
                            onChange={(e) =>
                              updatePricingForm("pickup_city", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded bg-gray-50">
                            Pincode: {pickupPincode}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Delivery Address
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Enter delivery address"
                            value={pricingForm.delivery_address}
                            onChange={(e) =>
                              updatePricingForm(
                                "delivery_address",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter city"
                            value={pricingForm.delivery_city}
                            onChange={(e) =>
                              updatePricingForm("delivery_city", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded bg-gray-50">
                            Pincode: {dropoffPincode}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===========================
                      PROPERTY DETAILS (PRE-FILLED FIELDS)
                  ============================ */}
                  <div className="space-y-4" style={{ display: "none" }}>
                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={pricingForm.property_type}
                        onChange={(e) =>
                          updatePricingForm("property_type", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Choose property type</option>
                        {PROPERTY_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size - UPDATED */}
                    {sizeOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {pricingForm.property_type === "a_few_items" ? "Vehicle Size" : "Property Size"}
                        </label>
                        <select
                          value={pricingForm.house_size}
                          onChange={(e) =>
                            updatePricingForm("house_size", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Choose {pricingForm.property_type === "a_few_items" ? "vehicle size" : "size"}</option>
                          {sizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Additional Spaces */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Spaces
                      </label>

                      <div className="space-y-2">
                        {ADDITIONAL_SPACES.map((space) => (
                          <label
                            key={space.value}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={pricingForm.additional_spaces.includes(
                                space.value
                              )}
                              onChange={() =>
                                toggleAdditionalSpace(space.value)
                              }
                              className="accent-pink-600"
                            />
                            {space.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity to Move
                      </label>
                      <select
                        value={pricingForm.quantity}
                        onChange={(e) =>
                          updatePricingForm("quantity", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Choose quantity</option>
                        {QUANTITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              }
            />

            {/* Collection Details */}
            <AccordionSection
              title="Collection Property Assessment"
              open={open.collectionDetails}
              onToggle={() => toggleSection("collectionDetails")}
              customContent={
                <div className="px-6 pb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking
                    </label>
                    <CustomIconSelect
                      value={pricingForm.collection_parking}
                      onChange={(val) => {
                        updatePricingForm("collection_parking", val);
                        // Clear parking distance if driveway is selected
                        if (val === "driveway") {
                          updatePricingForm("collection_parking_distance", "");
                        }
                      }}
                      options={PARKING_OPTIONS}
                      placeholder="Choose Parking"
                    />
                  </div>

                  {/* Only show parking distance when roadside is selected */}
                  {pricingForm.collection_parking === "roadside" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parking Distance (Vehicle To Property Entrance)
                      </label>
                      <div className="relative">
                        <select
                          value={pricingForm.collection_parking_distance}
                          onChange={(e) =>
                            updatePricingForm(
                              "collection_parking_distance",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md text-sm pr-10"
                        >
                        <option value="">Choose Parking Distance</option>
                        {PARKING_DISTANCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {pricingForm.collection_parking_distance && (
                        <button
                          type="button"
                          onClick={() => setShowCollectionParkingInfo(!showCollectionParkingInfo)}
                          className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Info size={18} />
                        </button>
                      )}
                      {showCollectionParkingInfo && pricingForm.collection_parking_distance && (
                        <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-gray-700 w-full max-w-md">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-900">
                              {PARKING_DISTANCE_OPTIONS.find(opt => opt.value === pricingForm.collection_parking_distance)?.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowCollectionParkingInfo(false)}
                              className="text-gray-400 hover:text-gray-600 ml-2"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {PARKING_DISTANCE_DESCRIPTIONS[pricingForm.collection_parking_distance]}
                          </p>
                        </div>
                      )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Access
                    </label>
                    
                    {/* Collection Attributes Checkboxes - Above Dropdown */}
                    {["house", "bungalow", "town_house"].includes(
                      pricingForm.property_type
                    ) && (
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.collection_is_standard_house || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("collection_is_standard_house", true);
                                updatePricingForm("collection_is_bungalow", false);
                                updatePricingForm("collection_is_town_house", false);
                              } else {
                                updatePricingForm("collection_is_standard_house", false);
                              }
                            }}
                          />
                          Standard House
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.collection_is_bungalow || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("collection_is_standard_house", false);
                                updatePricingForm("collection_is_bungalow", true);
                                updatePricingForm("collection_is_town_house", false);
                              } else {
                                updatePricingForm("collection_is_bungalow", false);
                              }
                            }}
                          />
                          Bungalow
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.collection_is_town_house || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("collection_is_standard_house", false);
                                updatePricingForm("collection_is_bungalow", false);
                                updatePricingForm("collection_is_town_house", true);
                              } else {
                                updatePricingForm("collection_is_town_house", false);
                              }
                            }}
                          />
                          Town house
                        </label>
                      </div>
                    )}
                    
                    {["flat", "office", "a_few_items"].includes(
                      pricingForm.property_type
                    ) && (
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.collection_stairs_only || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("collection_stairs_only", true);
                                updatePricingForm("collection_has_lift", false);
                              } else {
                                updatePricingForm("collection_stairs_only", false);
                              }
                            }}
                          />
                          Stair only
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.collection_has_lift || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("collection_stairs_only", false);
                                updatePricingForm("collection_has_lift", true);
                              } else {
                                updatePricingForm("collection_has_lift", false);
                              }
                            }}
                          />
                          Lift access
                        </label>
                      </div>
                    )}
                    
                    {/* Show dropdown: always for house types, only when stairs_only checked for flat/office/a_few_items */}
                    {(["house", "bungalow", "town_house"].includes(pricingForm.property_type) ||
                      (["flat", "office", "a_few_items"].includes(pricingForm.property_type) && pricingForm.collection_stairs_only)) && (
                    <select
                      value={collectionInternalAccess.value}
                      onChange={(e) =>
                        collectionInternalAccess.onChange(e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose internal access</option>
                      {collectionInternalAccess.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    )}
                    {/* Old flat checkbox code removed - now integrated above */}
                  </div>
                </div>
              }
            />

            {/* Delivery Details */}
            <AccordionSection
              title="Delivery Property Assessment"
              open={open.deliveryDetails}
              onToggle={() => toggleSection("deliveryDetails")}
              customContent={
                <div className="px-6 pb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <select
                      value={pricingForm.delivery_property_type}
                      onChange={(e) =>
                        updatePricingForm("delivery_property_type", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose property type</option>
                      {PROPERTY_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking
                    </label>
                    <CustomIconSelect
                      value={pricingForm.delivery_parking}
                      onChange={(val) => {
                        updatePricingForm("delivery_parking", val);
                        // Clear parking distance if driveway is selected
                        if (val === "driveway") {
                          updatePricingForm("delivery_parking_distance", "");
                        }
                      }}
                      options={PARKING_OPTIONS}
                      placeholder="Choose Parking"
                    />
                  </div>

                  {/* Only show parking distance when roadside is selected */}
                  {pricingForm.delivery_parking === "roadside" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parking Distance (Vehicle To Property Entrance)
                      </label>
                      <div className="relative">
                        <select
                          value={pricingForm.delivery_parking_distance}
                          onChange={(e) =>
                            updatePricingForm(
                              "delivery_parking_distance",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md text-sm pr-10"
                        >
                        <option value="">Choose parking distance</option>
                        {PARKING_DISTANCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {pricingForm.delivery_parking_distance && (
                        <button
                          type="button"
                          onClick={() => setShowDeliveryParkingInfo(!showDeliveryParkingInfo)}
                          className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Info size={18} />
                        </button>
                      )}
                      {showDeliveryParkingInfo && pricingForm.delivery_parking_distance && (
                        <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-gray-700 w-full max-w-md">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-900">
                              {PARKING_DISTANCE_OPTIONS.find(opt => opt.value === pricingForm.delivery_parking_distance)?.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowDeliveryParkingInfo(false)}
                              className="text-gray-400 hover:text-gray-600 ml-2"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {PARKING_DISTANCE_DESCRIPTIONS[pricingForm.delivery_parking_distance]}
                          </p>
                        </div>
                      )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Access
                    </label>
                    
                    {/* Delivery Attributes Checkboxes - Above Dropdown */}
                    {["house", "bungalow", "town_house"].includes(
                      pricingForm.delivery_property_type
                    ) && (
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.delivery_is_standard_house || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("delivery_is_standard_house", true);
                                updatePricingForm("delivery_is_bungalow", false);
                                updatePricingForm("delivery_is_town_house", false);
                              } else {
                                updatePricingForm("delivery_is_standard_house", false);
                              }
                            }}
                          />
                          Standard House
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.delivery_is_bungalow || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("delivery_is_standard_house", false);
                                updatePricingForm("delivery_is_bungalow", true);
                                updatePricingForm("delivery_is_town_house", false);
                              } else {
                                updatePricingForm("delivery_is_bungalow", false);
                              }
                            }}
                          />
                          Bungalow
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.delivery_is_town_house || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("delivery_is_standard_house", false);
                                updatePricingForm("delivery_is_bungalow", false);
                                updatePricingForm("delivery_is_town_house", true);
                              } else {
                                updatePricingForm("delivery_is_town_house", false);
                              }
                            }}
                          />
                          Town house
                        </label>
                      </div>
                    )}
                    
                    {["flat", "office", "a_few_items"].includes(
                      pricingForm.delivery_property_type
                    ) && (
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.delivery_stairs_only || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("delivery_stairs_only", true);
                                updatePricingForm("delivery_has_lift", false);
                              } else {
                                updatePricingForm("delivery_stairs_only", false);
                              }
                            }}
                          />
                          Stair only
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            className="accent-pink-600"
                            checked={pricingForm.delivery_has_lift || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updatePricingForm("delivery_stairs_only", false);
                                updatePricingForm("delivery_has_lift", true);
                              } else {
                                updatePricingForm("delivery_has_lift", false);
                              }
                            }}
                          />
                          Lift access
                        </label>
                      </div>
                    )}
                    
                    {/* Show dropdown: always for house types, only when stairs_only checked for flat/office/a_few_items */}
                    {(["house", "bungalow", "town_house"].includes(pricingForm.delivery_property_type) ||
                      (["flat", "office", "a_few_items"].includes(pricingForm.delivery_property_type) && pricingForm.delivery_stairs_only)) && (
                    <select
                      value={deliveryInternalAccess.value}
                      onChange={(e) =>
                        deliveryInternalAccess.onChange(e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose internal access</option>
                      {deliveryInternalAccess.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    )}
                  </div>
                </div>
              }
            />

            {/* Move Date Details */}
            <AccordionSection
              title="Move Date & Time"
              open={open.moveDateDetails}
              onToggle={() => toggleSection("moveDateDetails")}
              customContent={
                <div className="px-6 pb-4 space-y-4">
                  {/* Calendar Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Move Date
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full p-3 border border-gray-300 rounded-md text-left flex items-center justify-between hover:border-pink-400 transition"
                    >
                      <span
                        className={
                          selectedMoveDate ? "text-gray-800" : "text-gray-500"
                        }
                      >
                        {selectedMoveDate
                          ? selectedMoveDate.toLocaleDateString("en-GB", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Choose your move date"}
                      </span>
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </button>

                    {/* Calendar Dropdown */}
                    <div className="calendar-container">
                      {showCalendar && (
                        <div className="mt-2 bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 rounded-xl shadow-2xl">
                          {(() => {
                            try {
                              const calendars = generateCalendar();
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);

                              if (
                                !calendars ||
                                !Array.isArray(calendars) ||
                                calendars.length === 0
                              ) {
                                return (
                                  <div className="text-center py-8 text-gray-500">
                                    Loading calendar...
                                  </div>
                                );
                              }

                              const calendar = calendars[currentMonthIndex];
                              const canGoPrev = currentMonthIndex > 0;
                              const canGoNext = currentMonthIndex < calendars.length - 1;

                              return (
                                <div className="p-6">
                                  {/* Header with Navigation */}
                                  <div className="flex items-center justify-between mb-6">
                                    <button
                                      onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
                                      disabled={!canGoPrev}
                                      className={`p-2 rounded-lg transition ${
                                        canGoPrev
                                          ? "hover:bg-pink-100 text-gray-700"
                                          : "text-gray-300 cursor-not-allowed"
                                      }`}
                                    >
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>

                                    <div className="text-center">
                                      <h3 className="text-2xl font-bold text-gray-800">
                                        {calendar.monthName} {calendar.year}
                                      </h3>
                                      <p className="text-sm text-gray-500 mt-1">
                                        Select your preferred move date
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => setCurrentMonthIndex(prev => Math.min(calendars.length - 1, prev + 1))}
                                      disabled={!canGoNext}
                                      className={`p-2 rounded-lg transition ${
                                        canGoNext
                                          ? "hover:bg-pink-100 text-gray-700"
                                          : "text-gray-300 cursor-not-allowed"
                                      }`}
                                    >
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  </div>

                                  {/* Month Indicators */}
                                  <div className="flex justify-center gap-2 mb-6">
                                    {calendars.map((_, index) => (
                                      <button
                                        key={index}
                                        onClick={() => setCurrentMonthIndex(index)}
                                        className={`w-2 h-2 rounded-full transition ${
                                          index === currentMonthIndex
                                            ? "bg-pink-600 w-8"
                                            : "bg-gray-300 hover:bg-pink-300"
                                        }`}
                                      />
                                    ))}
                                  </div>

                                  {/* Day Headers */}
                                  <div className="grid grid-cols-7 gap-2 mb-3">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                      <div
                                        key={day}
                                        className="text-center text-sm font-bold text-gray-600 py-2"
                                      >
                                        {day}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Calendar Days */}
                                  <div className="grid grid-cols-7 gap-2 mb-6">
                                    {calendar.days.map((date, index) => {
                                      if (!date) {
                                        return <div key={`empty-${index}`} className="p-2"></div>;
                                      }

                                      const isToday = date.getTime() === today.getTime();
                                      const isSelected =
                                        selectedMoveDate &&
                                        date.getTime() === selectedMoveDate.getTime();
                                      const isDisabled = date < today;
                                      const isFridayOrSaturday =
                                        date.getDay() === 5 || date.getDay() === 6;
                                      const priceInfo = calculatePriceForDate(date);

                                      return (
                                        <button
                                          key={index}
                                          type="button"
                                          onClick={() => !isDisabled && handleDateSelect(date)}
                                          disabled={isDisabled}
                                          className={`
                                            relative p-3 text-sm rounded-xl transition-all flex flex-col items-center justify-center min-h-[70px] group
                                            ${
                                              isDisabled
                                                ? "text-gray-300 cursor-not-allowed bg-gray-50"
                                                : "hover:scale-105 cursor-pointer hover:shadow-lg"
                                            }
                                            ${
                                              isSelected
                                                ? "bg-gradient-to-br from-pink-600 to-pink-700 text-white font-bold shadow-xl scale-105"
                                                : ""
                                            }
                                            ${
                                              isToday && !isSelected
                                                ? "ring-2 ring-pink-500 ring-offset-2 font-semibold bg-white"
                                                : "border-2 border-transparent"
                                            }
                                            ${
                                              isFridayOrSaturday && !isSelected && !isDisabled
                                                ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
                                                : !isSelected && !isToday && !isDisabled
                                                ? "bg-white hover:bg-pink-50"
                                                : ""
                                            }
                                          `}
                                        >
                                          <span
                                            className={`text-lg font-bold ${
                                              isSelected ? "text-white" : "text-gray-800"
                                            }`}
                                          >
                                            {date.getDate()}
                                          </span>

                                          {!isDisabled && priceInfo && approximateCost && (
                                            <span
                                              className={`text-xs font-bold mt-1 ${
                                                isSelected
                                                  ? "text-white"
                                                  : isFridayOrSaturday
                                                  ? "text-orange-700"
                                                  : "text-pink-600"
                                              }`}
                                            >
                                              £{priceInfo.price.toLocaleString()}
                                            </span>
                                          )}

                                       
                                          {isFridayOrSaturday && !isSelected && !isDisabled && (
                                            <span className="absolute top-1 right-1 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-semibold">
                                              +15%
                                            </span>
                                          )}

                                          {!isDisabled &&
                                            priceInfo &&
                                            approximateCost &&
                                            priceInfo.price ===
                                              Math.min(
                                                ...calendar.days
                                                  .filter((d) => d && d >= today)
                                                  .map(
                                                    (d) =>
                                                      calculatePriceForDate(d)?.price ||
                                                      Infinity
                                                  )
                                              ) &&
                                            !isSelected && (
                                              <span className="absolute top-1 left-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-md font-semibold shadow">
                                                Best
                                              </span>
                                            )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Legend */}
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 ring-2 ring-pink-500 rounded"></div>
                                        <span className="text-gray-700">Today</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded"></div>
                                        <span className="text-gray-700">Weekend</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-green-500 rounded"></div>
                                        <span className="text-gray-700 font-semibold">Best Price</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-pink-600 to-pink-700 rounded"></div>
                                        <span className="text-gray-700">Selected</span>
                                      </div>
                                    </div>

                                    {approximateCost && (
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="font-bold text-gray-800 mb-2 text-sm">
                                          💰 Pricing Factors:
                                        </p>
                                        <ul className="space-y-1.5 text-xs text-gray-600">
                                          <li className="flex items-start">
                                            <span className="text-green-600 mr-2">✓</span>
                                            <span><strong>Notice:</strong> Save 20% booking 1+ month ahead</span>
                                          </li>
                                          <li className="flex items-start">
                                            <span className="text-blue-600 mr-2">✓</span>
                                            <span><strong>Day:</strong> Weekdays 15% cheaper than Fri/Sat</span>
                                          </li>
                                          <li className="flex items-start">
                                            <span className="text-orange-600 mr-2">⚠</span>
                                            <span><strong>Urgency:</strong> +30% for moves within 3 days</span>
                                          </li>
                                        </ul>
                                      </div>
                                    )}
                                  </div>

                                  {/* Close Button */}
                                  <button
                                    onClick={() => setShowCalendar(false)}
                                    className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                                  >
                                    Close Calendar
                                  </button>
                                </div>
                              );
                            } catch (error) {
                              console.error("Calendar render error:", error);
                              return (
                                <div className="text-center py-8 text-red-500">
                                  Error loading calendar. Please refresh the page.
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Rest of the existing fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notice Period
                    </label>
                    <select
                      value={pricingForm.notice_period}
                      onChange={(e) =>
                        updatePricingForm("notice_period", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose notice period</option>
                      {NOTICE_PERIOD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Move Day
                    </label>
                    <select
                      value={pricingForm.move_day}
                      onChange={(e) =>
                        updatePricingForm("move_day", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose move day</option>
                      {MOVE_DAY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Time Preference
                    </label>
                    <select
                      value={pricingForm.collection_time}
                      onChange={(e) =>
                        updatePricingForm("collection_time", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose collection time</option>
                      {COLLECTION_TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              }
            />
          </div>

          {/* APPLY BUTTON */}
          <div className="px-6 pb-6 pt-4">
            <button
              onClick={applyFilters}
              disabled={isLoadingCosts}
              className={`w-full border-2 border-pink-500 rounded-full py-3.5 text-sm font-semibold transition ${
                isLoadingCosts
                  ? "bg-pink-100 text-pink-400 cursor-not-allowed"
                  : "text-pink-600 hover:bg-pink-600 hover:text-white hover:shadow-lg"
              }`}
            >
              {isLoadingCosts
                ? "Searching Companies..."
                : "Search Companies with Pricing"}
            </button>

            {apiError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-[11px] text-red-600 font-medium">
                  API Error:
                </p>
                <p className="text-[10px] text-red-500 mt-1">{apiError}</p>
                <p className="text-[10px] text-gray-600 mt-2">
                  Check browser console (F12) for detailed debugging information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: MAP WITH PROFESSIONAL CALL BUTTONS FOR UK CLIENTS */}
      <div className="lg:flex-1 w-full">
        <div className="sticky top-10 rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
          {/* HEADER WITH PROFESSIONAL UK STYLING */}
          <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Route className="h-6 w-6" />
              <div>
                <h3 className="font-semibold text-lg">Move Route & Pricing</h3>
                <p className="text-xs text-pink-200 opacity-90">
                  UK-Wide Moving Services
                </p>
            </div>
            </div>

            {/* PROFESSIONAL UK-STYLE CALL BUTTON */}
            <button
              onClick={() =>
                navigate("/book-call", {
                  state: {
                    dismantleItems,
                    reassembleItems,
                    itemQuantities,
                    pricingForm,
                    pickup,
                    dropoff,
                    pickupPincode,
                    dropoffPincode,
                    distanceMiles,
                    distanceKm,
                    totalVolume: calculateTotalVolume(),
                  },
                })
              }
              className="bg-white text-pink-600 hover:bg-pink-50 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap border border-pink-200 hover:border-pink-300 group"
            >
              <div className="relative">
                <Phone className="h-4 w-4 group-hover:animate-pulse" />
              </div>
              <span>Need Help ? Call Now</span>
            </button>
          </div>

          {/* Pickup → Dropoff */}
          <div className="px-4 py-3 text-sm bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-800">Collection</div>
                  <div className="text-xs text-gray-600">{pickupPincode}</div>
                </div>
              </div>
              <div className="text-pink-400 mx-2">
                <span className="text-lg">→</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-800">Delivery</div>
                  <div className="text-xs text-gray-600">{dropoffPincode}</div>
                </div>
              </div>
            </div>

            {/* Professional Distance Display */}
            {distanceMiles && distanceKm && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-pink-400 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Route Distance:
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-pink-600">
                      {distanceMiles} miles
                    </div>
                    <div className="text-xs text-gray-500">
                      ({distanceKm} km)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAP CONTAINER */}
          <div style={{ height: "520px" }} className="relative bg-gray-50">
            <iframe
              title="Route Map"
              srcDoc={generateCustomMap(
                pickupCoords,
                dropoffCoords,
                routeGeometry
              )}
              className="w-full h-full border-0"
            ></iframe>
          </div>

          {/* PROFESSIONAL UK SUPPORT FOOTTER */}
          <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-pink-50 to-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <svg
                    className="w-5 h-5 text-pink-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    Need Help With Your UK Move?
                  </h4>
                  <p className="text-xs text-gray-600">
                    Our UK-based team is here to help
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate("/book-call", {
                    state: {
                      dismantleItems,
                      reassembleItems,
                      itemQuantities,
                      pricingForm,
                      pickup,
                      dropoff,
                      pickupPincode,
                      dropoffPincode,
                      distanceMiles,
                      distanceKm,
                      totalVolume: calculateTotalVolume(),
                    },
                  })
                }
                className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap group"
              >
                <div className="relative">
                  <Phone className="h-4 w-4 group-hover:animate-bounce" />
                </div>
                <span>020 7123 4567</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --------------------------------------------------------------
//  ACCORDION SECTION - UNCHANGED
// --------------------------------------------------------------
const AccordionSection = ({
  title,
  open,
  onToggle,
  options,
  group,
  filters,
  toggleFilter,
  customContent,
}) => (
  <div className="border-b border-gray-100">
    <button
      className="w-full flex items-center justify-between px-6 py-3 font-semibold text-sm text-gray-800 hover:bg-pink-50 transition"
      onClick={onToggle}
      type="button"
    >
      <span>{title}</span>
      <ChevronDown
        className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`}
      />
    </button>

    {open && (
      <div className="text-sm text-gray-700">
        {customContent ? (
          customContent
        ) : (
          <div className="px-6 pb-4 space-y-2">
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
    )}
  </div>
);

export default RefineOptionsPage;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import { ChevronDown, Route, Phone, Wrench, Car, MapPin, Info, Package, Layers, Boxes, Truck, Home, Briefcase, Building2 } from "lucide-react";
// import CustomIconSelect from "../components/CustomIconSelect";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// // --------------------------------------------------------------
// //  LEAFLET MAP BUILDER (unchanged)
// // --------------------------------------------------------------
// const generateCustomMap = (pickupCoords, dropoffCoords, routeGeometry) => {
//   if (!pickupCoords && !dropoffCoords) {
//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//           <title>Move Route Map</title>
//           <meta charset="utf-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//           <style> body { margin: 0; padding: 0; } #map { height: 100%; width: 100%; } </style>
//       </head>
//       <body>
//           <div id="map"></div>
//           <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//           <script>
//               var map = L.map('map').setView([20.5937, 78.9629], 5);
//               L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                   attribution: '© OpenStreetMap contributors'
//               }).addTo(map);
//           </script>
//       </body>
//       </html>
//     `;
//   }

//   let centerLat, centerLon, zoom;
//   let markers = [];
//   let polyline = null;

//   if (pickupCoords && dropoffCoords) {
//     centerLat = (pickupCoords.lat + dropoffCoords.lat) / 2;
//     centerLon = (pickupCoords.lon + dropoffCoords.lon) / 2;
//     zoom = 10;

//     markers.push(
//       { lat: pickupCoords.lat, lon: pickupCoords.lon, text: "Pickup" },
//       { lat: dropoffCoords.lat, lon: dropoffCoords.lon, text: "Dropoff" }
//     );

//     polyline = routeGeometry
//       ? routeGeometry.coordinates.map(([lon, lat]) => [lat, lon])
//       : [
//           [pickupCoords.lat, pickupCoords.lon],
//           [dropoffCoords.lat, dropoffCoords.lon],
//         ];
//   } else if (pickupCoords) {
//     centerLat = pickupCoords.lat;
//     centerLon = pickupCoords.lon;
//     zoom = 12;
//     markers.push({
//       lat: pickupCoords.lat,
//       lon: pickupCoords.lon,
//       text: "Pickup",
//     });
//   } else {
//     centerLat = dropoffCoords.lat;
//     centerLon = dropoffCoords.lon;
//     zoom = 12;
//     markers.push({
//       lat: dropoffCoords.lat,
//       lon: dropoffCoords.lon,
//       text: "Dropoff",
//     });
//   }

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//         <style> body { margin: 0; padding: 0; } #map { height: 520px; width: 100%; } </style>
//     </head>
//     <body>
//         <div id="map"></div>
//         <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//         <script>
//             var map = L.map('map').setView([${centerLat}, ${centerLon}], ${zoom});
//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

//             ${markers
//               .map(
//                 (m) => `
//                 L.marker([${m.lat}, ${m.lon}])
//                   .addTo(map)
//                   .bindPopup('${m.text}');
//               `
//               )
//               .join("")}

//             ${
//               polyline
//                 ? `
//                 var pinkRoute = L.polyline(${JSON.stringify(polyline)}, {
//                   color: '#ec4899', weight: 6, opacity: 0.8, dashArray: '10, 10'
//                 }).addTo(map);

//                 map.fitBounds(pinkRoute.getBounds());
//               `
//                 : ""
//             }
//         </script>
//     </body>
//     </html>
//   `;
// };

// // Vehicle Icon Components (matching ComparePage)
// const SwbIcon = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚐</span>;
// const TruckIconEmoji = (props) => <span {...props} style={{ fontSize: '1.2rem', lineHeight: 1 }}>🚚</span>;

// // Icon mapping for property types
// const getPropertyTypeIcon = (type) => {
//   const typeMap = {
//     "House": { icon: Home, color: "text-green-600" },
//     "Flat": { icon: Building2, color: "text-blue-600" },
//     "Office": { icon: Briefcase, color: "text-purple-600" },
//     "Few Items": { icon: Package, color: "text-orange-600" },
//     "A Few Items": { icon: Package, color: "text-orange-600" }
//   };
//   return typeMap[type] || { icon: Home, color: "text-gray-600" };
// };

// // Icon mapping for property sizes
// const getPropertySizeIcon = (size) => {
//   // For vehicles (SWB Van, MWB Van, LWB Van)
//   if (size.toLowerCase().includes('van')) {
//     const vanMap = {
//       "swb van": { icon: SwbIcon, color: "text-blue-500" },
//       "mwb van": { icon: SwbIcon, color: "text-indigo-500" },
//       "lwb van": { icon: SwbIcon, color: "text-purple-500" }
//     };
//     return vanMap[size.toLowerCase()] || { icon: SwbIcon, color: "text-blue-500" };
//   }
//   // For bedrooms
//   if (size.toLowerCase().includes('bed')) {
//     return { icon: Home, color: "text-emerald-600" };
//   }
//   // For workstations
//   if (size.toLowerCase().includes('workstations')) {
//     return { icon: Briefcase, color: "text-indigo-600" };
//   }
//   return { icon: Building2, color: "text-gray-600" };
// };

// // Icon mapping for quantities
// const getQuantityIcon = (quantity) => {
//   const quantityMap = {
//     "some_things": { icon: Package, color: "text-amber-500" },
//     "some things": { icon: Package, color: "text-amber-500" },
//     "quarter van": { icon: Package, color: "text-amber-500" },
//     "half_contents": { icon: Layers, color: "text-orange-500" },
//     "half contents": { icon: Layers, color: "text-orange-500" },
//     "half the contents": { icon: Layers, color: "text-orange-500" },
//     "half van": { icon: Layers, color: "text-orange-500" },
//     "most_things": { icon: Boxes, color: "text-red-500" },
//     "most things": { icon: Boxes, color: "text-red-500" },
//     "3/4 most things": { icon: Boxes, color: "text-red-500" },
//     "3/4 van": { icon: Boxes, color: "text-red-500" },
//     "everything": { icon: Truck, color: "text-blue-600" },
//     "whole van": { icon: Truck, color: "text-blue-600" },
//     "quarter_van": { icon: Package, color: "text-amber-500" },
//     "half_van": { icon: Layers, color: "text-orange-500" },
//     "three_quarter_van": { icon: Boxes, color: "text-red-500" },
//     "whole_van": { icon: Truck, color: "text-blue-600" }
//   };
  
//   // Normalize the quantity string
//   const normalizedQuantity = quantity.toLowerCase().replace(/_/g, " ");
//   return quantityMap[normalizedQuantity] || { icon: Boxes, color: "text-gray-600" };
// };

// // --------------------------------------------------------------
// //  FULL INVENTORY (grouped by category)
// // --------------------------------------------------------------
// const INVENTORY_DATA = [
//   // Living Room Items
//   { category: "Living Room", item_name: 'TV up to 45"', average_volume: 0.1 },
//   { category: "Living Room", item_name: 'TV up to 75"', average_volume: 0.2 },
//   { category: "Living Room", item_name: "TV Stand", average_volume: 0.3 },
//   { category: "Living Room", item_name: "Desk Standard", average_volume: 0.5 },
//   { category: "Living Room", item_name: "Desk Large", average_volume: 0.75 },
//   { category: "Living Room", item_name: "Armchair", average_volume: 1.0 },
//   { category: "Living Room", item_name: "2 Seater Sofa", average_volume: 1.5 },
//   { category: "Living Room", item_name: "3 Seater Sofa", average_volume: 2.0 },
//   { category: "Living Room", item_name: "4 Seater Sofa", average_volume: 2.5 },
//   { category: "Living Room", item_name: "Corner Sofa", average_volume: 3.5 },
//   { category: "Living Room", item_name: "Cabinet Large", average_volume: 1.0 },
//   { category: "Living Room", item_name: "Bookcase Large", average_volume: 0.8 },
//   {
//     category: "Living Room",
//     item_name: "Grandfather Clock",
//     average_volume: 0.6,
//   },
//   {
//     category: "Living Room",
//     item_name: "Other Medium Item",
//     average_volume: 0.5,
//   },
//   {
//     category: "Living Room",
//     item_name: "Other Large Item",
//     average_volume: 1.0,
//   },
//   {
//     category: "Living Room",
//     item_name: "Dining Table 4 Seater",
//     average_volume: 1.0,
//   },
//   {
//     category: "Living Room",
//     item_name: "Dining Table 6 Seater",
//     average_volume: 1.5,
//   },
//   {
//     category: "Living Room",
//     item_name: "Dining Table 8 Seater",
//     average_volume: 2.0,
//   },
//   { category: "Living Room", item_name: "Dining Chair", average_volume: 0.15 },
//   {
//     category: "Living Room",
//     item_name: "Misc Chairs ",
//     average_volume: 0.25,
//   },
//   { category: "Living Room", item_name: "Sideboard ", average_volume: 1.2 },
//   { category: "Living Room", item_name: "Coffee Table", average_volume: 0.3 },
//   { category: "Living Room", item_name: "Cabinet Small", average_volume: 0.4 },
//   {
//     category: "Living Room",
//     item_name: "Bookcase Small ",
//     average_volume: 0.5,
//   },
//   {
//     category: "Living Room",
//     item_name: "Shelves Contents Only",
//     average_volume: 0.1,
//   },
//   {
//     category: "Living Room",
//     item_name: "Ornaments Fragile ",
//     average_volume: 0.1,
//   },
//   {
//     category: "Living Room",
//     item_name: "Plant Small ",
//     average_volume: 0.05,
//   },
//   { category: "Living Room", item_name: "Plant Tall ", average_volume: 0.15 },
//   { category: "Living Room", item_name: "Piano Upright", average_volume: 2.0 },

//   // Kitchen Items
//   {
//     category: "Kitchen",
//     item_name: "Fridge Under Counter",
//     average_volume: 0.4,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Fridge Freezer Upright",
//     average_volume: 0.7,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Fridge Freezer American",
//     average_volume: 1.2,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Freezer Under Counter",
//     average_volume: 0.4,
//   },
//   { category: "Kitchen", item_name: "Freezer Chest", average_volume: 0.8 },
//   { category: "Kitchen", item_name: "Washing Machine", average_volume: 0.6 },
//   { category: "Kitchen", item_name: "Tumble Dryer", average_volume: 0.6 },
//   { category: "Kitchen", item_name: "Cooker Standard", average_volume: 0.5 },
//   { category: "Kitchen", item_name: "Dishwasher", average_volume: 0.6 },
//   {
//     category: "Kitchen",
//     item_name: "Other Medium Item Kitchen",
//     average_volume: 0.5,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Other Large Item Kitchen",
//     average_volume: 1.0,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Kitchen Dining Table 4 Seater",
//     average_volume: 1.0,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Kitchen Dining Table 6 Seater",
//     average_volume: 1.5,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Kitchen Dining Table 8 Seater",
//     average_volume: 2.0,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Kitchen Dining Chair",
//     average_volume: 0.15,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Misc Chairs Kitchen",
//     average_volume: 0.25,
//   },
//   { category: "Kitchen", item_name: "Ornaments Kitchen", average_volume: 0.1 },
//   {
//     category: "Kitchen",
//     item_name: "Plant Small Kitchen",
//     average_volume: 0.05,
//   },
//   {
//     category: "Kitchen",
//     item_name: "Plant Tall Kitchen",
//     average_volume: 0.15,
//   },
//   { category: "Kitchen", item_name: "Kitchen Bin", average_volume: 0.1 },
//   {
//     category: "Kitchen",
//     item_name: "General Small Medium Kitchen",
//     average_volume: 0.2,
//   },

//   // Bathroom/Hallway Items
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Sideboard Bathroom",
//     average_volume: 1.2,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Other Medium Bathroom",
//     average_volume: 0.5,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Other Large Bathroom",
//     average_volume: 1.0,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Bookcase Large Bathroom",
//     average_volume: 0.8,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Exercise Bike Hallway",
//     average_volume: 0.8,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Piano Upright Hallway",
//     average_volume: 2.0,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Cross Trainer Hallway",
//     average_volume: 1.5,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Treadmill Hallway",
//     average_volume: 1.5,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Bookcase Small Bathroom",
//     average_volume: 0.5,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Ornaments Bathroom",
//     average_volume: 0.1,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Plant Small Bathroom",
//     average_volume: 0.05,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "Plant Tall Bathroom",
//     average_volume: 0.15,
//   },
//   {
//     category: "Other / Bathroom / Hallway",
//     item_name: "General Small Bathroom",
//     average_volume: 0.2,
//   },

//   // Garden/Garage Items
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Garden Table",
//     average_volume: 0.8,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Garden Storage Box",
//     average_volume: 1.0,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Other Medium Garden",
//     average_volume: 0.5,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Other Large Garden",
//     average_volume: 1.0,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Shelving Unit Large",
//     average_volume: 0.7,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Exercise Bike Garden",
//     average_volume: 0.8,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Cross Trainer Garden",
//     average_volume: 1.5,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Treadmill Garden",
//     average_volume: 1.5,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Lawnmower",
//     average_volume: 0.4,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Fridge Freezer Garden",
//     average_volume: 0.7,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Freezer Chest Garden",
//     average_volume: 0.8,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "BBQ Standard",
//     average_volume: 0.6,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Garden Tools Small",
//     average_volume: 0.1,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Garden Tools Large",
//     average_volume: 0.25,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Bookcase Small Garden",
//     average_volume: 0.5,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Garden Ornaments",
//     average_volume: 0.15,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Plant Small Garden",
//     average_volume: 0.05,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Plant Tall Garden",
//     average_volume: 0.15,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "General Small Garden",
//     average_volume: 0.2,
//   },
//   {
//     category: "Garden / Garage / Loft",
//     item_name: "Garden Shed Dismantled",
//     average_volume: 5.0,
//   },

//   // Bedroom Items
//   { category: "Bedroom", item_name: "Single Bed", average_volume: 1.0 },
//   { category: "Bedroom", item_name: "Double Bed", average_volume: 1.5 },
//   { category: "Bedroom", item_name: "KingSize Bed", average_volume: 2.0 },
//   { category: "Bedroom", item_name: "Mattress Single", average_volume: 0.6 },
//   { category: "Bedroom", item_name: "Mattress Double", average_volume: 0.8 },
//   { category: "Bedroom", item_name: "Mattress KingSize", average_volume: 1.0 },
//   { category: "Bedroom", item_name: "Cot", average_volume: 0.4 },
//   { category: "Bedroom", item_name: "Bunk Bed", average_volume: 2.5 },
//   { category: "Bedroom", item_name: "Bedside Table", average_volume: 0.3 },
//   { category: "Bedroom", item_name: "TV 45 Bedroom", average_volume: 0.1 },
//   { category: "Bedroom", item_name: "TV 75 Bedroom", average_volume: 0.2 },
//   {
//     category: "Bedroom",
//     item_name: "Misc Chairs Bedroom",
//     average_volume: 0.25,
//   },
//   {
//     category: "Bedroom",
//     item_name: "Desk Standard Bedroom",
//     average_volume: 0.5,
//   },
//   {
//     category: "Bedroom",
//     item_name: "Desk Large Bedroom",
//     average_volume: 0.75,
//   },
//   { category: "Bedroom", item_name: "Chest Of 4 Drawers", average_volume: 0.7 },
//   { category: "Bedroom", item_name: "Chest Of 6 Drawers", average_volume: 0.9 },
//   {
//     category: "Bedroom",
//     item_name: "Chest Drawers Double",
//     average_volume: 1.2,
//   },
//   { category: "Bedroom", item_name: "Wardrobe Single", average_volume: 1.0 },
//   { category: "Bedroom", item_name: "Wardrobe Double", average_volume: 1.5 },
//   { category: "Bedroom", item_name: "Wardrobe Triple", average_volume: 2.0 },
//   { category: "Bedroom", item_name: "Wardrobe Quad", average_volume: 2.5 },
//   { category: "Bedroom", item_name: "Sideboard Bedroom", average_volume: 1.2 },
//   {
//     category: "Bedroom",
//     item_name: "Other Medium Bedroom",
//     average_volume: 0.5,
//   },
//   {
//     category: "Bedroom",
//     item_name: "Other Large Bedroom",
//     average_volume: 1.0,
//   },
//   {
//     category: "Bedroom",
//     item_name: "Bookcase Large Bedroom",
//     average_volume: 0.8,
//   },
//   {
//     category: "Bedroom",
//     item_name: "Bookcase Small Bedroom",
//     average_volume: 0.5,
//   },
//   { category: "Bedroom", item_name: "Suitcases", average_volume: 0.2 },
//   { category: "Bedroom", item_name: "Ornaments Bedroom", average_volume: 0.1 },
//   { category: "Bedroom", item_name: "Other Bedroom", average_volume: 0.2 },
  
//   // Office Items - Desks & Tables
//   { category: "Office", item_name: "Standing Desk (adjustable)", average_volume: 1.18 },
//   { category: "Office", item_name: "Corner Desk (L-shape)", average_volume: 1.44 },
//   { category: "Office", item_name: "Reception Desk (small)", average_volume: 0.79 },
//   { category: "Office", item_name: "Reception Desk (large counter)", average_volume: 1.94 },
//   { category: "Office", item_name: "Coffee Table (round)", average_volume: 0.2 },
//   { category: "Office", item_name: "Side Table", average_volume: 0.12 },
//   { category: "Office", item_name: "Training Table (folding)", average_volume: 0.41 },
//   { category: "Office", item_name: "High Bar Table", average_volume: 0.4 },
  
//   // Office Items - Seating
//   { category: "Office", item_name: "Ergonomic Chair", average_volume: 0.59 },
//   { category: "Office", item_name: "Conference Chair (stackable)", average_volume: 0.23 },
//   { category: "Office", item_name: "Bar Stool", average_volume: 0.22 },
//   { category: "Office", item_name: "Reception Waiting Chair", average_volume: 0.41 },
//   { category: "Office", item_name: "Lounge Armchair", average_volume: 0.65 },
//   { category: "Office", item_name: "Bean Bag", average_volume: 0.34 },
  
//   // Office Items - Storage & Shelving
//   { category: "Office", item_name: "Metal Storage Locker", average_volume: 0.31 },
//   { category: "Office", item_name: "Large Metal Cabinet (2-door)", average_volume: 0.73 },
//   { category: "Office", item_name: "Mobile Pedestal (wheels)", average_volume: 0.12 },
//   { category: "Office", item_name: "Compact Rolling File Rack", average_volume: 0.61 },
//   { category: "Office", item_name: "Open Shelf Unit (wide)", average_volume: 0.84 },
//   { category: "Office", item_name: "Desk Hutch", average_volume: 0.3 },
//   { category: "Office", item_name: "Document Sorter (multi-level)", average_volume: 0.05 },
  
//   // Office Items - Electronics & IT Equipment
//   { category: "Office", item_name: "Laptop (boxed)", average_volume: 0.01 },
//   { category: "Office", item_name: "Dual Monitor Arm", average_volume: 0.04 },
//   { category: "Office", item_name: "UPS Battery Unit", average_volume: 0.03 },
//   { category: "Office", item_name: "Server (rack-mounted)", average_volume: 0.09 },
//   { category: "Office", item_name: "Desk Phone", average_volume: 0.005 },
//   { category: "Office", item_name: "Projector", average_volume: 0.0075 },
//   { category: "Office", item_name: "Projector Screen (rolled)", average_volume: 0.03 },
//   { category: "Office", item_name: "Router / Switch (boxed)", average_volume: 0.006 },
  
//   // Office Items - Décor & Boards
//   { category: "Office", item_name: "Large Whiteboard", average_volume: 0.108 },
//   { category: "Office", item_name: "Corkboard", average_volume: 0.054 },
//   { category: "Office", item_name: "Wall Clock", average_volume: 0.009 },
//   { category: "Office", item_name: "Artificial Plant (tall)", average_volume: 0.24 },
//   { category: "Office", item_name: "Plant (medium pot)", average_volume: 0.04 },
//   { category: "Office", item_name: "Coat Stand", average_volume: 0.45 },
//   { category: "Office", item_name: "Floor Lamp", average_volume: 0.14 },
  
//   // Office Items - Kitchen / Break Area
//   { category: "Office", item_name: "Fridge (under-counter)", average_volume: 0.26 },
//   { category: "Office", item_name: "Full-Size Fridge", average_volume: 0.88 },
//   { category: "Office", item_name: "Microwave", average_volume: 0.04 },
//   { category: "Office", item_name: "Kettle (boxed)", average_volume: 0.02 },
//   { category: "Office", item_name: "Water Cooler Dispenser", average_volume: 0.12 },
//   { category: "Office", item_name: "Dining Table", average_volume: 0.84 },
//   { category: "Office", item_name: "Dining Chair", average_volume: 0.18 },
  
//   // Office Items - Boxes & Crates
//   { category: "Office", item_name: "Small Moving Box (Books / Tools)", average_volume: 0.036 },
//   { category: "Office", item_name: "Medium Moving Box (General Use)", average_volume: 0.097 },
//   { category: "Office", item_name: "Large Moving Box (Bulky Items)", average_volume: 0.129 },
//   { category: "Office", item_name: "Extra-Large Moving Box", average_volume: 0.226 },
//   { category: "Office", item_name: "Archive Document Box (A4 Files)", average_volume: 0.032 },
//   { category: "Office", item_name: "Heavy-Duty Crate (Plastic, Stackable)", average_volume: 0.072 },
//   { category: "Office", item_name: "Industrial Crate (Large Plastic Tote)", average_volume: 0.14 },
//   { category: "Office", item_name: "IT Equipment Crate (Padded)", average_volume: 0.24 },
//   { category: "Office", item_name: "File Storage Crate (Long)", average_volume: 0.126 },
//   { category: "Office", item_name: "Wardrobe Box (with hanging rail)", average_volume: 0.33 },
//   { category: "Office", item_name: "Pallet Crate (Wooden)", average_volume: 1.2 },
//   { category: "Office", item_name: "Euro Pallet Box (Large Foldable)", average_volume: 0.96 },
//   { category: "Office", item_name: "Half-Size Pallet Box", average_volume: 0.288 },
  
//   // Office Items - Miscellaneous
//   { category: "Office", item_name: "Shredder (small)", average_volume: 0.04 },
//   { category: "Office", item_name: "Shredder (large)", average_volume: 0.18 },
//   { category: "Office", item_name: "Cardboard Archive Box", average_volume: 0.03 },
//   { category: "Office", item_name: "Coat Hanger Rail", average_volume: 0.75 },
//   { category: "Office", item_name: "Cleaning Cart", average_volume: 0.45 },
//   { category: "Office", item_name: "Vacuum Cleaner", average_volume: 0.14 },
//   { category: "Office", item_name: "Portable Partition Panel", average_volume: 0.135 },
//   { category: "Office", item_name: "Mobile Whiteboard (on wheels)", average_volume: 1.4 },
  
//   // Gym Items - Cardio Equipment
//   { category: "Gym", item_name: "Treadmill (commercial)", average_volume: 2.7 },
//   { category: "Gym", item_name: "Elliptical Trainer", average_volume: 2.86 },
//   { category: "Gym", item_name: "Spin Bike", average_volume: 0.94 },
//   { category: "Gym", item_name: "Upright Exercise Bike", average_volume: 0.72 },
//   { category: "Gym", item_name: "Rowing Machine", average_volume: 0.83 },
//   { category: "Gym", item_name: "Stair Climber / Step Machine", average_volume: 2.46 },
  
//   // Gym Items - Weight Machines
//   { category: "Gym", item_name: "Smith Machine", average_volume: 6.0 },
//   { category: "Gym", item_name: "Cable Crossover", average_volume: 0.7 },
//   { category: "Gym", item_name: "Lat Pulldown Machine", average_volume: 3.96 },
//   { category: "Gym", item_name: "Seated Row Machine", average_volume: 2.64 },
//   { category: "Gym", item_name: "Chest Press Machine", average_volume: 2.52 },
//   { category: "Gym", item_name: "Leg Press (45°)", average_volume: 3.28 },
//   { category: "Gym", item_name: "Leg Extension / Curl Combo", average_volume: 1.96 },
  
//   // Gym Items - Free Weights & Storage
//   { category: "Gym", item_name: "Dumbbell Rack (2-tier)", average_volume: 1.2 },
//   { category: "Gym", item_name: "Dumbbell Set (pair, average footprint)", average_volume: 0.025 },
//   { category: "Gym", item_name: "Barbell Rack", average_volume: 1.44 },
//   { category: "Gym", item_name: "Weight Plates (stacked, 100kg set)", average_volume: 0.11 },
//   { category: "Gym", item_name: "Incline Bench", average_volume: 1.01 },
//   { category: "Gym", item_name: "Flat Bench", average_volume: 0.32 },
//   { category: "Gym", item_name: "Adjustable Bench (folding)", average_volume: 0.39 },
//   { category: "Gym", item_name: "Power Rack / Squat Rack", average_volume: 0.5 },
  
//   // Gym Items - Accessories & Training Equipment
//   { category: "Gym", item_name: "Kettlebell (each, typical 12–20kg)", average_volume: 0.019 },
//   { category: "Gym", item_name: "Medicine Ball", average_volume: 0.043 },
//   { category: "Gym", item_name: "Plyometric Box (large)", average_volume: 0.34 },
//   { category: "Gym", item_name: "Punching Bag (standing)", average_volume: 0.65 },
//   { category: "Gym", item_name: "Punching Bag (hanging)", average_volume: 0.19 },
//   { category: "Gym", item_name: "Yoga Mat (rolled)", average_volume: 0.028 },
//   { category: "Gym", item_name: "Foam Roller", average_volume: 0.01 },
//   { category: "Gym", item_name: "Balance Ball / Swiss Ball", average_volume: 0.27 },
// ];

// // Build grouped structure for UI
// const INVENTORY_BY_CATEGORY = INVENTORY_DATA.reduce((acc, it) => {
//   if (!acc[it.category]) acc[it.category] = [];
//   acc[it.category].push(it);
//   return acc;
// }, {});

// // --------------------------------------------------------------
// //  Property Type Options
// // --------------------------------------------------------------
// const PROPERTY_TYPES = [
//   { value: "a_few_items", label: "A Few Items" },
//   { value: "flat", label: "Flat" },
//   { value: "house", label: "House" },
//   { value: "office", label: "Office" },
// ];

// // House Sizes
// const HOUSE_SIZES = [
//   { value: "2_bed", label: "2 Bedroom" },
//   { value: "3_bed", label: "3 Bedroom" },
//   { value: "4_bed", label: "4 Bedroom" },
//   { value: "5_bed", label: "5 Bedroom" },
//   { value: "6_bed", label: "6 Bedroom" },
// ];

// // Flat Sizes
// const FLAT_SIZES = [
//   { value: "studio", label: "Studio" },
//   { value: "1_bed", label: "1 Bedroom" },
//   { value: "2_bed", label: "2 Bedroom" },
//   { value: "3_bed", label: "3 Bedroom" },
//   { value: "4_bed", label: "4 Bedroom" },
// ];

// // Office Sizes
// const OFFICE_SIZES = [
//   { value: "2_workstations", label: "2 Workstations" },
//   { value: "4_workstations", label: "4 Workstations" },
//   { value: "8_workstations", label: "8 Workstations" },
//   { value: "15_workstations", label: "15 Workstations" },
//   { value: "25_workstations", label: "25 Workstations" },
// ];

// // Vehicle Sizes for A Few Items
// const VEHICLE_SIZES = [
//   { value: "swb_van", label: "Small Van (SWB)" },
//   { value: "mwb_van", label: "Medium Van (MWB)" },
//   { value: "lwb_van", label: "Large Van (LWB)" },
// ];

// // Additional Spaces
// const ADDITIONAL_SPACES = [
//   { value: "shed", label: "Shed" },
//   { value: "loft", label: "Loft" },
//   { value: "basement", label: "Basement" },
//   { value: "single_garage", label: "Single Garage" },
//   { value: "double_garage", label: "Double Garage" },
// ];

// // Quantity Options
// const QUANTITY_OPTIONS = [
//   { value: "some_things", label: "A Few Things" },
//   { value: "half_contents", label: "Half Contents" },
//   { value: "three_quarter", label: "Three Quarter" },
//   { value: "most_things", label: "Most Things" },
//   { value: "everything", label: "Everything" },
  
// ];

// // Parking Options
// const PARKING_OPTIONS = [
//   { value: "driveway", label: "Driveway", icon: Car, iconClass: "text-blue-500" },
//   { value: "roadside", label: "Roadside", icon: MapPin, iconClass: "text-orange-500" },
// ];

// // Parking Distance
// const PARKING_DISTANCE_OPTIONS = [
//   { value: "less_than_10m", label: "Less Than 10m" },
//   { value: "10_to_20m", label: "10–20m" },
//   { value: "20m_plus", label: "20m+" },
// ];

// // Parking Distance Descriptions
// const PARKING_DISTANCE_DESCRIPTIONS = {
//   less_than_10m: "The vehicle can park within 10 meters (approximately 33 feet) of the property entrance. This is the ideal scenario with minimal carrying distance.",
//   "10_to_20m": "The vehicle can park between 10 to 20 meters (approximately 33 to 66 feet) from the property entrance. Moderate carrying distance may increase loading time.",
//   "20m_plus": "The vehicle must park more than 20 meters (over 66 feet) away from the property entrance. Longer carrying distance may significantly increase loading time and cost.",
// };

// // Internal Access Options for Houses/Bungalows/Town Houses
// const INTERNAL_ACCESS_HOUSE_OPTIONS = [
//   { value: "ground_only", label: "Ground Floor Only" },
//   { value: "ground_first", label: "Ground & 1st Floor" },
//   { value: "ground_first_second", label: "Ground, 1st & 2nd Floor" },
// ];

// // Internal Access Options for Flats/Office/A Few Items
// const INTERNAL_ACCESS_FLAT_OPTIONS = [
 
//   { value: "ground_floor", label: "Ground Floor" },
//   { value: "first_floor", label: "1st Floor" },
//   { value: "second_floor", label: "2nd Floor" },
//   { value: "third_floor_plus", label: "3rd Floor+" },
 
// ];

// // Notice Period
// const NOTICE_PERIOD_OPTIONS = [
//   { value: "within_3_days", label: "Within 3 days" },
//   { value: "within_week", label: "Within 1 week" },
//   { value: "within_2_weeks", label: "Within 2 weeks" },
//   { value: "within_month", label: "Within 1 month" },
//   { value: "over_month", label: "Over 1 month" },
//   { value: "flexible", label: "Im Flexible (save up to 20%)" },
// ];

// // Move Day Options
// const MOVE_DAY_OPTIONS = [
//   { value: "sun_to_thurs", label: "Sun - Thurs (save 15%)" },
//   { value: "fri_sat", label: "Friday - Saturday" },
// ];

// // Collection Time Options
// const COLLECTION_TIME_OPTIONS = [
//   { value: "flexible", label: "Flexible" },
//   { value: "morning", label: "Morning" },
//   { value: "afternoon", label: "Afternoon" },
//   { value: "one_hour_window", label: "1-Hour Window" },
// ];

// // --------------------------------------------------------------
// //  HELPER FUNCTION TO SAVE TO LOCALSTORAGE
// // --------------------------------------------------------------
// const saveToLocalStorage = (key, data, deliveryPincode = "") => {
//   try {
//     // Add delivery pincode to the data before saving
//     const dataWithPincode = {
//       ...data,
//       deliveryPincode: deliveryPincode || data?.deliveryPincode || "",
//       pickupPincode: data?.search_parameters?.pincode || "",
//       timestamp: new Date().toISOString(),
//     };

//     localStorage.setItem(key, JSON.stringify(dataWithPincode, null, 2));
//     console.log(
//       `✅ Saved to localStorage: ${key} with delivery pincode: ${deliveryPincode}`
//     );
//   } catch (error) {
//     console.error(`❌ Failed to save to localStorage: ${key}`, error);
//   }
// };

// // --------------------------------------------------------------
// //  LOAD FROM LOCALSTORAGE HELPER
// // --------------------------------------------------------------
// const loadFromLocalStorage = (key, defaultValue = null) => {
//   try {
//     const item = localStorage.getItem(key);
//     return item ? JSON.parse(item) : defaultValue;
//   } catch (error) {
//     console.error(`❌ Failed to load from localStorage: ${key}`, error);
//     return defaultValue;
//   }
// };

// // --------------------------------------------------------------
// //  MAIN COMPONENT
// // --------------------------------------------------------------
// const RefineOptionsPage = () => {
//   const navigate = useNavigate();
//   const { state } = useLocation();

//   // Load all previously stored data from localStorage
//   const loadStoredData = () => {
//     const storedFormData = loadFromLocalStorage("move_formData", {});
//     const storedCompareFormData = loadFromLocalStorage("compare_formData", {});
//     const storedRefineData = loadFromLocalStorage("move_refineData", {});
//     const storedCompareData = loadFromLocalStorage("move_compareData", {});

//     // Debug log to see what data is being loaded
//     console.log("🔍 DEBUG - Loading stored data for RefineOptions:");
//     console.log("move_formData quantity:", storedFormData?.quantity);
//     console.log("compare_formData quantity:", storedCompareFormData?.quantity);
//     console.log(
//       "move_refineData quantity:",
//       storedRefineData?.pricingForm?.quantity
//     );
//     console.log("Location state quantity:", state?.quantity);

//     return {
//       storedFormData,
//       storedCompareFormData,
//       storedRefineData,
//       storedCompareData,
//     };
//   };

//   const {
//     storedFormData,
//     storedCompareFormData,
//     storedRefineData,
//     storedCompareData,
//   } = loadStoredData();

//   // Function to get quantity with proper priority
//   const getQuantityFromSources = () => {
//     // Priority order: location state > refine data > compare form data > form data > compare data search > default
//     const sources = [
//       { source: "location state", value: state?.quantity },
//       { source: "refine data", value: storedRefineData?.pricingForm?.quantity },
//       { source: "compare form data", value: storedCompareFormData?.quantity },
//       { source: "form data", value: storedFormData?.quantity },
//       {
//         source: "compare data search",
//         value: storedCompareData?.search_parameters?.quantity,
//       },
//       { source: "default", value: "everything" },
//     ];

//     for (const source of sources) {
//       if (source.value) {
//         console.log(`✅ Using quantity from ${source.source}: ${source.value}`);
//         return source.value;
//       }
//     }

//     return "everything";
//   };

//   // Function to get property type with proper priority
//   const getPropertyTypeFromSources = () => {
//     const sources = [
//       { source: "location state", value: state?.serviceType },
//       {
//         source: "refine data",
//         value: storedRefineData?.pricingForm?.property_type,
//       },
//       {
//         source: "compare form data",
//         value: storedCompareFormData?.serviceType,
//       },
//       { source: "form data", value: storedFormData?.serviceType },
//       {
//         source: "compare data search",
//         value: storedCompareData?.search_parameters?.property_type,
//       },
//       { source: "default", value: "house" },
//     ];

//     for (const source of sources) {
//       if (source.value) {
//         return source.value;
//       }
//     }

//     return "house";
//   };

//   // Function to get property size with proper priority - UPDATED
//   const getPropertySizeFromSources = () => {
//     // Priority order: location state > refine data > compare form data > form data > compare data search > default
//     const sources = [
//       { source: "location state", value: state?.propertySize },
//       {
//         source: "refine data",
//         value: storedRefineData?.pricingForm?.property_size || 
//                storedRefineData?.pricingForm?.house_size, // Try both
//       },
//       {
//         source: "compare form data",
//         value: storedCompareFormData?.propertySize,
//       },
//       { source: "form data", value: storedFormData?.propertySize },
//       {
//         source: "compare data search",
//         value: storedCompareData?.search_parameters?.property_size,
//       },
//     ];

//     for (const source of sources) {
//       if (source.value) {
//         console.log(`✅ Using property size from ${source.source}: ${source.value}`);
//         return source.value;
//       }
//     }

//     // Return default based on property type
//     const propertyType = getPropertyTypeFromSources();
//     switch (propertyType) {
//       case "flat":
//         return "studio";
//       case "office":
//         return "2_workstations";
//       case "a_few_items":
//         return "swb_van";
//       default:
//         return "3_bed";
//     }
//   };

//   // Function to get additional spaces with proper priority
//   const getAdditionalSpacesFromSources = () => {
//     const sources = [
//       { source: "location state", value: state?.additionalSpaces },
//       {
//         source: "refine data",
//         value: storedRefineData?.pricingForm?.additional_spaces,
//       },
//       {
//         source: "compare form data",
//         value: storedCompareFormData?.additionalSpaces,
//       },
//       { source: "form data", value: storedFormData?.additionalSpaces },
//       {
//         source: "compare data search",
//         value: storedCompareData?.search_parameters?.additional_spaces,
//       },
//       { source: "default", value: [] },
//     ];

//     for (const source of sources) {
//       if (
//         source.value &&
//         Array.isArray(source.value) &&
//         source.value.length > 0
//       ) {
//         return source.value;
//       }
//     }

//     return [];
//   };

//   // Merge all stored data (priority: state > refineData > compareFormData > formData)
//   const _mergedFormData = {
//     ...storedFormData,
//     ...storedCompareFormData,
//     ...(storedRefineData?.pricingForm || {}),
//     ...(storedCompareData?.search_parameters || {}),
//   };

//   // Get providers from state or localStorage
//   const providers = state?.providers || storedCompareData?.providers || [];
//   const providersCount = providers.length;

//   // Get coordinates from state or localStorage
//   const pickupCoords =
//     state?.pickupCoords || storedCompareData?.pickupCoords || null;
//   const dropoffCoords =
//     state?.dropoffCoords || storedCompareData?.dropoffCoords || null;
//   const routeGeometry =
//     state?.routeGeometry || storedCompareData?.routeGeometry || null;

//   // Get pincodes from state or localStorage
//   const pickupPincode =
//     state?.pickupPincode ||
//     storedCompareData?.pickupPincode ||
//     storedFormData?.pickupPincode ||
//     "";
//   const dropoffPincode =
//     state?.dropoffPincode ||
//     storedCompareData?.destinationPincode ||
//     storedFormData?.dropoffPincode ||
//     "";

//   // Get location names from state or localStorage
//   const pickup = state?.pickup || storedFormData?.pickup || "";
//   const dropoff = state?.dropoff || storedFormData?.dropoff || "";

//   // Get distances from state or localStorage
//   const distanceMiles =
//     state?.distanceMiles ||
//     storedFormData?.distanceMiles ||
//     storedCompareFormData?.distanceMiles ||
//     null;
//   const distanceKm =
//     state?.distanceKm ||
//     storedFormData?.distanceKm ||
//     storedCompareFormData?.distanceKm ||
//     null;

//   const [open, setOpen] = useState({
//     propertyDetailsSummary: false,
//     propertyDetails: false,
//     collectionDetails: false,
//     deliveryDetails: false,
//     moveDateDetails: false,
//   });

//   const [filters, setFilters] = useState({
//     items: [],
//   });

//   // IMPORTANT: Don't load itemQuantities and dismantleItems from localStorage
//   // Start with empty objects so items don't get pre-filled
//   // const storedItemQuantities = storedRefineData?.itemQuantities || {};
//   // const storedDismantleItems = storedRefineData?.dismantleItems || {};

//   // itemQuantities stores { "<item_name>": number } - START EMPTY
//   const [itemQuantities, setItemQuantities] = useState({});

//   // State for tracking which items need dismantling - START EMPTY
//   const [dismantleItems, setDismantleItems] = useState({});

//   // State for tracking which items need reassembly - START EMPTY
//   const [reassembleItems, setReassembleItems] = useState({});

//   const [isLoadingCosts, setIsLoadingCosts] = useState(false);
//   const [apiError, setApiError] = useState(null);

//   // Parking distance info tooltip states
//   const [showCollectionParkingInfo, setShowCollectionParkingInfo] = useState(false);
//   const [showDeliveryParkingInfo, setShowDeliveryParkingInfo] = useState(false);

//   // ========== REAL-TIME APPROXIMATE COST CALCULATION ==========
//   const [approximateCost, setApproximateCost] = useState(null);
//   const [isCalculatingCost, setIsCalculatingCost] = useState(false);
//   const [_showCostBreakdown, _setShowCostBreakdown] = useState(false);
//   const [_costBreakdown, setCostBreakdown] = useState(null);
//   const [selectedMoveDate, setSelectedMoveDate] = useState(null);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

//   // Pricing form state - ONLY keep property type, size, quantity, and additional spaces pre-filled
//   const [pricingForm, setPricingForm] = useState({
//     // Keep ONLY these 4 fields pre-filled from localStorage:
//     property_type: getPropertyTypeFromSources(),
//     house_size: getPropertySizeFromSources(),
//     additional_spaces: getAdditionalSpacesFromSources(),
//     quantity: getQuantityFromSources(),

//     // All other fields START EMPTY/with defaults
//     user_details: {
//       full_name: "",
//       email: "",
//       phone: "",
//     },

//     // Optional Extras - default values
//     include_packing: true,
//     packing_volume_m3: "",
//     include_dismantling: false,
//     dismantling_items: 0,
//     include_reassembly: false,
//     reassembly_items: 0,

//     // Collection Assessment - default values
//     collection_parking: "",
//     collection_parking_distance: "",
//     collection_internal_access: "",
//     collection_flat_internal_access: "",
//     // Collection attributes
//     collection_is_standard_house: false,
//     collection_is_bungalow: false,
//     collection_is_town_house: false,
//     collection_has_lift: false,
//     collection_stairs_only: false,

//     // Delivery Assessment - default values
//     delivery_property_type: "",
//     delivery_parking: "",
//     delivery_parking_distance: "",
//     delivery_internal_access: "",
//     delivery_flat_internal_access: "",
//     // Delivery attributes
//     delivery_is_standard_house: false,
//     delivery_is_bungalow: false,
//     delivery_is_town_house: false,
//     delivery_has_lift: false,
//     delivery_stairs_only: false,

//     // Move Date Data - default values
//     notice_period: "",
//     move_day: "",
//     collection_time: "",

//     // Address fields - empty
//     pickup_address: "",
//     pickup_city: "",
//     delivery_address: "",
//     delivery_city: "",
//   });

//   // Save all data to localStorage whenever it changes
//   useEffect(() => {
//     const refineData = {
//       pricingForm,
//       itemQuantities,
//       dismantleItems,
//       reassembleItems,
//       filters,
//       open,
//       pickupPincode,
//       dropoffPincode,
//       pickup,
//       dropoff,
//       distanceMiles,
//       distanceKm,
//       timestamp: new Date().toISOString(),
//     };

//     try {
//       localStorage.setItem("move_refineData", JSON.stringify(refineData));
//     } catch (error) {
//       console.error("Error saving refine data to localStorage:", error);
//     }
//   }, [
//     pricingForm,
//     itemQuantities,
//     dismantleItems,
//     reassembleItems,
//     filters,
//     open,
//     pickupPincode,
//     dropoffPincode,
//     pickup,
//     dropoff,
//     distanceMiles,
//     distanceKm,
//   ]);

//   // Real-time cost calculation effect
//   useEffect(() => {
//     const calculateApproximateCost = async () => {
//       if (
//         !pickupPincode ||
//         !pricingForm.property_type ||
//         !pricingForm.house_size
//       ) {
//         setApproximateCost(null);
//         return;
//       }

//       setIsCalculatingCost(true);

//       try {
//         const totalVolume = calculateTotalVolume();
//         const dismantlingVolume = calculateDismantlingVolume();
//         const reassemblyVolume = calculateReassemblyVolume();
//         const _sizeField = getPropertySizeField();

//         const pricingPayload = {
//           pincode: pickupPincode,
//           property_type: pricingForm.property_type,
//           ...(sizeField && { property_size: pricingForm[sizeField] }),
//           quantity: pricingForm.quantity,
//           additional_spaces: pricingForm.additional_spaces,
//           selected_items: itemQuantities,
//           dismantle_items: dismantleItems,
//           reassemble_items: reassembleItems,
//           distance_miles: distanceMiles,

//           // ADD THESE FOR COMPLETE PRICING:
//           selected_move_date: selectedMoveDate
//             ? selectedMoveDate.toISOString().split("T")[0]
//             : null,
//           move_day: pricingForm.move_day,
//           notice_period: pricingForm.notice_period,
//           collection_time: pricingForm.collection_time,

//           include_packing: pricingForm.include_packing,
//           packing_volume_m3: pricingForm.include_packing ? totalVolume : null,
//           include_dismantling: pricingForm.include_dismantling,
//           dismantling_volume_m3: pricingForm.include_dismantling
//             ? dismantlingVolume
//             : null,
//           include_reassembly: pricingForm.include_reassembly,
//           reassembly_volume_m3: pricingForm.include_reassembly
//             ? reassemblyVolume
//             : null,

//           collection_parking_distance: pricingForm.collection_parking_distance,
//           delivery_parking_distance: pricingForm.delivery_parking_distance,

//           collection_internal_access: [
//             "flat",
//             "office",
//             "a_few_items",
//           ].includes(pricingForm.property_type)
//             ? pricingForm.collection_flat_internal_access
//             : pricingForm.collection_internal_access,

//           delivery_internal_access: ["flat", "office", "a_few_items"].includes(
//             pricingForm.property_type
//           )
//             ? pricingForm.delivery_flat_internal_access
//             : pricingForm.delivery_internal_access,
//         };

//         const response = await axios.post(
//           "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_with_cost",
//           pricingPayload,
//           { headers: { "Content-Type": "application/json" }, timeout: 30000 }
//         );

//         const apiResponse = response?.data?.message;

//         if (apiResponse?.success && apiResponse.data?.length > 0) {
//           const prices = apiResponse.data
//             .map((c) => c.exact_pricing?.final_total || 0)
//             .filter((p) => p > 0);

//           if (prices.length > 0) {
//             const minPrice = Math.min(...prices);
//             const maxPrice = Math.max(...prices);
//             const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

//             setApproximateCost({
//               min: minPrice,
//               max: maxPrice,
//               avg: avgPrice,
//               count: apiResponse.count,
//               currency: "£",
//             });

//             const cheapestProvider = apiResponse.data.find(
//               (c) => c.exact_pricing?.final_total === minPrice
//             );

//             if (cheapestProvider?.exact_pricing) {
//               setCostBreakdown({
//                 loading: cheapestProvider.exact_pricing.loading_cost || 0,
//                 mileage: cheapestProvider.exact_pricing.mileage_cost || 0,
//                 packing: cheapestProvider.exact_pricing.packing_cost || 0,
//                 dismantling:
//                   cheapestProvider.exact_pricing.dismantling_cost || 0,
//                 reassembly: cheapestProvider.exact_pricing.reassembly_cost || 0,
//                 parking: cheapestProvider.exact_pricing.parking_cost || 0,
//                 access: cheapestProvider.exact_pricing.access_cost || 0,
//                 dateAdjustment:
//                   cheapestProvider.exact_pricing.date_adjustment || 0,
//                 timeAdjustment:
//                   cheapestProvider.exact_pricing.time_adjustment || 0,
//                 noticeAdjustment:
//                   cheapestProvider.exact_pricing.notice_adjustment || 0,
//                 total: cheapestProvider.exact_pricing.final_total || 0,
//               });
//             }
//           }
//         } else {
//           setApproximateCost(null);
//           setCostBreakdown(null);
//         }
//       } catch (err) {
//         console.log("Cost calculation failed (silent):", err.message);
//         setApproximateCost(null);
//       } finally {
//         setIsCalculatingCost(false);
//       }
//     };

//     const timer = setTimeout(() => {
//       calculateApproximateCost();
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [
//     pickupPincode,
//     pricingForm.property_type,
//     pricingForm.house_size,
//     pricingForm.quantity,
//     pricingForm.additional_spaces,
//     pricingForm.notice_period,
//     pricingForm.move_day,
//     pricingForm.collection_time,
//     pricingForm.collection_parking_distance,
//     pricingForm.delivery_parking_distance,
//     pricingForm.collection_internal_access,
//     pricingForm.collection_flat_internal_access,
//     pricingForm.delivery_internal_access,
//     pricingForm.delivery_flat_internal_access,
//     selectedMoveDate, // ADD THIS
//     itemQuantities,
//     dismantleItems,
//     reassembleItems,
//     pricingForm.include_packing,
//     pricingForm.include_dismantling,
//     pricingForm.include_reassembly,
//     distanceMiles,
//   ]);

//   // Calendar helper functions
//   const _getDaysInMonth = (year, month) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const _getFirstDayOfMonth = (year, month) => {
//     return new Date(year, month, 1).getDay();
//   };

//   const generateCalendar = () => {
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth();

//     const months = [];

//     // Generate 6 months starting from current month
//     for (let i = 0; i < 6; i++) {
//       const monthDate = new Date(currentYear, currentMonth + i, 1);
//       const year = monthDate.getFullYear();
//       const month = monthDate.getMonth();

//       const daysInMonth = new Date(year, month + 1, 0).getDate();
//       const firstDay = new Date(year, month, 1).getDay();

//       const days = [];

//       // Add empty cells for days before month starts
//       for (let j = 0; j < firstDay; j++) {
//         days.push(null);
//       }

//       // Add all days of the month
//       for (let day = 1; day <= daysInMonth; day++) {
//         days.push(new Date(year, month, day));
//       }

//       months.push({
//         days,
//         monthName: monthDate.toLocaleString("default", { month: "long" }),
//         year: year,
//         monthIndex: month,
//       });
//     }

//     return months;
//   };

//   const handleDateSelect = (date) => {
//     if (date) {
//       const priceInfo = calculatePriceForDate(date);

//       setSelectedMoveDate(date);
//       setShowCalendar(false);

//       // Update pricing form
//       const dayOfWeek = date.getDay();
//       const isFridayOrSaturday = dayOfWeek === 5 || dayOfWeek === 6;
//       updatePricingForm(
//         "move_day",
//         isFridayOrSaturday ? "fri_sat" : "sun_to_thurs"
//       );

//       // Update notice period based on days until move
//       if (priceInfo) {
//         const days = priceInfo.daysUntilMove;
//         let noticePeriod = "within_month";

//         if (days <= 3) noticePeriod = "within_3_days";
//         else if (days <= 7) noticePeriod = "within_week";
//         else if (days <= 14) noticePeriod = "within_2_weeks";
//         else if (days <= 30) noticePeriod = "within_month";
//         else noticePeriod = "over_month";

//         updatePricingForm("notice_period", noticePeriod);

//         // Show price confirmation (optional toast/alert)
//         console.log(
//           `Selected date price: £${priceInfo.price} (${priceInfo.multiplier}x base)`
//         );
//       }
//     }
//   };

//   const _isDateDisabled = (date) => {
//     if (!date) return true;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return date < today;
//   };

//   const toggleSection = (key) => {
//     setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const updatePricingForm = (field, value) => {
//     setPricingForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const toggleAdditionalSpace = (space) => {
//     setPricingForm((prev) => ({
//       ...prev,
//       additional_spaces: prev.additional_spaces.includes(space)
//         ? prev.additional_spaces.filter((s) => s !== space)
//         : [...prev.additional_spaces, space],
//     }));
//   };

//   // Toggle dismantle status for an item
//   const toggleDismantleItem = (itemName) => {
//     setDismantleItems((prev) => {
//       const newState = {
//         ...prev,
//         [itemName]: !prev[itemName],
//       };

//       // Count how many items are marked for dismantling
//       const dismantleCount = Object.values(newState).filter((v) => v).length;

//       // Update the dismantling service toggle and count
//       setPricingForm((prevForm) => ({
//         ...prevForm,
//         include_dismantling: dismantleCount > 0,
//         dismantling_items: dismantleCount,
//       }));

//       // If dismantling is unchecked, also uncheck reassembly for the same item
//       if (!newState[itemName] && reassembleItems[itemName]) {
//         setReassembleItems((prev) => {
//           const newReassemble = { ...prev };
//           delete newReassemble[itemName];

//           // Update reassembly count
//           const reassembleCount = Object.values(newReassemble).filter(
//             (v) => v
//           ).length;
//           setPricingForm((prevForm) => ({
//             ...prevForm,
//             include_reassembly: reassembleCount > 0,
//             reassembly_items: reassembleCount,
//           }));

//           return newReassemble;
//         });
//       }

//       return newState;
//     });
//   };

//   // Toggle reassembly status for an item
//   const toggleReassembleItem = (itemName) => {
//     setReassembleItems((prev) => {
//       const newState = {
//         ...prev,
//         [itemName]: !prev[itemName],
//       };

//       // Count how many items are marked for reassembly
//       const reassembleCount = Object.values(newState).filter((v) => v).length;

//       // Update the reassembly service toggle and count
//       setPricingForm((prevForm) => ({
//         ...prevForm,
//         include_reassembly: reassembleCount > 0,
//         reassembly_items: reassembleCount,
//       }));

//       // If reassembly is checked, automatically check dismantling for the same item
//       if (newState[itemName] && !dismantleItems[itemName]) {
//         setDismantleItems((prev) => {
//           const newDismantle = { ...prev, [itemName]: true };

//           // Update dismantling count
//           const dismantleCount = Object.values(newDismantle).filter(
//             (v) => v
//           ).length;
//           setPricingForm((prevForm) => ({
//             ...prevForm,
//             include_dismantling: dismantleCount > 0,
//             dismantling_items: dismantleCount,
//           }));

//           return newDismantle;
//         });
//       }

//       return newState;
//     });
//   };

//   // updateItemQuantity now works with category items and keeps UI state
//   const updateItemQuantity = (key, newQtyRaw) => {
//     const parsed = Number(newQtyRaw);
//     const newQty = isNaN(parsed) ? 0 : Math.max(0, parsed);

//     setItemQuantities((prev) => {
//       const updated = { ...prev };
//       if (newQty <= 0) {
//         delete updated[key];
//         // Also remove from dismantle and reassemble items if quantity is 0
//         if (dismantleItems[key]) {
//           const newDismantle = { ...dismantleItems };
//           delete newDismantle[key];
//           setDismantleItems(newDismantle);
//         }
//         if (reassembleItems[key]) {
//           const newReassemble = { ...reassembleItems };
//           delete newReassemble[key];
//           setReassembleItems(newReassemble);
//         }
//       } else {
//         updated[key] = newQty;
//       }
//       return updated;
//     });

//     setFilters((prev) => {
//       const exists = prev.items.includes(key);
//       if (newQty > 0 && !exists)
//         return { ...prev, items: [...prev.items, key] };
//       if (newQty <= 0 && exists)
//         return { ...prev, items: prev.items.filter((i) => i !== key) };
//       return prev;
//     });
//   };

//   const resetAll = () => {
//     setFilters({
//       items: [],
//     });
//     setItemQuantities({});
//     setDismantleItems({});
//     setReassembleItems({});
//     setPricingForm({
//       property_type: "house",
//       house_size: "3_bed",
//       additional_spaces: [],
//       quantity: "everything",
//       include_dismantling: false,
//       dismantling_items: 0,
//       include_reassembly: false,
//       reassembly_items: 0,
//       include_packing: true,
//       packing_volume_m3: "",
//       collection_parking: "",
//       collection_parking_distance: "",
//       collection_internal_access: "",
//       collection_flat_internal_access: "",
//       delivery_parking: "",
//       delivery_parking_distance: "",
//       delivery_internal_access: "",
//       delivery_flat_internal_access: "",
//       notice_period: "",
//       move_day: "",
//       collection_time: "",
//       pickup_address: "",
//       pickup_city: "",
//       delivery_address: "",
//       delivery_city: "",
//       user_details: {
//         full_name: "",
//         email: "",
//         phone: "",
//       },
//     });
//     setApiError(null);

//     // Also clear refine data from localStorage
//     localStorage.removeItem("move_refineData");
//   };

//   // Calculate total volume from items (uses INVENTORY_DATA map)
//   const itemVolumeMap = React.useMemo(() => {
//     const map = {};
//     INVENTORY_DATA.forEach((i) => {
//       map[i.item_name] = i.average_volume;
//     });
//     return map;
//   }, []);

//   const calculateTotalVolume = () => {
//     let total = 0;
//     Object.entries(itemQuantities).forEach(([itemName, quantity]) => {
//       const vol = itemVolumeMap[itemName] || 0;
//       total += vol * quantity;
//     });
//     return parseFloat(total.toFixed(2));
//   };

//   // Calculate dismantling volume (total volume of items marked for dismantling)
//   const calculateDismantlingVolume = () => {
//     let total = 0;
//     Object.entries(dismantleItems).forEach(([itemName, needsDismantle]) => {
//       if (needsDismantle) {
//         const vol = itemVolumeMap[itemName] || 0;
//         const quantity = itemQuantities[itemName] || 0;
//         if (quantity > 0) {
//           total += vol * quantity;
//         }
//       }
//     });
//     return parseFloat(total.toFixed(2));
//   };

//   // Calculate reassembly volume (total volume of items marked for reassembly)
//   const calculateReassemblyVolume = () => {
//     let total = 0;
//     Object.entries(reassembleItems).forEach(([itemName, needsReassemble]) => {
//       if (needsReassemble) {
//         const vol = itemVolumeMap[itemName] || 0;
//         const quantity = itemQuantities[itemName] || 0;
//         if (quantity > 0) {
//           total += vol * quantity;
//         }
//       }
//     });
//     return parseFloat(total.toFixed(2));
//   };

//   // Get the correct property size field based on property type
//   const getPropertySizeField = () => {
//     switch (pricingForm.property_type) {
//       case "flat":
//         return "flat_size";
//       case "office":
//         return "office_size";
//       case "bungalow":
//         return "bungalow_size";
//       case "town_house":
//         return "town_house_size";
//       case "a_few_items":
//         return null;
//       default:
//         return "house_size";
//     }
//   };

//   // Helper functions to map to new API structure
//   function getCollectionHouseType() {
//     if (["house", "bungalow", "town_house"].includes(pricingForm.property_type)) {
//       if (pricingForm.collection_is_bungalow) {
//         return "bungalow_ground";
//       } else if (pricingForm.collection_is_town_house) {
//         return "townhouse_ground_1st_2nd";
//       } else if (pricingForm.collection_is_standard_house) {
//         const access = pricingForm.collection_internal_access;
//         if (access === "ground_only") return "house_ground_only";
//         if (access === "ground_first") return "house_ground_and_1st";
//         if (access === "ground_first_second") return "house_ground_1st_2nd";
//       }
//     }
//     return null;
//   }
  
//   function getCollectionFlatAccess() {
//     if (["flat", "office", "a_few_items"].includes(pricingForm.property_type)) {
//       if (pricingForm.collection_stairs_only) return "stairs_only";
//       if (pricingForm.collection_has_lift) return "lift_access";
//     }
//     return null;
//   }
  
//   function getCollectionFloorLevel() {
//     if (["flat", "office", "a_few_items"].includes(pricingForm.property_type)) {
//       const access = pricingForm.collection_flat_internal_access;
//       if (access === "ground_floor") return "ground_floor";
//       if (access === "first_floor") return "1st_floor";
//       if (access === "second_floor") return "2nd_floor";
//       if (access === "third_floor_plus") return "3rd_floor_plus";
//     }
//     return null;
//   }
  
//   function getDeliveryHouseType() {
//     if (["house", "bungalow", "town_house"].includes(pricingForm.delivery_property_type)) {
//       if (pricingForm.delivery_is_bungalow) {
//         return "bungalow_ground";
//       } else if (pricingForm.delivery_is_town_house) {
//         return "townhouse_ground_1st_2nd";
//       } else if (pricingForm.delivery_is_standard_house) {
//         const access = pricingForm.delivery_internal_access;
//         if (access === "ground_only") return "house_ground_only";
//         if (access === "ground_first") return "house_ground_and_1st";
//         if (access === "ground_first_second") return "house_ground_1st_2nd";
//       }
//     }
//     return null;
//   }
  
//   function getDeliveryFlatAccess() {
//     if (["flat", "office", "a_few_items"].includes(pricingForm.delivery_property_type)) {
//       if (pricingForm.delivery_stairs_only) return "stairs_only";
//       if (pricingForm.delivery_has_lift) return "lift_access";
//     }
//     return null;
//   }
  
//   function getDeliveryFloorLevel() {
//     if (["flat", "office", "a_few_items"].includes(pricingForm.delivery_property_type)) {
//       const access = pricingForm.delivery_flat_internal_access;
//       if (access === "ground_floor") return "ground_floor";
//       if (access === "first_floor") return "1st_floor";
//       if (access === "second_floor") return "2nd_floor";
//       if (access === "third_floor_plus") return "3rd_floor_plus";
//     }
//     return null;
//   }

//   // Send pricing request to backend
//   const applyFilters = async () => {
//     setIsLoadingCosts(true);
//     setApiError(null);

//     // Calculate volumes
//     const totalVolume = calculateTotalVolume();
//     const dismantlingVolume = calculateDismantlingVolume();
//     const reassemblyVolume = calculateReassemblyVolume();

//     // Get the correct size field
//     const _sizeField = getPropertySizeField();

//     // IMPORTANT: Use packing volume from form or default to total volume if packing is enabled
//     let packingVolume = "";

//     if (pricingForm.include_packing) {
//       packingVolume = pricingForm.packing_volume_m3
//         ? pricingForm.packing_volume_m3
//         : totalVolume; // Auto-calc only if user didn't type it
//     }

//     // ========== NEW API PAYLOAD STRUCTURE ==========
//     const pricingPayload = {
//       // ========== BASIC SEARCH ==========
//       pincode: pickupPincode || "",
//       distance_miles: distanceMiles || null,
      
//       // ========== ADDRESS DETAILS (Optional) ==========
//       pickup_address: pricingForm.pickup_address || "",
//       pickup_city: pricingForm.pickup_city || "",
//       delivery_address: pricingForm.delivery_address || "",
//       delivery_city: pricingForm.delivery_city || "",
      
//       // ========== PROPERTY INFORMATION ==========
//       property_type: pricingForm.property_type || "",
//       property_size: pricingForm.house_size || "", // Using house_size field for all property types
//       quantity: pricingForm.quantity || "",
      
//       // For houses only:
//       additional_spaces: pricingForm.additional_spaces || [],
      
//       // ========== ITEMS INVENTORY (Optional, alternative to property_type) ==========
//       selected_items: itemQuantities || {},
//       dismantle_items: dismantleItems || {},
      
//       // ========== OPTIONAL EXTRAS ==========
//       include_packing: pricingForm.include_packing || false,
//       include_dismantling: pricingForm.include_dismantling || false,
//       include_reassembly: pricingForm.include_reassembly || false,
      
//       // ========== COLLECTION PROPERTY ASSESSMENT ==========
//       collection_parking: pricingForm.collection_parking || "",
//       collection_parking_distance: pricingForm.collection_parking_distance || "",
      
//       // Determine collection house type based on checkboxes and internal access
//       ...(getCollectionHouseType() && { collection_house_type: getCollectionHouseType() }),
      
//       // For FLATS/OFFICES/A_FEW_ITEMS:
//       ...(getCollectionFlatAccess() && { collection_internal_access: getCollectionFlatAccess() }),
//       ...(getCollectionFloorLevel() && { collection_floor_level: getCollectionFloorLevel() }),
      
//       // ========== DELIVERY PROPERTY ASSESSMENT ==========
//       delivery_parking: pricingForm.delivery_parking || "",
//       delivery_parking_distance: pricingForm.delivery_parking_distance || "",
      
//       // Determine delivery house type based on checkboxes and internal access
//       ...(getDeliveryHouseType() && { delivery_house_type: getDeliveryHouseType() }),
      
//       // For FLATS/OFFICES/A_FEW_ITEMS:
//       ...(getDeliveryFlatAccess() && { delivery_internal_access: getDeliveryFlatAccess() }),
//       ...(getDeliveryFloorLevel() && { delivery_floor_level: getDeliveryFloorLevel() }),
      
//       // ========== MOVE DATE FACTORS ==========
//       notice_period: pricingForm.notice_period || "",
//       move_day: pricingForm.move_day || "",
//       collection_time: pricingForm.collection_time || "",
      
//       // ========== EMAIL NOTIFICATION ==========
//       send_email: false,
//       user_email: pricingForm.user_details.email || "",
//     };

//     console.log("=== DEBUG: SENDING TO API ===");
//     console.log("Full payload:", JSON.stringify(pricingPayload, null, 2));
//     console.log("Delivery Pincode to save:", dropoffPincode);
//     console.log("Quantity being sent:", pricingForm.quantity);

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/method/localmoves.api.company.search_companies_with_cost",
//         pricingPayload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           timeout: 30000,
//         }
//       );

//       console.log("=== DEBUG: API RESPONSE ===");
//       console.log("Response status:", response.status);

//       const apiResponse = response?.data?.message;

//       if (apiResponse?.success) {
//         console.log("Companies found:", apiResponse.count);

//         // ⭐ SAVE THE EXACT API RESPONSE TO LOCALSTORAGE WITH DELIVERY PINCODE
//         // Pass delivery pincode as third parameter
//         saveToLocalStorage(
//           "BookServiceResponse",
//           response.data.message,
//           dropoffPincode
//         );

//         // ⭐ AUTO-FETCH USER DETAILS WITHOUT UI
//         let userDetails = {
//           full_name: "",
//           email: "",
//           phone: "",
//         };

//         try {
//           const userRes = await axios.get(
//             "http://127.0.0.1:8000/api/method/localmoves.api.user.get_user_details"
//           );

//           if (userRes.data?.message) {
//             userDetails = {
//               full_name: userRes.data.message.full_name,
//               email: userRes.data.message.email,
//               phone: userRes.data.message.phone,
//             };
//           }
//         } catch (err) {
//           console.log("User details fetch failed", err);
//         }

//         // Navigate to filtered providers with the new API data
//         navigate("/filtered-providers", {
//           state: {
//             ...state,
//             refineFilters: filters,
//             itemQuantities,
//             dismantleItems,
//             reassembleItems,

//             user_details: userDetails,

//             providers: apiResponse.data || [],

//             pricingResult: {
//               success: true,
//               count: apiResponse.count,
//               total_companies: apiResponse.total_companies,
//               filtered_out: apiResponse.filtered_out,
//               pricing_note: apiResponse.pricing_note,
//               search_parameters: apiResponse.search_parameters,
//             },

//             pricingForm,
//             pricingPayload,

//             pickup,
//             dropoff,
//             pickupPincode,
//             dropoffPincode,

//             pickupCoords,
//             dropoffCoords,
//             routeGeometry,

//             distanceMiles,
//             distanceKm,
//             totalVolume,
//             dismantlingVolume,
//             reassemblyVolume,
//             packingVolume,

//             companiesWithPricing:
//               apiResponse.data?.map((company) => ({
//                 company_name: company.company_name || company.name,
//                 phone: company.phone,
//                 description: company.description,
//                 services_offered: company.services_offered,
//                 includes: company.includes,
//                 protection: company.protection,
//                 material: company.material,
//                 furniture: company.furniture,
//                 appliances: company.appliances,
//                 areas_covered: company.areas_covered,
//                 average_rating: company.average_rating,
//                 total_ratings: company.total_ratings,
//                 exact_pricing: company.exact_pricing,
//                 pricing_rates: company.pricing_rates,
//                 subscription_info: company.subscription_info,
//                 total_carrying_capacity: company.total_carrying_capacity,
//                 company_gallery: company.company_gallery,
//                 original_company_object: company,
//               })) || [],
//           },
//         });
//       } else {
//         console.error("API returned unsuccessful:", apiResponse);

//         // ⭐ SAVE ERROR RESPONSE TO LOCALSTORAGE WITH DELIVERY PINCODE
//         saveToLocalStorage(
//           "BookServiceResponse",
//           response.data.message || {
//             success: false,
//             error: "API returned unsuccessful",
//           },
//           dropoffPincode
//         );

//         setApiError(
//           typeof apiResponse?.message === "string"
//             ? apiResponse.message
//             : JSON.stringify(
//                 apiResponse?.message || "Search and pricing calculation failed"
//               )
//         );
//       }
//     } catch (err) {
//       console.error("=== DEBUG: API ERROR ===");
//       console.error("Error:", err);
//       console.error("Error response:", err.response?.data);

//       // Try to extract error message from response
//       let errorMessage =
//         "Failed to search companies with pricing. Please check your network connection.";
//       if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.response?.data?.exception) {
//         errorMessage = err.response.data.exception;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       // ⭐ SAVE ERROR TO LOCALSTORAGE WITH DELIVERY PINCODE
//       saveToLocalStorage(
//         "BookServiceResponse",
//         {
//           success: false,
//           error: errorMessage,
//           timestamp: new Date().toISOString(),
//         },
//         dropoffPincode
//       );

//       setApiError(errorMessage);
//     } finally {
//       setIsLoadingCosts(false);
//     }
//   };

//   // Get size options based on property type - UPDATED
//   const getSizeOptions = () => {
//     switch (pricingForm.property_type) {
//       case "flat":
//         return FLAT_SIZES;
//       case "office":
//         return OFFICE_SIZES;
//       case "a_few_items":
//         return VEHICLE_SIZES; // Add this line
//       case "bungalow":
//       case "town_house":
//         return HOUSE_SIZES.slice(0, 3);
//       default:
//         return HOUSE_SIZES;
//     }
//   };

//   // Get internal access options based on property type and checkbox selections
//   const getInternalAccessOptions = (isCollection = true) => {
//     const propertyType = isCollection ? pricingForm.property_type : pricingForm.delivery_property_type;
//     const field = isCollection
//       ? "collection_internal_access"
//       : "delivery_internal_access";
//     const flatField = isCollection
//       ? "collection_flat_internal_access"
//       : "delivery_flat_internal_access";

//     if (["flat", "office", "a_few_items"].includes(propertyType)) {
//       return {
//         options: INTERNAL_ACCESS_FLAT_OPTIONS,
//         value: pricingForm[flatField] || "",
//         onChange: (value) => updatePricingForm(flatField, value),
//       };
//     } else {
//       // Determine options based on house type checkboxes
//       let houseOptions = INTERNAL_ACCESS_HOUSE_OPTIONS;
      
//       if (isCollection) {
//         if (pricingForm.collection_is_standard_house) {
//           // Standard House: Ground & 1st Floor only
//           houseOptions = [
//             { value: "ground_only", label: "Ground Floor Only" },
//             { value: "ground_first", label: "Ground & 1st Floor" }
//           ];
//         } else if (pricingForm.collection_is_bungalow) {
//           // Bungalow: Ground only
//           houseOptions = [
//             { value: "ground_only", label: "Ground Floor Only" }
//           ];
//         } else if (pricingForm.collection_is_town_house) {
//           // Town House: Ground, 1st, 2nd
//           houseOptions = INTERNAL_ACCESS_HOUSE_OPTIONS;
//         }
//       } else {
//         if (pricingForm.delivery_is_standard_house) {
//           // Standard House: Ground & 1st Floor only
//           houseOptions = [
//             { value: "ground_only", label: "Ground Floor Only" },
//             { value: "ground_first", label: "Ground & 1st Floor" }
//           ];
//         } else if (pricingForm.delivery_is_bungalow) {
//           // Bungalow: Ground only
//           houseOptions = [
//             { value: "ground_only", label: "Ground Floor Only" }
//           ];
//         } else if (pricingForm.delivery_is_town_house) {
//           // Town House: Ground, 1st, 2nd
//           houseOptions = INTERNAL_ACCESS_HOUSE_OPTIONS;
//         }
//       }
      
//       return {
//         options: houseOptions,
//         value: pricingForm[field] || "",
//         onChange: (value) => updatePricingForm(field, value),
//       };
//     }
//   };

//   const sizeOptions = getSizeOptions();
//   const collectionInternalAccess = getInternalAccessOptions(true);
//   const deliveryInternalAccess = getInternalAccessOptions(false);

//   // Calculate price for a specific date
//   const calculatePriceForDate = (date) => {
//     if (!approximateCost || !date) return null;

//     // Get base price (average from approximateCost)
//     const basePrice = approximateCost.avg || approximateCost.min || 0;

//     // Determine if weekend
//     const dayOfWeek = date.getDay();
//     const isFridayOrSaturday = dayOfWeek === 5 || dayOfWeek === 6;

//     // Apply weekend multiplier (15% surcharge)
//     const weekendMultiplier = isFridayOrSaturday ? 1.15 : 1.0;

//     // Calculate notice period multiplier based on days until move
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const daysUntilMove = Math.floor((date - today) / (1000 * 60 * 60 * 24));

//     let noticeMultiplier = 1.0;
//     if (daysUntilMove <= 3) {
//       noticeMultiplier = 1.3; // Within 3 days
//     } else if (daysUntilMove <= 7) {
//       noticeMultiplier = 1.2; // Within 1 week
//     } else if (daysUntilMove <= 14) {
//       noticeMultiplier = 1.1; // Within 2 weeks
//     } else if (daysUntilMove <= 30) {
//       noticeMultiplier = 1.0; // Within 1 month
//     } else {
//       noticeMultiplier = 0.9; // Over 1 month
//     }

//     // Combined multiplier
//     const totalMultiplier = weekendMultiplier * noticeMultiplier;

//     // Final price
//     const finalPrice = basePrice * totalMultiplier;

//     return {
//       price: Math.round(finalPrice),
//       basePrice: Math.round(basePrice),
//       multiplier: totalMultiplier,
//       isWeekend: isFridayOrSaturday,
//       daysUntilMove: daysUntilMove,
//       breakdown: {
//         weekend: weekendMultiplier,
//         notice: noticeMultiplier,
//       },
//     };
//   };

//   return (
//     <section className="w-full min-h-screen bg-white px-4 md:px-10 py-10 flex flex-col lg:flex-row gap-10">
//       {/* LEFT PANEL */}
//       <div className="lg:w-[45%] w-full flex justify-center">
//         <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-200">
//           <div className="absolute -top-8 right-6 bg-pink-600 w-16 h-16 rounded-full text-white flex flex-col items-center justify-center">
//             <span className="text-xl font-bold">{providersCount}</span>
//             <span className="text-[10px]">Providers</span>
//           </div>

//           {/* Header */}
//           <div className="px-6 pt-8 pb-4">
//             <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
//               Refine Your Options Further
//             </h1>
//             <p className="text-gray-700 text-sm mt-2">
//               Select features you value and filter providers accordingly.
//             </p>

//             {/* ========== APPROXIMATE COST DISPLAY ========== */}
//             {/* {approximateCost && (
//               <div className="mt-4 relative">
//                 <div
//                   className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
//                   onClick={() => setShowCostBreakdown(!showCostBreakdown)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-xs text-gray-600 font-medium mb-1">
//                         Approximate Move Cost
//                       </p>
//                       <div className="flex items-baseline gap-2">
//                         <span className="text-2xl font-bold text-pink-600">
//                           {approximateCost.currency}
//                           {approximateCost.min.toLocaleString()}
//                         </span>
//                         <span className="text-sm text-gray-500">-</span>
//                         <span className="text-2xl font-bold text-pink-600">
//                           {approximateCost.currency}
//                           {approximateCost.max.toLocaleString()}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">
//                         Based on {approximateCost.count} available provider
//                         {approximateCost.count !== 1 ? "s" : ""}
//                       </p>
//                     </div>

//                     <div className="flex flex-col items-end gap-2">
//                       {isCalculatingCost && (
//                         <div className="flex items-center gap-2 text-pink-600">
//                           <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent"></div>
//                           <span className="text-xs">Updating...</span>
//                         </div>
//                       )}

//                       <button className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
//                         {showCostBreakdown ? "Hide" : "View"} breakdown
//                         <ChevronDown
//                           className={`h-3 w-3 transition-transform ${
//                             showCostBreakdown ? "rotate-180" : ""
//                           }`}
//                         />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="mt-3 pt-3 border-t border-pink-200">
//                     <p className="text-xs text-gray-600">
//                       💡 <span className="font-medium">Average:</span>{" "}
//                       {approximateCost.currency}
//                       {Math.round(approximateCost.avg).toLocaleString()}
//                       <span className="ml-2 text-gray-500">
//                         • Updates as you refine
//                       </span>
//                     </p>
//                   </div>
//                 </div>

//                 {showCostBreakdown && costBreakdown && (
//                   <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl border border-pink-200 shadow-lg z-10">
//                     <div className="flex items-center justify-between mb-3">
//                       <h4 className="text-sm font-semibold text-gray-800">
//                         Cost Breakdown (Cheapest)
//                       </h4>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setShowCostBreakdown(false);
//                         }}
//                         className="text-gray-400 hover:text-gray-600"
//                       >
//                         ✕
//                       </button>
//                     </div>

//                     <div className="space-y-2">
//                       {costBreakdown.loading > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">
//                             Loading & Transport
//                           </span>
//                           <span className="font-medium">
//                             £{costBreakdown.loading.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.mileage > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">
//                             Mileage ({distanceMiles} miles)
//                           </span>
//                           <span className="font-medium">
//                             £{costBreakdown.mileage.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.packing > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Packing Service</span>
//                           <span className="font-medium">
//                             £{costBreakdown.packing.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.dismantling > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Dismantling</span>
//                           <span className="font-medium">
//                             £{costBreakdown.dismantling.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.reassembly > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Reassembly</span>
//                           <span className="font-medium">
//                             £{costBreakdown.reassembly.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.parking > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">
//                             Parking Distance
//                           </span>
//                           <span className="font-medium">
//                             £{costBreakdown.parking.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.access > 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">Internal Access</span>
//                           <span className="font-medium">
//                             £{costBreakdown.access.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.dateAdjustment !== 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">
//                             {costBreakdown.dateAdjustment > 0
//                               ? "Weekend Surcharge"
//                               : "Weekday Discount"}
//                           </span>
//                           <span
//                             className={`font-medium ${
//                               costBreakdown.dateAdjustment > 0
//                                 ? "text-orange-600"
//                                 : "text-green-600"
//                             }`}
//                           >
//                             {costBreakdown.dateAdjustment > 0 ? "+" : ""}£
//                             {Math.abs(
//                               costBreakdown.dateAdjustment
//                             ).toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.timeAdjustment !== 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">
//                             Time Window Adjustment
//                           </span>
//                           <span className="font-medium">
//                             {costBreakdown.timeAdjustment > 0 ? "+" : ""}£
//                             {costBreakdown.timeAdjustment.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       {costBreakdown.noticeAdjustment !== 0 && (
//                         <div className="flex justify-between text-sm">
//                           <span className="text-gray-600">
//                             Notice Period Adjustment
//                           </span>
//                           <span className="font-medium">
//                             {costBreakdown.noticeAdjustment > 0 ? "+" : ""}£
//                             {costBreakdown.noticeAdjustment.toLocaleString()}
//                           </span>
//                         </div>
//                       )}

//                       <div className="border-t border-gray-200 pt-2 mt-2">
//                         <div className="flex justify-between text-base font-semibold">
//                           <span className="text-gray-800">Total Cost</span>
//                           <span className="text-pink-600">
//                             £{costBreakdown.total.toLocaleString()}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <p className="text-xs text-gray-500 mt-3 text-center">
//                       Click "Search Companies" for all prices
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )} */}

//             {isCalculatingCost && !approximateCost && (
//               <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-600 border-t-transparent"></div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-700">
//                       Calculating costs...
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Based on your selections
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//             {/* DEBUG: Show loaded data */}
//             {/* <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
//               <p className="text-blue-800 font-medium">DEBUG - Loaded Data:</p>
//               <p className="text-blue-600">
//                 Property Type: {pricingForm.property_type} | 
//                 Size: {pricingForm.house_size} | 
//                 Quantity: {pricingForm.quantity} | 
//                 Additional Spaces: {pricingForm.additional_spaces?.length || 0}
//               </p>
//             </div> */}

//           {/* Reset */}
//           <div className="px-6 pb-2 flex items-center justify-between border-t border-gray-100 pt-4">
            
//             <button
//               onClick={resetAll}
//               className="text-[11px] text-gray-500 hover:text-pink-600"
//             >
//               Reset All
//             </button>
//           </div>

//           {/* Items - What do you need help moving - MOVED HERE */}
//           <div className="px-6 pt-5 pb-4 border-t border-gray-100">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <h3 className="text-pink-600 font-semibold text-sm mb-1">
//                   What do you need help moving?
//                 </h3>
//                 <p className="text-[11px] text-gray-500">
//                   Set quantities for each item and mark which need
//                   dismantling/reassembly.
//                 </p>
//               </div>
//               {/* Dismantling/Reassembly Legend */}
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full">
//                   <Wrench className="h-3 w-3 text-pink-600" />
//                   <span className="text-[10px] font-medium text-pink-700">
//                     {Object.values(dismantleItems).filter((v) => v).length}{" "}
//                     dismantle
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
//                   <svg
//                     className="h-3 w-3 text-blue-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
//                     ></path>
//                   </svg>
//                   <span className="text-[10px] font-medium text-blue-700">
//                     {Object.values(reassembleItems).filter((v) => v).length}{" "}
//                     reassemble
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {Object.keys(INVENTORY_BY_CATEGORY).map((category) => (
//                 <div
//                   key={category}
//                   className="border rounded-lg overflow-hidden"
//                 >
//                   <details className="group">
//                     <summary className="px-4 py-3 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100">
//                       <div className="flex items-center gap-2">
//                         <span className="font-semibold text-sm text-gray-800">
//                           {category}
//                         </span>
//                         <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
//                           {INVENTORY_BY_CATEGORY[category].length} items
//                         </span>
//                       </div>
//                       <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
//                     </summary>

//                     <div className="px-3 pb-3 pt-2 bg-white">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {INVENTORY_BY_CATEGORY[category].map((item) => {
//                           const key = item.item_name;
//                           const qty = itemQuantities[key] || 0;
//                           const needsDismantle = dismantleItems[key] || false;
//                           const needsReassemble =
//                             reassembleItems[key] || false;
//                           const isActive = qty > 0;

//                           return (
//                             <div
//                               key={key}
//                               className={`flex flex-col rounded-lg border px-3 py-3 transition-all ${
//                                 isActive
//                                   ? needsDismantle || needsReassemble
//                                     ? "border-pink-300 bg-pink-50"
//                                     : "border-pink-200 bg-pink-50"
//                                   : "border-gray-200 bg-gray-50"
//                               }`}
//                             >
//                               {/* Item Header */}
//                               <div className="flex items-start justify-between mb-2">
//                                 <div className="flex-1">
//                                   <span
//                                     className={`text-[13px] font-medium block ${
//                                       isActive
//                                         ? "text-pink-700"
//                                         : "text-gray-700"
//                                     }`}
//                                   >
//                                     {item.item_name}
//                                   </span>
//                                 </div>

//                                 {/* Checkboxes Container */}
//                                 <div className="flex flex-col items-end gap-1.5">
//                                   {/* Dismantle Checkbox */}
//                                   <label
//                                     className={`flex items-center gap-1.5 cursor-pointer ${
//                                       qty === 0
//                                         ? "opacity-50 cursor-not-allowed"
//                                         : ""
//                                     }`}
//                                   >
//                                     <div className="relative">
//                                       <input
//                                         type="checkbox"
//                                         checked={needsDismantle}
//                                         onChange={() =>
//                                           toggleDismantleItem(key)
//                                         }
//                                         disabled={qty === 0}
//                                         className="sr-only"
//                                       />
//                                       <div
//                                         className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
//                                           needsDismantle
//                                             ? "bg-pink-600 border-pink-600"
//                                             : "border-gray-300 bg-white"
//                                         } ${
//                                           qty > 0
//                                             ? "hover:border-pink-400"
//                                             : ""
//                                         }`}
//                                       >
//                                         {needsDismantle && (
//                                           <svg
//                                             className="w-3 h-3 text-white"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             viewBox="0 0 24 24"
//                                             xmlns="http://www.w3.org/2000/svg"
//                                           >
//                                             <path
//                                               strokeLinecap="round"
//                                               strokeLinejoin="round"
//                                               strokeWidth="3"
//                                               d="M5 13l4 4L19 7"
//                                             ></path>
//                                           </svg>
//                                         )}
//                                       </div>
//                                     </div>
//                                     <span
//                                       className={`text-[10px] font-medium ${
//                                         needsDismantle
//                                           ? "text-pink-700"
//                                           : "text-gray-600"
//                                       }`}
//                                     >
//                                       Dismantle
//                                     </span>
//                                   </label>

//                                   {/* Reassemble Checkbox */}
//                                   <label
//                                     className={`flex items-center gap-1.5 cursor-pointer ${
//                                       qty === 0
//                                         ? "opacity-50 cursor-not-allowed"
//                                         : ""
//                                     }`}
//                                   >
//                                     <div className="relative">
//                                       <input
//                                         type="checkbox"
//                                         checked={needsReassemble}
//                                         onChange={() =>
//                                           toggleReassembleItem(key)
//                                         }
//                                         disabled={qty === 0}
//                                         className="sr-only"
//                                       />
//                                       <div
//                                         className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
//                                           needsReassemble
//                                             ? "bg-blue-600 border-blue-600"
//                                             : "border-gray-300 bg-white"
//                                         } ${
//                                           qty > 0
//                                             ? "hover:border-blue-400"
//                                             : ""
//                                         }`}
//                                       >
//                                         {needsReassemble && (
//                                           <svg
//                                             className="w-3 h-3 text-white"
//                                             fill="none"
//                                             stroke="currentColor"
//                                             viewBox="0 0 24 24"
//                                             xmlns="http://www.w3.org/2000/svg"
//                                           >
//                                             <path
//                                               strokeLinecap="round"
//                                               strokeLinejoin="round"
//                                               strokeWidth="3"
//                                               d="M5 13l4 4L19 7"
//                                             ></path>
//                                           </svg>
//                                         )}
//                                       </div>
//                                     </div>
//                                     <span
//                                       className={`text-[10px] font-medium ${
//                                         needsReassemble
//                                           ? "text-blue-700"
//                                           : "text-gray-600"
//                                       }`}
//                                     >
//                                       Reassemble
//                                     </span>
//                                   </label>
//                                 </div>
//                               </div>

//                               {/* Quantity Controls */}
//                               <div className="flex items-center justify-between mt-2">
//                                 <div className="flex-1">
//                                   <span className="text-[11px] text-gray-600">
//                                     Quantity:
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-1.5">
//                                   <button
//                                     type="button"
//                                     className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition ${
//                                       qty > 0
//                                         ? "border-pink-300 text-pink-700 hover:bg-pink-100"
//                                         : "border-gray-300 text-gray-400 hover:bg-gray-100"
//                                     }`}
//                                     onClick={() =>
//                                       updateItemQuantity(key, qty - 1)
//                                     }
//                                     aria-label={`Decrease ${item.item_name}`}
//                                   >
//                                     −
//                                   </button>
//                                   <input
//                                     type="number"
//                                     min="0"
//                                     value={qty}
//                                     onChange={(e) =>
//                                       updateItemQuantity(key, e.target.value)
//                                     }
//                                     className={`w-14 h-8 text-sm border rounded text-center font-medium ${
//                                       qty > 0
//                                         ? "border-pink-300 text-pink-700"
//                                         : "border-gray-300 text-gray-700"
//                                     }`}
//                                   />
//                                   <button
//                                     type="button"
//                                     className="w-8 h-8 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-100 flex items-center justify-center text-sm transition"
//                                     onClick={() =>
//                                       updateItemQuantity(key, qty + 1)
//                                     }
//                                     aria-label={`Increase ${item.item_name}`}
//                                   >
//                                     +
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </details>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Property Details Summary Section - Read-only from localStorage */}
//           <div className="border-t border-gray-100">
//             <AccordionSection
//               title="Property Details"
//               open={open.propertyDetailsSummary}
//               onToggle={() => toggleSection("propertyDetailsSummary")}
//               customContent={
//                 <div className="px-6 pb-4">
//                   {/* Property Details Grid with Icons - Just like ComparePage */}
//                   <div className="grid grid-cols-2 gap-3">
//                     {/* Property Type with Icon */}
//                     {pricingForm.property_type && (() => {
//                       // Format for display
//                       const propertyTypeDisplay = pricingForm.property_type === "house" ? "HOUSE" : 
//                                                pricingForm.property_type === "flat" ? "FLAT" :
//                                                pricingForm.property_type === "office" ? "OFFICE" :
//                                                pricingForm.property_type === "a_few_items" ? "A FEW ITEMS" : 
//                                                pricingForm.property_type;
                      
//                       // For icon mapping
//                       const propertyTypeForIcon = propertyTypeDisplay.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
//                       const adjustedPropertyType = propertyTypeForIcon === "A Few Items" ? "Few Items" : propertyTypeForIcon;
                      
//                       const { icon: Icon, color } = getPropertyTypeIcon(adjustedPropertyType);
//                       const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                      
//                       return (
//                         <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
//                           {isEmoji ? (
//                             <Icon className={color} style={{ fontSize: '1rem' }} />
//                           ) : (
//                             <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
//                           )}
//                           <div className="flex flex-col">
//                             <span className="text-[10px] text-gray-500">Property</span>
//                             <span className="text-xs font-medium text-gray-800">
//                               {propertyTypeDisplay}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })()}

//                     {/* Property Size with Icon */}
//                     {pricingForm.house_size && (() => {
//                       // Format the property size based on property type
//                       let displaySize = pricingForm.house_size;
//                       if (pricingForm.property_type === "a_few_items") {
//                         const vehicleMap = {
//                           'swb_van': 'SWB Van',
//                           'mwb_van': 'MWB Van',
//                           'lwb_van': 'LWB Van'
//                         };
//                         displaySize = vehicleMap[pricingForm.house_size] || pricingForm.house_size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//                       } else {
//                         displaySize = pricingForm.house_size.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//                       }
                      
//                       const { icon: Icon, color } = getPropertySizeIcon(displaySize);
//                       const isEmoji = typeof Icon === 'function' && Icon.toString().includes('span');
                      
//                       return (
//                         <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
//                           {isEmoji ? (
//                             <Icon className={color} style={{ fontSize: '1rem' }} />
//                           ) : (
//                             <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
//                           )}
//                           <div className="flex flex-col">
//                             <span className="text-[10px] text-gray-500">Size</span>
//                             <span className="text-xs font-medium text-gray-800">
//                               {displaySize}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })()}

//                     {/* Quantity with Icon */}
//                     {pricingForm.quantity && (() => {
//                       // Format quantity based on property type
//                       let formattedQuantity = "";
                      
//                       if (pricingForm.property_type === "a_few_items") {
//                         const vanQuantityMap = {
//                           quarter_van: "Quarter Van",
//                           half_van: "Half Van",
//                           three_quarter_van: "3/4 Van",
//                           whole_van: "Whole Van",
//                         };
//                         formattedQuantity = vanQuantityMap[pricingForm.quantity] || 
//                                          pricingForm.quantity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//                       } else {
//                         const contentQuantityMap = {
//                           some_things: "Some Things",
//                           half_contents: "Half the Contents",
//                           three_quarter: "3/4 Contents",
//                           everything: "Everything",
//                         };
//                         formattedQuantity = contentQuantityMap[pricingForm.quantity] || 
//                                          pricingForm.quantity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
//                       }
                      
//                       const { icon: Icon, color } = getQuantityIcon(formattedQuantity.toLowerCase());
                      
//                       return (
//                         <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
//                           <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
//                           <div className="flex flex-col">
//                             <span className="text-[10px] text-gray-500">Quantity</span>
//                             <span className="text-xs font-medium text-gray-800">
//                               {formattedQuantity}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })()}

//                     {/* Distance with Icon */}
//                     {distanceMiles && (
//                       <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
//                         <MapPin className="h-4 w-4 text-pink-600 flex-shrink-0" />
//                         <div className="flex flex-col">
//                           <span className="text-[10px] text-gray-500">Distance</span>
//                           <span className="text-xs font-medium text-gray-800">
//                             {distanceMiles} miles
//                           </span>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Additional Spaces - Only show if property type is house/bungalow/town_house */}
//                   {/* {pricingForm.additional_spaces?.length > 0 && (
//                     <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
//                       <div className="flex items-center gap-2 mb-1">
//                         <Boxes className="h-3 w-3 text-blue-600" />
//                         <span className="text-xs font-medium text-blue-800">Additional Spaces:</span>
//                       </div>
//                       <div className="flex flex-wrap gap-1">
//                         {pricingForm.additional_spaces.map((space, idx) => (
//                           <span key={idx} className="text-xs px-2 py-1 bg-white rounded-md text-blue-700 border">
//                             {space.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )} */}
//                 </div>
//               }
//             />
//           </div>

//           {/* Address Details Section - EVERYTHING INSIDE DROPDOWN */}
//           <div className="border-t border-gray-100">
//             <AccordionSection
//               title="Address Details"
//               open={open.propertyDetails}
//               onToggle={() => toggleSection("propertyDetails")}
//               customContent={
//                 <div className="px-6 pb-4 space-y-6">
//                   {/* ===========================
//                       VISIBLE ADDRESS FIELDS
//                   ============================ */}
//                   <div className="space-y-4">
//                     {/* Pickup Address */}
//                     <div className="space-y-2">
//                       <label className="block text-xs font-medium text-gray-600">
//                         Pickup Address
//                       </label>

//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="col-span-2">
//                           <input
//                             type="text"
//                             placeholder="Enter pickup address"
//                             value={pricingForm.pickup_address}
//                             onChange={(e) =>
//                               updatePricingForm(
//                                 "pickup_address",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                           />
//                         </div>

//                         <div>
//                           <input
//                             type="text"
//                             placeholder="Enter city"
//                             value={pricingForm.pickup_city}
//                             onChange={(e) =>
//                               updatePricingForm("pickup_city", e.target.value)
//                             }
//                             className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                           />
//                         </div>

//                         <div>
//                           <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded bg-gray-50">
//                             Pincode: {pickupPincode}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Delivery Address */}
//                     <div className="space-y-2">
//                       <label className="block text-xs font-medium text-gray-600">
//                         Delivery Address
//                       </label>

//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="col-span-2">
//                           <input
//                             type="text"
//                             placeholder="Enter delivery address"
//                             value={pricingForm.delivery_address}
//                             onChange={(e) =>
//                               updatePricingForm(
//                                 "delivery_address",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                           />
//                         </div>

//                         <div>
//                           <input
//                             type="text"
//                             placeholder="Enter city"
//                             value={pricingForm.delivery_city}
//                             onChange={(e) =>
//                               updatePricingForm("delivery_city", e.target.value)
//                             }
//                             className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                           />
//                         </div>

//                         <div>
//                           <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded bg-gray-50">
//                             Pincode: {dropoffPincode}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ===========================
//                       PROPERTY DETAILS (PRE-FILLED FIELDS)
//                   ============================ */}
//                   <div className="space-y-4" style={{ display: "none" }}>
//                     {/* Property Type */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Property Type
//                       </label>
//                       <select
//                         value={pricingForm.property_type}
//                         onChange={(e) =>
//                           updatePricingForm("property_type", e.target.value)
//                         }
//                         className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                       >
//                         <option value="">Choose property type</option>
//                         {PROPERTY_TYPES.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Size - UPDATED */}
//                     {sizeOptions.length > 0 && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           {pricingForm.property_type === "a_few_items" ? "Vehicle Size" : "Property Size"}
//                         </label>
//                         <select
//                           value={pricingForm.house_size}
//                           onChange={(e) =>
//                             updatePricingForm("house_size", e.target.value)
//                           }
//                           className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                         >
//                           <option value="">Choose {pricingForm.property_type === "a_few_items" ? "vehicle size" : "size"}</option>
//                           {sizeOptions.map((option) => (
//                             <option key={option.value} value={option.value}>
//                               {option.label}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     {/* Additional Spaces */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Additional Spaces
//                       </label>

//                       <div className="space-y-2">
//                         {ADDITIONAL_SPACES.map((space) => (
//                           <label
//                             key={space.value}
//                             className="flex items-center gap-2"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={pricingForm.additional_spaces.includes(
//                                 space.value
//                               )}
//                               onChange={() =>
//                                 toggleAdditionalSpace(space.value)
//                               }
//                               className="accent-pink-600"
//                             />
//                             {space.label}
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Quantity */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Quantity to Move
//                       </label>
//                       <select
//                         value={pricingForm.quantity}
//                         onChange={(e) =>
//                           updatePricingForm("quantity", e.target.value)
//                         }
//                         className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                       >
//                         <option value="">Choose quantity</option>
//                         {QUANTITY_OPTIONS.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               }
//             />

//             {/* Collection Details */}
//             <AccordionSection
//               title="Collection Property Assessment"
//               open={open.collectionDetails}
//               onToggle={() => toggleSection("collectionDetails")}
//               customContent={
//                 <div className="px-6 pb-4 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Parking
//                     </label>
//                     <CustomIconSelect
//                       value={pricingForm.collection_parking}
//                       onChange={(val) => {
//                         updatePricingForm("collection_parking", val);
//                         // Clear parking distance if driveway is selected
//                         if (val === "driveway") {
//                           updatePricingForm("collection_parking_distance", "");
//                         }
//                       }}
//                       options={PARKING_OPTIONS}
//                       placeholder="Choose Parking"
//                     />
//                   </div>

//                   {/* Only show parking distance when roadside is selected */}
//                   {pricingForm.collection_parking === "roadside" && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Parking Distance (Vehicle To Property Entrance)
//                       </label>
//                       <div className="relative">
//                         <select
//                           value={pricingForm.collection_parking_distance}
//                           onChange={(e) =>
//                             updatePricingForm(
//                               "collection_parking_distance",
//                               e.target.value
//                             )
//                           }
//                           className="w-full p-2 border border-gray-300 rounded-md text-sm pr-10"
//                         >
//                         <option value="">Choose Parking Distance</option>
//                         {PARKING_DISTANCE_OPTIONS.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                       {pricingForm.collection_parking_distance && (
//                         <button
//                           type="button"
//                           onClick={() => setShowCollectionParkingInfo(!showCollectionParkingInfo)}
//                           className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
//                         >
//                           <Info size={18} />
//                         </button>
//                       )}
//                       {showCollectionParkingInfo && pricingForm.collection_parking_distance && (
//                         <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-gray-700 w-full max-w-md">
//                           <div className="flex justify-between items-start mb-1">
//                             <span className="font-semibold text-gray-900">
//                               {PARKING_DISTANCE_OPTIONS.find(opt => opt.value === pricingForm.collection_parking_distance)?.label}
//                             </span>
//                             <button
//                               type="button"
//                               onClick={() => setShowCollectionParkingInfo(false)}
//                               className="text-gray-400 hover:text-gray-600 ml-2"
//                             >
//                               ×
//                             </button>
//                           </div>
//                           <p className="text-gray-600 leading-relaxed">
//                             {PARKING_DISTANCE_DESCRIPTIONS[pricingForm.collection_parking_distance]}
//                           </p>
//                         </div>
//                       )}
//                       </div>
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Internal Access
//                     </label>
                    
//                     {/* Collection Attributes Checkboxes - Above Dropdown */}
//                     {["house", "bungalow", "town_house"].includes(
//                       pricingForm.property_type
//                     ) && (
//                       <div className="flex gap-4 mb-2">
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.collection_is_standard_house || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("collection_is_standard_house", true);
//                                 updatePricingForm("collection_is_bungalow", false);
//                                 updatePricingForm("collection_is_town_house", false);
//                               } else {
//                                 updatePricingForm("collection_is_standard_house", false);
//                               }
//                             }}
//                           />
//                           Standard House
//                         </label>
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.collection_is_bungalow || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("collection_is_standard_house", false);
//                                 updatePricingForm("collection_is_bungalow", true);
//                                 updatePricingForm("collection_is_town_house", false);
//                               } else {
//                                 updatePricingForm("collection_is_bungalow", false);
//                               }
//                             }}
//                           />
//                           Bungalow
//                         </label>
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.collection_is_town_house || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("collection_is_standard_house", false);
//                                 updatePricingForm("collection_is_bungalow", false);
//                                 updatePricingForm("collection_is_town_house", true);
//                               } else {
//                                 updatePricingForm("collection_is_town_house", false);
//                               }
//                             }}
//                           />
//                           Town house
//                         </label>
//                       </div>
//                     )}
                    
//                     {["flat", "office", "a_few_items"].includes(
//                       pricingForm.property_type
//                     ) && (
//                       <div className="flex gap-4 mb-2">
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.collection_stairs_only || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("collection_stairs_only", true);
//                                 updatePricingForm("collection_has_lift", false);
//                               } else {
//                                 updatePricingForm("collection_stairs_only", false);
//                               }
//                             }}
//                           />
//                           Stair only
//                         </label>
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.collection_has_lift || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("collection_stairs_only", false);
//                                 updatePricingForm("collection_has_lift", true);
//                               } else {
//                                 updatePricingForm("collection_has_lift", false);
//                               }
//                             }}
//                           />
//                           Lift access
//                         </label>
//                       </div>
//                     )}
                    
//                     {/* Show dropdown: always for house types, only when stairs_only checked for flat/office/a_few_items */}
//                     {(["house", "bungalow", "town_house"].includes(pricingForm.property_type) ||
//                       (["flat", "office", "a_few_items"].includes(pricingForm.property_type) && pricingForm.collection_stairs_only)) && (
//                     <select
//                       value={collectionInternalAccess.value}
//                       onChange={(e) =>
//                         collectionInternalAccess.onChange(e.target.value)
//                       }
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     >
//                       <option value="">Choose internal access</option>
//                       {collectionInternalAccess.options.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                     )}
//                     {/* Old flat checkbox code removed - now integrated above */}
//                   </div>
//                 </div>
//               }
//             />

//             {/* Delivery Details */}
//             <AccordionSection
//               title="Delivery Property Assessment"
//               open={open.deliveryDetails}
//               onToggle={() => toggleSection("deliveryDetails")}
//               customContent={
//                 <div className="px-6 pb-4 space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Property Type
//                     </label>
//                     <select
//                       value={pricingForm.delivery_property_type}
//                       onChange={(e) =>
//                         updatePricingForm("delivery_property_type", e.target.value)
//                       }
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     >
//                       <option value="">Choose property type</option>
//                       {PROPERTY_TYPES.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Parking
//                     </label>
//                     <CustomIconSelect
//                       value={pricingForm.delivery_parking}
//                       onChange={(val) => {
//                         updatePricingForm("delivery_parking", val);
//                         // Clear parking distance if driveway is selected
//                         if (val === "driveway") {
//                           updatePricingForm("delivery_parking_distance", "");
//                         }
//                       }}
//                       options={PARKING_OPTIONS}
//                       placeholder="Choose Parking"
//                     />
//                   </div>

//                   {/* Only show parking distance when roadside is selected */}
//                   {pricingForm.delivery_parking === "roadside" && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Parking Distance (Vehicle To Property Entrance)
//                       </label>
//                       <div className="relative">
//                         <select
//                           value={pricingForm.delivery_parking_distance}
//                           onChange={(e) =>
//                             updatePricingForm(
//                               "delivery_parking_distance",
//                               e.target.value
//                             )
//                           }
//                           className="w-full p-2 border border-gray-300 rounded-md text-sm pr-10"
//                         >
//                         <option value="">Choose parking distance</option>
//                         {PARKING_DISTANCE_OPTIONS.map((option) => (
//                           <option key={option.value} value={option.value}>
//                             {option.label}
//                           </option>
//                         ))}
//                       </select>
//                       {pricingForm.delivery_parking_distance && (
//                         <button
//                           type="button"
//                           onClick={() => setShowDeliveryParkingInfo(!showDeliveryParkingInfo)}
//                           className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
//                         >
//                           <Info size={18} />
//                         </button>
//                       )}
//                       {showDeliveryParkingInfo && pricingForm.delivery_parking_distance && (
//                         <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-gray-700 w-full max-w-md">
//                           <div className="flex justify-between items-start mb-1">
//                             <span className="font-semibold text-gray-900">
//                               {PARKING_DISTANCE_OPTIONS.find(opt => opt.value === pricingForm.delivery_parking_distance)?.label}
//                             </span>
//                             <button
//                               type="button"
//                               onClick={() => setShowDeliveryParkingInfo(false)}
//                               className="text-gray-400 hover:text-gray-600 ml-2"
//                             >
//                               ×
//                             </button>
//                           </div>
//                           <p className="text-gray-600 leading-relaxed">
//                             {PARKING_DISTANCE_DESCRIPTIONS[pricingForm.delivery_parking_distance]}
//                           </p>
//                         </div>
//                       )}
//                       </div>
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Internal Access
//                     </label>
                    
//                     {/* Delivery Attributes Checkboxes - Above Dropdown */}
//                     {["house", "bungalow", "town_house"].includes(
//                       pricingForm.delivery_property_type
//                     ) && (
//                       <div className="flex gap-4 mb-2">
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.delivery_is_standard_house || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("delivery_is_standard_house", true);
//                                 updatePricingForm("delivery_is_bungalow", false);
//                                 updatePricingForm("delivery_is_town_house", false);
//                               } else {
//                                 updatePricingForm("delivery_is_standard_house", false);
//                               }
//                             }}
//                           />
//                           Standard House
//                         </label>
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.delivery_is_bungalow || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("delivery_is_standard_house", false);
//                                 updatePricingForm("delivery_is_bungalow", true);
//                                 updatePricingForm("delivery_is_town_house", false);
//                               } else {
//                                 updatePricingForm("delivery_is_bungalow", false);
//                               }
//                             }}
//                           />
//                           Bungalow
//                         </label>
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.delivery_is_town_house || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("delivery_is_standard_house", false);
//                                 updatePricingForm("delivery_is_bungalow", false);
//                                 updatePricingForm("delivery_is_town_house", true);
//                               } else {
//                                 updatePricingForm("delivery_is_town_house", false);
//                               }
//                             }}
//                           />
//                           Town house
//                         </label>
//                       </div>
//                     )}
                    
//                     {["flat", "office", "a_few_items"].includes(
//                       pricingForm.delivery_property_type
//                     ) && (
//                       <div className="flex gap-4 mb-2">
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.delivery_stairs_only || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("delivery_stairs_only", true);
//                                 updatePricingForm("delivery_has_lift", false);
//                               } else {
//                                 updatePricingForm("delivery_stairs_only", false);
//                               }
//                             }}
//                           />
//                           Stair only
//                         </label>
//                         <label className="flex items-center gap-2 text-sm text-gray-700">
//                           <input
//                             type="checkbox"
//                             className="accent-pink-600"
//                             checked={pricingForm.delivery_has_lift || false}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 updatePricingForm("delivery_stairs_only", false);
//                                 updatePricingForm("delivery_has_lift", true);
//                               } else {
//                                 updatePricingForm("delivery_has_lift", false);
//                               }
//                             }}
//                           />
//                           Lift access
//                         </label>
//                       </div>
//                     )}
                    
//                     {/* Show dropdown: always for house types, only when stairs_only checked for flat/office/a_few_items */}
//                     {(["house", "bungalow", "town_house"].includes(pricingForm.delivery_property_type) ||
//                       (["flat", "office", "a_few_items"].includes(pricingForm.delivery_property_type) && pricingForm.delivery_stairs_only)) && (
//                     <select
//                       value={deliveryInternalAccess.value}
//                       onChange={(e) =>
//                         deliveryInternalAccess.onChange(e.target.value)
//                       }
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     >
//                       <option value="">Choose internal access</option>
//                       {deliveryInternalAccess.options.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                     )}
//                   </div>
//                 </div>
//               }
//             />

//             {/* Move Date Details */}
//             <AccordionSection
//               title="Move Date & Time"
//               open={open.moveDateDetails}
//               onToggle={() => toggleSection("moveDateDetails")}
//               customContent={
//                 <div className="px-6 pb-4 space-y-4">
//                   {/* Calendar Date Picker */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Select Move Date
//                     </label>

//                     <button
//                       type="button"
//                       onClick={() => setShowCalendar(!showCalendar)}
//                       className="w-full p-3 border border-gray-300 rounded-md text-left flex items-center justify-between hover:border-pink-400 transition"
//                     >
//                       <span
//                         className={
//                           selectedMoveDate ? "text-gray-800" : "text-gray-500"
//                         }
//                       >
//                         {selectedMoveDate
//                           ? selectedMoveDate.toLocaleDateString("en-GB", {
//                               weekday: "long",
//                               year: "numeric",
//                               month: "long",
//                               day: "numeric",
//                             })
//                           : "Choose your move date"}
//                       </span>
//                       <svg
//                         className="h-5 w-5 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                         />
//                       </svg>
//                     </button>

//                     {/* Calendar Dropdown */}
//                     <div className="calendar-container">
//                       {showCalendar && (
//                         <div className="mt-2 bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 rounded-xl shadow-2xl">
//                           {(() => {
//                             try {
//                               const calendars = generateCalendar();
//                               const today = new Date();
//                               today.setHours(0, 0, 0, 0);

//                               if (
//                                 !calendars ||
//                                 !Array.isArray(calendars) ||
//                                 calendars.length === 0
//                               ) {
//                                 return (
//                                   <div className="text-center py-8 text-gray-500">
//                                     Loading calendar...
//                                   </div>
//                                 );
//                               }

//                               const calendar = calendars[currentMonthIndex];
//                               const canGoPrev = currentMonthIndex > 0;
//                               const canGoNext = currentMonthIndex < calendars.length - 1;

//                               return (
//                                 <div className="p-6">
//                                   {/* Header with Navigation */}
//                                   <div className="flex items-center justify-between mb-6">
//                                     <button
//                                       onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
//                                       disabled={!canGoPrev}
//                                       className={`p-2 rounded-lg transition ${
//                                         canGoPrev
//                                           ? "hover:bg-pink-100 text-gray-700"
//                                           : "text-gray-300 cursor-not-allowed"
//                                       }`}
//                                     >
//                                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                                       </svg>
//                                     </button>

//                                     <div className="text-center">
//                                       <h3 className="text-2xl font-bold text-gray-800">
//                                         {calendar.monthName} {calendar.year}
//                                       </h3>
//                                       <p className="text-sm text-gray-500 mt-1">
//                                         Select your preferred move date
//                                       </p>
//                                     </div>

//                                     <button
//                                       onClick={() => setCurrentMonthIndex(prev => Math.min(calendars.length - 1, prev + 1))}
//                                       disabled={!canGoNext}
//                                       className={`p-2 rounded-lg transition ${
//                                         canGoNext
//                                           ? "hover:bg-pink-100 text-gray-700"
//                                           : "text-gray-300 cursor-not-allowed"
//                                       }`}
//                                     >
//                                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                       </svg>
//                                     </button>
//                                   </div>

//                                   {/* Month Indicators */}
//                                   <div className="flex justify-center gap-2 mb-6">
//                                     {calendars.map((_, index) => (
//                                       <button
//                                         key={index}
//                                         onClick={() => setCurrentMonthIndex(index)}
//                                         className={`w-2 h-2 rounded-full transition ${
//                                           index === currentMonthIndex
//                                             ? "bg-pink-600 w-8"
//                                             : "bg-gray-300 hover:bg-pink-300"
//                                         }`}
//                                       />
//                                     ))}
//                                   </div>

//                                   {/* Day Headers */}
//                                   <div className="grid grid-cols-7 gap-2 mb-3">
//                                     {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//                                       <div
//                                         key={day}
//                                         className="text-center text-sm font-bold text-gray-600 py-2"
//                                       >
//                                         {day}
//                                       </div>
//                                     ))}
//                                   </div>

//                                   {/* Calendar Days */}
//                                   <div className="grid grid-cols-7 gap-2 mb-6">
//                                     {calendar.days.map((date, index) => {
//                                       if (!date) {
//                                         return <div key={`empty-${index}`} className="p-2"></div>;
//                                       }

//                                       const isToday = date.getTime() === today.getTime();
//                                       const isSelected =
//                                         selectedMoveDate &&
//                                         date.getTime() === selectedMoveDate.getTime();
//                                       const isDisabled = date < today;
//                                       const isFridayOrSaturday =
//                                         date.getDay() === 5 || date.getDay() === 6;
//                                       const priceInfo = calculatePriceForDate(date);

//                                       return (
//                                         <button
//                                           key={index}
//                                           type="button"
//                                           onClick={() => !isDisabled && handleDateSelect(date)}
//                                           disabled={isDisabled}
//                                           className={`
//                                             relative p-3 text-sm rounded-xl transition-all flex flex-col items-center justify-center min-h-[70px] group
//                                             ${
//                                               isDisabled
//                                                 ? "text-gray-300 cursor-not-allowed bg-gray-50"
//                                                 : "hover:scale-105 cursor-pointer hover:shadow-lg"
//                                             }
//                                             ${
//                                               isSelected
//                                                 ? "bg-gradient-to-br from-pink-600 to-pink-700 text-white font-bold shadow-xl scale-105"
//                                                 : ""
//                                             }
//                                             ${
//                                               isToday && !isSelected
//                                                 ? "ring-2 ring-pink-500 ring-offset-2 font-semibold bg-white"
//                                                 : "border-2 border-transparent"
//                                             }
//                                             ${
//                                               isFridayOrSaturday && !isSelected && !isDisabled
//                                                 ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
//                                                 : !isSelected && !isToday && !isDisabled
//                                                 ? "bg-white hover:bg-pink-50"
//                                                 : ""
//                                             }
//                                           `}
//                                         >
//                                           <span
//                                             className={`text-lg font-bold ${
//                                               isSelected ? "text-white" : "text-gray-800"
//                                             }`}
//                                           >
//                                             {date.getDate()}
//                                           </span>

//                                           {!isDisabled && priceInfo && approximateCost && (
//                                             <span
//                                               className={`text-xs font-bold mt-1 ${
//                                                 isSelected
//                                                   ? "text-white"
//                                                   : isFridayOrSaturday
//                                                   ? "text-orange-700"
//                                                   : "text-pink-600"
//                                               }`}
//                                             >
//                                               £{priceInfo.price.toLocaleString()}
//                                             </span>
//                                           )}

                                       
//                                           {isFridayOrSaturday && !isSelected && !isDisabled && (
//                                             <span className="absolute top-1 right-1 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-semibold">
//                                               +15%
//                                             </span>
//                                           )}

//                                           {!isDisabled &&
//                                             priceInfo &&
//                                             approximateCost &&
//                                             priceInfo.price ===
//                                               Math.min(
//                                                 ...calendar.days
//                                                   .filter((d) => d && d >= today)
//                                                   .map(
//                                                     (d) =>
//                                                       calculatePriceForDate(d)?.price ||
//                                                       Infinity
//                                                   )
//                                               ) &&
//                                             !isSelected && (
//                                               <span className="absolute top-1 left-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-md font-semibold shadow">
//                                                 Best
//                                               </span>
//                                             )}
//                                         </button>
//                                       );
//                                     })}
//                                   </div>

//                                   {/* Legend */}
//                                   <div className="bg-white rounded-lg p-4 border border-gray-200">
//                                     <div className="grid grid-cols-2 gap-3 text-xs">
//                                       <div className="flex items-center gap-2">
//                                         <div className="w-5 h-5 ring-2 ring-pink-500 rounded"></div>
//                                         <span className="text-gray-700">Today</span>
//                                       </div>
//                                       <div className="flex items-center gap-2">
//                                         <div className="w-5 h-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded"></div>
//                                         <span className="text-gray-700">Weekend</span>
//                                       </div>
//                                       <div className="flex items-center gap-2">
//                                         <div className="w-5 h-5 bg-green-500 rounded"></div>
//                                         <span className="text-gray-700 font-semibold">Best Price</span>
//                                       </div>
//                                       <div className="flex items-center gap-2">
//                                         <div className="w-5 h-5 bg-gradient-to-br from-pink-600 to-pink-700 rounded"></div>
//                                         <span className="text-gray-700">Selected</span>
//                                       </div>
//                                     </div>

//                                     {approximateCost && (
//                                       <div className="mt-4 pt-4 border-t border-gray-200">
//                                         <p className="font-bold text-gray-800 mb-2 text-sm">
//                                           💰 Pricing Factors:
//                                         </p>
//                                         <ul className="space-y-1.5 text-xs text-gray-600">
//                                           <li className="flex items-start">
//                                             <span className="text-green-600 mr-2">✓</span>
//                                             <span><strong>Notice:</strong> Save 20% booking 1+ month ahead</span>
//                                           </li>
//                                           <li className="flex items-start">
//                                             <span className="text-blue-600 mr-2">✓</span>
//                                             <span><strong>Day:</strong> Weekdays 15% cheaper than Fri/Sat</span>
//                                           </li>
//                                           <li className="flex items-start">
//                                             <span className="text-orange-600 mr-2">⚠</span>
//                                             <span><strong>Urgency:</strong> +30% for moves within 3 days</span>
//                                           </li>
//                                         </ul>
//                                       </div>
//                                     )}
//                                   </div>

//                                   {/* Close Button */}
//                                   <button
//                                     onClick={() => setShowCalendar(false)}
//                                     className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
//                                   >
//                                     Close Calendar
//                                   </button>
//                                 </div>
//                               );
//                             } catch (error) {
//                               console.error("Calendar render error:", error);
//                               return (
//                                 <div className="text-center py-8 text-red-500">
//                                   Error loading calendar. Please refresh the page.
//                                 </div>
//                               );
//                             }
//                           })()}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   {/* Rest of the existing fields */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Notice Period
//                     </label>
//                     <select
//                       value={pricingForm.notice_period}
//                       onChange={(e) =>
//                         updatePricingForm("notice_period", e.target.value)
//                       }
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     >
//                       <option value="">Choose notice period</option>
//                       {NOTICE_PERIOD_OPTIONS.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Preferred Move Day
//                     </label>
//                     <select
//                       value={pricingForm.move_day}
//                       onChange={(e) =>
//                         updatePricingForm("move_day", e.target.value)
//                       }
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     >
//                       <option value="">Choose move day</option>
//                       {MOVE_DAY_OPTIONS.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Collection Time Preference
//                     </label>
//                     <select
//                       value={pricingForm.collection_time}
//                       onChange={(e) =>
//                         updatePricingForm("collection_time", e.target.value)
//                       }
//                       className="w-full p-2 border border-gray-300 rounded-md text-sm"
//                     >
//                       <option value="">Choose collection time</option>
//                       {COLLECTION_TIME_OPTIONS.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               }
//             />
//           </div>

//           {/* APPLY BUTTON */}
//           <div className="px-6 pb-6 pt-4">
//             <button
//               onClick={applyFilters}
//               disabled={isLoadingCosts}
//               className={`w-full border-2 border-pink-500 rounded-full py-3.5 text-sm font-semibold transition ${
//                 isLoadingCosts
//                   ? "bg-pink-100 text-pink-400 cursor-not-allowed"
//                   : "text-pink-600 hover:bg-pink-600 hover:text-white hover:shadow-lg"
//               }`}
//             >
//               {isLoadingCosts
//                 ? "Searching Companies..."
//                 : "Search Companies with Pricing"}
//             </button>

//             {apiError && (
//               <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
//                 <p className="text-[11px] text-red-600 font-medium">
//                   API Error:
//                 </p>
//                 <p className="text-[10px] text-red-500 mt-1">{apiError}</p>
//                 <p className="text-[10px] text-gray-600 mt-2">
//                   Check browser console (F12) for detailed debugging information
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* RIGHT: MAP WITH PROFESSIONAL CALL BUTTONS FOR UK CLIENTS */}
//       <div className="lg:flex-1 w-full">
//         <div className="sticky top-10 rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
//           {/* HEADER WITH PROFESSIONAL UK STYLING */}
//           <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Route className="h-6 w-6" />
//               <div>
//                 <h3 className="font-semibold text-lg">Move Route & Pricing</h3>
//                 <p className="text-xs text-pink-200 opacity-90">
//                   UK-Wide Moving Services
//                 </p>
//             </div>
//             </div>

//             {/* PROFESSIONAL UK-STYLE CALL BUTTON */}
//             <button
//               onClick={() =>
//                 navigate("/book-call", {
//                   state: {
//                     dismantleItems,
//                     reassembleItems,
//                     itemQuantities,
//                     pricingForm,
//                     pickup,
//                     dropoff,
//                     pickupPincode,
//                     dropoffPincode,
//                     distanceMiles,
//                     distanceKm,
//                     totalVolume: calculateTotalVolume(),
//                   },
//                 })
//               }
//               className="bg-white text-pink-600 hover:bg-pink-50 px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap border border-pink-200 hover:border-pink-300 group"
//             >
//               <div className="relative">
//                 <Phone className="h-4 w-4 group-hover:animate-pulse" />
//               </div>
//               <span>Need Help ? Call Now</span>
//             </button>
//           </div>

//           {/* Pickup → Dropoff */}
//           <div className="px-4 py-3 text-sm bg-gray-50 border-b border-gray-100">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <div>
//                   <div className="font-medium text-gray-800">Collection</div>
//                   <div className="text-xs text-gray-600">{pickupPincode}</div>
//                 </div>
//               </div>
//               <div className="text-pink-400 mx-2">
//                 <span className="text-lg">→</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                 <div>
//                   <div className="font-medium text-gray-800">Delivery</div>
//                   <div className="text-xs text-gray-600">{dropoffPincode}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Professional Distance Display */}
//             {distanceMiles && distanceKm && (
//               <div className="mt-3 pt-3 border-t border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-1 bg-pink-400 rounded-full"></div>
//                     <span className="text-sm text-gray-700">
//                       Route Distance:
//                     </span>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-semibold text-pink-600">
//                       {distanceMiles} miles
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       ({distanceKm} km)
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* MAP CONTAINER */}
//           <div style={{ height: "520px" }} className="relative bg-gray-50">
//             <iframe
//               title="Route Map"
//               srcDoc={generateCustomMap(
//                 pickupCoords,
//                 dropoffCoords,
//                 routeGeometry
//               )}
//               className="w-full h-full border-0"
//             ></iframe>
//           </div>

//           {/* PROFESSIONAL UK SUPPORT FOOTTER */}
//           <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-pink-50 to-white">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="bg-white p-2 rounded-lg shadow-sm">
//                   <svg
//                     className="w-5 h-5 text-pink-600"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-semibold text-gray-800">
//                     Need Help With Your UK Move?
//                   </h4>
//                   <p className="text-xs text-gray-600">
//                     Our UK-based team is here to help
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() =>
//                   navigate("/book-call", {
//                     state: {
//                       dismantleItems,
//                       reassembleItems,
//                       itemQuantities,
//                       pricingForm,
//                       pickup,
//                       dropoff,
//                       pickupPincode,
//                       dropoffPincode,
//                       distanceMiles,
//                       distanceKm,
//                       totalVolume: calculateTotalVolume(),
//                     },
//                   })
//                 }
//                 className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap group"
//               >
//                 <div className="relative">
//                   <Phone className="h-4 w-4 group-hover:animate-bounce" />
//                 </div>
//                 <span>020 7123 4567</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// // --------------------------------------------------------------
// //  ACCORDION SECTION - UNCHANGED
// // --------------------------------------------------------------
// const AccordionSection = ({
//   title,
//   open,
//   onToggle,
//   options,
//   group,
//   filters,
//   toggleFilter,
//   customContent,
// }) => (
//   <div className="border-b border-gray-100">
//     <button
//       className="w-full flex items-center justify-between px-6 py-3 font-semibold text-sm text-gray-800 hover:bg-pink-50 transition"
//       onClick={onToggle}
//       type="button"
//     >
//       <span>{title}</span>
//       <ChevronDown
//         className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`}
//       />
//     </button>

//     {open && (
//       <div className="text-sm text-gray-700">
//         {customContent ? (
//           customContent
//         ) : (
//           <div className="px-6 pb-4 space-y-2">
//             {options.map((opt) => (
//               <label key={opt} className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   className="accent-pink-600"
//                   checked={filters[group].includes(opt)}
//                   onChange={() => toggleFilter(group, opt)}
//                 />
//                 {opt}
//               </label>
//             ))}
//           </div>
//         )}
//       </div>
//     )}
//   </div>
// );

// export default RefineOptionsPage;

