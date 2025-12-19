import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import env from "../../config/env";

const PAYPAL_CONFIG = {
  CLIENT_ID: env.PAYPAL_CLIENT_ID,
  CURRENCY: env.PAYPAL_CURRENCY,
  INR_TO_USD_RATE: env.INR_TO_USD_RATE,
};

const API_CONFIG = {
  BASE_URL: env.API_BASE_URL.replace('/api/method/', ''),
  PAYMENT_ENDPOINT: "/api/method/localmoves.api.payment.process_payment",
};

const SANDBOX_ACCOUNT = {
  EMAIL: "sb-favaj47519721@personal.example.com",
  PASSWORD: "J%mf!l9?",
};

//  Map display names to backend plan names
const PLAN_NAME_MAPPING = {
  "Advanced": "Standard",
  "Free": "Free",
  "Basic": "Basic",
  "Medium": "Standard", // Map "Medium" to "Standard"
  "Standard": "Standard",
  "Premium": "Premium",
  // Also handle with " Plan" suffix
  "Advanced Plan": "Standard",
  "Free Plan": "Free",
  "Basic Plan": "Basic",
  "Medium Plan": "Standard",
  "Standard Plan": "Standard",
  "Premium Plan": "Premium",
};

const getBackendPlanName = (displayName) => {
  return PLAN_NAME_MAPPING[displayName] || displayName;
};

//  Get user data from localStorage
const getUserData = () => {
  try {
    // Try getting from 'user' key first
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user;
    }

    // Fallback: try other possible keys
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      // Decode JWT to get user info (basic decode, not verification)
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      return payload;
    }

    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

const PaymentPage = ({ setActivePlan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState("");

  const scriptLoadedRef = useRef(false);
  const buttonRenderedRef = useRef(false);
  const processingPaymentRef = useRef(false);

  const convertINRtoUSD = (inr) =>
    (Number(inr || 0) / PAYPAL_CONFIG.INR_TO_USD_RATE).toFixed(2);

  //  Get company name on mount
  useEffect(() => {
    const userData = getUserData();
    console.log("👤 User Data:", userData);

    if (!userData) {
      toast.error("User not authenticated. Please login again.");
      navigate("/login");
      return;
    }

    // Get company name from user data
    // Adjust the field name based on your actual user object structure
    const company = userData.company_name ||
      userData.companyName ||
      userData.company ||
      userData.Company ||
      "";

    if (!company) {
      toast.error("Company not found. Please complete your profile.");
      setError("Company information missing");
      setLoading(false);
      return;
    }

    setCompanyName(company);
    console.log("🏢 Company Name:", company);
  }, [navigate]);

  useEffect(() => {
    if (!plan || buttonRenderedRef.current || !companyName) return;

    let mounted = true;

    const loadPayPal = async () => {
      try {
        if (!scriptLoadedRef.current) {
          await loadPayPalScript();
          scriptLoadedRef.current = true;
        }

        await new Promise((res) => setTimeout(res, 400));
        if (!mounted) return;
        renderPayPalButton();
      } catch (err) {
        console.error("PayPal Load Error:", err);
        setError("Failed to load PayPal");
        setLoading(false);
      }
    };

    loadPayPal();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, companyName]);

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

  const renderPayPalButton = () => {
    if (!window.paypal) {
      setError("PayPal SDK missing");
      return;
    }

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    const usdAmount = convertINRtoUSD(plan.priceINR);

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          console.log(" Creating PayPal Order");
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: usdAmount },
                description: `${plan.name} Subscription`,
              },
            ],
          });
        },

        onApprove: async (data, actions) => {
          if (processingPaymentRef.current) return;
          processingPaymentRef.current = true;

          toast.info("Processing payment...");

          try {
            const details = await actions.order.capture();
            console.log(" PayPal Capture:", details);

            const token =
              localStorage.getItem("authToken") ||
              JSON.parse(localStorage.getItem("user") || "{}")?.token;

            if (!token) {
              toast.error("Not authenticated. Please log in again.");
              processingPaymentRef.current = false;
              return;
            }

            console.log("🔑 Using JWT:", token?.substring(0, 20));

            //  Get the correct backend plan name
            const backendPlanName = getBackendPlanName(plan.name);
            console.log(`📝 Plan mapping: "${plan.name}" → "${backendPlanName}"`);
            console.log(`🏢 Company: "${companyName}"`);

            const resp = await axios.post(
              `${API_CONFIG.BASE_URL}${API_CONFIG.PAYMENT_ENDPOINT}`,
              {
                company_name: companyName, //  Use dynamic company name
                subscription_plan: backendPlanName,
                billing_cycle: "monthly",
                payment_method: "PayPal",
                payment_immediately: true,
                transaction_ref: details?.id,
                notes: `PayPal Order ${details?.id}`,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // Frappe wraps responses in { message: ... }
            const payload = resp?.data?.message || resp?.data;
            console.log(" Backend Response:", payload);

            if (!payload?.success) {
              toast.error(payload?.message || "Payment save failed");
              processingPaymentRef.current = false;
              return;
            }

            toast.success("Payment successful!");

            if (setActivePlan) setActivePlan(plan);

            navigate("/logistic-dashboard/payment-success", {
              replace: true,
              state: {
                plan,
                transactionId: details?.id,
                paymentData: payload?.data,
                amount: `$${usdAmount} USD`,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (err) {
            console.error("❌ Error:", err);
            const msg =
              err?.response?.data?.message ||
              err?.response?.data ||
              err?.message ||
              "Server error while saving payment.";
            toast.error(
              typeof msg === "string" ? msg : "Server error while saving payment."
            );
          } finally {
            processingPaymentRef.current = false;
          }
        },

        onCancel: () => toast.warning("Payment cancelled"),
        onError: (err) => {
          console.error("❌ PayPal Error:", err);
          toast.error("Payment failed.");
        },
      })
      .render("#paypal-button-container")
      .then(() => {
        console.log(" PayPal Button Rendered");
        buttonRenderedRef.current = true;
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ PayPal Render Error:", err);
        setError("Failed to render PayPal");
        setLoading(false);
      });
  };

  if (!plan)
    return (
      <div className="p-6 text-center">
        <p>No plan selected.</p>
      </div>
    );

  if (error && !companyName)
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/logistic-dashboard/profile")}
          className="mt-4 px-4 py-2 bg-pink-600 text-white rounded"
        >
          Update Profile
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-pink-200">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Complete Payment</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Company: {companyName}</p>
          <p className="text-xl font-bold">{plan.name}</p>
          <p className="text-2xl font-bold text-pink-600 mt-2">{plan.price}</p>
          <p className="text-sm text-gray-500">
            ≈ ${convertINRtoUSD(plan.priceINR)} USD
          </p>
        </div>

        {loading && <p>Loading PayPal...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div id="paypal-button-container" className="mb-6"></div>

        <div className="mt-4 text-xs text-gray-600 bg-yellow-50 p-3 rounded">
          <p className="font-semibold mb-1">Sandbox Test Account:</p>
          <p className="break-all">{SANDBOX_ACCOUNT.EMAIL}</p>
          <p>{SANDBOX_ACCOUNT.PASSWORD}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;