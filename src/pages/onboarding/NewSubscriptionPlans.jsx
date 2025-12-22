import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api/axios";
import HappyStories from "../../components/HappyStoriesSection";
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
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Professional Color Palette matching ComparePage
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

// PUBLIC PLANS
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "£495",
    period: "per year",
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
    price: "£995",
    period: "per year",
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
    price: "£1595",
    period: "per year",
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

// LEADS PLANS - Updated to match exact specification
const LEADS_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "£200",
    period: "per month",
    tagline: "Ideal for small businesses or those beginning structured lead generation",
    featured: false,
    bullets: [
      "20 qualified leads per month (average)",
      "Email support (48-hour response time)",
      "Advanced reporting suite",
      "Lead delivery by email",
      "Enhanced lead verification (telephone verification)",
      "Quarterly performance summary",
    ],
    bestFor: "Trading professionals, solo operators, and early-stage businesses",
  },
  {
    id: "growth",
    name: "Growth",
    price: "£400",
    period: "per month",
    tagline: "Designed for growing teams needing more consistent volumes",
    featured: true,
    highlight: "Best Value",
    bullets: [
      "50 qualified leads per month",
      "Priority email support (24-hour response time)",
      "Advanced reporting suite",
      "Lead delivery by email & SMS",
      "Enhanced lead verification (telephone verification)",
      "Monthly performance review",
      "Dedicated account manager",
      "Early access to product updates",
    ],
    bestFor: "Small to medium teams focused on predictable growth with higher monthly volume",
  },
  {
    id: "pro",
    name: "Pro",
    price: "£700",
    period: "per month",
    tagline: "Built for scaling operations that require high-volume, high-quality lead flow",
    featured: false,
    bullets: [
      "100 qualified leads per month",
      "Priority support (same-day response)",
      "Advanced reporting suite",
      "Lead delivery by email & SMS or WhatsApp",
      "Enhanced lead verification (telephone verification)",
      "Twice-monthly performance review",
      "Dedicated account manager",
      "Early access to new lead channels",
    ],
    bestFor: "Businesses scaling aggressively, hiring new staff, or managing multiple locations",
  },
];

// JOBS PLANS - Updated to match exact specification
const JOBS_PLANS = [
  {
    id: "founder",
    name: "Founder",
    price: "£500",
    period: "per month",
    tagline: "Perfect for small or newly established businesses that need consistent, ready-to-deliver jobs without the workload of lead chasing",
    featured: false,
    bullets: [
      "5 fully booked jobs per month",
      "Each job includes verified customer details, confirmed booking date and deposit taken",
      "Full handling of lead qualification → quote → booking → payment securing",
      "Customer communication handled on your behalf",
      "Advanced reporting dashboard",
      "Email support (48-hour response time)",
    ],
    bestFor: "Small businesses, solo operators, and teams that can only handle a handful of guaranteed monthly jobs",
  },
  {
    id: "advanced",
    name: "Advanced",
    price: "£900",
    period: "per month",
    tagline: "Designed for growing trades and service companies that want a stronger pipeline of confirmed jobs without internal admin burden",
    featured: true,
    highlight: "Recommended",
    bullets: [
      "10 fully booked jobs per month",
      "Multi-step qualification and conversion process",
      "Dedicated account manager",
      "Deposit handling & payment confirmation",
      "Advanced reporting dashboard",
      "Priority email support (24-hour response)",
      "Monthly performance review",
      "Appointment scheduling with customer reminders",
    ],
    bestFor: "Growing companies aiming for predictable monthly revenue with minimal admin time",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "£1700",
    period: "per month",
    tagline: "Built for larger or scaling businesses requiring high-volume, reliably converted jobs every month",
    featured: false,
    bullets: [
      "20 fully booked jobs per month",
      "Full sales pipeline handling: lead → qualification → consultation → booking → deposit",
      "Dedicated account manager",
      "Deposit handling & payment confirmation",
      "Advanced reporting dashboard",
      "Same-day priority support",
      "Fortnightly performance reviews",
      "Improved reporting & job forecasting tools",
    ],
    bestFor: "Multi-team operations, franchises, or businesses scaling fast and needing high output with minimal effort",
  },
];

