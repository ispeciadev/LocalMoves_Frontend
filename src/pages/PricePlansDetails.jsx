import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import api from "../api/axios";
import HappyStories from "../components/HappyStoriesSection";
import { FaCrown, FaRupeeSign, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

// PUBLIC PLANS – MATCH NAMES FROM SUBSCRIPTION PAGE
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "£495/year",
    tagline: "Perfect for small local movers",
    bullets: [
      "Membership: 2 Months",
      "Free Entry Views: 20",
      "Map Display",
      "Quote Display",
      "Image Gallery",
      "Email Support",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "£995/year",
    tagline: "Ideal for expanding moving companies",
    bullets: [
      "Membership: 6 Months",
      "Free Entry Views: 50",
      "Phone/Email Support",
      "Profile Page",
      "Map Display",
      "Quote Display",
      "Image Gallery",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "£1595/year",
    tagline: "Best for high-volume UK logistics teams",
    bullets: [
      "Membership: 1 Year",
      "Free Entry Views: Unlimited",
      "Survey Bookings",
      "Hide Competitors",
      "Phone/Email Support",
      "Profile Page",
      "Map Display",
      "Quote Display",
      "Image Gallery",
    ],
  },
];

const PricePlansDetails = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH USER PLAN DETAILS (IF LOGGED IN)
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("localmoves.api.company.get_company_details", {
          params: { email: user?.email },
        });

        setCompanyData(res.data?.message?.data?.[0] || null);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, isAuthenticated]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading plan details…
      </div>
    );
  }

  // START BUTTON HANDLER
  const handleStartAction = () => {
    toast.info("Please login or register to start booking services.");
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-white pb-20">

      {/* HEADER */}
      <div className="bg-pink-600 text-white py-10 text-center">
        <h1 className="text-4xl font-bold">Price & Plans Details</h1>
        <p className="mt-2 text-sm opacity-90">Explore our UK-friendly plans & benefits</p>
      </div>

      {/* ALWAYS SHOW CTA BUTTON */}
      <div className="text-center mt-12">
        <button
          onClick={handleStartAction}
          className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition"
        >
          Click Me To Start
        </button>
      </div>

      {/* USER'S CURRENT PLAN – ONLY IF LOGGED IN */}
      {isAuthenticated && companyData && (
        <div className="max-w-4xl mx-auto px-4 mt-10">

          <div className="bg-white shadow-lg border rounded-3xl p-6 sm:p-10">

            {/* CURRENT PLAN CARD */}
            <div className="text-center mb-6">
              <FaCrown className="text-pink-600 text-5xl mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-pink-600">
                {companyData.subscription_plan}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-pink-50 shadow-sm">
                <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FaRupeeSign /> Price
                </div>
                <p className="text-xl font-bold text-pink-700">
                  ₹{companyData.price || 0}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-pink-50 shadow-sm">
                <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FaCalendarAlt /> Renewal Date
                </div>
                <p className="text-lg font-semibold text-pink-700">
                  {companyData.subscription_end_date || "N/A"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-pink-50 shadow-sm sm:col-span-2">
                <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FaCheckCircle /> Free Entries
                </div>
                <p className="text-lg font-semibold text-pink-700">
                  {companyData.subscription_plan === "Premium"
                    ? "Unlimited"
                    : companyData.requests_viewed_this_month || 0}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-pink-600 mb-3">Your Plan Features</h3>
              <ul className="space-y-2 text-gray-700">
                {(JSON.parse(companyData.includes || "[]") || []).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <FaCheckCircle className="text-pink-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* PUBLIC PLANS – 3-CARD INLINE DISPLAY */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-10">
          All Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="bg-white shadow-lg border rounded-3xl p-6 hover:shadow-xl transition"
            >
              <h3 className="text-center text-2xl font-bold text-gray-800">
                {plan.name}
              </h3>

              <p className="text-center text-pink-600 text-3xl font-extrabold mt-2">
                {plan.price}
              </p>

              <p className="text-center text-gray-600 mt-1">{plan.tagline}</p>

              <ul className="mt-4 space-y-2 text-gray-700">
                {plan.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <FaCheckCircle className="text-pink-600 mt-1" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* HAPPY STORIES SECTION */}
      <div className="mt-16">
        <HappyStories />
      </div>
    </div>
  );
};

export default PricePlansDetails;
