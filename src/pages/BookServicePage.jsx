// BookServicePage.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";
import { motion as Motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/* --------------------------------------------------------------------
   STATIC OPTIONS — no backend dependency for dropdowns
-------------------------------------------------------------------- */
const STATIC_OPTIONS = {
  property_types: ["a_few_items", "house", "flat", "office"],

  vehicle_types: ["swb_van", "mwb_van", "lwb_van"],
  space_usage_options: [
    "quarter_van",
    "half_van",
    "three_quarter_van",
    "whole_van",
  ],

  house_sizes: ["2_bed", "3_bed", "4_bed", "5_bed", "6_bed"],
  additional_spaces: [
    "shed",
    "loft",
    "basement",
    "single_garage",
    "double_garage",
  ],

  flat_sizes: ["studio", "1_bed", "2_bed", "3_bed", "4_bed"],
  office_sizes: [
    "2_workstations",
    "4_workstations",
    "8_workstations",
    "15_workstations",
    "25_workstations",
  ],

  quantity_options: [
    "some_things",
    "half_contents",
    "three_quarter",
    "everything",
  ],

  parking_options: ["driveway", "allocated_bay", "roadside"],
  parking_distance_options: [
    "less_than_5m",
    "5_to_10m",
    "10_to_15m",
    "15_to_20m",
    "over_20m",
  ],
  external_stairs_options: ["none", "up_to_5_steps", "over_5_steps"],
  internal_access_options: ["stairs_only", "lift_access"],
  floor_level_options: [
    "ground_floor",
    "1st_floor",
    "2nd_floor",
    "3rd_floor",
    "4th_floor",
  ],

  notice_period_options: [
    "flexible",
    "within_3_days",
    "within_week",
    "within_month",
  ],
  move_day_options: ["sun_to_thurs", "fri_sat"],
  collection_time_options: [
    "flexible",
    "9am_to_5pm",
    "four_hour_window",
    "one_hour_window",
  ],
};

const formatOptionLabel = (o) =>
  String(o).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center gap-4 mb-6 overflow-auto">
    {steps.map((s, i) => (
      <div key={s.key} className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold ${
            i === current
              ? "bg-pink-600 text-white"
              : i < current
              ? "bg-pink-100 text-pink-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {i + 1}
        </div>
        <div
          className={`hidden md:block text-sm ${
            i === current ? "text-gray-900 font-semibold" : "text-gray-600"
          }`}
        >
          {s.label}
        </div>
        {i < steps.length - 1 && (
          <div className="w-6 border-t border-gray-200 ml-2 mr-2 hidden md:block" />
        )}
      </div>
    ))}
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, type = "text", placeholder = "", required = false, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={name}
      value={value}
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(name, e.target.value)}
      className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-1 focus:ring-pink-400 focus:border-pink-500 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
    />
  </div>
);

const Textarea = ({ label, name, value, onChange, rows = 4, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      rows={rows}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-1 focus:ring-pink-400 focus:border-pink-500"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options = [], required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="w-full border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-1 focus:ring-pink-400 focus:border-pink-500"
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {formatOptionLabel(o)}
        </option>
      ))}
    </select>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-gray-300"
    />
    <span>{label}</span>
  </label>
);

/* --------------------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------------------- */
export default function BookServicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  useAuthStore();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",

    pickup_address: "",
    pickup_city: "",
    pickup_pincode: "",

    delivery_address: "",
    delivery_city: "",
    delivery_pincode: "",

    delivery_date: "",
    distance_miles: "",
    company_name: "",
    special_instructions: "",

    property_type: "",
    quantity: "",
    house_size: "",
    flat_size: "",
    office_size: "",
    vehicle_type: "",
    space_usage: "",
    additional_spaces: [],

    include_dismantling: true,
    dismantling_items: 0,
    include_reassembly: true,
    reassembly_items: 0,
    include_packing: true,
    packing_volume_m3: "",

    collection_parking: "",
    collection_parking_distance: "",
    collection_external_stairs: "",
    collection_internal_access: "",
    collection_floor_level: "",

    delivery_parking: "",
    delivery_parking_distance: "",
    delivery_external_stairs: "",
    delivery_internal_access: "",
    delivery_floor_level: "",

    notice_period: "",
    move_day: "",
    collection_time: "",
  });

