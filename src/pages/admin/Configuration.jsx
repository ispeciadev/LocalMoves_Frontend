// src/pages/admin/Configuration.jsx
import React, { useEffect, useState } from "react";
import {
    FaCog,
    FaDollarSign,
    FaTruck,
    FaCalculator,
    FaSave,
    FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const Configuration = () => {
    const { isDarkMode } = useAdminThemeStore();
    const [activeTab, setActiveTab] = useState("system");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // System Configuration State
    const [systemConfig, setSystemConfig] = useState({});
    const [systemForm, setSystemForm] = useState({});

    // Pricing Configuration State
    const [pricingConfig, setPricingConfig] = useState({});
    const [pricingForm, setPricingForm] = useState({});

    // Vehicle Configuration State
    const [vehicleConfig, setVehicleConfig] = useState({});
    const [vehicleForm, setVehicleForm] = useState({});

    // Multiplier Configuration State
    const [multiplierConfig, setMultiplierConfig] = useState({});
    const [multiplierForm, setMultiplierForm] = useState({});

    // Tabs configuration
    const tabs = [
        { id: "system", label: "System", icon: FaCog },
        { id: "pricing", label: "Pricing", icon: FaDollarSign },
        { id: "vehicle", label: "Vehicle", icon: FaTruck },
        { id: "multiplier", label: "Multiplier", icon: FaCalculator },
    ];

    // ================== FETCH FUNCTIONS ==================
    const fetchSystemConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get("localmoves.api.dashboard.get_system_configuration");
            const data = res.data?.message?.data || {};
            setSystemConfig(data);
            setSystemForm(data);
        } catch (error) {
            console.error("Failed to fetch system configuration:", error);
            toast.error("Failed to load system configuration");
        } finally {
            setLoading(false);
        }
    };

    const fetchPricingConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get("localmoves.api.dashboard.get_pricing_configuration");
            const data = res.data?.message?.data || {};
            setPricingConfig(data);
            setPricingForm(data);
        } catch (error) {
            console.error("Failed to fetch pricing configuration:", error);
            toast.error("Failed to load pricing configuration");
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get("localmoves.api.dashboard.get_vehicle_configuration");
            const data = res.data?.message?.data || {};
            setVehicleConfig(data);
            setVehicleForm(data);
        } catch (error) {
            console.error("Failed to fetch vehicle configuration:", error);
            toast.error("Failed to load vehicle configuration");
        } finally {
            setLoading(false);
        }
    };

    const fetchMultiplierConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get("localmoves.api.dashboard.get_multiplier_configuration");
            const data = res.data?.message?.data || {};
            setMultiplierConfig(data);
            setMultiplierForm(data);
        } catch (error) {
            console.error("Failed to fetch multiplier configuration:", error);
            toast.error("Failed to load multiplier configuration");
        } finally {
            setLoading(false);
        }
    };

    // ================== UPDATE FUNCTIONS ==================
    const updateSystemConfig = async () => {
        try {
            setSaving(true);
            await api.post("localmoves.api.dashboard.update_system_configuration", systemForm);
            toast.success("System configuration updated successfully");
            fetchSystemConfig();
        } catch (error) {
            console.error("Failed to update system configuration:", error);
            toast.error(error.response?.data?.message || "Failed to update system configuration");
        } finally {
            setSaving(false);
        }
    };

    const updatePricingConfig = async () => {
        try {
            setSaving(true);
            await api.post("localmoves.api.dashboard.update_pricing_configuration", pricingForm);
            toast.success("Pricing configuration updated successfully");
            fetchPricingConfig();
        } catch (error) {
            console.error("Failed to update pricing configuration:", error);
            toast.error(error.response?.data?.message || "Failed to update pricing configuration");
        } finally {
            setSaving(false);
        }
    };

    const updateVehicleConfig = async () => {
        try {
            setSaving(true);
            await api.post("localmoves.api.dashboard.update_vehicle_configuration", vehicleForm);
            toast.success("Vehicle configuration updated successfully");
            fetchVehicleConfig();
        } catch (error) {
            console.error("Failed to update vehicle configuration:", error);
            toast.error(error.response?.data?.message || "Failed to update vehicle configuration");
        } finally {
            setSaving(false);
        }
    };

    const updateMultiplierConfig = async () => {
        try {
            setSaving(true);
            await api.post("localmoves.api.dashboard.update_multiplier_configuration", multiplierForm);
            toast.success("Multiplier configuration updated successfully");
            fetchMultiplierConfig();
        } catch (error) {
            console.error("Failed to update multiplier configuration:", error);
            toast.error(error.response?.data?.message || "Failed to update multiplier configuration");
        } finally {
            setSaving(false);
        }
    };

    // ================== EFFECTS ==================
    useEffect(() => {
        switch (activeTab) {
            case "system":
                fetchSystemConfig();
                break;
            case "pricing":
                fetchPricingConfig();
                break;
            case "vehicle":
                fetchVehicleConfig();
                break;
            case "multiplier":
                fetchMultiplierConfig();
                break;
            default:
                break;
        }
    }, [activeTab]);

    // ================== HANDLERS ==================
    const handleSave = () => {
        switch (activeTab) {
            case "system":
                updateSystemConfig();
                break;
            case "pricing":
                updatePricingConfig();
                break;
            case "vehicle":
                updateVehicleConfig();
                break;
            case "multiplier":
                updateMultiplierConfig();
                break;
            default:
                break;
        }
    };

    const handleReset = () => {
        switch (activeTab) {
            case "system":
                setSystemForm(systemConfig);
                break;
            case "pricing":
                setPricingForm(pricingConfig);
                break;
            case "vehicle":
                setVehicleForm(vehicleConfig);
                break;
            case "multiplier":
                setMultiplierForm(multiplierConfig);
                break;
            default:
                break;
        }
        toast.info("Changes reset");
    };

    const handleRefresh = () => {
        switch (activeTab) {
            case "system":
                fetchSystemConfig();
                break;
            case "pricing":
                fetchPricingConfig();
                break;
            case "vehicle":
                fetchVehicleConfig();
                break;
            case "multiplier":
                fetchMultiplierConfig();
                break;
            default:
                break;
        }
    };

    // ================== RENDER FORM FIELDS ==================
    const renderFormField = (label, key, value, onChange, type = "text", options = null) => {
        return (
            <div className="space-y-2">
                <label
                    className={`block text-xs font-medium transition-colors ${isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                >
                    {label}
                </label>
                {options ? (
                    <select
                        value={value || ""}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition outline-none ${isDarkMode
                                ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                                : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                            }`}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value || ""}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition outline-none ${isDarkMode
                                ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                                : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                            }`}
                    />
                )}
            </div>
        );
    };

    // ================== RENDER TAB CONTENT ==================
    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className={`h-8 w-8 border-2 border-t-transparent rounded-full animate-spin ${isDarkMode ? "border-pink-400" : "border-pink-600"
                                }`}
                        />
                        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-400"}`}>
                            Loading configuration...
                        </p>
                    </div>
                </div>
            );
        }

        const updateForm = (key, value) => {
            switch (activeTab) {
                case "system":
                    setSystemForm({ ...systemForm, [key]: value });
                    break;
                case "pricing":
                    setPricingForm({ ...pricingForm, [key]: value });
                    break;
                case "vehicle":
                    setVehicleForm({ ...vehicleForm, [key]: value });
                    break;
                case "multiplier":
                    setMultiplierForm({ ...multiplierForm, [key]: value });
                    break;
                default:
                    break;
            }
        };

        switch (activeTab) {
            case "system":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(systemForm).map((key) => (
                            <div key={key}>
                                {renderFormField(
                                    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                                    key,
                                    systemForm[key],
                                    updateForm,
                                    typeof systemForm[key] === "number" ? "number" : "text"
                                )}
                            </div>
                        ))}
                    </div>
                );

            case "pricing":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(pricingForm).map((key) => (
                            <div key={key}>
                                {renderFormField(
                                    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                                    key,
                                    pricingForm[key],
                                    updateForm,
                                    typeof pricingForm[key] === "number" ? "number" : "text"
                                )}
                            </div>
                        ))}
                    </div>
                );

            case "vehicle":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(vehicleForm).map((key) => (
                            <div key={key}>
                                {renderFormField(
                                    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                                    key,
                                    vehicleForm[key],
                                    updateForm,
                                    typeof vehicleForm[key] === "number" ? "number" : "text"
                                )}
                            </div>
                        ))}
                    </div>
                );

            case "multiplier":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(multiplierForm).map((key) => (
                            <div key={key}>
                                {renderFormField(
                                    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                                    key,
                                    multiplierForm[key],
                                    updateForm,
                                    typeof multiplierForm[key] === "number" ? "number" : "text"
                                )}
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen overflow-hidden">
            <div className="pt-2 space-y-4 md:space-y-6 pb-4 md:pb-6 px-3 md:px-6 max-w-[1920px] mx-auto">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h2
                            className={`text-lg md:text-xl lg:text-2xl font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                                }`}
                        >
                            Configuration
                        </h2>
                        <p
                            className={`text-xs md:text-sm transition-colors truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                                }`}
                        >
                            Manage system, pricing, vehicle, and multiplier configurations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className={`self-start md:self-auto px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm hover:transition flex items-center gap-2 transition-colors flex-shrink-0 mt-2 md:mt-0 ${isDarkMode
                                ? "bg-pink-900/20 border-pink-700/50 text-pink-300 hover:bg-pink-900/30"
                                : "bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200"
                            }`}
                    >
                        <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                        <span className="hidden sm:inline">Refresh data</span>
                        <span className="sm:hidden">Refresh</span>
                    </button>
                </div>

                {/* TABS */}
                <div
                    className={`backdrop-blur-md border shadow-sm rounded-2xl p-1 transition-colors ${isDarkMode
                            ? "bg-slate-800/90 border-slate-700"
                            : "bg-white/90 border-pink-200"
                        }`}
                >
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                            ? "bg-gradient-to-r from-pink-700 to-pink-600 text-white shadow"
                                            : isDarkMode
                                                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-pink-50"
                                        }`}
                                >
                                    <Icon className="text-base" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* CONTENT */}
                <div
                    className={`backdrop-blur-md border shadow-sm rounded-2xl p-4 md:p-6 transition-colors ${isDarkMode
                            ? "bg-slate-800/90 border-slate-700"
                            : "bg-white/90 border-pink-200"
                        }`}
                >
                    {renderTabContent()}

                    {/* ACTION BUTTONS */}
                    {!loading && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-700">
                            <button
                                onClick={handleReset}
                                disabled={saving}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isDarkMode
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <FaTimes />
                                <span>Reset</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-pink-700 to-pink-600 text-white shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <FaSave />
                                <span>{saving ? "Saving..." : "Save Changes"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Configuration;
