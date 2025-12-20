// src/pages/admin/Configuration.jsx
import React, { useEffect, useState } from "react";
import {
    FaCog,
    FaDollarSign,
    FaTruck,
    FaCalculator,
    FaSave,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

// ================== COLLAPSIBLE SECTION COMPONENT ==================
const CollapsibleSection = ({ title, children, defaultOpen = true, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`rounded-lg border mb-4 ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${isDarkMode
                        ? "bg-slate-800/50 hover:bg-slate-800 text-slate-200"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                    }`}
            >
                <span className="font-semibold text-sm">{title}</span>
                {isOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>
            {isOpen && <div className="p-4">{children}</div>}
        </div>
    );
};

// ================== FORM FIELD COMPONENT ==================
const FormField = ({ label, value, onChange, type = "number", step = "0.01", min, max, help, isDarkMode }) => {
    return (
        <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                {label}
            </label>
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                step={step}
                min={min}
                max={max}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition outline-none ${isDarkMode
                        ? "border-slate-600 bg-slate-800 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                        : "border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                    }`}
            />
            {help && <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-gray-500"}`}>{help}</p>}
        </div>
    );
};

const Configuration = () => {
    const { isDarkMode } = useAdminThemeStore();
    const [activeTab, setActiveTab] = useState("pricing");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Configuration States
    const [systemConfig, setSystemConfig] = useState({});
    const [systemForm, setSystemForm] = useState({});
    const [pricingConfig, setPricingConfig] = useState({});
    const [pricingForm, setPricingForm] = useState({});
    const [vehicleConfig, setVehicleConfig] = useState({});
    const [vehicleForm, setVehicleForm] = useState({});
    const [multiplierConfig, setMultiplierConfig] = useState({});
    const [multiplierForm, setMultiplierForm] = useState({});

    const tabs = [
        { id: "pricing", label: "Pricing", icon: FaDollarSign },
        { id: "vehicle", label: "Vehicle", icon: FaTruck },
        { id: "multiplier", label: "Multiplier", icon: FaCalculator },
        { id: "system", label: "System", icon: FaCog },
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
            const data = res.data?.message || {};
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
            const data = res.data?.message || {};
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

    // ================== PRICING FORM ==================
    const renderPricingForm = () => {
        const updateField = (field, value) => {
            setPricingForm({ ...pricingForm, [field]: value });
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    label="Loading Cost per m³ (€)"
                    value={pricingForm.loading_cost_per_m3}
                    onChange={(val) => updateField("loading_cost_per_m3", val)}
                    isDarkMode={isDarkMode}
                />
                <FormField
                    label="Cost per Mile Under 100 (€)"
                    value={pricingForm.cost_per_mile_under_100}
                    onChange={(val) => updateField("cost_per_mile_under_100", val)}
                    isDarkMode={isDarkMode}
                />
                <FormField
                    label="Cost per Mile Over 100 (€)"
                    value={pricingForm.cost_per_mile_over_100}
                    onChange={(val) => updateField("cost_per_mile_over_100", val)}
                    isDarkMode={isDarkMode}
                />
                <FormField
                    label="Assembly per m³ (€)"
                    value={pricingForm.assembly_per_m3}
                    onChange={(val) => updateField("assembly_per_m3", val)}
                    isDarkMode={isDarkMode}
                />
                <FormField
                    label="Disassembly per m³ (€)"
                    value={pricingForm.disassembly_per_m3}
                    onChange={(val) => updateField("disassembly_per_m3", val)}
                    isDarkMode={isDarkMode}
                />
                <FormField
                    label="Packing Percentage"
                    value={pricingForm.packing_percentage}
                    onChange={(val) => updateField("packing_percentage", val)}
                    min="0"
                    max="1"
                    help="Value between 0 and 1"
                    isDarkMode={isDarkMode}
                />
            </div>
        );
    };

    // ================== VEHICLE FORM ==================
    const renderVehicleForm = () => {
        const updateNestedField = (section, field, value) => {
            setVehicleForm({
                ...vehicleForm,
                [section]: {
                    ...vehicleForm[section],
                    [field]: value,
                },
            });
        };

        const updateDoubleNestedField = (section, subsection, field, value) => {
            setVehicleForm({
                ...vehicleForm,
                [section]: {
                    ...vehicleForm[section],
                    [subsection]: {
                        ...vehicleForm[section]?.[subsection],
                        [field]: value,
                    },
                },
            });
        };

        return (
            <div className="space-y-4">
                <CollapsibleSection title="Vehicle Capacities (m³)" isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            label="SWB Van"
                            value={vehicleForm.vehicle_capacities?.swb_van}
                            onChange={(val) => updateNestedField("vehicle_capacities", "swb_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="MWB Van"
                            value={vehicleForm.vehicle_capacities?.mwb_van}
                            onChange={(val) => updateNestedField("vehicle_capacities", "mwb_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="LWB Van"
                            value={vehicleForm.vehicle_capacities?.lwb_van}
                            onChange={(val) => updateNestedField("vehicle_capacities", "lwb_van", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Vehicle Space Multipliers" isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Quarter Van"
                            value={vehicleForm.vehicle_space_multipliers?.quarter_van}
                            onChange={(val) => updateNestedField("vehicle_space_multipliers", "quarter_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Half Van"
                            value={vehicleForm.vehicle_space_multipliers?.half_van}
                            onChange={(val) => updateNestedField("vehicle_space_multipliers", "half_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Three Quarter Van"
                            value={vehicleForm.vehicle_space_multipliers?.three_quarter_van}
                            onChange={(val) => updateNestedField("vehicle_space_multipliers", "three_quarter_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Whole Van"
                            value={vehicleForm.vehicle_space_multipliers?.whole_van}
                            onChange={(val) => updateNestedField("vehicle_space_multipliers", "whole_van", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Property Volumes" isDarkMode={isDarkMode} defaultOpen={false}>
                    <div className="space-y-4">
                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                                A Few Items
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="SWB Van"
                                    value={vehicleForm.property_volumes?.a_few_items?.swb_van}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "a_few_items", "swb_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="MWB Van"
                                    value={vehicleForm.property_volumes?.a_few_items?.mwb_van}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "a_few_items", "mwb_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="LWB Van"
                                    value={vehicleForm.property_volumes?.a_few_items?.lwb_van}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "a_few_items", "lwb_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>House</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="2 Bedroom"
                                    value={vehicleForm.property_volumes?.house?.["2_bed"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "house", "2_bed", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="3 Bedroom"
                                    value={vehicleForm.property_volumes?.house?.["3_bed"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "house", "3_bed", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Flat</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="Studio"
                                    value={vehicleForm.property_volumes?.flat?.studio}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "flat", "studio", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="1 Bedroom"
                                    value={vehicleForm.property_volumes?.flat?.["1_bed"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "flat", "1_bed", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="2 Bedroom"
                                    value={vehicleForm.property_volumes?.flat?.["2_bed"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "flat", "2_bed", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="3 Bedroom"
                                    value={vehicleForm.property_volumes?.flat?.["3_bed"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "flat", "3_bed", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="4 Bedroom"
                                    value={vehicleForm.property_volumes?.flat?.["4_bed"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "flat", "4_bed", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Office</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="2 Workstations"
                                    value={vehicleForm.property_volumes?.office?.["2_workstations"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "office", "2_workstations", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="4 Workstations"
                                    value={vehicleForm.property_volumes?.office?.["4_workstations"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "office", "4_workstations", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="8 Workstations"
                                    value={vehicleForm.property_volumes?.office?.["8_workstations"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "office", "8_workstations", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="15 Workstations"
                                    value={vehicleForm.property_volumes?.office?.["15_workstations"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "office", "15_workstations", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="25 Workstations"
                                    value={vehicleForm.property_volumes?.office?.["25_workstations"]}
                                    onChange={(val) => updateDoubleNestedField("property_volumes", "office", "25_workstations", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        );
    };

    // ================== MULTIPLIER FORM ==================
    const renderMultiplierForm = () => {
        const updateNestedField = (section, field, value) => {
            setMultiplierForm({
                ...multiplierForm,
                [section]: {
                    ...multiplierForm[section],
                    [field]: value,
                },
            });
        };

        const updateDoubleNestedField = (section, subsection, field, value) => {
            setMultiplierForm({
                ...multiplierForm,
                [section]: {
                    ...multiplierForm[section],
                    [subsection]: {
                        ...multiplierForm[section]?.[subsection],
                        [field]: value,
                    },
                },
            });
        };

        return (
            <div className="space-y-4">
                <CollapsibleSection title="Quantity Multipliers" isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Some Things"
                            value={multiplierForm.quantity_multipliers?.some_things}
                            onChange={(val) => updateNestedField("quantity_multipliers", "some_things", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Half Contents"
                            value={multiplierForm.quantity_multipliers?.half_contents}
                            onChange={(val) => updateNestedField("quantity_multipliers", "half_contents", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Three Quarter"
                            value={multiplierForm.quantity_multipliers?.three_quarter}
                            onChange={(val) => updateNestedField("quantity_multipliers", "three_quarter", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Everything"
                            value={multiplierForm.quantity_multipliers?.everything}
                            onChange={(val) => updateNestedField("quantity_multipliers", "everything", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Collection Assessment Multipliers" isDarkMode={isDarkMode} defaultOpen={false}>
                    <div className="space-y-4">
                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                                Parking
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Driveway"
                                    value={multiplierForm.collection_assessment?.parking?.driveway}
                                    onChange={(val) => updateDoubleNestedField("collection_assessment", "parking", "driveway", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Roadside"
                                    value={multiplierForm.collection_assessment?.parking?.roadside}
                                    onChange={(val) => updateDoubleNestedField("collection_assessment", "parking", "roadside", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                                Parking Distance
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="Less than 10m"
                                    value={multiplierForm.collection_assessment?.parking_distance?.less_than_10m}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "parking_distance", "less_than_10m", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="10 to 20m"
                                    value={multiplierForm.collection_assessment?.parking_distance?.["10_to_20m"]}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "parking_distance", "10_to_20m", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Over 20m"
                                    value={multiplierForm.collection_assessment?.parking_distance?.over_20m}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "parking_distance", "over_20m", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                                House Type
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="House (Ground + 1st)"
                                    value={multiplierForm.collection_assessment?.house_type?.house_ground_and_1st}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "house_type", "house_ground_and_1st", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Bungalow (Ground)"
                                    value={multiplierForm.collection_assessment?.house_type?.bungalow_ground}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "house_type", "bungalow_ground", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Townhouse (Ground + 1st + 2nd)"
                                    value={multiplierForm.collection_assessment?.house_type?.townhouse_ground_1st_2nd}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "house_type", "townhouse_ground_1st_2nd", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                                Internal Access
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Stairs Only"
                                    value={multiplierForm.collection_assessment?.internal_access?.stairs_only}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "internal_access", "stairs_only", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Lift Access"
                                    value={multiplierForm.collection_assessment?.internal_access?.lift_access}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "internal_access", "lift_access", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                                Floor Level
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Ground Floor"
                                    value={multiplierForm.collection_assessment?.floor_level?.ground_floor}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "floor_level", "ground_floor", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="1st Floor"
                                    value={multiplierForm.collection_assessment?.floor_level?.["1st_floor"]}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "floor_level", "1st_floor", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="2nd Floor"
                                    value={multiplierForm.collection_assessment?.floor_level?.["2nd_floor"]}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "floor_level", "2nd_floor", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="3rd Floor+"
                                    value={multiplierForm.collection_assessment?.floor_level?.["3rd_floor_plus"]}
                                    onChange={(val) =>
                                        updateDoubleNestedField("collection_assessment", "floor_level", "3rd_floor_plus", val)
                                    }
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Notice Period Multipliers" isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            label="Flexible"
                            value={multiplierForm.notice_period_multipliers?.flexible}
                            onChange={(val) => updateNestedField("notice_period_multipliers", "flexible", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Within 3 Days"
                            value={multiplierForm.notice_period_multipliers?.within_3_days}
                            onChange={(val) => updateNestedField("notice_period_multipliers", "within_3_days", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Within Week"
                            value={multiplierForm.notice_period_multipliers?.within_week}
                            onChange={(val) => updateNestedField("notice_period_multipliers", "within_week", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Within 2 Weeks"
                            value={multiplierForm.notice_period_multipliers?.within_2_weeks}
                            onChange={(val) => updateNestedField("notice_period_multipliers", "within_2_weeks", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Within Month"
                            value={multiplierForm.notice_period_multipliers?.within_month}
                            onChange={(val) => updateNestedField("notice_period_multipliers", "within_month", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Over Month"
                            value={multiplierForm.notice_period_multipliers?.over_month}
                            onChange={(val) => updateNestedField("notice_period_multipliers", "over_month", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Move Day Multipliers" isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Sunday to Thursday"
                            value={multiplierForm.move_day_multipliers?.sun_to_thurs}
                            onChange={(val) => updateNestedField("move_day_multipliers", "sun_to_thurs", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Friday / Saturday"
                            value={multiplierForm.move_day_multipliers?.friday_saturday}
                            onChange={(val) => updateNestedField("move_day_multipliers", "friday_saturday", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>
            </div>
        );
    };

    // ================== SYSTEM FORM (COMPREHENSIVE) ==================
    const renderSystemForm = () => {
        const updateNestedField = (section, field, value) => {
            setSystemForm({
                ...systemForm,
                [section]: {
                    ...systemForm[section],
                    [field]: value,
                },
            });
        };

        const updateDoubleNestedField = (section, subsection, field, value) => {
            setSystemForm({
                ...systemForm,
                [section]: {
                    ...systemForm[section],
                    [subsection]: {
                        ...systemForm[section]?.[subsection],
                        [field]: value,
                    },
                },
            });
        };

        const updateTripleNestedField = (section, subsection, subsubsection, field, value) => {
            setSystemForm({
                ...systemForm,
                [section]: {
                    ...systemForm[section],
                    [subsection]: {
                        ...systemForm[section]?.[subsection],
                        [subsubsection]: {
                            ...systemForm[section]?.[subsection]?.[subsubsection],
                            [field]: value,
                        },
                    },
                },
            });
        };

        return (
            <div className="space-y-4">
                <CollapsibleSection title="Pricing Configuration" isDarkMode={isDarkMode}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Loading Cost per m³ (€)"
                            value={systemForm.pricing?.loading_cost_per_m3}
                            onChange={(val) => updateNestedField("pricing", "loading_cost_per_m3", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Cost per Mile Under 100 (€)"
                            value={systemForm.pricing?.cost_per_mile_under_100}
                            onChange={(val) => updateNestedField("pricing", "cost_per_mile_under_100", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Cost per Mile Over 100 (€)"
                            value={systemForm.pricing?.cost_per_mile_over_100}
                            onChange={(val) => updateNestedField("pricing", "cost_per_mile_over_100", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Assembly per m³ (€)"
                            value={systemForm.pricing?.assembly_per_m3}
                            onChange={(val) => updateNestedField("pricing", "assembly_per_m3", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Disassembly per m³ (€)"
                            value={systemForm.pricing?.disassembly_per_m3}
                            onChange={(val) => updateNestedField("pricing", "disassembly_per_m3", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Packing Percentage"
                            value={systemForm.pricing?.packing_percentage}
                            onChange={(val) => updateNestedField("pricing", "packing_percentage", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Vehicle Capacities" isDarkMode={isDarkMode} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            label="SWB Van (m³)"
                            value={systemForm.vehicle_capacities?.swb_van}
                            onChange={(val) => updateNestedField("vehicle_capacities", "swb_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="MWB Van (m³)"
                            value={systemForm.vehicle_capacities?.mwb_van}
                            onChange={(val) => updateNestedField("vehicle_capacities", "mwb_van", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="LWB Van (m³)"
                            value={systemForm.vehicle_capacities?.lwb_van}
                            onChange={(val) => updateNestedField("vehicle_capacities", "lwb_van", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Additional Spaces" isDarkMode={isDarkMode} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            label="Shed (m³)"
                            value={systemForm.additional_spaces?.shed}
                            onChange={(val) => updateNestedField("additional_spaces", "shed", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Loft (m³)"
                            value={systemForm.additional_spaces?.loft}
                            onChange={(val) => updateNestedField("additional_spaces", "loft", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Basement (m³)"
                            value={systemForm.additional_spaces?.basement}
                            onChange={(val) => updateNestedField("additional_spaces", "basement", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Single Garage (m³)"
                            value={systemForm.additional_spaces?.single_garage}
                            onChange={(val) => updateNestedField("additional_spaces", "single_garage", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Double Garage (m³)"
                            value={systemForm.additional_spaces?.double_garage}
                            onChange={(val) => updateNestedField("additional_spaces", "double_garage", val)}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Plan Limits" isDarkMode={isDarkMode} defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Free Plan Limit"
                            value={systemForm.plan_limits?.Free}
                            onChange={(val) => updateNestedField("plan_limits", "Free", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Basic Plan Limit"
                            value={systemForm.plan_limits?.Basic}
                            onChange={(val) => updateNestedField("plan_limits", "Basic", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Standard Plan Limit"
                            value={systemForm.plan_limits?.Standard}
                            onChange={(val) => updateNestedField("plan_limits", "Standard", val)}
                            isDarkMode={isDarkMode}
                        />
                        <FormField
                            label="Premium Plan Limit"
                            value={systemForm.plan_limits?.Premium}
                            onChange={(val) => updateNestedField("plan_limits", "Premium", val)}
                            help="-1 for unlimited"
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="All Multipliers" isDarkMode={isDarkMode} defaultOpen={false}>
                    <div className="space-y-6">
                        <div>
                            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                                Quantity Multipliers
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Some Things"
                                    value={systemForm.quantity_multipliers?.some_things}
                                    onChange={(val) => updateNestedField("quantity_multipliers", "some_things", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Half Contents"
                                    value={systemForm.quantity_multipliers?.half_contents}
                                    onChange={(val) => updateNestedField("quantity_multipliers", "half_contents", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Three Quarter"
                                    value={systemForm.quantity_multipliers?.three_quarter}
                                    onChange={(val) => updateNestedField("quantity_multipliers", "three_quarter", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Everything"
                                    value={systemForm.quantity_multipliers?.everything}
                                    onChange={(val) => updateNestedField("quantity_multipliers", "everything", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                                Vehicle Space Multipliers
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Quarter Van"
                                    value={systemForm.vehicle_space_multipliers?.quarter_van}
                                    onChange={(val) => updateNestedField("vehicle_space_multipliers", "quarter_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Half Van"
                                    value={systemForm.vehicle_space_multipliers?.half_van}
                                    onChange={(val) => updateNestedField("vehicle_space_multipliers", "half_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Three Quarter Van"
                                    value={systemForm.vehicle_space_multipliers?.three_quarter_van}
                                    onChange={(val) => updateNestedField("vehicle_space_multipliers", "three_quarter_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Whole Van"
                                    value={systemForm.vehicle_space_multipliers?.whole_van}
                                    onChange={(val) => updateNestedField("vehicle_space_multipliers", "whole_van", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                                Notice Period Multipliers
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="Flexible"
                                    value={systemForm.notice_period_multipliers?.flexible}
                                    onChange={(val) => updateNestedField("notice_period_multipliers", "flexible", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Within 3 Days"
                                    value={systemForm.notice_period_multipliers?.within_3_days}
                                    onChange={(val) => updateNestedField("notice_period_multipliers", "within_3_days", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Within Week"
                                    value={systemForm.notice_period_multipliers?.within_week}
                                    onChange={(val) => updateNestedField("notice_period_multipliers", "within_week", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Within 2 Weeks"
                                    value={systemForm.notice_period_multipliers?.within_2_weeks}
                                    onChange={(val) => updateNestedField("notice_period_multipliers", "within_2_weeks", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Within Month"
                                    value={systemForm.notice_period_multipliers?.within_month}
                                    onChange={(val) => updateNestedField("notice_period_multipliers", "within_month", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Over Month"
                                    value={systemForm.notice_period_multipliers?.over_month}
                                    onChange={(val) => updateNestedField("notice_period_multipliers", "over_month", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
                                Move Day Multipliers
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Sunday to Thursday"
                                    value={systemForm.move_day_multipliers?.sun_to_thurs}
                                    onChange={(val) => updateNestedField("move_day_multipliers", "sun_to_thurs", val)}
                                    isDarkMode={isDarkMode}
                                />
                                <FormField
                                    label="Friday / Saturday"
                                    value={systemForm.move_day_multipliers?.friday_saturday}
                                    onChange={(val) => updateNestedField("move_day_multipliers", "friday_saturday", val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
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
                        <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-400"}`}>Loading configuration...</p>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case "pricing":
                return renderPricingForm();
            case "vehicle":
                return renderVehicleForm();
            case "multiplier":
                return renderMultiplierForm();
            case "system":
                return renderSystemForm();
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
                    className={`backdrop-blur-md border shadow-sm rounded-2xl p-1 transition-colors ${isDarkMode ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-pink-200"
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
                    className={`backdrop-blur-md border shadow-sm rounded-2xl p-4 md:p-6 transition-colors ${isDarkMode ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-pink-200"
                        }`}
                >
                    {renderTabContent()}

                    {/* ACTION BUTTONS */}
                    {!loading && (
                        <div
                            className={`flex justify-end gap-3 mt-6 pt-6 border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"
                                }`}
                        >
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