/* --------------------------------------------------------------------
   ⭐ MOVE FIXED — THIS WAS MOVED DOWN HERE
-------------------------------------------------------------------- */
const [currentStep, setCurrentStep] = useState(0);
const [priceResult, setPriceResult] = useState(null);
const [priceSimulated, setPriceSimulated] = useState(false);
const [loadingCalc, setLoadingCalc] = useState(false);
const [loadingSubmit] = useState(false);

const opt = STATIC_OPTIONS;

/* ⭐⭐⭐ ONLY FIX ADDED — moved here, unchanged ⭐⭐⭐ */
useEffect(() => {
  if (!location.state) return;

  const {
    pickupPincode,
    dropoffPincode,
    distanceMiles,
    companyName,
    totalVolume,
    assemblyItems,
  } = location.state;

  if (totalVolume) {
    setForm((prev) => ({ ...prev, packing_volume_m3: totalVolume }));
  }

  if (assemblyItems) {
    setForm((prev) => ({ ...prev, reassembly_items: assemblyItems }));
  }

  if (pickupPincode) {
    setForm((prev) => ({ ...prev, pickup_pincode: pickupPincode }));
  }

  if (dropoffPincode) {
    setForm((prev) => ({ ...prev, delivery_pincode: dropoffPincode }));
  }

  if (distanceMiles) {
    const cleaned = Number(String(distanceMiles).replace(/[^0-9.]/g, ""));
    setForm((prev) => ({ ...prev, distance_miles: cleaned }));
  }

  if (companyName) {
    setForm((prev) => ({ ...prev, company_name: companyName }));
  }
}, [location.state]);
/* ⭐⭐⭐ END ⭐⭐⭐ */

/* ⭐ Prefill both Modal user-details & ComparePage route details */
useEffect(() => {
  try {
    const saved = localStorage.getItem("moveUserDetails");
    if (saved) {
      const u = JSON.parse(saved);
      setForm((prev) => ({
        ...prev,
        full_name: u.name || prev.full_name,
        phone: u.phone || prev.phone,
        email: u.email || prev.email,
        delivery_date: u.moveDate || prev.delivery_date,
      }));
    }

    const nav = location.state || {};

    setForm((prev) => ({
      ...prev,
      pickup_pincode: nav.pickupPincode || prev.pickup_pincode,
      delivery_pincode: nav.dropoffPincode || prev.delivery_pincode,
      distance_miles: nav.distanceMiles || prev.distance_miles,
    }));
  } catch (err) {
    console.error("Error pre-filling form from saved details:", err);
  }
}, [location.state]);

/* --------------------------------------------------------------------
   REST OF FILE (UNCHANGED)
-------------------------------------------------------------------- */

const update = (name, value) => {
  setForm((prev) => ({ ...prev, [name]: value }));
};

const toggleAdditional = (space) => {
  setForm((prev) => {
    const arr = Array.isArray(prev.additional_spaces)
      ? [...prev.additional_spaces]
      : [];
    return {
      ...prev,
      additional_spaces: arr.includes(space)
        ? arr.filter((x) => x !== space)
        : [...arr, space],
    };
  });
};



const buildPayload = (includeSimulate = false) => {
  const base = {
    user_details: {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
    },
    addresses: {
      pickup_address: form.pickup_address,
      pickup_city: form.pickup_city || form.pickup_address,
      pickup_pincode: form.pickup_pincode,

      delivery_address: form.delivery_address,
      delivery_city: form.delivery_city || form.delivery_address,
      delivery_pincode: form.delivery_pincode,
    },
    distance_miles: Number(form.distance_miles || 0),
    delivery_date: form.delivery_date,
    special_instructions: form.special_instructions || "",
    company_name: form.company_name || "",

    pricing_data: {
      property_type: form.property_type,
      house_size: form.house_size || undefined,
      additional_spaces: form.additional_spaces || [],
      quantity: form.quantity || undefined,
      vehicle_type: form.vehicle_type || undefined,
      space_usage: form.space_usage || undefined,
      flat_size: form.flat_size || undefined,
      office_size: form.office_size || undefined,
      include_dismantling: !!form.include_dismantling,
      dismantling_items: Number(form.dismantling_items || 0),
      include_reassembly: !!form.include_reassembly,
      reassembly_items: Number(form.reassembly_items || 0),
      include_packing: !!form.include_packing,
      packing_volume_m3: form.packing_volume_m3
        ? Number(form.packing_volume_m3)
        : undefined,
    },

    collection_assessment: {
      parking: form.collection_parking || undefined,
      parking_distance: form.collection_parking_distance || undefined,
      external_stairs: form.collection_external_stairs || undefined,
      internal_access: form.collection_internal_access || undefined,
      floor_level: form.collection_floor_level || undefined,
    },

    delivery_assessment: {
      parking: form.delivery_parking || undefined,
      parking_distance: form.delivery_parking_distance || undefined,
      external_stairs: form.delivery_external_stairs || undefined,
      internal_access: form.delivery_internal_access || undefined,
      floor_level: form.delivery_floor_level || undefined,
    },

    move_date_data: {
      notice_period: form.notice_period || undefined,
      move_day: form.move_day || undefined,
      collection_time: form.collection_time || undefined,
    },
  };

  if (includeSimulate) base.simulate = true;
  return base;
};

