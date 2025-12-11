import React, { useState, useEffect } from "react";
import { ChevronDown, Route, Phone, Wrench } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
//  Property Type Options
// --------------------------------------------------------------
const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "flat", label: "Flat/Apartment" },
  { value: "bungalow", label: "Bungalow" },
  { value: "town_house", label: "Town House" },
  { value: "office", label: "Office" },
  { value: "a_few_items", label: "Just a Few Items" }
];

// House Sizes
const HOUSE_SIZES = [
  { value: "2_bed", label: "2 Bedroom" },
  { value: "3_bed", label: "3 Bedroom" },
  { value: "4_bed", label: "4 Bedroom" },
  { value: "5_bed", label: "5 Bedroom" },
  { value: "6_bed", label: "6 Bedroom" }
];

// Flat Sizes
const FLAT_SIZES = [
  { value: "studio", label: "Studio" },
  { value: "1_bed", label: "1 Bedroom" },
  { value: "2_bed", label: "2 Bedroom" },
  { value: "3_bed", label: "3 Bedroom" },
  { value: "4_bed", label: "4 Bedroom" }
];

// Office Sizes
const OFFICE_SIZES = [
  { value: "2_workstations", label: "2 Workstations" },
  { value: "4_workstations", label: "4 Workstations" },
  { value: "8_workstations", label: "8 Workstations" },
  { value: "15_workstations", label: "15 Workstations" },
  { value: "25_workstations", label: "25 Workstations" }
];

// Additional Spaces
const ADDITIONAL_SPACES = [
  { value: "shed", label: "Shed" },
  { value: "loft", label: "Loft" },
  { value: "basement", label: "Basement" },
  { value: "single_garage", label: "Single Garage" },
  { value: "double_garage", label: "Double Garage" }
];

// Quantity Options
const QUANTITY_OPTIONS = [
  { value: "some_things", label: "A Few Things" },
  { value: "half_contents", label: "Half Contents" },
  { value: "three_quarter", label: "Three Quarter" },
  { value: "most_things", label: "Most Things" },
  { value: "everything", label: "Everything" }
];

// Parking Options
const PARKING_OPTIONS = [
  { value: "driveway", label: "Driveway" },
  { value: "roadside", label: "Roadside" }
];


// Parking Distance
const PARKING_DISTANCE_OPTIONS = [
  { value: "less_than_10m", label: "Less Than 10m" },
  { value: "10_to_20m", label: "10–20m" },
  { value: "20m_plus", label: "20m+" }
];

// Internal Access Options for Houses/Bungalows/Town Houses
const INTERNAL_ACCESS_HOUSE_OPTIONS = [
  { value: "ground_only", label: "Ground Floor Only" },
  { value: "ground_first", label: "Ground & 1st Floor" },
  { value: "ground_first_second", label: "Ground, 1st & 2nd Floor" }
];

// Internal Access Options for Flats/Office/A Few Items
const INTERNAL_ACCESS_FLAT_OPTIONS = [
  { value: "stairs_only", label: "Stairs Only" },
  { value: "ground_floor", label: "Ground Floor" },
  { value: "first_floor", label: "1st Floor" },
  { value: "second_floor", label: "2nd Floor" },
  { value: "third_floor_plus", label: "3rd Floor+" },
  { value: "lift_access", label: "Lift Access" }
];


// Notice Period
const NOTICE_PERIOD_OPTIONS = [
  { value: "within_3_days", label: "Within 3 days" },
  { value: "within_week", label: "Within 1 week" },
  { value: "within_2_weeks", label: "Within 2 weeks" },
  { value: "within_month", label: "Within 1 month" },
  { value: "over_month", label: "Over 1 month" },
  { value: "flexible", label: "Flexible" }
];

// Move Day Options
const MOVE_DAY_OPTIONS = [
  { value: "sun_to_thurs", label: "Sunday - Thursday" },
  { value: "fri_sat", label: "Friday - Saturday" }
];

