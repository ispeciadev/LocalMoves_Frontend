// // src/pages/onboarding/PaymentSuccess.jsx
// import React, { useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { CheckCircle2 } from "lucide-react";
// import { toast } from "react-toastify";
// import api from "../../api/axios";

// const PaymentSuccess = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const hasHandled = useRef(false);

//   const plan = location.state?.plan;
//   const transactionId = location.state?.transactionId;

//   useEffect(() => {
//     if (hasHandled.current) return;
//     hasHandled.current = true;

//     toast.dismiss();
//     toast.success("Subscription activated!", { autoClose: 2000 });

//     if (!plan || !transactionId) {
//       navigate("/logistic-dashboard/home", { replace: true });
//       return;
//     }

//     updateSubscription();
//   }, []);

//   // ⭐ CRITICAL: Update subscription in backend + localStorage
//   const updateSubscription = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user?.email) return;

//       // 1️⃣ Update Backend
//       await api.post("localmoves.api.company.update_subscription", {
//         email: user.email,
//         plan: plan.name,
//         transaction_id: transactionId,
//       });

//       // 2️⃣ Update Local User
//       const updatedUser = {
//         ...user,
//         subscription_plan: plan.name,
//         company_registered: true,
//       };

//       localStorage.setItem("user", JSON.stringify(updatedUser));

//       // 3️⃣ Let AppRouter know subscription changed
//       localStorage.setItem("hasSubscription", "true");
//       window.dispatchEvent(new Event("subscription-updated"));

//     } catch (error) {
//       console.error("Subscription update failed:", error);
//       toast.error("Subscription update failed. Try refreshing.");
//     }
//   };

//   if (!plan || !transactionId) return null;

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6">
//       <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-pink-200 text-center">

//         <div className="flex justify-center mb-6">
//           <CheckCircle2 className="w-16 h-16 text-pink-600 animate-bounce" />
//         </div>

//         <h2 className="text-3xl font-bold text-pink-700 mb-3">
//           Payment Successful!
//         </h2>

//         <p className="text-gray-700 mb-2">
//           Your <strong className="text-pink-600">{plan?.name}</strong> subscription is active.
//         </p>

//         <p className="text-gray-500 mb-6 text-xs">
//           Transaction ID: <strong>{transactionId}</strong>
//         </p>

//         <button
//           onClick={() => navigate("/logistic-dashboard/home", { replace: true })}
//           className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
//         >
//           Go to Dashboard
//         </button>

//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

// src/pages/onboarding/PaymentSuccess.jsx
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  const plan = location.state?.plan;
  const transactionId = location.state?.transactionId;

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    toast.dismiss();
    toast.success("Subscription activated!", { autoClose: 2000 });

    if (!plan || !transactionId) {
      navigate("/logistic-dashboard/home", { replace: true });
      return;
    }

    updateLocalSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  Update ONLY local storage (backend already updated in PaymentPage)
  const updateLocalSubscription = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      const updatedUser = {
        ...user,
        subscription_plan: plan.name,
        company_registered: true,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Notify router
      localStorage.setItem("hasSubscription", "true");
      window.dispatchEvent(new Event("subscription-updated"));

    } catch (error) {
      console.error("Local subscription update failed:", error);
      toast.error("Subscription updated failed locally. Try refresh.");
    }
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
          Your <strong className="text-pink-600">{plan?.name}</strong> subscription is active.
        </p>

        <p className="text-gray-500 mb-6 text-xs">
          Transaction ID: <strong>{transactionId}</strong>
        </p>

        <button
          onClick={() => navigate("/logistic-dashboard/home", { replace: true })}
          className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
        >
          Go to Dashboard
        </button>

      </div>
    </div>
  );
};

export default PaymentSuccess;