const handleCalculate = async () => {
  if (!form.company_name) {
    toast.error("Please specify company name to calculate price.");
    return;
  }
  if (!form.property_type) {
    toast.error("Please select property type.");
    return;
  }
  if (!form.delivery_date) {
    toast.error("Please select a moving date.");
    return;
  }

  setLoadingCalc(true);
  setPriceResult(null);
  setPriceSimulated(false);

  const payload = buildPayload(true);

  try {
    const res = await api.post(
      "localmoves.api.request_pricing.calculate_detailed_price",
      payload
    );
    const data = res?.data;

    let result = null;
    if (data?.message && typeof data.message === "object") {
      result = data.message.data || data.message;
    } else {
      result = data;
    }

    const priceBreak =
      result?.price_breakdown || result?.calculation || result;

    if (priceBreak) {
      setPriceResult(priceBreak);
      setPriceSimulated(true);
      toast.success("Price simulated — review breakdown on the right.");
      setCurrentStep(6);
    } else {
      toast.info("Server returned no price breakdown; check server logs.");
      setPriceResult(result || { message: "No breakdown returned" });
    }
  } catch (err) {
    console.error("Calculate error:", err);
    const status = err?.response?.status;
    if (status === 417) {
      toast.error(
        "Server rejected calculate request (417). The backend may expect a different format or headers."
      );
    } else {
      toast.error("Failed to calculate price.");
    }
  } finally {
    setLoadingCalc(false);
  }
};



const getTotalFromPriceResult = (pr) => {
  if (!pr) return null;
  if (pr.final_total !== undefined && pr.final_total !== null)
    return pr.final_total;
  if (pr.subtotal !== undefined && pr.subtotal !== null)
    return pr.subtotal;
  if (pr.total !== undefined && pr.total !== null) return pr.total;

  if (pr.price_breakdown) {
    return (
      pr.price_breakdown.final_total ??
      pr.price_breakdown.subtotal ??
      pr.price_breakdown.total
    );
  }

  if (pr.calculation && pr.calculation.final_total)
    return pr.calculation.final_total;

  return null;
};

const formatCurrency = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n)))
    return "-";
  try {
    return Number(n).toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });
  } catch {
    return `£${Number(n).toFixed(2)}`;
  }
};

const steps = [
  { key: "user", label: "Your Details" },
  { key: "pickup", label: "Pickup Address" },
  { key: "delivery", label: "Delivery Address" },
  { key: "property", label: "Property & Items" },
  { key: "move", label: "Move Date" },
  { key: "assess", label: "Accessments" },
  { key: "review", label: "Review" },
];

const renderReviewRow = (label, value) => (
  <div className="flex justify-between py-1 border-b text-sm">
    <span>{label}</span>
    <span className="font-semibold">{value || "-"}</span>
  </div>
);

const totalPrice = getTotalFromPriceResult(priceResult);
const depositAmount = totalPrice ? Number((totalPrice * 0.10).toFixed(2)) : 0;

