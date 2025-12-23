// src/pages/logistic/BoltOnUpgrade.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import api from "../../api/axios";
import {
    FaBolt,
    FaCheckCircle,
    FaArrowRight,
    FaSmile,
    FaCrown,
} from "react-icons/fa";
import { motion } from "framer-motion";

// BOLT-ON UPGRADES
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

const BoltOnUpgrade = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) {
                navigate("/login");
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
    }, [user, isAuthenticated, navigate]);

    const handleAddToPlan = (plan) => {
        const finalPlan = {
            ...plan,
            name: plan.backendName,
        };
        navigate("/logistic-dashboard/payment", { state: { plan: finalPlan } });
    };

    const handleSkip = () => {
        // Mark that user has seen the bolt-on offer
        localStorage.setItem("boltOnOfferSeen", "true");
        navigate("/logistic-dashboard/home");
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
                        onClick={() => handleAddToPlan(plan)}
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl mb-4">
                        <FaBolt className="text-3xl sm:text-4xl text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Boost Your Plan!
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                        Enhance your existing plan with additional capacity when you need it
                    </p>

                    {/* Current Plan Info */}
                    {companyData && (
                        <div className="inline-block bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-3 rounded-lg shadow-md">
                                    <FaCrown className="text-white text-xl sm:text-2xl" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs sm:text-sm text-gray-600">Your Current Plan</p>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900">{companyData.subscription_plan}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Bolt-On Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8">
                    {BOLT_ON_PLANS.map((plan, index) => renderBoltOnCard(plan, index))}
                </div>

                {/* Skip Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <button
                        onClick={handleSkip}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-base sm:text-lg transition-colors underline decoration-2 underline-offset-4"
                    >
                        Skip to Dashboard <FaArrowRight />
                    </button>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        You can always add bolt-ons later from your subscription settings
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default BoltOnUpgrade;
