// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "../stores/useAuthStore";
// import api from "../api/axios";
// import HappyStories from "../components/HappyStoriesSection";
// import { FaCrown, FaRupeeSign, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
// import { toast } from "react-toastify";

// // PUBLIC PLANS – MATCH NAMES FROM SUBSCRIPTION PAGE
// const PLANS = [
//   {
//     id: "basic",
//     name: "Basic",
//     price: "£495/year",
//     tagline: "Perfect for small local movers",
//     bullets: [
//       "Membership: 2 Months",
//       "Free Entry Views: 20",
//       "Map Display",
//       "Quote Display",
//       "Image Gallery",
//       "Email Support",
//     ],
//   },
//   {
//     id: "standard",
//     name: "Standard",
//     price: "£995/year",
//     tagline: "Ideal for expanding moving companies",
//     bullets: [
//       "Membership: 6 Months",
//       "Free Entry Views: 50",
//       "Phone/Email Support",
//       "Profile Page",
//       "Map Display",
//       "Quote Display",
//       "Image Gallery",
//     ],
//   },
//   {
//     id: "premium",
//     name: "Premium",
//     price: "£1595/year",
//     tagline: "Best for high-volume UK logistics teams",
//     bullets: [
//       "Membership: 1 Year",
//       "Free Entry Views: Unlimited",
//       "Survey Bookings",
//       "Hide Competitors",
//       "Phone/Email Support",
//       "Profile Page",
//       "Map Display",
//       "Quote Display",
//       "Image Gallery",
//     ],
//   },
// ];

// const PricePlansDetails = () => {
//   const { user, isAuthenticated } = useAuthStore();
//   const navigate = useNavigate();

