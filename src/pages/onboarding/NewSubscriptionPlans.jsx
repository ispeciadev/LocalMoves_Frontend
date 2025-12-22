import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaCrown,
  FaCalendarAlt,
  FaCheckCircle,
  FaStar,
  FaRocket,
  FaBullhorn,
  FaChartLine,
  FaUsers,
  FaHeadset,
  FaThumbsUp,
  FaArrowRight,
  FaBolt,
  FaGem,
  FaRegCheckCircle,
  FaTimes,
  FaInfinity,
  FaSmile,
  FaMedal,
  FaShieldAlt,
  FaClock,
  FaEnvelope,
  FaUserTie,
  FaChartBar,
  FaEye,
  FaMoneyBillWave,
  FaBuilding,
  FaCalendarCheck,
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
  Basic: "Basic",
  Standard: "Standard",
  Premium: "Premium",
};

// PLANS DATA - Matching PricePlansDetails exactly
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    backendName: PLAN_MAP["Basic"],
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
    ],
  },
  {
    id: "standard",
    name: "Standard",
    backendName: PLAN_MAP["Standard"],
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
    ],
  },
  {
    id: "premium",
    name: "Premium",
    backendName: PLAN_MAP["Premium"],
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
      "Profile Page",
      "Map Display",
      "Quote Display",
      "Image Gallery",
    ],
  },
];

const NewSubscriptionPlans = () => {
  const navigate = useNavigate();
  const planRef = useRef(null);
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
      planRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    ];

    const match = iconMap.find((item) =>
      item.keywords.some((keyword) => bulletLower.includes(keyword))
    );

    return match ? match.icon : <FaRegCheckCircle className="text-pink-600" />;
  };

  const getPlanIcon = (planId) => {
    const icons = {
      basic: <span className="text-2xl">⭐</span>,
      standard: <span className="text-2xl">📈</span>,
      premium: <span className="text-2xl">🚀</span>,
    };
    return icons[planId] || <FaStar className="text-pink-600" />;
  };

  const renderPlanCard = (plan, index) => {
    const isSelected = comparisonPlans.includes(plan.id);

    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`relative rounded-2xl p-8 h-full flex flex-col transition-all duration-300 ${plan.featured
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
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
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
              className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 border-gray-300"
            />
            <span className="text-sm text-gray-600">Compare</span>
          </label>
        </div>

        {/* Plan icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 mb-4">
            {getPlanIcon(plan.id)}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{plan.name} Plan</h3>
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-end justify-center">
            <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-600 ml-2">{plan.period}</span>
          </div>
        </div>

        {/* Features list */}
        <div className="flex-grow">
          <ul className="space-y-3">
            {plan.bullets.slice(0, 6).map((bullet, i) => (
              <li key={i} className="flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="flex-shrink-0 mt-1 mr-3">
                  {getBulletIcon(bullet)}
                </span>
                <span className="text-gray-700 text-sm">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => handleSubscribe(plan)}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            Subscribe Now <FaArrowRight className="ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderComparisonTable = () => {
    const plan1 = PLANS.find((p) => p.id === comparisonPlans[0]);
    const plan2 = PLANS.find((p) => p.id === comparisonPlans[1]);

    if (!plan1 || !plan2) return null;

    const allFeatures = [...new Set([...plan1.bullets, ...plan2.bullets])];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-gray-200"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Plan Comparison</h3>
            <p className="text-gray-600">Side-by-side feature comparison</p>
          </div>
          <button
            onClick={() => {
              setCompareMode(false);
              setComparisonPlans([]);
            }}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="text-left p-4 text-gray-800 font-bold">Features</th>
                <th className="text-center p-4">
                  <div className="font-bold text-xl text-gray-900">{plan1.name}</div>
                  <div className="text-gray-600 font-bold">{plan1.price} {plan1.period}</div>
                </th>
                <th className="text-center p-4">
                  <div className="font-bold text-xl text-gray-900">{plan2.name}</div>
                  <div className="text-gray-600 font-bold">{plan2.price} {plan2.period}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4 font-medium text-gray-800">{feature}</td>
                  <td className="p-4 text-center">
                    {plan1.bullets.includes(feature) ? (
                      <FaCheckCircle className="text-green-500 mx-auto text-xl" />
                    ) : (
                      <FaTimes className="text-gray-300 mx-auto text-xl" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {plan2.bullets.includes(feature) ? (
                      <FaCheckCircle className="text-green-500 mx-auto text-xl" />
                    ) : (
                      <FaTimes className="text-gray-300 mx-auto text-xl" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => handleSubscribe(plan1)}
            className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-lg"
          >
            Choose {plan1.name}
          </button>
          <button
            onClick={() => handleSubscribe(plan2)}
            className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-lg"
          >
            Choose {plan2.name}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-pink-600 to-pink-500 text-white py-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-pink-700 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-800 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-block mb-4 sm:mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-1.5 sm:py-2 border border-white/20 inline-flex items-center gap-2">
                <FaStar className="text-yellow-300 text-sm sm:text-base" />
                <span className="text-xs sm:text-sm font-semibold">TRUSTED BY 500+ BUSINESSES</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light px-4">
              Flexible pricing designed to help your moving business grow
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mt-8 sm:mt-12 md:mt-16">
            {/* Stat 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 group-hover:from-pink-200 group-hover:to-pink-100 transition-all">
                    <FaUsers className="text-3xl text-pink-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 mb-1">500+</div>
                    <div className="text-xs text-gray-500 font-medium">COMPANIES</div>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Trusted Platform</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Join hundreds of successful moving companies across the UK.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaRocket className="mr-2 text-pink-500" />
                    <span>Growing every day</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 group-hover:from-green-200 group-hover:to-green-100 transition-all">
                    <FaChartLine className="text-3xl text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 mb-1">98%</div>
                    <div className="text-xs text-gray-500 font-medium">SATISFACTION</div>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Client Success</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our clients see real growth in their moving business.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaThumbsUp className="mr-2 text-blue-500" />
                    <span>Rated excellent by clients</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-all">
                    <FaHeadset className="text-3xl text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900 mb-1">24/7</div>
                    <div className="text-xs text-gray-500 font-medium">SUPPORT</div>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Always Available</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Round-the-clock dedicated support for all your moving business needs.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-2 text-purple-500" />
                    <span>Instant response guarantee</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <button
                onClick={() => planRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-pink-600 hover:bg-gray-50 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <FaRocket className="text-pink-500" />
                View Plans
                <FaArrowRight />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white/80 px-4">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-400" />
                <span className="text-xs sm:text-sm">Secure Payments</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-blue-400" />
                <span className="text-xs sm:text-sm">No Hidden Fees</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <FaCalendarCheck className="text-purple-400" />
                <span className="text-xs sm:text-sm">Flexible Billing</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-4 py-16" ref={planRef}>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Subscription Plans
          </h2>
          <p className="text-gray-600 text-lg">
            Choose the plan that best fits your business needs
          </p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan, index) => renderPlanCard(plan, index))}
        </div>

        {/* Comparison Table */}
        {compareMode && renderComparisonTable()}
      </div>
    </div>
  );
};

export default NewSubscriptionPlans;
