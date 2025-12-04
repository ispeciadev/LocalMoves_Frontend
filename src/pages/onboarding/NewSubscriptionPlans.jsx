// src/pages/onboarding/NewSubscriptionPlans.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

//  Map UI → Backend
const PLAN_MAP = {
  Starter: "Basic",
  Growth: "Standard",
  Pro: "Premium",
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    backendName: PLAN_MAP["Starter"],
    priceINR: 495,
    priceDisplay: "£495/year",
    tagline: "Kickstart your visibility & get your first customers",
    bullets: [
      "Membership : 2 Months",
      "Free Entries : 20",
      "Basic Business Listing",
      "Map Display",
      "Quote Display",
      "Image Gallery",
      "Email Support",
      "Showcase Your Services",
      "Boost Local Discovery",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    backendName: PLAN_MAP["Growth"],
    priceINR: 995,
    priceDisplay: "£995/year",
    tagline: "Grow your business & reach more serious buyers",
    bullets: [
      "Membership : 6 Months",
      "Free Entries : 50",
      "Enhanced Business Visibility",
      "Phone/Email Support",
      "Profile Page Included",
      "Map Display",
      "Quote Display",
      "Image Gallery",
      "Rank Higher in Local Listings",
      "Access to Priority Leads",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    backendName: PLAN_MAP["Pro"],
    priceINR: 1595,
    priceDisplay: "£1595/year",
    tagline: "Maximize bookings with premium exposure & tools",
    bullets: [
      "Membership : 1 Year",
      "Free Entries : Unlimited",
      "Survey Bookings",
      "Hide Competitors",
      "Phone/Email Support",
      "Dedicated Profile Page",
      "Map Display",
      "Quote Display",
      "Image Gallery",
      "Featured Listing Badge",
      "Top Ranking in Your Area",
      "Win More Exclusive Requests",
    ],
  },
];

const NewSubscriptionPlans = () => {
  const navigate = useNavigate();

  const handleSubscribe = (plan) => {
    const finalPlan = {
      ...plan,
      name: plan.backendName, // important for backend
    };
    navigate("/onboarding/payment", { state: { plan: finalPlan } });
  };

  return (
    <div
      style={{
        padding: "50px 20px",
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/*  MAIN HEADING */}
      <h1
        style={{
          textAlign: "center",
          marginBottom: 10,
          fontSize: 40,
          fontWeight: 800,
          color: "#e6007e",
        }}
      >
        Subscription Plans
      </h1>

      {/*  NEW LINES BELOW HEADING */}
      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginTop: 0,
          marginBottom: 6,
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        Choose a plan that matches your business goals.
      </p>

      <p
        style={{
          textAlign: "center",
          color: "#888",
          marginBottom: 40,
          fontSize: 14,
        }}
      >
        Upgrade anytime as you grow — no hidden fees, no long-term lock-ins.
      </p>

      {/* PLANS GRID */}
      <div
        style={{
          display: "flex",
          gap: 30,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            style={{
              width: 340,
              background: "#fff",
              borderRadius: 16,
              padding: 26,
              boxShadow: "0 8px 24px rgba(230,0,126,0.12)",
            }}
          >
            <h2 style={{ textAlign: "center", fontSize: 26 }}>{plan.name}</h2>

            <p
              style={{
                textAlign: "center",
                fontSize: 32,
                fontWeight: 900,
                color: "#e6007e",
              }}
            >
              {plan.priceDisplay}
            </p>

            <p style={{ textAlign: "center", color: "#888", marginBottom: 16 }}>
              {plan.tagline}
            </p>

            <ul style={{ paddingLeft: 20 }}>
              {plan.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  {b}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "14px 18px",
                background: "#e6007e",
                color: "#fff",
                borderRadius: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
              }}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewSubscriptionPlans;
