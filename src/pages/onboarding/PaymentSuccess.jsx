// src/pages/onboarding/PaymentSuccess.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasHandled = useRef(false);
  const [verifying, setVerifying] = useState(true);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const plan = location.state?.plan;
  const transactionId = location.state?.transactionId;
  const companyName = location.state?.companyName;

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    // Backend payment already done in PaymentPage (process_payment)
    toast.success("Payment processed! Verifying subscription...");

    // Verify backend subscription before redirect
    verifyAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyAndRedirect = async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // 1.5 seconds between retries

    console.log("🔍 Verifying subscription status with backend...");

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        setRetryCount(attempt);
        console.log(`📡 Verification attempt ${attempt}/${MAX_RETRIES}...`);

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.email) {
          console.error("❌ No user email found");
          throw new Error("User email not found");
        }

        // Check backend subscription status
        const res = await api.get("localmoves.api.company.get_my_company", {
          params: { email: user.email },
        });

        const company = res.data?.message?.data?.[0];
        console.log("📊 Backend company data:", company);

        if (!company) {
          console.warn("⚠️ Company not found in backend");
          if (attempt < MAX_RETRIES) {
            console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          throw new Error("Company not found");
        }

        const subscriptionPlan = company.subscription_plan?.trim().toLowerCase();
        console.log("📋 Subscription plan from backend:", subscriptionPlan);

        // Check if subscription is active (not "free" or empty)
        if (subscriptionPlan && subscriptionPlan !== "free" && subscriptionPlan !== "") {
          console.log("✅ Subscription verified in backend!");

          // Update localStorage with confirmed data
          updateLocalSubscription(company.subscription_plan);

          // Wait a moment then redirect
          setTimeout(() => {
            console.log("🚀 Redirecting to dashboard...");
            setVerifying(false);
            window.location.href = "/logistic-dashboard/home";
          }, 500);

          return; // Success!
        }

        // Subscription not active yet
        console.warn(`⚠️ Subscription not active yet (attempt ${attempt}/${MAX_RETRIES})`);

        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          // Max retries reached, but still update localStorage optimistically
          console.warn("⚠️ Max retries reached, updating localStorage optimistically");
          updateLocalSubscription(plan.name);
          setVerifying(false);
          setVerificationFailed(true);
        }

      } catch (error) {
        console.error(`❌ Verification attempt ${attempt} failed:`, error);

        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.error("❌ All verification attempts failed");
          // Update localStorage optimistically even on failure
          updateLocalSubscription(plan.name);
          setVerifying(false);
          setVerificationFailed(true);
        }
      }
    }
  };

  const updateLocalSubscription = (subscriptionPlan) => {
    console.log("🔄 Updating localStorage with subscription:", subscriptionPlan);
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const updatedUser = {
        ...user,
        subscription_plan: subscriptionPlan,
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

  const handleManualRedirect = () => {
    console.log("🖱️ Manual redirect triggered");
    window.location.href = "/logistic-dashboard/home";
  };

  if (!plan || !transactionId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-pink-50 via-white to-pink-100 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-pink-200 text-center">

        {verifying ? (
          // Verification in progress
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-pink-600 animate-spin" />
            </div>

            <h2 className="text-3xl font-bold text-pink-700 mb-3">
              Payment Successful!
            </h2>

            <p className="text-gray-700 mb-2">
              Verifying your <strong className="text-pink-600">{plan?.name}</strong> subscription...
            </p>

            <p className="text-gray-500 mb-4 text-xs">
              Transaction ID: <strong>{transactionId}</strong>
            </p>

            {retryCount > 1 && (
              <p className="text-gray-400 text-xs mb-4">
                Verification attempt {retryCount}/3...
              </p>
            )}

            <p className="text-gray-400 text-sm">
              Please wait while we confirm your subscription status...
            </p>
          </>
        ) : verificationFailed ? (
          // Verification failed - show manual redirect option
          <>
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-600" />
            </div>

            <h2 className="text-3xl font-bold text-pink-700 mb-3">
              Payment Successful!
            </h2>

            <p className="text-gray-700 mb-2">
              Your <strong className="text-pink-600">{plan?.name}</strong> payment was processed.
            </p>

            <p className="text-gray-500 mb-4 text-xs">
              Transaction ID: <strong>{transactionId}</strong>
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm mb-2">
                We're still processing your subscription activation.
              </p>
              <p className="text-yellow-700 text-xs">
                You can proceed to the dashboard. Your subscription will be active shortly.
              </p>
            </div>

            <button
              onClick={handleManualRedirect}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          // Success - verified
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-pink-600 animate-bounce" />
            </div>

            <h2 className="text-3xl font-bold text-pink-700 mb-3">
              Payment Successful!
            </h2>

            <p className="text-gray-700 mb-2">
              Your <strong className="text-pink-600">{plan?.name}</strong> subscription is active.
            </p>

            <p className="text-gray-500 mb-6 text-xs">
              Transaction ID: <strong>{transactionId}</strong>
            </p>

            <p className="text-gray-400 text-sm">
              Redirecting to dashboard...
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;
