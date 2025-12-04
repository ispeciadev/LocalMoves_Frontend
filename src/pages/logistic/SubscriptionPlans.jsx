import React from "react";
import { useNavigate } from "react-router-dom";

//  Map UI plan names → Backend required names
const PLAN_NAME_MAPPING = {
  Starter: "Basic",
  Growth: "Standard",
  Pro: "Premium",
};

const SubscriptionPlans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      backendName: PLAN_NAME_MAPPING["Starter"],
      priceINR: 495,
      price: "£495/year",
      features: [
        "Membership : 2 Months",
        "Free Entries : 20",
        "Map Display",
        "Quote Display",
        "Image Gallery",
        "Email Support",
      ],
    },
    {
      name: "Growth",
      backendName: PLAN_NAME_MAPPING["Growth"],
      priceINR: 995,
      price: "£995/year",
      features: [
        "Membership : 6 Months",
        "Free Entries : 50",
        "Phone/Email Support",
        "Profile Page",
        "Map Display",
        "Quote Display",
        "Image Gallery",
      ],
    },
    {
      name: "Pro",
      backendName: PLAN_NAME_MAPPING["Pro"],
      priceINR: 1595,
      price: "£1595/year",
      features: [
        "Membership : 1 Year",
        "Free Entries : Unlimited",
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

  const handleSubscribe = (plan) => {
    const finalPlan = {
      ...plan,
      name: plan.backendName,
    };

    navigate("/logistic-dashboard/payment", { state: { plan: finalPlan } });
  };

  return (
    <div className="dashboard-scrollbar w-full h-full overflow-auto bg-pink-50 flex flex-col items-center py-12 px-4">
      
      <style>{`
        .dashboard-scrollbar::-webkit-scrollbar { display: none; }
        .dashboard-scrollbar { scrollbar-width: none; }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-pink-600">
          Choose Your Subscription Plan
        </h2>
        <p className="text-gray-600 text-sm mt-2">
          Upgrade your plan anytime as your business grows.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white border border-pink-100 rounded-xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                {plan.name} Plan
              </h3>

              <p className="text-2xl font-bold text-pink-600 text-center mb-4">
                {plan.price}
              </p>

              <ul className="text-gray-600 text-sm space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-pink-600">✔</span> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              className="w-full bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition"
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <p className="mt-10 text-gray-500 text-xs text-center">
        All subscriptions auto-renew yearly. Cancel anytime from your dashboard.
      </p>
    </div>
  );
};

export default SubscriptionPlans;
