// src/pages/logistic/SubscriptionPlans.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api/axios";
import {
  FaCrown,
  FaCheckCircle,
  FaStar,
  FaRocket,
  FaBullhorn,
  FaBriefcase,
  FaShieldAlt,
  FaEnvelope,
  FaSms,
  FaMoneyBillWave,
  FaUserTie,
  FaChartBar,
  FaHeadset,
  FaEye,
  FaThumbsUp,
  FaArrowRight,
  FaBolt,
  FaGem,
  FaRegCheckCircle,
  FaTimes,
  FaInfinity,
  FaSmile,
  FaMedal,
  FaCog,
  FaCalendarCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

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

// PUBLIC PLANS
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    backendName: "Basic",
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
    backendName: "Standard",
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
    backendName: "Premium",
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

// LEADS PLANS
const LEADS_PLANS = [
  {
    id: "starter",
    name: "Starter",
    backendName: "Starter",
    price: "£200",
    period: "per month",
    priceINR: 200,
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
    backendName: "Growth",
    price: "£400",
    period: "per month",
    priceINR: 400,
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
    backendName: "Pro",
    price: "£700",
    period: "per month",
    priceINR: 700,
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

// JOBS PLANS
const JOBS_PLANS = [
  {
    id: "founder",
    name: "Founder",
    backendName: "Founder",
    price: "£500",
    period: "per month",
    priceINR: 500,
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
    backendName: "Advanced",
    price: "£900",
    period: "per month",
    priceINR: 900,
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
    backendName: "Enterprise",
    price: "£1700",
    period: "per month",
    priceINR: 1700,
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

// BOLT-ON UPGRADES (for existing subscribers)
const BOLT_ON_PLANS = [
  {
    id: "extra-leads",
    name: "Extra Leads",
    backendName: "Extra Leads",
    price: "£400",
    period: "bolt-on",
    priceINR: 400,
    tagline: "Add more volume to any plan",
    featured: false,
    isBoltOn: true,
    bullets: [
      "50 additional qualified leads",
      "Available on: Starter, Growth, or Pro plans",
      "No change to support or reporting tier—keeps your main plan benefits",
      "Can be added at any point during the 12-month contract",
    ],
    bestFor: "Businesses experiencing seasonal peaks or expanding into new service areas",
  },
  {
    id: "additional-jobs",
    name: "Additional Jobs",
    backendName: "Additional Jobs",
    price: "£600",
    period: "bolt-on",
    priceINR: 600,
    tagline: "For businesses experiencing demand spikes or needing extra booked-in work",
    featured: false,
    isBoltOn: true,
    bullets: [
      "5 fully booked jobs",
      "Can be added to any plan",
      "No change to support tier—keeps your main plan benefits",
      "Add or remove bolt-ons at renewal",
    ],
    bestFor: "Ideal for seasonal peaks or rapid expansion",
  },
];

const SubscriptionPlans = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const planRef = useRef(null);
  const tabsRef = useRef(null);

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");

  // FETCH USER PLAN DETAILS
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const userEmail = user?.email;
        const response = await api.get(
          "localmoves.api.company.get_my_company",
          {
            params: { email: userEmail },
          }
        );
        setCompanyData(response.data?.message?.data?.[0] || null);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user, isAuthenticated]);

  // PAYMENT HANDLER
  const handleStartAction = (plan) => {
    if (plan) {
      const finalPlan = {
        ...plan,
        name: plan.backendName,
      };
      navigate("/logistic-dashboard/payment", { state: { plan: finalPlan } });
    } else {
      toast.info("Please select a plan to continue");
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
        starter: <span className="text-2xl">⭐</span>,
        growth: <span className="text-2xl">📈</span>,
        pro: <span className="text-2xl">🚀</span>,
      },
      jobs: {
        founder: <span className="text-2xl">🌱</span>,
        advanced: <span className="text-2xl">📘</span>,
        enterprise: <span className="text-2xl">🏆</span>,
      },
    };

    return icons[tab]?.[planId] || <FaCrown className="text-2xl text-pink-600" />;
  };

  const renderPlanCard = (plan, index) => {
    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`relative rounded-2xl p-6 sm:p-8 h-full flex flex-col transition-all duration-300 ${plan.featured
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
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
              <FaMedal className="text-yellow-300" />
              {plan.highlight}
            </div>
          </div>
        )}

        {/* Plan icon */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 mb-3 sm:mb-4">
            {getPlanIcon(plan.id, activeTab)}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{plan.name} Plan</h3>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm leading-relaxed">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-end justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-600 ml-2 text-sm sm:text-base">{plan.period}</span>
          </div>
        </div>

        {/* Features list */}
        <div className="flex-grow">
          <ul className="space-y-2 sm:space-y-3">
            {plan.bullets.slice(0, 6).map((bullet, i) => (
              <li key={i} className="flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="flex-shrink-0 mt-1 mr-2 sm:mr-3">
                  {getBulletIcon(bullet)}
                </span>
                <span className="text-gray-700 text-xs sm:text-sm">{bullet}</span>
              </li>
            ))}
          </ul>

          {plan.bestFor && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="flex items-start">
                <FaSmile className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">Best for:</p>
                  <p className="text-gray-600 text-xs sm:text-sm">{plan.bestFor}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={() => handleStartAction(plan)}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            Subscribe Now <FaArrowRight className="ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderBoltOnCard = (plan, index) => {
    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="relative rounded-2xl p-6 sm:p-8 h-full flex flex-col transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
      >
        {/* Lightning bolt badge */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
            <FaBolt className="text-white" />
            Bolt-On Upgrade
          </div>
        </div>

        {/* Plan icon */}
        <div className="text-center mb-4 sm:mb-6 mt-4">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 mb-3 sm:mb-4">
            <FaBolt className="text-3xl text-orange-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">⚡ {plan.name}</h3>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm leading-relaxed">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-end justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-orange-600">{plan.price}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">One-time add-on</p>
        </div>

        {/* Features list */}
        <div className="flex-grow">
          <ul className="space-y-2 sm:space-y-3">
            {plan.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start p-2 hover:bg-yellow-100 rounded-lg transition-colors">
                <span className="flex-shrink-0 mt-1 mr-2 sm:mr-3">
                  <FaCheckCircle className="text-orange-600" />
                </span>
                <span className="text-gray-700 text-xs sm:text-sm">{bullet}</span>
              </li>
            ))}
          </ul>

          {plan.bestFor && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-orange-200">
              <div className="flex items-start">
                <FaSmile className="text-orange-400 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">Best for:</p>
                  <p className="text-gray-600 text-xs sm:text-sm">{plan.bestFor}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={() => handleStartAction(plan)}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            Add to Plan <FaArrowRight className="ml-2" />
          </button>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-scrollbar w-full h-full overflow-auto bg-gray-50 flex items-center justify-center">
        <style>{`
          .dashboard-scrollbar::-webkit-scrollbar { display: none; }
          .dashboard-scrollbar { scrollbar-width: none; }
        `}</style>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-scrollbar w-full h-full overflow-auto bg-gray-50">
      <style>{`
        .dashboard-scrollbar::-webkit-scrollbar { display: none; }
        .dashboard-scrollbar { scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl border-2 border-pink-300 shadow-xl mb-4">
              <FaCrown className="text-3xl sm:text-4xl text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6"
          >
            Subscription Plans
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Choose the perfect plan for your moving business and start growing today
          </motion.p>
        </div>

        {/* User Current Plan */}
        {isAuthenticated && companyData && (
          <div className="mb-8 sm:mb-12">
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
                    <div className="text-2xl font-bold text-gray-800">£{companyData.price || 0}</div>
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
                  {(() => {
                    try {
                      const features = companyData.includes
                        ? (companyData.includes.startsWith('[')
                          ? JSON.parse(companyData.includes)
                          : companyData.includes.split(',').map(f => f.trim()))
                        : [];
                      return features.map((item, idx) => (
                        <div key={idx} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm flex items-center shadow-sm">
                          <FaCheckCircle className="text-green-500 mr-2" />
                          {item}
                        </div>
                      ));
                    } catch (error) {
                      console.error("Error parsing features:", error);
                      return null;
                    }
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs Section */}
        <div ref={tabsRef} className="flex flex-col items-center mb-8 sm:mb-12">
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

        {/* Plans Grid */}
        <div ref={planRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {(activeTab === "leads" ? LEADS_PLANS : JOBS_PLANS).map((plan, index) => renderPlanCard(plan, index))}
        </div>

        {/* Bolt-On Upgrades Section - Only show if user has active subscription */}
        {isAuthenticated && companyData && companyData.subscription_plan && companyData.subscription_plan !== "Free" && (
          <div className="mt-16 sm:mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl mb-4">
                <FaBolt className="text-3xl sm:text-4xl text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Bolt-On Upgrades
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Enhance your existing plan with additional capacity when you need it
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {BOLT_ON_PLANS.map((plan, index) => renderBoltOnCard(plan, index))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-gray-500 text-xs sm:text-sm text-center"
        >
          All subscriptions auto-renew yearly. Cancel anytime from your dashboard.
        </motion.p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