const NewSubscriptionPlans = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const planRef = useRef(null);
  const tabsRef = useRef(null); // Ref for tabs section

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comparisonPlans, setComparisonPlans] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

  // FETCH USER PLAN DETAILS
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(
          "localmoves.api.company.get_company_details",
          {
            params: { email: user?.email },
          }
        );
        setCompanyData(res.data?.message?.data?.[0] || null);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, isAuthenticated]);

  // AUTO-SCROLL TO TABS ON PAGE LOAD
  useEffect(() => {
    // Wait for page to render, then scroll to tabs
    const timer = setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500); // 500ms delay to allow page to render

    return () => clearTimeout(timer);
  }, []);

  const handleStartAction = (plan) => {
    // Navigate to payment with plan data
    if (plan) {
      navigate("/onboarding/payment", { state: { plan } });
    } else {
      toast.info("Please select a plan to continue");
    }
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCompareToggle = (planId) => {
    if (comparisonPlans.includes(planId)) {
      setComparisonPlans(comparisonPlans.filter(id => id !== planId));
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
      { keywords: ["reporting", "dashboard", "chart"], icon: <FaChartBar className="text-green-500" /> },
      { keywords: ["lead"], icon: <FaBullhorn className="text-pink-600" /> },
      { keywords: ["job", "briefcase"], icon: <FaBriefcase className="text-purple-500" /> },
      { keywords: ["manager", "account"], icon: <FaUserTie className="text-gray-600" /> },
      { keywords: ["deposit", "payment", "money"], icon: <FaMoneyBillWave className="text-green-600" /> },
      { keywords: ["verification", "verified", "shield"], icon: <FaShieldAlt className="text-blue-600" /> },
      { keywords: ["communication", "sms", "whatsapp", "phone"], icon: <FaSms className="text-green-500" /> },
      { keywords: ["review", "summary", "eye"], icon: <FaEye className="text-gray-600" /> },
      { keywords: ["access", "update", "cog"], icon: <FaCog className="text-gray-600" /> },
      { keywords: ["scheduling", "appointment", "calendar"], icon: <FaCalendarCheck className="text-blue-500" /> },
      { keywords: ["best for"], icon: <FaThumbsUp className="text-green-500" /> },
      { keywords: ["membership"], icon: <FaGem className="text-purple-500" /> },
      { keywords: ["unlimited"], icon: <FaInfinity className="text-pink-600" /> },
      { keywords: ["priority"], icon: <FaBolt className="text-yellow-500" /> },
    ];

    const match = iconMap.find(item =>
      item.keywords.some(keyword => bulletLower.includes(keyword))
    );

    return match ? match.icon : <FaRegCheckCircle className="text-pink-600" />;
  };

  const getPlanIcon = (planId, tab) => {
    const icons = {
      leads: {
        starter: <span className="text-2xl">⭐</span>, // Star emoji
        growth: <span className="text-2xl">📈</span>, // Chart emoji
        pro: <span className="text-2xl">🚀</span>, // Rocket emoji
      },
      jobs: {
        founder: <span className="text-2xl">🌱</span>, // Seedling emoji
        advanced: <span className="text-2xl">📘</span>, // Blue book emoji
        enterprise: <span className="text-2xl">🏆</span>, // Trophy emoji
      },
    };

    return icons[tab]?.[planId] || <FaStar className="text-pink-600" />;
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
          ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-pink-200 shadow-xl transform hover:-translate-y-1'
          : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300'
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
            {getPlanIcon(plan.id, activeTab)}
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

          {plan.bestFor && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start">
                <FaSmile className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Best for:</p>
                  <p className="text-gray-600 text-sm">{plan.bestFor}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => handleViewDetails(plan)}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold transition duration-300 hover:border-gray-400"
          >
            View Details
          </button>
          <button
            onClick={() => handleStartAction(plan)}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            Subscribe Now <FaArrowRight className="ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderComparisonTable = () => {
    const plans = activeTab === "leads" ? LEADS_PLANS : JOBS_PLANS;
    const plan1 = plans.find(p => p.id === comparisonPlans[0]);
    const plan2 = plans.find(p => p.id === comparisonPlans[1]);

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
            onClick={() => handleStartAction(plan1)}
            className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-lg"
          >
            Choose {plan1.name}
          </button>
          <button
            onClick={() => handleStartAction(plan2)}
            className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-lg"
          >
            Choose {plan2.name}
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="relative bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 shadow-xl">
              <FaCrown className="text-3xl sm:text-4xl text-white" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight"
          >
            Subscription Plans
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light mb-6 sm:mb-8"
          >
            Choose the perfect plan for your moving business and start growing today
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/80"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <FaCheckCircle className="text-green-300" />
              <span className="text-sm sm:text-base">No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <FaRocket className="text-yellow-300" />
              <span className="text-sm sm:text-base">Instant Activation</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <FaShieldAlt className="text-blue-300" />
              <span className="text-sm sm:text-base">Secure Payment</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* User Current Plan */}
      {isAuthenticated && companyData && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-3 sm:p-4 rounded-lg sm:rounded-xl mr-4 sm:mr-6 shadow-md">
                  <FaCrown className="text-white text-2xl sm:text-3xl" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Current Plan</h2>
                  <p className="text-sm sm:text-base text-gray-600">{companyData.subscription_plan} Plan</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-gray-600 text-sm mb-1">Price</div>
                  <div className="text-2xl font-bold text-gray-800">₹{companyData.price || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 text-sm mb-1">Renewal Date</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {companyData.subscription_end_date || "N/A"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 text-sm mb-1">Free Entries</div>
                  <div className="text-xl font-bold text-pink-600">
                    {companyData.subscription_plan === "Premium"
                      ? "Unlimited"
                      : companyData.requests_viewed_this_month || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan Features</h3>
              <div className="flex flex-wrap gap-3">
                {(JSON.parse(companyData.includes || "[]") || []).map((item, idx) => (
                  <div key={idx} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm flex items-center shadow-sm">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs Section with Pink Toggle */}
      <div ref={tabsRef} className="flex flex-col items-center mb-8 sm:mb-12 pt-12 sm:pt-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
          Choose Your Service Type
        </h2>

        <div className="inline-flex rounded-full bg-gray-100 p-2 shadow-inner relative">
          {/* Pink toggle background indicator */}
          <motion.div
            layout
            className="absolute bg-gradient-to-r from-pink-600 to-pink-500 rounded-full shadow-lg"
            style={{
              width: 'calc(50% - 4px)',
              height: 'calc(100% - 8px)',
              left: activeTab === "leads" ? '4px' : 'calc(50% + 4px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Leads Tab */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab("leads");
              planRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center relative z-10 ${activeTab === "leads"
              ? "text-white"
              : "text-gray-700 hover:text-gray-900"
              }`}
          >
            <FaBullhorn className="mr-1 sm:mr-2 text-sm sm:text-base" />
            <span className="hidden sm:inline">Leads Generation</span>
            <span className="sm:hidden">Leads</span>
          </motion.button>

          {/* Jobs Tab */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab("jobs");
              planRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center relative z-10 ${activeTab === "jobs"
              ? "text-white"
              : "text-gray-700 hover:text-gray-900"
              }`}
          >
            <FaBriefcase className="mr-1 sm:mr-2 text-sm sm:text-base" />
            <span className="hidden sm:inline">Jobs Booking</span>
            <span className="sm:hidden">Jobs</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16" ref={planRef}>
        {/* Tab Information Banner */}
        <div className="mb-8 sm:mb-12 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {activeTab === "leads" ? (
              <>
                <span className="text-xl sm:text-2xl">📊</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Leads</h3>
              </>
            ) : (
              <>
                <span className="text-xl sm:text-2xl">📦</span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Jobs</h3>
              </>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3 text-gray-700">
            {activeTab === "leads" ? (
              <>
                <p className="text-sm sm:text-base text-gray-600">All plans provide leads with verified phone numbers.</p>
                <p className="text-sm sm:text-base text-gray-600">All plans are billed monthly and require a 12-month contract.</p>
                <p className="text-sm sm:text-base text-gray-600">Lead figures shown represent average monthly volumes.</p>
              </>
            ) : (
              <>
                <p className="text-sm sm:text-base text-gray-600">All plans provide fully booked-in jobs (deposit taken).</p>
                <p className="text-sm sm:text-base text-gray-600">Pricing shown is per month, on a 12-month contract.</p>
                <p className="text-sm sm:text-base text-gray-600">Job numbers represent an average per month.</p>
              </>
            )}
          </div>
        </div>

        {/* Compare button */}
        {comparisonPlans.length > 0 && !compareMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <button
              onClick={handleCompareView}
              className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition duration-300 flex items-center shadow-md hover:shadow-lg"
            >
              <FaEye className="mr-2" />
              Compare Plans ({comparisonPlans.length}/2)
            </button>
          </motion.div>
        )}

        {/* Plans Grid */}
        {!compareMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {(activeTab === "leads" ? LEADS_PLANS : JOBS_PLANS).map((plan, index) =>
              renderPlanCard(plan, index)
            )}
          </div>
        ) : (
          renderComparisonTable()
        )}
      </div>

      {/* Plan Details Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-start sm:items-center rounded-t-2xl">
              <div className="flex items-start sm:items-center flex-1 mr-2">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                  {getPlanIcon(selectedPlan.id, activeTab)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">{selectedPlan.name} Plan – {selectedPlan.price} {selectedPlan.period}</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{selectedPlan.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0"
              >
                <FaTimes size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  Includes:
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {selectedPlan.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <span className="flex-shrink-0 mt-1 mr-3 sm:mr-4">
                        <FaRegCheckCircle className="text-pink-600 text-sm sm:text-base" />
                      </span>
                      <span className="text-sm sm:text-base text-gray-800">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedPlan.bestFor && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                  <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                    <FaSmile className="text-gray-600 mr-2" />
                    Best for:
                  </h4>
                  <p className="text-gray-800">{selectedPlan.bestFor}</p>
                </div>
              )}

              {/* Plan Note */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="font-semibold text-blue-800 mb-1">Important Note:</p>
                    <p className="text-blue-700 text-sm">
                      {activeTab === "leads"
                        ? "Lead figures represent average monthly volumes. All plans require a 12-month contract."
                        : "Job numbers represent average monthly volumes. All plans require a 12-month contract."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition duration-300"
                >
                  Close
                </button>
                <button
                  onClick={handleStartAction}
                  className="px-8 py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white rounded-xl font-semibold transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  Get Started Now <FaArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Happy Stories Section */}
      <div className="mt-16">
        <HappyStories />
      </div>
    </div>
  );
};

export default NewSubscriptionPlans;