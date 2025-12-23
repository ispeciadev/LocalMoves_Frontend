```javascript
// src/pages/onboarding/PaymentSuccess.jsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const hasHandled = useRef(false);

  const plan = location.state?.plan;
  const transactionId = location.state?.transactionId;
  const companyName = location.state?.companyName;

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    console.log("✅ Payment successful, updating localStorage and redirecting...");
    
    // Backend payment already processed in PaymentPage
    toast.success("Payment Successful! Redirecting to dashboard...");

    // Update localStorage immediately
    updateLocalSubscription();

    // Redirect after short delay
    setTimeout(() => {
      console.log("🚀 Redirecting to dashboard...");
      window.location.href = "/logistic-dashboard/home";
    }, 1500);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocalSubscription = () => {
    console.log("🔄 Updating localStorage with subscription:", plan?.name);
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const updatedUser = {
        ...user,
        subscription_plan: plan?.name || "Premium",
        company_registered: true,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ Updated user in localStorage:", updatedUser);
    }

    // Set flags to ensure subscription is recognized
    localStorage.setItem("hasSubscription", "true");
    localStorage.setItem("subscriptionActive", "true");
    localStorage.setItem("justPaid", "true");

    console.log("📢 Dispatching subscription-updated event");
    window.dispatchEvent(new Event("subscription-updated"));
  };

  if (!plan || !transactionId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-pink-50 via-white to-pink-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-pink-200 text-center">

        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-pink-600 animate-bounce" />
        </div>

        <h2 className="text-3xl font-bold text-pink-700 mb-3">
          Payment Successful!
        </h2>

        <p className="text-gray-700 mb-2">
          Your <strong className="text-pink-600">{plan?.name}</strong> subscription is being activated.
        </p>

        <p className="text-gray-500 mb-6 text-xs">
          Transaction ID: <strong>{transactionId}</strong>
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            ✅ Payment processed successfully!
          </p>
          <p className="text-green-700 text-xs mt-2">
            Redirecting you to the dashboard...
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-600"></div>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;