//   const [companyData, setCompanyData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // FETCH USER PLAN DETAILS (IF LOGGED IN)
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!isAuthenticated) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await api.get("localmoves.api.company.get_company_details", {
//           params: { email: user?.email },
//         });

//         setCompanyData(res.data?.message?.data?.[0] || null);
//       } catch (error) {
//         console.error(error);
//       }

//       setLoading(false);
//     };

//     fetchData();
//   }, [user, isAuthenticated]);

//   if (loading) {
//     return (
//       <div className="p-6 text-center text-gray-500">
//         Loading plan details…
//       </div>
//     );
//   }

//   // START BUTTON HANDLER
//   const handleStartAction = () => {
//     toast.info("Please login or register to start booking services.");
//     navigate("/register");
//   };

//   return (
//     <div className="min-h-screen bg-white pb-20">

//       {/* HEADER */}
//       <div className="bg-pink-600 text-white py-10 text-center">
//         <h1 className="text-4xl font-bold">Price & Plans Details</h1>
//         <p className="mt-2 text-sm opacity-90">Explore our UK-friendly plans & benefits</p>
//       </div>

//       {/* ALWAYS SHOW CTA BUTTON */}
//       <div className="text-center mt-12">
//         <button
//           onClick={handleStartAction}
//           className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition"
//         >
//           Click Me To Start
//         </button>
//       </div>

//       {/* USER'S CURRENT PLAN – ONLY IF LOGGED IN */}
//       {isAuthenticated && companyData && (
//         <div className="max-w-4xl mx-auto px-4 mt-10">

//           <div className="bg-white shadow-lg border rounded-3xl p-6 sm:p-10">

//             {/* CURRENT PLAN CARD */}
//             <div className="text-center mb-6">
//               <FaCrown className="text-pink-600 text-5xl mx-auto mb-3" />
//               <h2 className="text-3xl font-bold text-pink-600">
//                 {companyData.subscription_plan}
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div className="p-4 rounded-xl bg-pink-50 shadow-sm">
//                 <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
//                   <FaRupeeSign /> Price
//                 </div>
//                 <p className="text-xl font-bold text-pink-700">
//                   ₹{companyData.price || 0}
//                 </p>
//               </div>

//               <div className="p-4 rounded-xl bg-pink-50 shadow-sm">
//                 <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
//                   <FaCalendarAlt /> Renewal Date
//                 </div>
//                 <p className="text-lg font-semibold text-pink-700">
//                   {companyData.subscription_end_date || "N/A"}
//                 </p>
//               </div>

//               <div className="p-4 rounded-xl bg-pink-50 shadow-sm sm:col-span-2">
//                 <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
//                   <FaCheckCircle /> Free Entries
//                 </div>
//                 <p className="text-lg font-semibold text-pink-700">
//                   {companyData.subscription_plan === "Premium"
//                     ? "Unlimited"
//                     : companyData.requests_viewed_this_month || 0}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-10">
//               <h3 className="text-xl font-bold text-pink-600 mb-3">Your Plan Features</h3>
//               <ul className="space-y-2 text-gray-700">
//                 {(JSON.parse(companyData.includes || "[]") || []).map((item, idx) => (
//                   <li key={idx} className="flex items-center gap-2">
//                     <FaCheckCircle className="text-pink-600" />
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//           </div>
//         </div>
//       )}

//       {/* PUBLIC PLANS – 3-CARD INLINE DISPLAY */}
//       <div className="max-w-6xl mx-auto px-4 mt-16">
//         <h2 className="text-3xl font-bold text-center text-pink-600 mb-10">
//           All Available Subscription Plans
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
//           {PLANS.map((plan) => (
//             <div
//               key={plan.id}
//               className="bg-white shadow-lg border rounded-3xl p-6 hover:shadow-xl transition"
//             >
//               <h3 className="text-center text-2xl font-bold text-gray-800">
//                 {plan.name}
//               </h3>

//               <p className="text-center text-pink-600 text-3xl font-extrabold mt-2">
//                 {plan.price}
//               </p>

//               <p className="text-center text-gray-600 mt-1">{plan.tagline}</p>

//               <ul className="mt-4 space-y-2 text-gray-700">
//                 {plan.bullets.map((b, i) => (
//                   <li key={i} className="flex items-start gap-2">
//                     <FaCheckCircle className="text-pink-600 mt-1" />
//                     {b}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* HAPPY STORIES SECTION */}
//       <div className="mt-16">
//         <HappyStories />
//       </div>
//     </div>
//   );
// };

// export default PricePlansDetails;

import React from "react";
import { useNavigate } from "react-router-dom";
import HappyStories from "../components/HappyStoriesSection";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const PricePlansDetails = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    toast.info("Please login or register to get started.");
    navigate("/register");
  };

  const Bullet = ({ text }) => (
    <li className="flex gap-2 items-start">
      <FaCheckCircle className="text-pink-600 mt-1" />
      <span>{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* HEADER */}
      <div className="bg-pink-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold">UK Pricing & Plans</h1>
        <p className="mt-3 opacity-90">
          All plans are billed monthly · 12-month contract · Verified customers
        </p>
      </div>

      {/* CTA */}
      <div className="text-center mt-10">
        <button
          onClick={handleStart}
          className="bg-pink-600 hover:bg-pink-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition"
        >
          Start Getting Customers
        </button>
      </div>

      {/* ======================= */}
      {/* 📊 LEADS SECTION */}
      {/* ======================= */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-4">
          📊 Leads
        </h2>

        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
          All plans provide leads with verified phone numbers. <br />
          All plans are billed monthly and require a 12-month contract. <br />
          Lead figures shown represent average monthly volumes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* STARTER */}
          <div className="border rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-center">⭐ Starter Plan</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £200 per month
            </p>
            <p className="text-center text-gray-600 mt-2">
              Ideal for small businesses or those beginning structured lead generation.
            </p>

            <h4 className="mt-4 font-semibold">Includes:</h4>
            <ul className="mt-3 space-y-2 text-gray-700">
              <Bullet text="20 qualified leads per month (average)" />
              <Bullet text="Email support (48-hour response time)" />
              <Bullet text="Advanced reporting suite" />
              <Bullet text="Lead delivery by email" />
              <Bullet text="Enhanced lead verification (telephone verification)" />
              <Bullet text="Quarterly performance summary" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600 mt-1">
              Trading professionals, solo operators, and early-stage businesses validating their pipeline.
            </p>
          </div>

          {/* GROWTH */}
          <div className="border rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-center">📈 Growth Plan</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £400 per month
            </p>
            <p className="text-center text-gray-600 mt-2">
              Designed for growing teams needing more consistent volumes.
            </p>

            <h4 className="mt-4 font-semibold">Includes:</h4>
            <ul className="mt-3 space-y-2 text-gray-700">
              <Bullet text="50 qualified leads per month" />
              <Bullet text="Priority email support (24-hour response time)" />
              <Bullet text="Advanced reporting suite" />
              <Bullet text="Lead delivery by email & SMS" />
              <Bullet text="Enhanced lead verification (telephone verification)" />
              <Bullet text="Monthly performance review" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600 mt-1">
              Small to medium teams focused on predictable growth with higher monthly volume.
            </p>
          </div>

          {/* PRO */}
          <div className="border rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-center">🚀 Pro Plan</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £700 per month
            </p>
            <p className="text-center text-gray-600 mt-2">
              Built for scaling operations that require high-volume, high-quality lead flow.
            </p>

            <h4 className="mt-4 font-semibold">Includes:</h4>
            <ul className="mt-3 space-y-2 text-gray-700">
              <Bullet text="100 qualified leads per month" />
              <Bullet text="Priority support (same-day response)" />
              <Bullet text="Advanced reporting suite" />
              <Bullet text="Lead delivery by email, SMS or WhatsApp" />
              <Bullet text="Enhanced lead verification (telephone verification)" />
              <Bullet text="Twice-monthly performance review" />
              <Bullet text="Dedicated account manager" />
              <Bullet text="Early access to product updates and new lead channels" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600 mt-1">
              Businesses scaling aggressively, hiring new staff, or managing multiple locations.
            </p>
          </div>

          {/* LEADS BOLT-ON */}
          <div className="border rounded-3xl shadow-lg p-6 bg-pink-50">
            <h3 className="text-xl font-bold text-center">⚡ Bolt-On: Extra Leads</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £400
            </p>

            <h4 className="mt-4 font-semibold">Includes:</h4>
            <ul className="mt-3 space-y-2 text-gray-700">
              <Bullet text="Plus 50 additional qualified leads per month" />
              <Bullet text="Available on Starter, Growth, or Pro plans" />
              <Bullet text="No change to support or reporting tier" />
              <Bullet text="Can be added at any point during the 12-month contract" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600 mt-1">
              Businesses experiencing seasonal peaks or expanding into new service areas.
            </p>
          </div>
        </div>
      </section>

      {/* ======================= */}
      {/* 📦 JOBS SECTION */}
      {/* ======================= */}
      <section className="max-w-7xl mx-auto px-4 mt-28">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-4">
          📦 Jobs
        </h2>

        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
          All plans provide fully booked-in jobs (deposit taken). <br />
          Pricing shown is per month, on a 12-month contract. <br />
          Job numbers represent an average per month.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* FOUNDER */}
          <div className="border rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-center">🌱 Founder Plan</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £500 per month
            </p>

            <ul className="mt-4 space-y-2 text-gray-700">
              <Bullet text="5 fully booked jobs per month" />
              <Bullet text="Verified customer details, confirmed booking date & deposit taken" />
              <Bullet text="Full handling of lead qualification → quote → booking → payment securing" />
              <Bullet text="Customer communication handled on your behalf" />
              <Bullet text="Advanced reporting dashboard" />
              <Bullet text="Email support (48-hour response time)" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600">
              Small businesses, solo operators, and teams handling a handful of guaranteed jobs.
            </p>
          </div>

          {/* ADVANCED */}
          <div className="border rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-center">📘 Advanced Plan</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £900 per month
            </p>

            <ul className="mt-4 space-y-2 text-gray-700">
              <Bullet text="10 fully booked jobs per month" />
              <Bullet text="Multi-step qualification and conversion process" />
              <Bullet text="Dedicated account manager" />
              <Bullet text="Deposit handling & payment confirmation" />
              <Bullet text="Monthly performance review" />
              <Bullet text="Appointment scheduling with customer reminders" />
              <Bullet text="Advanced reporting dashboard" />
              <Bullet text="Priority email support (24-hour response)" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600">
              Growing companies aiming for predictable monthly revenue with minimal admin time.
            </p>
          </div>

          {/* ENTERPRISE */}
          <div className="border rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-center">🏆 Enterprise Plan</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £1700 per month
            </p>

            <ul className="mt-4 space-y-2 text-gray-700">
              <Bullet text="20 fully booked jobs per month" />
              <Bullet text="Full sales pipeline handling: lead → qualification → consultation → booking → deposit" />
              <Bullet text="Dedicated account manager" />
              <Bullet text="Deposit handling & payment confirmation" />
              <Bullet text="Fortnightly performance reviews" />
              <Bullet text="Improved reporting & job forecasting tools" />
              <Bullet text="Advanced reporting dashboard" />
              <Bullet text="Same-day priority support" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600">
              Multi-team operations, franchises, or businesses scaling fast.
            </p>
          </div>

          {/* JOBS BOLT-ON */}
          <div className="border rounded-3xl shadow-lg p-6 bg-pink-50">
            <h3 className="text-xl font-bold text-center">⚡ Bolt-On: Additional Jobs</h3>
            <p className="text-center text-pink-600 text-2xl font-extrabold mt-2">
              £600
            </p>

            <ul className="mt-4 space-y-2 text-gray-700">
              <Bullet text="Plus 5 fully booked jobs" />
              <Bullet text="Can be added to any plan" />
              <Bullet text="No change to support tier" />
              <Bullet text="Add or remove bolt-ons at renewal" />
            </ul>

            <p className="mt-4 font-semibold">Best for:</p>
            <p className="text-sm text-gray-600">
              Ideal for seasonal peaks or rapid expansion.
            </p>
          </div>
        </div>
      </section>

      {/* HAPPY STORIES */}
      <div className="mt-28">
        <HappyStories />
      </div>
    </div>
  );
};

export default PricePlansDetails;
