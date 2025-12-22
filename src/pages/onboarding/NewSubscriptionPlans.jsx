// src/pages/onboarding/NewSubscriptionPlans.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaCrown,
  FaRupeeSign,
  FaCalendarAlt,
  FaCheckCircle,
  FaStar,
  FaRocket,
  FaBullhorn,
  FaChartLine,
  FaBuilding,
  FaUsers,
  FaBriefcase,
  FaHandshake,
  FaCog,
  FaShieldAlt,
  FaClock,
  FaEnvelope,
  FaSms,
  FaWhatsapp,
  FaPhone,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaUserTie,
  FaChartBar,
  FaHeadset,
  FaEye,
  FaThumbsUp,
  FaArrowRight,
  FaTrophy,
  FaChartPie,
  FaLightbulb,
  FaBolt,
  FaGem,
  FaRegCheckCircle,
  FaTimes,
  FaInfinity,
  FaHeart,
  FaSmile,
  FaMedal,
  FaRibbon,
  FaInfoCircle,
} from "react-icons/fa";

// Professional Color Palette
const COLORS = {
  primary: "#ffffff",
  secondary: "#f9fafb",
  accent: "#db2777", // pink-600
  accentLight: "#f472b6",
  text: "#111827",
  textLight: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
  blue: "#3b82f6",
  green: "#10b981",
  purple: "#8b5cf6",
};

//  Map UI → Backend
const PLAN_MAP = {
  Starter: "Basic",
  Growth: "Standard",
  Pro: "Premium",
};

