// src/pages/onboarding/PaymentPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";

const PAYPAL_CLIENT_ID =
  "ASm02TPJYiJIF3UDo_zN68nJF54cPpet9-mxExj7oQlczR6qy3bfQ4M57hw-CfGDXjtSJbYvYlV-eiWc";

const INR_TO_USD_RATE = 85;

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
  const [loading, setLoading] = useState(true);
  const scriptLoaded = useRef(false);
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
      } catch (err) {
        toast.error("Failed to load company info.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
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
  }, [plan, companyName]);

  // Convert INR → USD
  const convertINRtoUSD = (inr) =>
    (Number(inr || 0) / INR_TO_USD_RATE).toFixed(2);

  // Render PayPal button
  const renderPayPalButton = () => {
    if (!window.paypal) return;

    const container = document.getElementById("paypal-btn");
    if (!container) return;

    const usd = convertINRtoUSD(plan.priceINR);
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
            const details = await actions.order.capture();
            const transactionId = details.id;

            // SAME backend call dashboard uses
            await api.post("localmoves.api.payment.process_payment", {
              company_name: companyName,
              subscription_plan: backendPlan,
              billing_cycle: "monthly",
              payment_method: "PayPal",
              payment_immediately: true,
              transaction_ref: transactionId,
              notes: "PayPal Order " + transactionId,
            });

            toast.success("Payment Successful!");

            navigate("/onboarding/payment-success", {
              replace: true,
              state: { plan, transactionId },
            });
          } catch (err) {
            console.error("Payment error:", err);
            toast.error("Server error while saving payment.");
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

  return (
    <div className="flex justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-pink-600 mb-3">
          Complete Payment
        </h1>

        <p className="text-gray-700 mb-1">Company: {companyName}</p>
        <p className="font-bold text-xl">{plan.name}</p>

        {/* FIXED LINE HERE */}
        <p className="text-2xl text-pink-600 font-bold">{plan.priceDisplay}</p>

        <div id="paypal-btn" className="mt-6"></div>
      </div>
    </div>
  );
};

export default PaymentPage;