return (
  <section className="max-w-7xl mx-auto p-6">
    <Motion.h1
      className="text-3xl md:text-4xl text-center font-bold text-pink-600 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Multi-step Move Booking — UK
    </Motion.h1>

    <StepIndicator current={currentStep} steps={steps} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">

        {currentStep === 0 && (
          <Card title="Your Details">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="full_name"
                value={form.full_name}
                onChange={update}
                placeholder="John Doe"
              />
              <Input
                label="Email"
                name="email"
                value={form.email}
                onChange={update}
                placeholder="john@example.com"
              />
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={update}
                placeholder="+44 7123 456789"
              />
            </div>
          </Card>
        )}

        {currentStep === 1 && (
          <Card title="Pickup Address">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Address"
                name="pickup_address"
                value={form.pickup_address}
                onChange={update}
              />
              <Input
                label="City"
                name="pickup_city"
                value={form.pickup_city}
                onChange={update}
              />
              <Input
                label="Postcode"
                name="pickup_pincode"
                value={form.pickup_pincode}
                onChange={update}
              />

              <Select
                label="Parking"
                name="collection_parking"
                value={form.collection_parking}
                onChange={update}
                options={opt.parking_options}
              />
              <Select
                label="Parking Distance"
                name="collection_parking_distance"
                value={form.collection_parking_distance}
                onChange={update}
                options={opt.parking_distance_options}
              />
              <Select
                label="External Stairs"
                name="collection_external_stairs"
                value={form.collection_external_stairs}
                onChange={update}
                options={opt.external_stairs_options}
              />
              <Select
                label="Internal Access"
                name="collection_internal_access"
                value={form.collection_internal_access}
                onChange={update}
                options={opt.internal_access_options}
              />
              <Select
                label="Floor Level"
                name="collection_floor_level"
                value={form.collection_floor_level}
                onChange={update}
                options={opt.floor_level_options}
              />
            </div>
          </Card>
        )}

        {currentStep === 2 && (
          <Card title="Delivery Address">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Address"
                name="delivery_address"
                value={form.delivery_address}
                onChange={update}
              />
              <Input
                label="City"
                name="delivery_city"
                value={form.delivery_city}
                onChange={update}
              />
              <Input
                label="Postcode"
                name="delivery_pincode"
                value={form.delivery_pincode}
                onChange={update}
              />

              <Select
                label="Parking"
                name="delivery_parking"
                value={form.delivery_parking}
                onChange={update}
                options={opt.parking_options}
              />
              <Select
                label="Parking Distance"
                name="delivery_parking_distance"
                value={form.delivery_parking_distance}
                onChange={update}
                options={opt.parking_distance_options}
              />
              <Select
                label="External Stairs"
                name="delivery_external_stairs"
                value={form.delivery_external_stairs}
                onChange={update}
                options={opt.external_stairs_options}
              />
              <Select
                label="Internal Access"
                name="delivery_internal_access"
                value={form.delivery_internal_access}
                onChange={update}
                options={opt.internal_access_options}
              />
              <Select
                label="Floor Level"
                name="delivery_floor_level"
                value={form.delivery_floor_level}
                onChange={update}
                options={opt.floor_level_options}
              />
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <Card title="Property & Items">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Property Type"
                name="property_type"
                value={form.property_type}
                onChange={update}
                options={opt.property_types}
              />

              <Select
                label="Quantity"
                name="quantity"
                value={form.quantity}
                onChange={update}
                options={opt.quantity_options}
              />

              {form.property_type === "house" && (
                <>
                  <Select
                    label="House Size"
                    name="house_size"
                    value={form.house_size}
                    onChange={update}
                    options={opt.house_sizes}
                  />

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm mb-1">
                      Additional Spaces
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {opt.additional_spaces.map((sp) => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => toggleAdditional(sp)}
                          className={`px-3 py-1 rounded-full border text-sm ${
                            form.additional_spaces.includes(sp)
                              ? "bg-pink-600 text-white border-pink-600"
                              : "bg-white"
                          }`}
                        >
                          {formatOptionLabel(sp)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {form.property_type === "flat" && (
                <Select
                  label="Flat Size"
                  name="flat_size"
                  value={form.flat_size}
                  onChange={update}
                  options={opt.flat_sizes}
                />
              )}

              {form.property_type === "office" && (
                <Select
                  label="Office Size"
                  name="office_size"
                  value={form.office_size}
                  onChange={update}
                  options={opt.office_sizes}
                />
              )}

              {form.property_type === "a_few_items" && (
                <>
                  <Select
                    label="Vehicle Type"
                    name="vehicle_type"
                    value={form.vehicle_type}
                    onChange={update}
                    options={opt.vehicle_types}
                  />
                  <Select
                    label="Space Usage"
                    name="space_usage"
                    value={form.space_usage}
                    onChange={update}
                    options={opt.space_usage_options}
                  />
                </>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Checkbox
                  label="Include Dismantling"
                  checked={true}
                  onChange={() => null}

                  disabled={true}
                />

                <Input
                  label="Dismantling Items"
                  type="number"
                  name="dismantling_items"
                  value={form.dismantling_items}
                  onChange={update}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Checkbox
                  label="Include Reassembly"
                  checked={true}
                  onChange={() => null}

                  disabled={true}
                />

                <Input
                  label="Reassembly Items"
                  type="number"
                  name="reassembly_items"
                  value={form.reassembly_items}
                  onChange={update}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Checkbox
                  label="Include Packing"
                  checked={form.include_packing}
                  onChange={(v) => update("include_packing", v)}
                />

                <Input
                  label="Packing Volume (m³)"
                  type="number"
                  name="packing_volume_m3"
                  value={form.packing_volume_m3}
                  onChange={update}
                  required={true}
                  disabled={!!location.state?.totalVolume}
                />
              </div>
            </div>
          </Card>
        )}

        {currentStep === 4 && (
          <Card title="Move Date & Company">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Move Date"
                name="delivery_date"
                type="date"
                value={form.delivery_date}
                onChange={update}
              />
              <Input
                label="Distance (miles)"
                name="distance_miles"
                type="number"
                value={form.distance_miles}
                onChange={update}
              />
              <Input
                label="Company Name"
                name="company_name"
                value={form.company_name}
                onChange={update}
                placeholder="Ali moves"
              />

              <Select
                label="Notice Period"
                name="notice_period"
                value={form.notice_period}
                onChange={update}
                options={opt.notice_period_options}
              />
              <Select
                label="Move Day"
                name="move_day"
                value={form.move_day}
                onChange={update}
                options={opt.move_day_options}
              />
              <Select
                label="Collection Time"
                name="collection_time"
                value={form.collection_time}
                onChange={update}
                options={opt.collection_time_options}
              />

              <Textarea
                label="Special Instructions"
                name="special_instructions"
                value={form.special_instructions}
                onChange={update}
              />
            </div>
          </Card>
        )}

        {currentStep === 5 && (
          <Card title="Access Assessments">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Collection Parking"
                name="collection_parking"
                value={form.collection_parking}
                onChange={update}
                options={opt.parking_options}
              />
              <Select
                label="Collection Distance"
                name="collection_parking_distance"
                value={form.collection_parking_distance}
                onChange={update}
                options={opt.parking_distance_options}
              />
              <Select
                label="Collection External Stairs"
                name="collection_external_stairs"
                value={form.collection_external_stairs}
                onChange={update}
                options={opt.external_stairs_options}
              />
              <Select
                label="Collection Internal Access"
                name="collection_internal_access"
                value={form.collection_internal_access}
                onChange={update}
                options={opt.internal_access_options}
              />
              <Select
                label="Collection Floor Level"
                name="collection_floor_level"
                value={form.collection_floor_level}
                onChange={update}
                options={opt.floor_level_options}
              />

              <Select
                label="Delivery Parking"
                name="delivery_parking"
                value={form.delivery_parking}
                onChange={update}
                options={opt.parking_options}
              />
              <Select
                label="Delivery Distance"
                name="delivery_parking_distance"
                value={form.delivery_parking_distance}
                onChange={update}
                options={opt.parking_distance_options}
              />
              <Select
                label="Delivery External Stairs"
                name="delivery_external_stairs"
                value={form.delivery_external_stairs}
                onChange={update}
                options={opt.external_stairs_options}
              />
              <Select
                label="Delivery Internal Access"
                name="delivery_internal_access"
                value={form.delivery_internal_access}
                onChange={update}
                options={opt.internal_access_options}
              />
              <Select
                label="Delivery Floor Level"
                name="delivery_floor_level"
                value={form.delivery_floor_level}
                onChange={update}
                options={opt.floor_level_options}
              />
            </div>
          </Card>
        )}

        {currentStep === 6 && (
          <Card title="Review Summary">
            {renderReviewRow("Name", form.full_name)}
            {renderReviewRow("Phone", form.phone)}
            {renderReviewRow(
              "Pickup",
              `${form.pickup_address} • ${form.pickup_pincode}`
            )}
            {renderReviewRow(
              "Delivery",
              `${form.delivery_address} • ${form.delivery_pincode}`
            )}
            {renderReviewRow(
              "Property Type",
              formatOptionLabel(form.property_type || "")
            )}
            {renderReviewRow("Move Date", form.delivery_date)}
            {renderReviewRow("Company", form.company_name)}

            <div className="mt-3">
              <div className="text-xs text-gray-500">
                {priceSimulated
                  ? "Price shown is a simulation (preview)."
                  : "No simulation performed yet."}
              </div>
            </div>
          </Card>
        )}

        {/* FINAL BUTTONS */}
        <div className="flex gap-3 mt-4">
          {currentStep > 0 && (
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              Back
            </button>
          )}

          {currentStep < 6 && (
            <button
              className="ml-auto px-5 py-2 rounded bg-pink-600 text-white"
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Next
            </button>
          )}

          {currentStep === 6 && (
            <>
              {!priceSimulated && (
                <button
                  className="px-5 py-2 rounded bg-white border border-pink-600 text-pink-600"
                  onClick={handleCalculate}
                  disabled={loadingCalc}
                >
                  {loadingCalc ? "Simulating..." : "Calculate Price (Preview)"}
                </button>
              )}

              {priceSimulated && (
                <button
                  className="px-5 py-2 rounded bg-pink-600 text-white"
                  onClick={() =>
                    navigate("/payment", {
                      state: {
                        amount: totalPrice,
                        companyName: form.company_name,
                        payload: buildPayload(false),
                      },
                    })
                  }
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? "Submitting..." : "Confirm & Submit"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE SUMMARY */}
      <div className="space-y-6">
        <Card title="Summary">
          <p className="text-sm text-gray-600">
            Fill all steps and calculate price at last step. Use company name
            exactly as registered for best results.
          </p>

          <div className="text-sm text-gray-700 mt-3">
            <div>
              <strong>Company:</strong> {form.company_name || "-"}
            </div>
            <div>
              <strong>From:</strong> {form.pickup_pincode || "-"}
            </div>
            <div>
              <strong>To:</strong> {form.delivery_pincode || "-"}
            </div>
            <div>
              <strong>Move date:</strong> {form.delivery_date || "-"}
            </div>
          </div>
        </Card>

        <Card title="Price Breakdown">
          <div className="mb-4">
            <div className="text-xs text-gray-500">Estimated Total</div>
            <div className="text-2xl md:text-3xl font-bold text-pink-600">
              {totalPrice ? formatCurrency(totalPrice) : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {priceSimulated
                ? "Simulated preview"
                : priceResult
                ? "Latest server response"
                : "No price yet"}
            </div>
          </div>

          {priceResult ? (
            <div className="text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-gray-600">Total volume (m³)</div>
                <div className="text-right font-medium">
                  {priceResult.total_volume_m3 ?? "-"}
                </div>

                <div className="text-gray-600">Distance (miles)</div>
                <div className="text-right font-medium">
                  {priceResult.distance_miles ?? "-"}
                </div>

                <div className="text-gray-600">Loading cost (adjusted)</div>
                <div className="text-right font-medium">
                  {formatCurrency(
                    priceResult.adjusted_loading_cost ??
                      priceResult.loading ??
                      priceResult.breakdown?.loading
                  )}
                </div>

                <div className="text-gray-600">Mileage cost</div>
                <div className="text-right font-medium">
                  {formatCurrency(
                    priceResult.mileage_cost ??
                      priceResult.breakdown?.mileage
                  )}
                </div>

                <div className="text-gray-600">Optional extras</div>
                <div className="text-right font-medium">
                  {formatCurrency(
                    priceResult.optional_extras?.total ??
                      priceResult.optional_extras ??
                      0
                  )}
                </div>

                <div className="text-gray-600">Subtotal</div>
                <div className="text-right font-medium">
                  {formatCurrency(
                    priceResult.subtotal ??
                      priceResult.breakdown?.subtotal ??
                      null
                  )}
                </div>

                <div className="text-gray-600">Move date factor</div>
                <div className="text-right font-medium">
                  {priceResult.move_date_multiplier ?? "-"}
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Final total</div>
                  <div className="text-xl font-bold text-pink-600">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-sm text-pink-700 font-medium">
                  You only need to pay 10% now:
                </p>
                <p className="text-lg font-bold text-pink-600 mt-1">
                  {formatCurrency(depositAmount)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              No price yet. Click "Calculate Price (Preview)" to get a
              breakdown.
            </p>
          )}
        </Card>
      </div>
    </div>
  </section>
);
}