// PLANS DATA - Using PricePlansDetails content with NewSubscriptionPlans names
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    backendName: PLAN_MAP["Starter"],
    price: "£495",
    period: "per year",
    priceINR: 495,
    priceDisplay: "£495/year",
    tagline: "Perfect for small local movers",
    featured: false,
    bullets: [
      "Membership: 2 Months",
      "Free Entry Views: 20",
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
    price: "£995",
    period: "per year",
    priceINR: 995,
    priceDisplay: "£995/year",
    tagline: "Ideal for expanding moving companies",
    featured: true,
    highlight: "Most Popular",
    bullets: [
      "Membership: 6 Months",
      "Free Entry Views: 50",
      "Phone/Email Support",
      "Profile Page",
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
    price: "£1595",
    period: "per year",
    priceINR: 1595,
    priceDisplay: "£1595/year",
    tagline: "Best for high-volume UK logistics teams",
    featured: false,
    bullets: [
      "Membership: 1 Year",
      "Free Entry Views: Unlimited",
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

// FAQ DATA
const FAQ_DATA = [
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.",
  },
  {
    question: "What happens when my plan expires?",
    answer: "Your listing will remain active but with reduced visibility. You'll receive reminders before expiration to renew your plan.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service. No questions asked.",
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel anytime from your dashboard. Your plan will remain active until the end of the billing period.",
  },
];

const NewSubscriptionPlans = () => {
  const navigate = useNavigate();
  const [showFaq, setShowFaq] = useState({});
  const [comparisonPlans, setComparisonPlans] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

  const handleSubscribe = (plan) => {
    const finalPlan = {
      ...plan,
      name: plan.backendName, // important for backend
    };
    navigate("/onboarding/payment", { state: { plan: finalPlan } });
  };

  const handleCompareToggle = (planId) => {
    if (comparisonPlans.includes(planId)) {
      setComparisonPlans(comparisonPlans.filter((id) => id !== planId));
    } else {
      if (comparisonPlans.length < 2) {
        setComparisonPlans([...comparisonPlans, planId]);
      } else {
        toast.info("You can compare up to 2 plans at a time");
      }
    }
  };

  const handleCompareView = () => {
    if (comparisonPlans.length === 2) {
      setCompareMode(true);
    } else {
      toast.info("Please select exactly 2 plans to compare");
    }
  };

  const getBulletIcon = (bullet) => {
    const bulletLower = bullet.toLowerCase();

    const iconMap = [
      { keywords: ["email"], icon: <FaEnvelope className="text-pink-600" /> },
      { keywords: ["support", "headset"], icon: <FaHeadset className="text-blue-500" /> },
      { keywords: ["membership"], icon: <FaGem className="text-purple-500" /> },
      { keywords: ["unlimited"], icon: <FaInfinity className="text-pink-600" /> },
      { keywords: ["priority"], icon: <FaBolt className="text-yellow-500" /> },
      { keywords: ["profile", "page"], icon: <FaUserTie className="text-gray-600" /> },
      { keywords: ["map"], icon: <FaBuilding className="text-blue-500" /> },
      { keywords: ["quote"], icon: <FaMoneyBillWave className="text-green-600" /> },
      { keywords: ["gallery", "image"], icon: <FaEye className="text-gray-600" /> },
      { keywords: ["survey", "booking"], icon: <FaCalendarCheck className="text-blue-500" /> },
      { keywords: ["hide", "competitor"], icon: <FaShieldAlt className="text-blue-600" /> },
      { keywords: ["featured", "badge"], icon: <FaMedal className="text-yellow-500" /> },
      { keywords: ["ranking", "top"], icon: <FaTrophy className="text-pink-600" /> },
      { keywords: ["exclusive", "win"], icon: <FaCrown className="text-purple-500" /> },
    ];

    const match = iconMap.find((item) =>
      item.keywords.some((keyword) => bulletLower.includes(keyword))
    );

    return match ? match.icon : <FaRegCheckCircle className="text-pink-600" />;
  };

  const renderPlanCard = (plan, index) => {
    const isSelected = comparisonPlans.includes(plan.id);

    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`relative rounded-2xl p-6 sm:p-8 h-full flex flex-col transition-all duration-300 ${plan.featured
            ? "bg-gradient-to-br from-white to-gray-50 border-2 border-pink-200 shadow-xl transform hover:-translate-y-1"
            : "bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300"
          }`}
      >
        {/* Sparkle effect for featured */}
        {plan.featured && (
          <div className="absolute -top-2 -right-2">
            <FaStar className="text-pink-400 text-2xl" />
          </div>
        )}

        {/* Highlight badge */}
        {plan.highlight && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
              <FaMedal className="text-yellow-300" />
              {plan.highlight}
            </div>
          </div>
        )}

        {/* Compare checkbox */}
        <div className="absolute top-4 right-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCompareToggle(plan.id)}
              className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 rounded focus:ring-pink-500 border-gray-300"
            />
            <span className="text-xs sm:text-sm text-gray-600">Compare</span>
          </label>
        </div>

        {/* Plan Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-100 to-pink-50 rounded-full flex items-center justify-center">
            {plan.id === "starter" && <span className="text-3xl sm:text-4xl">⭐</span>}
            {plan.id === "growth" && <span className="text-3xl sm:text-4xl">📈</span>}
            {plan.id === "pro" && <span className="text-3xl sm:text-4xl">🚀</span>}
          </div>
        </div>

        {/* Plan Name */}
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
          {plan.name}
        </h3>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-center text-gray-600 mb-4 min-h-[48px]">
          {plan.tagline}
        </p>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-pink-600">
              {plan.price}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{plan.period}</p>
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-6 flex-grow">
          {plan.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getBulletIcon(bullet)}</div>
              <span className="text-sm sm:text-base text-gray-700">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Subscribe Button */}
        <button
          onClick={() => handleSubscribe(plan)}
          className={`w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 ${plan.featured
              ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105"
              : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
            }`}
        >
          Subscribe Now
          <FaArrowRight className="text-sm" />
        </button>
      </motion.div>
    );
  };

  const renderComparisonTable = () => {
    if (!compareMode || comparisonPlans.length !== 2) return null;

    const plan1 = PLANS.find((p) => p.id === comparisonPlans[0]);
    const plan2 = PLANS.find((p) => p.id === comparisonPlans[1]);

    if (!plan1 || !plan2) return null;

    return (
      <div className="mt-12 bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Plan Comparison</h3>
          <button
            onClick={() => {
              setCompareMode(false);
              setComparisonPlans([]);
            }}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-2 sm:px-4 text-sm sm:text-base font-semibold text-gray-700">
                  Feature
                </th>
                <th className="text-center py-4 px-2 sm:px-4 text-sm sm:text-base font-semibold text-pink-600">
                  {plan1.name}
                </th>
                <th className="text-center py-4 px-2 sm:px-4 text-sm sm:text-base font-semibold text-pink-600">
                  {plan2.name}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2 sm:px-4 text-sm sm:text-base font-medium text-gray-700">
                  Price
                </td>
                <td className="py-4 px-2 sm:px-4 text-center text-sm sm:text-base font-bold text-pink-600">
                  {plan1.price}
                </td>
                <td className="py-4 px-2 sm:px-4 text-center text-sm sm:text-base font-bold text-pink-600">
                  {plan2.price}
                </td>
              </tr>
              {plan1.bullets.map((bullet, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700">{bullet}</td>
                  <td className="py-3 px-2 sm:px-4 text-center">
                    <FaCheckCircle className="inline text-green-500 text-base sm:text-lg" />
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center">
                    {plan2.bullets.includes(bullet) ? (
                      <FaCheckCircle className="inline text-green-500 text-base sm:text-lg" />
                    ) : (
                      <FaTimes className="inline text-gray-300 text-base sm:text-lg" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaCrown className="text-3xl sm:text-4xl md:text-5xl text-yellow-300" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold">
                Subscription Plans
              </h1>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl mb-4 text-pink-100">
              Choose a plan that matches your business goals
            </p>
            <p className="text-sm sm:text-base md:text-lg text-pink-50 max-w-3xl mx-auto">
              Upgrade anytime as you grow — no hidden fees, no long-term lock-ins
            </p>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-lg sm:text-xl" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <FaHeart className="text-lg sm:text-xl" />
                <span>30-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <FaSmile className="text-lg sm:text-xl" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        {/* Compare Button */}
        {comparisonPlans.length === 2 && !compareMode && (
          <div className="mb-8 text-center">
            <button
              onClick={handleCompareView}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <FaChartBar />
              Compare Selected Plans
            </button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {PLANS.map((plan, index) => renderPlanCard(plan, index))}
        </div>

        {/* Comparison Table */}
        {renderComparisonTable()}

        {/* Why Choose Us */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Why Choose Local Moves?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-2xl sm:text-3xl text-pink-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Trusted Platform
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Join thousands of moving companies across the UK
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-2xl sm:text-3xl text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Grow Your Business
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get more leads and bookings every month
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="text-2xl sm:text-3xl text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our team is here to help you succeed
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-2xl sm:text-3xl text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Easy Setup
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get started in minutes, no technical skills needed
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setShowFaq((prev) => ({ ...prev, [index]: !prev[index] }))
                  }
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-left text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <FaInfoCircle
                    className={`text-pink-600 text-lg sm:text-xl flex-shrink-0 ml-4 transition-transform ${showFaq[index] ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {showFaq[index] && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 text-center bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Moving Business?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-pink-100">
            Join Local Moves today and start getting more customers
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white text-pink-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2"
          >
            View Plans
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSubscriptionPlans;