// Collection Time Options
const COLLECTION_TIME_OPTIONS = [
  { value: "flexible", label: "Flexible" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "one_hour_window", label: "1-Hour Window" }
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
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(dataWithPincode, null, 2));
    console.log(`✅ Saved to localStorage: ${key} with delivery pincode: ${deliveryPincode}`);
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
    console.log("move_refineData quantity:", storedRefineData?.pricingForm?.quantity);
    console.log("Location state quantity:", state?.quantity);
    
    return {
      storedFormData,
      storedCompareFormData,
      storedRefineData,
      storedCompareData
    };
  };

  const {
    storedFormData,
    storedCompareFormData,
    storedRefineData,
    storedCompareData
  } = loadStoredData();

  // Function to get quantity with proper priority
  const getQuantityFromSources = () => {
    // Priority order: location state > refine data > compare form data > form data > compare data search > default
    const sources = [
      { source: "location state", value: state?.quantity },
      { source: "refine data", value: storedRefineData?.pricingForm?.quantity },
      { source: "compare form data", value: storedCompareFormData?.quantity },
      { source: "form data", value: storedFormData?.quantity },
      { source: "compare data search", value: storedCompareData?.search_parameters?.quantity },
      { source: "default", value: "everything" }
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
      { source: "refine data", value: storedRefineData?.pricingForm?.property_type },
      { source: "compare form data", value: storedCompareFormData?.serviceType },
      { source: "form data", value: storedFormData?.serviceType },
      { source: "compare data search", value: storedCompareData?.search_parameters?.property_type },
      { source: "default", value: "house" }
    ];
    
    for (const source of sources) {
      if (source.value) {
        return source.value;
      }
    }
    
    return "house";
  };

  // Function to get property size with proper priority
  const getPropertySizeFromSources = () => {
    const sources = [
      { source: "location state", value: state?.propertySize },
      { source: "refine data", value: storedRefineData?.pricingForm?.house_size },
      { source: "compare form data", value: storedCompareFormData?.propertySize },
      { source: "form data", value: storedFormData?.propertySize },
      { source: "compare data search", value: storedCompareData?.search_parameters?.property_size },
      { source: "default", value: "3_bed" }
    ];
    
    for (const source of sources) {
      if (source.value) {
        return source.value;
      }
    }
    
    return "3_bed";
  };

  // Function to get additional spaces with proper priority
  const getAdditionalSpacesFromSources = () => {
    const sources = [
      { source: "location state", value: state?.additionalSpaces },
      { source: "refine data", value: storedRefineData?.pricingForm?.additional_spaces },
      { source: "compare form data", value: storedCompareFormData?.additionalSpaces },
      { source: "form data", value: storedFormData?.additionalSpaces },
      { source: "compare data search", value: storedCompareData?.search_parameters?.additional_spaces },
      { source: "default", value: [] }
    ];
    
    for (const source of sources) {
      if (source.value && Array.isArray(source.value) && source.value.length > 0) {
        return source.value;
      }
    }
    
    return [];
  };

  // Merge all stored data (priority: state > refineData > compareFormData > formData)
  const mergedFormData = {
    ...storedFormData,
    ...storedCompareFormData,
    ...(storedRefineData?.pricingForm || {}),
    ...(storedCompareData?.search_parameters || {})
  };

  // Get providers from state or localStorage
  const providers = state?.providers || storedCompareData?.providers || [];
  const providersCount = providers.length;

  // Get coordinates from state or localStorage
  const pickupCoords = state?.pickupCoords || storedCompareData?.pickupCoords || null;
  const dropoffCoords = state?.dropoffCoords || storedCompareData?.dropoffCoords || null;
  const routeGeometry = state?.routeGeometry || storedCompareData?.routeGeometry || null;

  // Get pincodes from state or localStorage
  const pickupPincode = state?.pickupPincode || storedCompareData?.pickupPincode || storedFormData?.pickupPincode || "";
  const dropoffPincode = state?.dropoffPincode || storedCompareData?.destinationPincode || storedFormData?.dropoffPincode || "";

  // Get location names from state or localStorage
  const pickup = state?.pickup || storedFormData?.pickup || "";
  const dropoff = state?.dropoff || storedFormData?.dropoff || "";

  // Get distances from state or localStorage
  const distanceMiles = state?.distanceMiles || storedFormData?.distanceMiles || storedCompareFormData?.distanceMiles || null;
  const distanceKm = state?.distanceKm || storedFormData?.distanceKm || storedCompareFormData?.distanceKm || null;

  const [open, setOpen] = useState({
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

    // Delivery Assessment - default values
    delivery_parking: "",
    delivery_parking_distance: "",
    delivery_internal_access: "",
    delivery_flat_internal_access: "",

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
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem("move_refineData", JSON.stringify(refineData));
    } catch (error) {
      console.error("Error saving refine data to localStorage:", error);
    }
  }, [pricingForm, itemQuantities, dismantleItems, reassembleItems, filters, open, pickupPincode, dropoffPincode, pickup, dropoff, distanceMiles, distanceKm]);

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
        ? prev.additional_spaces.filter(s => s !== space)
        : [...prev.additional_spaces, space],
    }));
  };

  // Toggle dismantle status for an item
  const toggleDismantleItem = (itemName) => {
    setDismantleItems((prev) => {
      const newState = {
        ...prev,
        [itemName]: !prev[itemName]
      };

      // Count how many items are marked for dismantling
      const dismantleCount = Object.values(newState).filter(v => v).length;

      // Update the dismantling service toggle and count
      setPricingForm((prevForm) => ({
        ...prevForm,
        include_dismantling: dismantleCount > 0,
        dismantling_items: dismantleCount,
      }));

      // If dismantling is unchecked, also uncheck reassembly for the same item
      if (!newState[itemName] && reassembleItems[itemName]) {
        setReassembleItems(prev => {
          const newReassemble = { ...prev };
          delete newReassemble[itemName];
          
          // Update reassembly count
          const reassembleCount = Object.values(newReassemble).filter(v => v).length;
          setPricingForm(prevForm => ({
            ...prevForm,
            include_reassembly: reassembleCount > 0,
            reassembly_items: reassembleCount
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
        [itemName]: !prev[itemName]
      };

      // Count how many items are marked for reassembly
      const reassembleCount = Object.values(newState).filter(v => v).length;

      // Update the reassembly service toggle and count
      setPricingForm((prevForm) => ({
        ...prevForm,
        include_reassembly: reassembleCount > 0,
        reassembly_items: reassembleCount
      }));

      // If reassembly is checked, automatically check dismantling for the same item
      if (newState[itemName] && !dismantleItems[itemName]) {
        setDismantleItems(prev => {
          const newDismantle = { ...prev, [itemName]: true };
          
          // Update dismantling count
          const dismantleCount = Object.values(newDismantle).filter(v => v).length;
          setPricingForm(prevForm => ({
            ...prevForm,
            include_dismantling: dismantleCount > 0,
            dismantling_items: dismantleCount
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
      if (newQty > 0 && !exists) return { ...prev, items: [...prev.items, key] };
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
      }
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
    switch(pricingForm.property_type) {
      case 'flat': return 'flat_size';
      case 'office': return 'office_size';
      case 'bungalow': return 'bungalow_size';
      case 'town_house': return 'town_house_size';
      case 'a_few_items': return null;
      default: return 'house_size';
    }
  };

  // Send pricing request to backend
  const applyFilters = async () => {
    setIsLoadingCosts(true);
    setApiError(null);

    // Calculate volumes
    const totalVolume = calculateTotalVolume();
    const dismantlingVolume = calculateDismantlingVolume();
    const reassemblyVolume = calculateReassemblyVolume();

    // Get the correct size field
    const sizeField = getPropertySizeField();

    // IMPORTANT: Use packing volume from form or default to total volume if packing is enabled
   let packingVolume = "";

if (pricingForm.include_packing) {
  packingVolume = pricingForm.packing_volume_m3
    ? pricingForm.packing_volume_m3
    : totalVolume; // Auto-calc only if user didn’t type it
}


    // Prepare payload matching the API structure exactly.
const pricingPayload = {
  pincode: pickupPincode || "",

  property_type: pricingForm.property_type || "",
  ...(sizeField && { property_size: pricingForm[sizeField] || "" }),

  vehicle_type: null,
  space_usage: null,

  quantity: pricingForm.quantity || "",
  additional_spaces: pricingForm.additional_spaces || [],

  selected_items: itemQuantities || {},
  dismantle_items: dismantleItems || {},
  reassemble_items: reassembleItems || {},

  distance_miles: distanceMiles || null,

  pickup_address: pricingForm.pickup_address || "",
  pickup_city: pricingForm.pickup_city || "",
  delivery_address: pricingForm.delivery_address || "",
  delivery_city: pricingForm.delivery_city || "",

  include_packing: pricingForm.include_packing || false,
packing_volume_m3: pricingForm.include_packing
  ? (pricingForm.packing_volume_m3 !== "" ? Number(pricingForm.packing_volume_m3) : totalVolume)
  : null,

include_dismantling: pricingForm.include_dismantling || false,
dismantling_volume_m3: pricingForm.include_dismantling
  ? (dismantlingVolume || 0)
  : null,

include_reassembly: pricingForm.include_reassembly || false,
reassembly_volume_m3: pricingForm.include_reassembly
  ? (reassemblyVolume || 0)
  : null,


  // IMPORTANT: No default values – send ONLY user selections
  collection_parking_distance: pricingForm.collection_parking_distance || "",
  collection_internal_access: ["flat", "office", "a_few_items"].includes(pricingForm.property_type)
    ? (pricingForm.collection_flat_internal_access || "")
    : (pricingForm.collection_internal_access || ""),

  delivery_parking_distance: pricingForm.delivery_parking_distance || "",
  delivery_internal_access: ["flat", "office", "a_few_items"].includes(pricingForm.property_type)
    ? (pricingForm.delivery_flat_internal_access || "")
    : (pricingForm.delivery_internal_access || ""),

  notice_period: pricingForm.notice_period || "",
  move_day: pricingForm.move_day || "",
  collection_time: pricingForm.collection_time || "",

  user_email: pricingForm.user_details.email || "",
  send_email: false,
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
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      console.log("=== DEBUG: API RESPONSE ===");
      console.log("Response status:", response.status);

      const apiResponse = response?.data?.message;

      if (apiResponse?.success) {
        console.log("Companies found:", apiResponse.count);

        // ⭐ SAVE THE EXACT API RESPONSE TO LOCALSTORAGE WITH DELIVERY PINCODE
        // Pass delivery pincode as third parameter
        saveToLocalStorage('BookServiceResponse', response.data.message, dropoffPincode);

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

            companiesWithPricing: apiResponse.data?.map(company => ({
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
              original_company_object: company
            })) || [],
          },
        });
      } else {
        console.error("API returned unsuccessful:", apiResponse);
        
        // ⭐ SAVE ERROR RESPONSE TO LOCALSTORAGE WITH DELIVERY PINCODE
        saveToLocalStorage('BookServiceResponse', 
          response.data.message || { 
            success: false, 
            error: "API returned unsuccessful" 
          }, 
          dropoffPincode
        );
        
        setApiError(
  typeof apiResponse?.message === "string"
    ? apiResponse.message
    : JSON.stringify(apiResponse?.message || "Search and pricing calculation failed")
);
      }
    } catch (err) {
      console.error("=== DEBUG: API ERROR ===");
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);

      // Try to extract error message from response
      let errorMessage = "Failed to search companies with pricing. Please check your network connection.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.exception) {
        errorMessage = err.response.data.exception;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // ⭐ SAVE ERROR TO LOCALSTORAGE WITH DELIVERY PINCODE
      saveToLocalStorage('BookServiceResponse', { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString() 
      }, dropoffPincode);

      setApiError(errorMessage);
    } finally {
      setIsLoadingCosts(false);
    }
  };

  // Get size options based on property type
  const getSizeOptions = () => {
    switch (pricingForm.property_type) {
      case "flat":
        return FLAT_SIZES;
      case "office":
        return OFFICE_SIZES;
      case "bungalow":
      case "town_house":
      case "a_few_items":
        return HOUSE_SIZES.slice(0, 3);
      default:
        return HOUSE_SIZES;
    }
  };

  // Get internal access options based on property type
  const getInternalAccessOptions = (isCollection = true) => {
    const propertyType = pricingForm.property_type;
    const field = isCollection ? "collection_internal_access" : "delivery_internal_access";
    const flatField = isCollection ? "collection_flat_internal_access" : "delivery_flat_internal_access";

    if (["flat", "office", "a_few_items"].includes(propertyType)) {
      return {
        options: INTERNAL_ACCESS_FLAT_OPTIONS,
        value: pricingForm[flatField] || "",
        onChange: (value) => updatePricingForm(flatField, value)
      };
    } else {
      return {
        options: INTERNAL_ACCESS_HOUSE_OPTIONS,
        value: pricingForm[field] || "",
        onChange: (value) => updatePricingForm(field, value)
      };
    }
  };

  const sizeOptions = getSizeOptions();
  const collectionInternalAccess = getInternalAccessOptions(true);
  const deliveryInternalAccess = getInternalAccessOptions(false);

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
                            onChange={(e) => updatePricingForm("pickup_address", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter city"
                            value={pricingForm.pickup_city}
                            onChange={(e) => updatePricingForm("pickup_city", e.target.value)}
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
                            onChange={(e) => updatePricingForm("delivery_address", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter city"
                            value={pricingForm.delivery_city}
                            onChange={(e) => updatePricingForm("delivery_city", e.target.value)}
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
                  <div className="space-y-4" style={{ display: 'none' }}>
                    {/* Property Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={pricingForm.property_type}
                        onChange={(e) => updatePricingForm("property_type", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Choose property type</option>
                        {PROPERTY_TYPES.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size */}
                    {sizeOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Size
                        </label>
                        <select
                          value={pricingForm.house_size}
                          onChange={(e) => updatePricingForm("house_size", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Choose size</option>
                          {sizeOptions.map(option => (
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
                        {ADDITIONAL_SPACES.map(space => (
                          <label key={space.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pricingForm.additional_spaces.includes(space.value)}
                              onChange={() => toggleAdditionalSpace(space.value)}
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
                        onChange={(e) => updatePricingForm("quantity", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Choose quantity</option>
                        {QUANTITY_OPTIONS.map(option => (
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
                    <select
                      value={pricingForm.collection_parking}
                      onChange={(e) => updatePricingForm("collection_parking", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose Parking </option>
                      {PARKING_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Distance
                    </label>
                    <select
                      value={pricingForm.collection_parking_distance}
                      onChange={(e) => updatePricingForm("collection_parking_distance", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose Parking Distance</option>
                      {PARKING_DISTANCE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Access
                    </label>
                    <select
                      value={collectionInternalAccess.value}
                      onChange={(e) => collectionInternalAccess.onChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose internal access</option>
                      {collectionInternalAccess.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                      Parking
                    </label>
                    <select
                      value={pricingForm.delivery_parking}
                      onChange={(e) => updatePricingForm("delivery_parking", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose Parking </option>
                      {PARKING_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Distance (Vehicle To Property Entrance)
                    </label>
                    <select
                      value={pricingForm.delivery_parking_distance}
                      onChange={(e) => updatePricingForm("delivery_parking_distance", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose parking distance</option>
                      {PARKING_DISTANCE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Access
                    </label>
                    <select
                      value={deliveryInternalAccess.value}
                      onChange={(e) => deliveryInternalAccess.onChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose internal access</option>
                      {deliveryInternalAccess.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notice Period
                    </label>
                    <select
                      value={pricingForm.notice_period}
                      onChange={(e) => updatePricingForm("notice_period", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose notice period</option>
                      {NOTICE_PERIOD_OPTIONS.map(option => (
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
                      onChange={(e) => updatePricingForm("move_day", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose move day</option>
                      {MOVE_DAY_OPTIONS.map(option => (
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
                      onChange={(e) => updatePricingForm("collection_time", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Choose collection time</option>
                      {COLLECTION_TIME_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              }
            />

            {/* Items - grouped categories with quantities, DISMANTLE and REASSEMBLY CHECKMARKS */}
            <div className="px-6 pt-5 pb-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-pink-600 font-semibold text-sm mb-1">
                    What do you need help moving?
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Set quantities for each item and mark which need dismantling/reassembly.
                  </p>
                </div>
                {/* Dismantling/Reassembly Legend */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full">
                    <Wrench className="h-3 w-3 text-pink-600" />
                    <span className="text-[10px] font-medium text-pink-700">
                      {Object.values(dismantleItems).filter(v => v).length} dismantle
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <svg className="h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                    </svg>
                    <span className="text-[10px] font-medium text-blue-700">
                      {Object.values(reassembleItems).filter(v => v).length} reassemble
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.keys(INVENTORY_BY_CATEGORY).map((category) => (
                  <div key={category} className="border rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="px-4 py-3 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-800">{category}</span>
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
                            const qty = itemQuantities[key] || 0; // Will be 0 initially
                            const needsDismantle = dismantleItems[key] || false; // Will be false initially
                            const needsReassemble = reassembleItems[key] || false; // Will be false initially
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
                                    <span className={`text-[13px] font-medium block ${
                                      isActive ? "text-pink-700" : "text-gray-700"
                                    }`}>
                                      {item.item_name}
                                    </span>
                                  </div>

                                  {/* Checkboxes Container */}
                                  <div className="flex flex-col items-end gap-1.5">
                                    {/* Dismantle Checkbox */}
                                    <label className={`flex items-center gap-1.5 cursor-pointer ${qty === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={needsDismantle}
                                          onChange={() => toggleDismantleItem(key)}
                                          disabled={qty === 0}
                                          className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                                          needsDismantle 
                                            ? "bg-pink-600 border-pink-600" 
                                            : "border-gray-300 bg-white"
                                        } ${qty > 0 ? "hover:border-pink-400" : ""}`}>
                                          {needsDismantle && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <span className={`text-[10px] font-medium ${
                                        needsDismantle ? "text-pink-700" : "text-gray-600"
                                      }`}>
                                        Dismantle
                                      </span>
                                    </label>

                                    {/* Reassemble Checkbox */}
                                    <label className={`flex items-center gap-1.5 cursor-pointer ${qty === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={needsReassemble}
                                          onChange={() => toggleReassembleItem(key)}
                                          disabled={qty === 0}
                                          className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                                          needsReassemble 
                                            ? "bg-blue-600 border-blue-600" 
                                            : "border-gray-300 bg-white"
                                        } ${qty > 0 ? "hover:border-blue-400" : ""}`}>
                                          {needsReassemble && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <span className={`text-[10px] font-medium ${
                                        needsReassemble ? "text-blue-700" : "text-gray-600"
                                      }`}>
                                        Reassemble
                                      </span>
                                    </label>
                                  </div>
                                </div>

                                {/* Quantity Controls - Improved Responsiveness */}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex-1">
                                    <span className="text-[11px] text-gray-600">Quantity:</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm transition ${
                                        qty > 0 
                                          ? "border-pink-300 text-pink-700 hover:bg-pink-100" 
                                          : "border-gray-300 text-gray-400 hover:bg-gray-100"
                                      }`}
                                      onClick={() => updateItemQuantity(key, qty - 1)}
                                      aria-label={`Decrease ${item.item_name}`}
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={qty}
                                      onChange={(e) => updateItemQuantity(key, e.target.value)}
                                      className={`w-14 h-8 text-sm border rounded text-center font-medium ${
                                        qty > 0 
                                          ? "border-pink-300 text-pink-700" 
                                          : "border-gray-300 text-gray-700"
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      className="w-8 h-8 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-100 flex items-center justify-center text-sm transition"
                                      onClick={() => updateItemQuantity(key, qty + 1)}
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
              {isLoadingCosts ? "Searching Companies..." : "Search Companies with Pricing"}
            </button>

            {apiError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-[11px] text-red-600 font-medium">API Error:</p>
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
                <p className="text-xs text-pink-200 opacity-90">UK-Wide Moving Services</p>
              </div>
            </div>

            {/* PROFESSIONAL UK-STYLE CALL BUTTON */}
            <button
              onClick={() => navigate("/book-call", {
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
                  totalVolume: calculateTotalVolume()
                }
              })}
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
                    <span className="text-sm text-gray-700">Route Distance:</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-pink-600">{distanceMiles} miles</div>
                    <div className="text-xs text-gray-500">({distanceKm} km)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAP CONTAINER */}
          <div style={{ height: "520px" }} className="relative bg-gray-50">
            <iframe
              title="Route Map"
              srcDoc={generateCustomMap(pickupCoords, dropoffCoords, routeGeometry)}
              className="w-full h-full border-0"
            ></iframe>
          </div>

          {/* PROFESSIONAL UK SUPPORT FOOTER */}
          <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-pink-50 to-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Need Help With Your UK Move?</h4>
                  <p className="text-xs text-gray-600">Our UK-based team is here to help</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/book-call", {
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
                    totalVolume: calculateTotalVolume()
                  }
                })}
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
  customContent
}) => (
  <div className="border-b border-gray-100">
    <button
      className="w-full flex items-center justify-between px-6 py-3 font-semibold text-sm text-gray-800 hover:bg-pink-50 transition"
      onClick={onToggle}
      type="button"
    >
      <span>{title}</span>
      <ChevronDown className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`} />
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