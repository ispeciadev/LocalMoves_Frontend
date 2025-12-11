// src/pages/BookServicePage.jsx
// src/pages/BookServicePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Home,
  PoundSterling,
  User,
  Phone,
  Mail,
  Building,
  CreditCard,
  HelpCircle,
  Truck,
  Package,
  Wrench,
  Box,
} from "lucide-react";

export default function BookServicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [storedResponse, setStoredResponse] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [priceResult, setPriceResult] = useState(null);
  const [priceSimulated, setPriceSimulated] = useState(false);

  // User details - only these come from user input or API
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // Move details extracted from localStorage API response
  const [moveDetails, setMoveDetails] = useState({
    totalVolume: 0,
    distanceMiles: 0,
    property_type: "",
    property_size: "",
    move_day: "",
    finalTotal: 0,
    pickup_address: "",
    pickup_city: "",
    pickupPincode: "",
    delivery_address: "",
    delivery_city: "",
    dropoffPincode: "", // This is what we need to fix
    quantity: "everything",
    additional_spaces: [],
    selected_items: {},
    dismantle_items: {},
    collection_parking_distance: "less_than_5m",
    collection_internal_access: "ground_first",
    delivery_parking_distance: "less_than_5m",
    delivery_internal_access: "ground_first",
    notice_period: "flexible",
    collection_time: "flexible",
  });

  // Initialize - Load data from localStorage
  useEffect(() => {
    const init = async () => {
      try {
        // 1) Load API response from localStorage
        const storedKey = localStorage.getItem("BookServiceResponse") ? "BookServiceResponse" : "filteredProvidersResponse";
        const apiResponse = JSON.parse(localStorage.getItem(storedKey));
        
        console.log("📦 Loading localStorage data:", {
          storedKey,
          hasData: !!apiResponse,
          apiResponseKeys: apiResponse ? Object.keys(apiResponse) : [],
          deliveryPincodeInResponse: apiResponse?.deliveryPincode,
          pickupPincodeInResponse: apiResponse?.pickupPincode,
          searchParameters: apiResponse?.search_parameters
        });
        
        if (apiResponse) {
          setStoredResponse(apiResponse);
          
          // 2) Find selected company by name from navigation state
          let company = null;
          if (state?.company_name) {
            company = apiResponse.data?.find(
              (c) => c.name === state.company_name || c.company_name === state.company_name
            );
          }
          
          // Fallback to first company
          if (!company && apiResponse.data?.length > 0) {
            company = apiResponse.data[0];
          }
          
          if (company) {
            setSelectedCompany(company);
            
            // 3) Extract data from company's exact_pricing
            const exactPricing = company.exact_pricing || {};
            const autoVolumes = exactPricing.auto_calculated_volumes || {};
            
            // 4) Extract search_parameters from API response
            const searchParams = apiResponse.search_parameters || {};
            const moveDate = searchParams.move_date || {};
            const optionalExtras = searchParams.optional_extras || {};
            const itemDetails = searchParams.item_details || [];
            
            // 5) Convert item_details array to selected_items object
            const selected_items = {};
            itemDetails.forEach(item => {
              if (item.item_name && item.quantity) {
                selected_items[item.item_name] = item.quantity;
              }
            });
            
            // 6) Get the delivery pincode - THIS IS THE FIX
            // Check multiple possible locations for the delivery pincode
            const deliveryPincode = 
              apiResponse.deliveryPincode || // From our saveToLocalStorage function
              searchParams.delivery_pincode || // From API search_parameters
              searchParams.delivery_pincode || // Alternative spelling
              state?.dropoffPincode || // From navigation state
              "";
              
            // Get pickup pincode from multiple possible locations
            const pickupPincode = 
              apiResponse.pickupPincode || // From our saveToLocalStorage function
              searchParams.pincode || // From API search_parameters
              searchParams.pickup_pincode || // Alternative
              state?.pickupPincode || // From navigation state
              "";
            
            console.log("📍 Pincode debugging:", {
              apiResponseDeliveryPincode: apiResponse.deliveryPincode,
              searchParamsDeliveryPincode: searchParams.delivery_pincode,
              stateDropoffPincode: state?.dropoffPincode,
              finalDeliveryPincode: deliveryPincode,
              pickupPincode
            });
            
            // 7) Set all move details from API response with proper fallbacks
            setMoveDetails({
              totalVolume: exactPricing.total_volume_m3 || parseFloat(searchParams.total_volume_m3) || 0,
              distanceMiles: exactPricing.distance_miles || parseFloat(searchParams.distance_miles) || 0,
              property_type: searchParams.property_type || "house",
              property_size: searchParams.property_size || "",
              move_day: moveDate.move_day || "flexible",
              finalTotal: exactPricing.final_total || 0,
              
              // Addresses from search_parameters with fallbacks
              pickup_address: searchParams.pickup_address || state?.pickup_address || "",
              pickup_city: searchParams.pickup_city || state?.pickup_city || "",
              pickupPincode: pickupPincode,
              delivery_address: searchParams.delivery_address || state?.delivery_address || "",
              delivery_city: searchParams.delivery_city || state?.delivery_city || "",
              dropoffPincode: deliveryPincode, // This is now properly set
              
              // Pricing data
              quantity: searchParams.quantity || "everything",
              additional_spaces: searchParams.additional_spaces || [],
              
              // Items - converted from array to object
              selected_items: selected_items,
              dismantle_items: {}, // Default empty - will be filled by user if needed
              
              // Assessments - default values since API doesn't provide these
              collection_parking_distance: state?.collection_parking_distance || "less_than_5m",
              collection_internal_access: state?.collection_internal_access || "ground_first",
              delivery_parking_distance: state?.delivery_parking_distance || "less_than_5m",
              delivery_internal_access: state?.delivery_internal_access || "ground_first",
              
              // Date data
              notice_period: moveDate.notice_period || state?.notice_period || "flexible",
              collection_time: moveDate.collection_time || state?.collection_time || "flexible",
            });
          }
        }

        // 8) Load user details - try API first
        try {
          const uRes = await axios.get(
            "http://127.0.0.1:8000/api/method/localmoves.api.auth.get_current_user_info"
          );
          if (uRes?.data?.message?.data) {
            const ud = uRes.data.message.data;
            setUserDetails({
              full_name: ud.full_name || "",
              email: ud.email || "",
              phone: ud.phone || "",
            });
          }
        } catch (e) {
          console.info("Could not fetch current user (non-fatal)");
        }

        // 9) Fallback to localStorage for user details
        const savedUser = JSON.parse(localStorage.getItem("moveUserDetails"));
        if (savedUser) {
          setUserDetails((prev) => ({
            full_name: prev.full_name || savedUser.name || savedUser.full_name || "",
            email: prev.email || savedUser.email || "",
            phone: prev.phone || savedUser.phone || "",
          }));
        }

        // 10) Restore user details from navigation state
if (state?.full_name || state?.email || state?.phone) {
  setUserDetails(prev => ({
    full_name: state.full_name || prev.full_name,
    email: state.email || prev.email,
    phone: state.phone || prev.phone,
  }));
}


        // 10) Override with navigation state if provided
        if (state) {
          // if (state.full_name) setUserDetails(prev => ({ ...prev, full_name: state.full_name }));
          // if (state.email) setUserDetails(prev => ({ ...prev, email: state.email }));
          // if (state.phone) setUserDetails(prev => ({ ...prev, phone: state.phone }));
          
          // Also check if state has pincode data
          if (state.dropoffPincode && !moveDetails.dropoffPincode) {
            setMoveDetails(prev => ({ ...prev, dropoffPincode: state.dropoffPincode }));
          }
          if (state.pickupPincode && !moveDetails.pickupPincode) {
            setMoveDetails(prev => ({ ...prev, pickupPincode: state.pickupPincode }));
          }
        }
      } catch (err) {
        console.error("Init error:", err);
      }
    };

    init();
  }, [state]);

  // The rest of your component remains the same...
  // Helper functions, buildPayload, handleCalculate, handleSubmit, etc.
  // Helper functions
  const safeNumber = (v) => {
    if (v === null || v === undefined || v === "") return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const getActualDeliveryDate = (moveDayPreference) => {
    if (!moveDayPreference) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(moveDayPreference)) return moveDayPreference;

    const today = new Date();
    let target = new Date();

    switch (moveDayPreference) {
      case "within_3_days":
        target.setDate(today.getDate() + 3);
        break;
      case "within_week":
        target.setDate(today.getDate() + 7);
        break;
      case "within_month":
        target.setMonth(today.getMonth() + 1);
        break;
      case "sun_to_thurs":
        const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
        target.setDate(today.getDate() + daysUntilSunday);
        break;
      case "fri_sat":
        const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
        target.setDate(today.getDate() + daysUntilFriday);
        break;
      default:
        target.setDate(today.getDate() + 7);
    }

    return target.toISOString().split("T")[0];
  };

  // Build payload matching exact API structure
  const buildPayload = (overrides = {}) => {
    if (!selectedCompany) {
      console.error("No selected company available");
      return null;
    }

    const exactPricing = selectedCompany.exact_pricing || {};
    const autoVolumes = exactPricing.auto_calculated_volumes || {};

    // Use priceResult if verified, otherwise use exactPricing
    const finalPricing = priceResult || exactPricing;

    const transaction_ref = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get the search parameters for item conversion
    const searchParams = storedResponse?.search_parameters || {};
    const itemDetails = searchParams.item_details || [];
    
    // Convert item_details array to selected_items object
    const selected_items = {};
    const dismantle_items = {};
    
    itemDetails.forEach(item => {
      if (item.item_name && item.quantity) {
        selected_items[item.item_name] = item.quantity;
        // Default dismantle_items to false for all items
        dismantle_items[item.item_name] = false;
      }
    });

    const payload = {
      user_details: {
        full_name: userDetails.full_name || "",
        email: userDetails.email || "",
        phone: userDetails.phone || "",
      },

      addresses: {
        pickup_address: moveDetails.pickup_address || "",
        pickup_city: moveDetails.pickup_city || "",
        pickup_pincode: moveDetails.pickupPincode || "",
        delivery_address: moveDetails.delivery_address || "",
        delivery_city: moveDetails.delivery_city || "",
        delivery_pincode: moveDetails.dropoffPincode || "",
      },

      company_name: selectedCompany.name || selectedCompany.company_name || "",

      delivery_date: getActualDeliveryDate(moveDetails.move_day),
      special_instructions: "",
      distance_miles: safeNumber(moveDetails.distanceMiles),

      pricing_data: {
        property_type: moveDetails.property_type || "house",
        house_size: moveDetails.property_size || "",
        quantity: moveDetails.quantity || "everything",
        additional_spaces: moveDetails.additional_spaces || [],
        include_packing: true,
        packing_volume_m3: safeNumber(autoVolumes.packing_volume_m3 || moveDetails.totalVolume),
        include_dismantling: true,
        dismantling_volume_m3: safeNumber(autoVolumes.dismantling_volume_m3 || 0),
        include_reassembly: true,
        reassembly_volume_m3: safeNumber(autoVolumes.reassembly_volume_m3 || 0),
      },

      // Use the converted items
      selected_items: Object.keys(selected_items).length > 0 ? selected_items : moveDetails.selected_items,
      dismantle_items: Object.keys(dismantle_items).length > 0 ? dismantle_items : moveDetails.dismantle_items,

      collection_assessment: {
        parking_distance: moveDetails.collection_parking_distance || "less_than_5m",
        internal_access: moveDetails.collection_internal_access || "ground_first",
      },

      delivery_assessment: {
        parking_distance: moveDetails.delivery_parking_distance || "less_than_5m",
        internal_access: moveDetails.delivery_internal_access || "ground_first",
      },

      move_date_data: {
        notice_period: moveDetails.notice_period || "flexible",
        move_day: moveDetails.move_day || "flexible",
        collection_time: moveDetails.collection_time || "flexible",
      },

      payment_method: "PayPal", // Changed from Stripe to PayPal
      process_deposit: true,
      transaction_ref,
      payment_gateway_response: overrides.payment_gateway_response || {},

      price_breakdown: {
        total_volume_m3: safeNumber(finalPricing.total_volume_m3 || moveDetails.totalVolume),
        distance_miles: safeNumber(finalPricing.distance_miles || moveDetails.distanceMiles),
        collection_multiplier: finalPricing.collection_multiplier || 1,
        delivery_multiplier: finalPricing.delivery_multiplier || 1,
        combined_property_multiplier: finalPricing.combined_property_multiplier || 1,
        loading_cost: safeNumber(finalPricing.loading_cost || 0),
        adjusted_loading_cost: safeNumber(finalPricing.adjusted_loading_cost || finalPricing.loading_cost || 0),
        mileage_cost: safeNumber(finalPricing.mileage_cost || 0),
        subtotal_before_date: safeNumber(finalPricing.subtotal_before_date || 0),
        move_date_multiplier: finalPricing.move_date_multiplier || 1,
        date_adjustment: safeNumber(finalPricing.date_adjustment || 0),
        final_total: safeNumber(finalPricing.final_total || moveDetails.finalTotal),
        optional_extras: finalPricing.optional_extras || {},
        breakdown: finalPricing.breakdown || {},
        multipliers: finalPricing.multipliers || {},
      },

      request_type: "full_move",
      booking_status: "pending_payment",
      deposit_amount: (safeNumber(finalPricing.final_total || moveDetails.finalTotal) * 0.1).toFixed(2),
      total_amount: safeNumber(finalPricing.final_total || moveDetails.finalTotal),
      payment_status: "pending",
      source: "web_booking",
      date_preference: moveDetails.move_day || "flexible",
      actual_delivery_date: getActualDeliveryDate(moveDetails.move_day),

      ...overrides,
    };

    return payload;
  };

  // Price verification
  const handleCalculate = async () => {
    if (!selectedCompany) {
      toast.error("Please select a provider/company before verifying price.");
      return;
    }

    setLoadingCalc(true);
    setPriceResult(null);
    setPriceSimulated(false);

    const payload = buildPayload({ simulate: true });
    if (!payload) {
      toast.error("Failed to build pricing request.");
      setLoadingCalc(false);
      return;
    }

    try {
      const url = "http://127.0.0.1:8000/api/method/localmoves.api.request_pricing.calculate_detailed_price";
      const res = await axios.post(url, payload);
      const data = res?.data;

      let result = null;
      if (data?.message && typeof data.message === "object") {
        result = data.message.data || data.message;
      } else {
        result = data;
      }

      const priceBreak = result?.price_breakdown || result?.calculation || result;

      if (priceBreak && priceBreak.final_total) {
        setPriceResult(priceBreak);
        setPriceSimulated(true);
        toast.success("Price verified — you can now proceed to payment.");
      } else {
        const currentTotal = selectedCompany.exact_pricing?.final_total || moveDetails.finalTotal;
        setPriceResult({ final_total: currentTotal });
        setPriceSimulated(true);
        toast.info("Using company's quoted price.");
      }
    } catch (err) {
      console.error("Price calculation error:", err);
      toast.error("Failed to verify price. Using company's quoted price.");
      const currentTotal = selectedCompany.exact_pricing?.final_total || moveDetails.finalTotal;
      setPriceResult({ final_total: currentTotal });
      setPriceSimulated(false);
    } finally {
      setLoadingCalc(false);
    }
  };

  // Handle submit function
  const handleSubmit = async () => {
    // Validate user details
    if (!userDetails.full_name || !userDetails.email || !userDetails.phone) {
      toast.error("Please fill all required user details before proceeding.");
      return;
    }

    // Validate we have company data
    if (!selectedCompany) {
      toast.error("Please select a provider/company first.");
      return;
    }

    setLoading(true);

    try {
      const finalTotal = moveDetails.finalTotal || 0;
      
      // Build the complete payload for payment page
      const payload = buildPayload({
        payment_gateway_response: {}, // Will be filled by PaymentPage after successful payment
      });

      if (!payload) {
        toast.error("Failed to create booking payload.");
        setLoading(false);
        return;
      }

      const companyName = selectedCompany?.name || selectedCompany?.company_name || "";
      const depositAmount = Number((finalTotal * 0.1).toFixed(2));

      // Save user details
      localStorage.setItem("moveUserDetails", JSON.stringify({
        name: userDetails.full_name,
        full_name: userDetails.full_name,
        email: userDetails.email,
        phone: userDetails.phone,
        moveDate: moveDetails.move_day,
      }));

      // Navigate to payment page with complete payload
      navigate("/payment", {
        state: {
          amount: depositAmount,
          companyName,
          payload, // Complete payload - PaymentPage will call create_request_with_payment after payment
          storedResponse,
          selectedCompany,
          userDetails: {
            full_name: userDetails.full_name,
            email: userDetails.email,
            phone: userDetails.phone,
          },
          moveDetails: {
            move_day_preference: moveDetails.move_day,
            actual_delivery_date: getActualDeliveryDate(moveDetails.move_day),
            formatted_move_day: formatMoveDay(moveDetails.move_day),
            property_type: moveDetails.property_type,
            formatted_property_type: formatPropertyType(moveDetails.property_type),
            pickup_address: moveDetails.pickup_address,
            delivery_address: moveDetails.delivery_address,
            distance: moveDetails.distanceMiles,
            volume: moveDetails.totalVolume,
            total_price: finalTotal,
          },
          paymentData: {
            deposit_amount: depositAmount,
            total_amount: finalTotal,
            currency: "GBP",
            description: `Move booking with ${companyName}`,
            metadata: {
              move_date_preference: moveDetails.move_day,
              actual_delivery_date: getActualDeliveryDate(moveDetails.move_day),
              property_type: moveDetails.property_type,
              user_email: userDetails.email,
              user_phone: userDetails.phone,
            },
          },
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to initiate payment flow.");
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const getTotalFromPriceResult = (pr) => {
    if (!pr) return moveDetails.finalTotal || 0;
    if (pr.final_total !== undefined && pr.final_total !== null) return pr.final_total;
    if (pr.total !== undefined && pr.total !== null) return pr.total;
    return moveDetails.finalTotal || 0;
  };

  const formatCurrency = (n) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
    try {
      return Number(n).toLocaleString("en-GB", { style: "currency", currency: "GBP" });
    } catch {
      return `£${Number(n).toFixed(2)}`;
    }
  };

  const displayTotal = moveDetails.finalTotal || 0;
  const displayDeposit = displayTotal > 0 ? (displayTotal * 0.1).toFixed(2) : "0.00";

  const handleUserDetailChange = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Guard for missing data
  const companyName = selectedCompany?.name || selectedCompany?.company_name || "";
  if (!storedResponse && !selectedCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">No Booking Details Found</h2>
          <p className="text-gray-600 mb-6">Please go back and select a provider first.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Complete Your Booking</h1>
          <p className="text-gray-600 text-lg">Review your details and pay deposit to secure your moving date</p>
          {storedResponse && <p className="text-sm text-green-600 mt-2">✅ All data loaded from your previous search</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* User Details */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-pink-100 rounded-xl mr-4">
                  <User className="text-pink-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name *" value={userDetails.full_name} onChange={(v) => handleUserDetailChange("full_name", v)} icon={<User size={20} className="text-gray-400" />} />
                <InputField label="Email Address *" type="email" value={userDetails.email} onChange={(v) => handleUserDetailChange("email", v)} icon={<Mail size={20} className="text-gray-400" />} />
                <InputField label="Phone Number *" type="tel" value={userDetails.phone} onChange={(v) => handleUserDetailChange("phone", v)} icon={<Phone size={20} className="text-gray-400" />} />
                <InputField label="Company Name" value={companyName || "Select a company"} readOnly icon={<Building size={20} className="text-gray-400" />} />
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Address Details</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AddressCard
                    title="Pickup Location"
                    address={moveDetails.pickup_address || "Not specified"}
                    city={`${moveDetails.pickup_city || "Not specified"} - ${moveDetails.pickupPincode || "N/A"}`}
                    color="from-blue-50 to-blue-100"
                    iconColor="text-blue-600"
                  />
                  <AddressCard
                    title="Delivery Location"
                    address={moveDetails.delivery_address || "Not specified"}
                    city={`${moveDetails.delivery_city || "Not specified"} - ${moveDetails.dropoffPincode || "N/A"}`}
                    color="from-green-50 to-green-100"
                    iconColor="text-green-600"
                  />
                </div>
              </div>
            </div>

            {/* Move Details */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Move Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailCard icon={<Calendar size={20} />} label="Move Day" value={formatMoveDay(moveDetails.move_day)} bgColor="bg-purple-50" />
                <DetailCard icon={<Home size={20} />} label="Property Type" value={formatPropertyType(moveDetails.property_type)} bgColor="bg-purple-50" />
                {/* <DetailCard icon={<Package size={20} />} label="Total Volume" value={`${safeNumber(moveDetails.totalVolume).toFixed(1)} m³`} bgColor="bg-purple-50" /> */}
                <DetailCard icon={<Truck size={20} />} label="Distance" value={`${safeNumber(moveDetails.distanceMiles).toFixed(1)} miles`} bgColor="bg-purple-50" />
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !companyName}
                    className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    } bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white`}
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={24} />
                        <span>Pay Deposit & Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  {moveDetails.move_day && (
                    <p className="text-xs text-blue-600 mt-2">📅 Move scheduled for: {formatMoveDay(moveDetails.move_day)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT column - Price Summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <PoundSterling className="text-green-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Price Summary</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Total Move Cost</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(displayTotal)}</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Total Volume</div>
                        <div className="text-lg font-bold text-gray-900">{safeNumber(moveDetails.totalVolume).toFixed(1)} m³</div>
                      </div> */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Distance</div>
                        <div className="text-lg font-bold text-gray-900">{safeNumber(moveDetails.distanceMiles).toFixed(1)} miles</div>
                      </div>
                    </div>
                  </div>

                  {priceResult && priceResult.breakdown && (
                    <div className="space-y-3 text-sm">
                      {priceResult.breakdown.loading !== undefined && (
                        <DetailLine label="Loading Cost" value={priceResult.breakdown.loading} icon={<Truck size={14} />} />
                      )}
                      {priceResult.breakdown.mileage !== undefined && (
                        <DetailLine label="Mileage Cost" value={priceResult.breakdown.mileage} icon={<Truck size={14} />} />
                      )}
                      {priceResult.breakdown.packing !== undefined && (
                        <DetailLine label="Packing Service" value={priceResult.breakdown.packing} icon={<Package size={14} />} />
                      )}
                      {priceResult.breakdown.dismantling !== undefined && (
                        <DetailLine label="Dismantling" value={priceResult.breakdown.dismantling} icon={<Wrench size={14} />} />
                      )}
                      {priceResult.breakdown.reassembly !== undefined && (
                        <DetailLine label="Reassembly" value={priceResult.breakdown.reassembly} icon={<Box size={14} />} />
                      )}
                      {priceResult.breakdown.date_adjustment !== undefined && (
                        <DetailLine label="Date Adjustment" value={priceResult.breakdown.date_adjustment} icon={<Calendar size={14} />} />
                      )}
                    </div>
                  )}
                </div>

                {/* Deposit */}
                <div className="bg-gradient-to-br from-pink-50 to-red-50 border border-pink-200 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-3">
                      <CreditCard className="text-pink-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-pink-700 mb-2">10% Deposit Required</h3>
                    <div className="text-4xl font-bold text-pink-600 mb-2">{formatCurrency(displayDeposit)}</div>
                    <p className="text-pink-700 text-sm">Pay deposit now to secure your booking</p>
                  </div>
                </div>

                {/* Payment schedule */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Payment Schedule</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                        <span className="text-sm">Today - Deposit</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(displayDeposit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500">Move Day - Balance</span>
                      </div>
                      <span className="text-gray-500 font-semibold">{formatCurrency(displayTotal - parseFloat(displayDeposit || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8 shadow-xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <HelpCircle className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-blue-700 mb-4">Our friendly team is available 7 days a week to assist you</p>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-3">
                      <Phone className="text-blue-600" size={20} />
                      <span className="text-blue-900 font-bold text-lg">0800 123 4567</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Free from UK landlines</p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-3">
                      <Mail className="text-blue-600" size={20} />
                      <span className="text-blue-900 font-bold text-lg">support@move.com</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Response within 1 hour</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-xs text-blue-600">⏰ Mon-Sun: 8:00 AM - 10:00 PM GMT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

/* Component functions remain the same... */
/* Component functions */
function InputField({ label, value, onChange, type = "text", readOnly, icon }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 transform -translate-y-1/2">{icon}</div>}
        <input
          type={type}
          value={value || ""}
          readOnly={readOnly}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`w-full rounded-xl p-4 border-2 transition-all ${
            readOnly ? "bg-gray-50 border-gray-200 text-gray-500" : "bg-white border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none"
          } ${icon ? "pl-12" : ""}`}
        />
      </div>
    </div>
  );
}

function AddressCard({ title, address, city, color, iconColor }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6`}>
      <div className="flex items-start mb-4">
        <MapPin className={`${iconColor} mr-3 mt-1`} size={20} />
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-gray-700 mt-1">{address}</p>
          <p className="text-gray-600 text-sm">{city}</p>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-2xl p-5`}>
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value || "-"}</p>
    </div>
  );
}

function DetailLine({ label, value, icon }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <div className="flex items-center">
        <div className="text-gray-400 mr-2">{icon}</div>
        <span className="text-gray-500">{label}</span>
      </div>
      <span className="font-medium text-gray-700">{formatCurrencyStatic(value)}</span>
    </div>
  );
}

function formatMoveDay(day) {
  if (!day) return "Not specified";
  const dayMap = {
    sun_to_thurs: "Sunday to Thursday",
    fri_sat: "Friday to Saturday",
    flexible: "Flexible",
    within_3_days: "Within 3 days",
    within_week: "Within a week",
    within_month: "Within a month",
  };
  if (dayMap[day]) return dayMap[day];
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const d = new Date(day);
    return d.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  return day.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPropertyType(type) {
  if (!type) return "Not specified";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrencyStatic(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
  try {
    return Number(n).toLocaleString("en-GB", { style: "currency", currency: "GBP" });
  } catch {
    return `£${Number(n).toFixed(2)}`;
  }
}