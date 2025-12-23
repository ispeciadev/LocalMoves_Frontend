// src/pages/onboarding/PaymentPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import env from "../../config/env";

const PAYPAL_CLIENT_ID = env.PAYPAL_CLIENT_ID;

const INR_TO_USD_RATE = env.INR_TO_USD_RATE;

// Match backend plan names
const PLAN_NAME_MAPPING = {
  Basic: "Basic",
  Medium: "Standard",
  Standard: "Standard",
  Premium: "Premium",
  "Basic Plan": "Basic",
  "Medium Plan": "Standard",
  "Standard Plan": "Standard",
  "Premium Plan": "Premium",
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;

  const [companyName, setCompanyName] = useState("");
  const [_loading, setLoading] = useState(true);
  const _scriptLoaded = useRef(false);
  const buttonRendered = useRef(false);

  // Get company name — SAME as dashboard logic
  useEffect(() => {
    const fetchCompany = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) {
        toast.error("User not authenticated.");
        return navigate("/login");
      }

      try {
        const res = await api.get("localmoves.api.company.get_my_company", {
          params: { email: user.email },
        });

        const c = res.data?.message?.data?.[0];
        if (c?.company_name) {
          setCompanyName(c.company_name);
        } else {
          toast.error("Company not found.");
        }
      } catch {
        toast.error("Failed to load company info.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load PayPal script when ready
  useEffect(() => {
    if (!plan || !companyName || buttonRendered.current) return;

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.paypal) return resolve();
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    loadScript().then(() => renderPayPalButton());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, companyName]);

  // Convert INR → USD
  const convertINRtoUSD = (inr) =>
    (Number(inr || 0) / INR_TO_USD_RATE).toFixed(2);

  // Render PayPal button
  const renderPayPalButton = () => {
    if (!window.paypal) return;

    const container = document.getElementById("paypal-btn");
    if (!container) return;

    // Use fallback price calculation
    const priceInINR = plan.priceINR || plan.price?.replace(/[^0-9]/g, '') || 0;
    const usd = convertINRtoUSD(priceInINR);
    const backendPlan = PLAN_NAME_MAPPING[plan.name] || plan.name;

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: usd },
                description: `${plan.name} Subscription`,
              },
            ],
          });
        },

        // ALL FIXED — USE DASHBOARD PAYMENT LOGIC
        onApprove: async (data, actions) => {
          try {
            console.log("💳 PayPal payment approved, capturing...");
            const details = await actions.order.capture();
            const transactionId = details.id;
            console.log("✅ PayPal capture successful:", transactionId);

            console.log("📤 Sending payment to backend...");
            console.log("Company:", companyName);
            console.log("Plan:", backendPlan);
            console.log("Transaction ID:", transactionId);

            // SAME backend call dashboard uses
            const response = await api.post("localmoves.api.payment.process_payment", {
              company_name: companyName,
              subscription_plan: backendPlan,
              billing_cycle: "monthly",
              payment_method: "PayPal",
              payment_immediately: true,
              transaction_ref: transactionId,
              notes: "PayPal Order " + transactionId,
            });

            console.log("✅ Backend payment processed successfully:", response.data);

            // Verify backend actually processed the payment
            const backendResponse = response.data?.message || response.data;
            if (!backendResponse || backendResponse.success === false) {
              console.error("❌ Backend payment processing failed:", backendResponse);
              toast.error("Payment failed to process on server. Please contact support.");
              return;
            }

            toast.success("Payment Successful!");

            // Pass backend response to success page for verification
            navigate("/onboarding/payment-success", {
              replace: true,
              state: {
                plan,
                transactionId,
                backendResponse,
                companyName
              },
            });
          } catch (err) {
            console.error("❌ Payment processing error:", err);
            console.error("Error details:", {
              message: err.message,
              status: err.response?.status,
              statusText: err.response?.statusText,
              data: err.response?.data,
            });

            // Show specific error message
            if (err.response?.status === 417) {
              toast.error("Payment failed: Server rejected the request (417). Please contact support.");
            } else if (err.response?.data?.message) {
              toast.error(`Payment failed: ${err.response.data.message}`);
            } else {
              toast.error("Server error while saving payment. Please contact support.");
            }

            // DO NOT navigate on error - stay on payment page
          }
        },

        onError: (err) => {
          console.error("PayPal error:", err);
          toast.error("Payment failed. Try again.");
        },
      })
      .render("#paypal-btn");

    buttonRendered.current = true;
  };

  if (!plan) return <p>No plan selected.</p>;

  // Debug: Log the plan object to see what's being passed
  console.log("Plan object received:", plan);
  console.log("Plan price:", plan.price);
  console.log("Plan priceDisplay:", plan.priceDisplay);
  console.log("Plan priceINR:", plan.priceINR);
  console.log("Plan period:", plan.period);

  // Handle different plan structures - add fallbacks
  const displayPrice = plan.priceDisplay ||
    (plan.price && plan.period ? `${plan.price} ${plan.period}` : plan.price) ||
    'Price not available';
  const priceInINR = plan.priceINR || parseInt(plan.price?.replace(/[^0-9]/g, '')) || 0;

  console.log("Calculated displayPrice:", displayPrice);
  console.log("Calculated priceInINR:", priceInINR);

  return (
    <div className="flex justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-pink-600 mb-3">
          Complete Payment
        </h1>

        <p className="text-gray-700 mb-1">Company: {companyName}</p>
        <p className="font-bold text-xl">{plan.name}</p>

        {/* Display price with fallback */}
        <p className="text-2xl text-pink-600 font-bold mt-2 mb-4">{displayPrice}</p>

        <div id="paypal-btn" className="mt-6"></div>
      </div>
    </div>
  );
};

export default PaymentPage;
