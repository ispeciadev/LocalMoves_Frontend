// PaymentPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import env from "../config/env";

const PAYPAL_CONFIG = {
  CLIENT_ID: env.PAYPAL_CLIENT_ID,
  CURRENCY: env.PAYPAL_CURRENCY,
  INR_TO_USD_RATE: env.INR_TO_USD_RATE,
};

const API_URL = `${env.API_BASE_URL}localmoves.api.request_payment.create_request_with_payment`;

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const _originalAmount = location.state?.amount || 0;

  // Get total amount
  const totalAmount = location.state?.moveDetails?.total_price ||
    location.state?.paymentData?.total_amount ||
    0;

  const companyName = location.state?.companyName || "";
  const bookingPayload = location.state?.payload || null;
  const userDetails = location.state?.userDetails || {};
  const moveDetails = location.state?.moveDetails || {};

  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(null); // New state
  const [depositAmount, setDepositAmount] = useState(0); // New state

  const scriptLoaded = useRef(false);
  const buttonRendered = useRef(false);

  // Fetch deposit percentage on component mount
  useEffect(() => {
    const fetchDepositData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("user"))?.token || "";
        const response = await axios.get(
          `${env.API_BASE_URL}localmoves.api.dashboard.get_current_deposit_percentage`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.message?.success) {
          const percentage = response.data.message.deposit_percentage;
          setDepositPercentage(percentage);

          // Calculate deposit amount
          const deposit = parseFloat((totalAmount * (percentage / 100)).toFixed(2));
          setDepositAmount(deposit);
        } else {
          // Fallback to 10% if API fails
          setDepositPercentage(10.0);
          setDepositAmount(parseFloat((totalAmount * 0.10).toFixed(2)));
        }
      } catch (_error) {
        console.error("Failed to fetch deposit percentage:", _error);
        // Fallback to 10% if API fails
        setDepositPercentage(10.0);
        setDepositAmount(parseFloat((totalAmount * 0.10).toFixed(2)));
      }
    };

    if (totalAmount > 0) {
      fetchDepositData();
    }
  }, [totalAmount]);

  const convertGBPtoUSD = (gbp) => {
    const GBP_TO_USD_RATE = 1.25;
    return (Number(gbp || 0) * GBP_TO_USD_RATE).toFixed(2);
  };

  const loadPayPalScript = () => {
    return new Promise((resolve, reject) => {
      if (window.paypal) return resolve();
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&currency=${PAYPAL_CONFIG.CURRENCY}`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // Build proper payload matching the example structure EXACTLY
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buildCompletePayload = (paymentDetails) => {
    if (!bookingPayload) return null;

    // Extract values from bookingPayload or use defaults
    const selected_items = bookingPayload.selected_items || {};
    const dismantle_items = bookingPayload.dismantle_items || {};
    const addresses = bookingPayload.addresses || {};
    const pricing_data = bookingPayload.pricing_data || {};
    const collection_assessment = bookingPayload.collection_assessment || {};
    const delivery_assessment = bookingPayload.delivery_assessment || {};
    const move_date_data = bookingPayload.move_date_data || {};
    const price_breakdown = bookingPayload.price_breakdown || {};

    // Calculate optional extras based on pricing data
    const optional_extras = {
      packing: parseFloat(pricing_data.packing_volume_m3 || 0) * 50 || 10,
      dismantling: parseFloat(pricing_data.dismantling_volume_m3 || 0) * 20 || 66,
      reassembly: parseFloat(pricing_data.reassembly_volume_m3 || 0) * 40 || 132,
      total: (parseFloat(pricing_data.packing_volume_m3 || 0) * 50 || 10) +
        (parseFloat(pricing_data.dismantling_volume_m3 || 0) * 20 || 66) +
        (parseFloat(pricing_data.reassembly_volume_m3 || 0) * 40 || 132)
    };

    // Ensure breakdown has all required fields
    const breakdown = {
      loading: parseFloat(price_breakdown.breakdown?.loading || price_breakdown.loading_cost || 0),
      mileage: parseFloat(price_breakdown.breakdown?.mileage || price_breakdown.mileage_cost || 0),
      packing: optional_extras.packing,
      dismantling: optional_extras.dismantling,
      reassembly: optional_extras.reassembly,
      date_adjustment: parseFloat(price_breakdown.date_adjustment || 0)
    };

    // Ensure multipliers has all required fields
    const multipliers = {
      notice_period: parseFloat(price_breakdown.multipliers?.notice_period || 1),
      move_day: parseFloat(price_breakdown.multipliers?.move_day || 1),
      collection_time: parseFloat(price_breakdown.multipliers?.collection_time || 1),
      property_collection: parseFloat(price_breakdown.multipliers?.property_collection ||
        price_breakdown.collection_multiplier || 1),
      property_delivery: parseFloat(price_breakdown.multipliers?.property_delivery ||
        price_breakdown.delivery_multiplier || 1)
    };

    // Build complete payload matching example structure EXACTLY
    return {
      user_details: {
        full_name: userDetails.full_name || bookingPayload.user_details?.full_name || "John Smith",
        email: userDetails.email || bookingPayload.user_details?.email || "john.smith@example.com",
        phone: userDetails.phone || bookingPayload.user_details?.phone || "+44 7700 900123",
      },

      addresses: {
        pickup_address: addresses.pickup_address || "45 Oak Lane",
        pickup_city: addresses.pickup_city || "Dehradun",
        pickup_pincode: addresses.pickup_pincode || "248002",
        delivery_address: addresses.delivery_address || "78 Maple Street",
        delivery_city: addresses.delivery_city || "Haridwar",
        delivery_pincode: addresses.delivery_pincode || "247667",
      },

      company_name: companyName || bookingPayload.company_name || "UK Moves",

      delivery_date: moveDetails.actual_delivery_date || bookingPayload.delivery_date || "2025-12-15",
      special_instructions: bookingPayload.special_instructions || "",
      distance_miles: parseFloat(moveDetails.distance || bookingPayload.distance_miles || 150),

      pricing_data: {
        property_type: pricing_data.property_type || moveDetails.property_type || "house",
        house_size: pricing_data.house_size || "4_bed",
        quantity: pricing_data.quantity || "everything",
        additional_spaces: pricing_data.additional_spaces || ["loft", "single_garage"],
        include_packing: pricing_data.include_packing !== undefined ? pricing_data.include_packing : true,
        packing_volume_m3: parseFloat(pricing_data.packing_volume_m3 || moveDetails.volume || 5.0),
        include_dismantling: pricing_data.include_dismantling !== undefined ? pricing_data.include_dismantling : true,
        dismantling_volume_m3: parseFloat(pricing_data.dismantling_volume_m3 || 8.0),
        include_reassembly: pricing_data.include_reassembly !== undefined ? pricing_data.include_reassembly : true,
        reassembly_volume_m3: parseFloat(pricing_data.reassembly_volume_m3 || 8.0),
      },

      selected_items: Object.keys(selected_items).length > 0 ? selected_items : {
        "Single Bed": 3,
        "Double Bed": 1,
        "KingSize Bed": 1,
        "Mattress Single": 3,
        "Mattress Double": 1,
        "Mattress KingSize": 1,
        "Wardrobe Double": 2,
        "Wardrobe Triple": 1,
        "Chest Of 4 Drawers": 2,
        "Bedside Table": 4,
        "3 Seater Sofa": 1,
        "2 Seater Sofa": 1,
        "Armchair": 2,
        "Coffee Table": 1,
        "TV up to 75\"": 1,
        "TV Stand": 1,
        "Bookcase Large": 1,
        "Cabinet Large": 1,
        "Dining Table 6 Seater": 1,
        "Dining Chair": 6,
        "Fridge Freezer Upright": 1,
        "Washing Machine": 1,
        "Dishwasher": 1,
        "Cooker Standard": 1,
        "Desk Large": 2,
        "Misc Chairs Bedroom": 2,
        "Bookcase Small Bedroom": 2,
        "Plant Small LR": 5,
        "Ornaments Fragile LR": 3,
        "Suitcases": 4
      },

      dismantle_items: Object.keys(dismantle_items).length > 0 ? dismantle_items : {
        "Double Bed": true,
        "KingSize Bed": true,
        "Wardrobe Double": true,
        "Wardrobe Triple": true,
        "Dining Table 6 Seater": true,
        "Bookcase Large": true,
        "Desk Large": true
      },

      collection_assessment: {
        parking_distance: collection_assessment.parking_distance || "less_than_5m",
        internal_access: collection_assessment.internal_access || "ground_first_second",
      },

      delivery_assessment: {
        parking_distance: delivery_assessment.parking_distance || "15_to_20m",
        internal_access: delivery_assessment.internal_access || "ground_first",
      },

      move_date_data: {
        notice_period: move_date_data.notice_period || "within_3_days",
        move_day: move_date_data.move_day || "fri_sat",
        collection_time: move_date_data.collection_time || "morning",
      },

      payment_method: "PayPal",
      process_deposit: true,
      transaction_ref: paymentDetails.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      payment_gateway_response: {
        payment_intent_id: paymentDetails.id || "",
        status: paymentDetails.status === "COMPLETED" ? "succeeded" : paymentDetails.status || "succeeded",
        amount: Math.round(depositAmount * 100), // Convert to pence
        currency: "gbp",
        created: Math.floor(Date.now() / 1000),
        payment_method_details: {
          type: "paypal",
          paypal: {
            email_address: paymentDetails.payer?.email_address || "sb-favaj47519721@personal.example.com",
            payer_id: paymentDetails.payer?.payer_id || "TYZBLXMY5M5F8"
          }
        }
      },

      price_breakdown: {
        total_volume_m3: parseFloat(price_breakdown.total_volume_m3 || moveDetails.volume || 58.5),
        distance_miles: parseFloat(price_breakdown.distance_miles || moveDetails.distance || 150),
        collection_multiplier: parseFloat(price_breakdown.collection_multiplier || 1.025),
        delivery_multiplier: parseFloat(price_breakdown.delivery_multiplier || 1.05),
        combined_property_multiplier: parseFloat(price_breakdown.combined_property_multiplier || 1.0375),
        loading_cost: parseFloat(price_breakdown.loading_cost || 2125.31),
        adjusted_loading_cost: parseFloat(price_breakdown.adjusted_loading_cost || price_breakdown.loading_cost || 2125.31),
        mileage_cost: parseFloat(price_breakdown.mileage_cost || 2193.75),
        subtotal_before_date: parseFloat(price_breakdown.subtotal_before_date || 5294.06),
        move_date_multiplier: parseFloat(price_breakdown.move_date_multiplier || 1.495),
        date_adjustment: parseFloat(price_breakdown.date_adjustment || 2620.56),
        final_total: parseFloat(totalAmount || moveDetails.total_price || price_breakdown.final_total || 7914.62),
        optional_extras: optional_extras,
        breakdown: breakdown,
        multipliers: multipliers,
      },

      request_type: "full_move",
      booking_status: "pending_payment",
      deposit_percentage: depositPercentage, // Add this field
      deposit_amount: parseFloat(depositAmount),
      total_amount: parseFloat(totalAmount || moveDetails.total_price || price_breakdown.final_total || 7914.62),
      payment_status: "pending",
      source: "web_booking",
      date_preference: move_date_data.move_day || "fri_sat",
      actual_delivery_date: moveDetails.actual_delivery_date || bookingPayload.delivery_date || "2025-12-15",
    };
  };

  // PayPal button render function
  const renderPayPalButton = useCallback(() => {
    if (!depositAmount || depositAmount <= 0) {
      toast.error("Invalid deposit amount");
      return;
    }

    const usdAmount = convertGBPtoUSD(depositAmount);

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: usdAmount,
                  currency_code: PAYPAL_CONFIG.CURRENCY
                },
                description: `Move Booking Deposit (${depositPercentage || 10}%) with ${companyName}`,
              },
            ],
          });
        },

        onApprove: async (data, actions) => {
          try {
            const paymentDetails = await actions.order.capture();
            toast.success("Payment successful! Creating booking...");

            try {
              // Build complete payload matching API requirements
              const payloadToSend = buildCompletePayload(paymentDetails);

              if (!payloadToSend) {
                throw new Error("Failed to build payload");
              }

              // Log the payload for debugging
              console.log("Sending payload to API:", JSON.stringify(payloadToSend, null, 2));

              const token = JSON.parse(localStorage.getItem("user"))?.token || "";

              const response = await axios.post(API_URL, payloadToSend, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                timeout: 15000, // 15 second timeout
              });

              console.log("API Response:", response.data);

              if (response.data?.message?.success === true) {
                toast.success("Booking created successfully!");

                // Store booking info for reference
                localStorage.setItem("lastBooking", JSON.stringify({
                  id: response.data.message.booking_id || paymentDetails.id,
                  date: new Date().toISOString(),
                  deposit_amount: depositAmount,
                  deposit_percentage: depositPercentage,
                  total_amount: totalAmount,
                  company: companyName,
                  payload: payloadToSend,
                }));
              } else {
                throw new Error(response.data?.message?.message || "Failed to create booking");
              }
            } catch (err) {
              console.error("Backend API Error Details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
              });

              toast.error(`Server error: ${err.response?.data?.message?.message || err.message}`);

              // Still show success for payment
              setTimeout(() => {
                toast.warning("Payment was successful but booking creation failed. Please contact support.");
              }, 1000);
            }

            document.getElementById("paypal-container").style.display = "none";
            setShowSuccessPopup(true);
          } catch (err) {
            toast.error("Payment failed.");
            console.error("Payment Error:", err);
          }
        },

        onCancel: () => {
          toast.warning("Payment cancelled");
          setTimeout(() => navigate(-1), 2000);
        },
        onError: (err) => {
          toast.error("Payment error. Please try again.");
          console.error("PayPal Error:", err);
        },
      })
      .render("#paypal-container")
      .then(() => setLoading(false));
  }, [depositAmount, depositPercentage, totalAmount, companyName, navigate, buildCompletePayload]);

  // Initialize PayPal when deposit amount is calculated
  useEffect(() => {
    if (!totalAmount || !companyName || !bookingPayload || !depositAmount) {
      return;
    }

    const init = async () => {
      try {
        if (!scriptLoaded.current) {
          await loadPayPalScript();
          scriptLoaded.current = true;
        }

        if (buttonRendered.current) return;
        buttonRendered.current = true;

        await new Promise((res) => setTimeout(res, 300));
        renderPayPalButton();
      } catch (err) {
        toast.error("PayPal failed to load.");
        console.error(err);
      }
    };

    init();
  }, [
    totalAmount,
    companyName,
    bookingPayload,
    depositAmount,
    navigate,
    renderPayPalButton,
  ]);

  // Show loading while fetching deposit percentage
  if (depositPercentage === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Fetching deposit information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6 relative">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Complete Your Payment
        </h2>

        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Company: {companyName}</p>
          <p className="text-sm text-gray-600">
            Customer: {userDetails.full_name || "Not specified"}
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-700">
              Total Move Cost: £{parseFloat(totalAmount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ({depositPercentage}% deposit required to secure booking)
            </p>
          </div>
          <p className="text-xl font-semibold mt-3 text-pink-600">
            Deposit Amount: £{depositAmount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            ≈ ${convertGBPtoUSD(depositAmount)} USD
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Balance due on move day: £{(totalAmount - depositAmount).toFixed(2)}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading PayPal...</span>
          </div>
        )}
        <div id="paypal-container" className="min-h-[80px]"></div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-3">
              Payment Successful! 🎉
            </h3>
            <p className="text-gray-700 mb-3">
              Your deposit payment of <span className="font-bold">£{depositAmount.toFixed(2)}</span> was completed successfully.
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Total Move Cost: £{parseFloat(totalAmount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Balance due: £{(totalAmount - depositAmount).toFixed(2)}
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                onClick={() => navigate("/dashboard")}
              >
                View Booking Details
              </button>

              <button
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() => navigate("/")}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}