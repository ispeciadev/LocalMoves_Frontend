import React, { useEffect, useState } from "react";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";
import api from "../../api/axios";
import { FiEdit, FiTrash2, FiX, FiCheck, FiSearch, FiFilter } from "react-icons/fi";

// ---------------------------------------------
// HELPER FUNCTION - FORMAT ITEM NAME
// ---------------------------------------------
const formatItemNameForDisplay = (category, itemName) => {
  // Concatenate category + "-" + item_name exactly as they come from database
  return `${category}-${itemName}`;
};

// ---------------------------------------------
// CATEGORY BADGE COLOR
// ---------------------------------------------
const getCategoryColor = (category, isDarkMode) => {
  if (isDarkMode) {
    const colors = {
      "Living Room": "bg-pink-900/30 text-pink-300",
      Kitchen: "bg-pink-900/30 text-pink-300",
      Bedroom: "bg-pink-900/30 text-pink-300",
      "Other / Bathroom / Hallway": "bg-pink-900/30 text-pink-300",
      "Garden / Garage / Loft": "bg-pink-900/30 text-pink-300",
      Gym: "bg-pink-900/30 text-pink-300",
      Office: "bg-pink-900/30 text-pink-300",
    };
    return colors[category] || "bg-pink-900/30 text-pink-300";
  }

  const colors = {
    "Living Room": "bg-pink-50 text-pink-700",
    Kitchen: "bg-pink-50 text-pink-700",
    Bedroom: "bg-pink-50 text-pink-700",
    "Other / Bathroom / Hallway": "bg-pink-50 text-pink-700",
    "Garden / Garage / Loft": "bg-pink-50 text-pink-700",
    Gym: "bg-pink-50 text-pink-700",
    Office: "bg-pink-50 text-pink-700",
  };
  return colors[category] || "bg-pink-50 text-pink-700";
};

// ---------------------------------------------
// FORM MODAL COMPONENT
// ---------------------------------------------
const InventoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  categories,
  isDarkMode
}) => {
  const [formData, setFormData] = useState({
    category: "",
    item_name: "",
    average_volume: "",
    unit: "m³"
  });


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          category: initialData.category || "",
          item_name: initialData.item_name || "",
          average_volume: initialData.average_volume || "",
          unit: initialData.unit || "m³"
        });

      } else {
        setFormData({
          category: "",
          item_name: "",
          average_volume: "",
          unit: "m³"
        });

      }
      setError("");
    }
  }, [isOpen, isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "average_volume" ? parseFloat(value) || "" : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.category || !formData.item_name || !formData.average_volume) {
        throw new Error("All fields are required");
      }

      if (isNaN(formData.average_volume) || formData.average_volume <= 0) {
        throw new Error("Average volume must be a positive number");
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl w-full max-w-md transition-colors ${isDarkMode ? "bg-slate-800 text-slate-100" : "bg-white text-gray-900"
          }`}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}>
          <div>
            <h3 className="text-lg font-semibold">
              {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
            </h3>
            {error && (
              <div className={`mt-1 text-sm font-medium ${isDarkMode ? "text-red-300" : "text-red-600"
                }`}>
                {error}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 ${isDarkMode
              ? "hover:bg-slate-100 text-slate-400"
              : "hover:bg-gray-900 text-gray-500"
              }`}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* CATEGORY */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
            >
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full rounded-lg px-4 py-3 text-sm border transition-colors ${isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                : "bg-white border-pink-200 text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                }`}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ITEM NAME */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
            >
              Item Name *
            </label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              className={`w-full rounded-lg px-4 py-3 text-sm border transition-colors ${isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                : "bg-white border-pink-200 text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                }`}
              placeholder="e.g., Dining Chair"
              required
            />
          </div>

          {/* AVERAGE VOLUME */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
            >
              Average Volume *
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  name="average_volume"
                  value={formData.average_volume}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full rounded-lg px-4 py-3 text-sm border transition-colors ${isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    : "bg-white border-pink-200 text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    }`}
                  placeholder="e.g., 0.18"
                  required
                />
              </div>
              <div className="w-20">
                <div className={`w-full rounded-lg px-3 py-3 text-sm border text-center ${isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-300"
                  : "bg-pink-50 border-pink-200 text-pink-700"
                  }`}>
                  m³
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${loading
                ? "opacity-70 cursor-not-allowed"
                : ""
                } ${isDarkMode
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-pink-600 text-white hover:bg-pink-700"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiCheck size={16} />
                  {isEditing ? "Update Item" : "Add Item"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------
// DELETE CONFIRMATION MODAL
// ---------------------------------------------
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDarkMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl w-full max-w-md transition-colors ${isDarkMode ? "bg-slate-800 text-slate-100" : "bg-white text-gray-900"
          }`}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <FiTrash2 size={24} />
          </div>

          <h3 className="text-lg font-semibold text-center mb-2">
            Delete Item?
          </h3>

          <p className={`text-center text-sm mb-6 ${isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}>
            Are you sure you want to delete <span className="font-semibold">"{itemName}"</span>?
            This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-600 text-white hover:bg-red-700"
                }`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------
// ADD CATEGORY MODAL
// ---------------------------------------------
const AddCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  isDarkMode
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCategoryName("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!categoryName.trim()) {
        throw new Error("Category name is required");
      }

      await onSubmit(categoryName.trim());
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl w-full max-w-md transition-colors ${isDarkMode ? "bg-slate-800 text-slate-100" : "bg-white text-gray-900"
          }`}
      >
        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}>
          <div>
            <h3 className="text-lg font-semibold">
              Add New Category
            </h3>
            {error && (
              <div className={`mt-1 text-sm font-medium ${isDarkMode ? "text-red-300" : "text-red-600"
                }`}>
                {error}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 ${isDarkMode
              ? "hover:bg-slate-100 text-slate-400"
              : "hover:bg-gray-900 text-gray-500"
              }`}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
            >
              Category Name *
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className={`w-full rounded-lg px-4 py-3 text-sm border transition-colors ${isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                : "bg-white border-pink-200 text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                }`}
              placeholder="e.g., Movie Studio"
              required
              autoFocus
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${loading
                ? "opacity-70 cursor-not-allowed"
                : ""
                } ${isDarkMode
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-pink-600 text-white hover:bg-pink-700"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiCheck size={16} />
                  Create Category
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
const ManageInventory = () => {
  const { isDarkMode } = useAdminThemeStore();

  // State
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ---------------------------------------------
  // FETCH INVENTORY ITEMS
  // ---------------------------------------------
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.post(
        "localmoves.api.dashboard.get_all_inventory_items"
      );

      // Log the entire response to debug
      console.log("Full API Response:", res);
      console.log("Response data:", res.data);
      console.log("Message data:", res.data?.message);
      console.log("Inventory items:", res.data?.message?.data);

      // Check different possible structures
      const data = res.data?.message?.data ||
        res.data?.data ||
        res.data ||
        [];

      const summary = res.data?.message?.category_summary ||
        res.data?.category_summary ||
        [];

      console.log("Extracted data:", data);
      console.log("Extracted summary:", summary);

      setItems(data);
      setFilteredItems(data);
      setCategorySummary(summary);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // CRUD OPERATIONS
  // ---------------------------------------------
  const handleCreateItem = async (formData) => {
    console.log("📤 Creating inventory item");
    console.log("➡️ Payload being sent:", formData);

    try {
      const res = await api.post(
        "localmoves.api.dashboard.create_inventory_item",
        formData
      );

      console.log("✅ Create API response:", res);
      console.log("✅ Response data:", res.data);

      if (res.data?.message?.success) {
        fetchInventory();
        return true;
      }

      // Backend responded but with error
      console.error("❌ Backend error message:", res.data?.message);
      throw new Error(
        res.data?.message?.message ||
        res.data?.message?.error ||
        "Failed to create item"
      );


    } catch (error) {
      console.error("❌ Create item FAILED");

      // Axios error details
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response message:", error.response?.data?.message);
      console.error("Error response exception:", error.response?.data?.exception);

      throw new Error(
        error.response?.data?.message?.error ||
        error.response?.data?.exception ||
        error.message ||
        "Failed to create item"
      );
    }
  };


  const handleUpdateItem = async (formData) => {
    try {
      const res = await api.post(
        "localmoves.api.dashboard.update_inventory_item",
        {
          item_name: editingItem.item_name,
          ...formData
        }
      );
      if (res.data?.message?.success) {
        fetchInventory();
        return true;
      }
      throw new Error(res.data?.message?.error || "Failed to update item");
    } catch (error) {
      throw new Error(error.response?.data?.message?.error || error.message);
    }
  };

  const handleDeleteItem = async () => {
    try {
      const res = await api.post(
        "localmoves.api.dashboard.delete_inventory_item",
        {
          item_name: itemToDelete.item_name
        }
      );
      if (res.data?.message?.success) {
        fetchInventory();
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // ---------------------------------------------
  // CREATE CATEGORY
  // ---------------------------------------------
  const handleCreateCategory = async (categoryName) => {
    try {
      const res = await api.post(
        "localmoves.api.dashboard.create_inventory_category",
        {
          category_name: categoryName
        }
      );

      if (res.data?.message?.success) {
        // Refresh inventory to get the new category and its sample item
        await fetchInventory();
        return true;
      }

      throw new Error(res.data?.message?.error || "Failed to create category");
    } catch (error) {
      console.error("Failed to create category:", error);
      throw new Error(error.response?.data?.message?.error || error.message);
    }
  };

  // ---------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------
  const handleAddClick = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      category: formData.category.trim(),
      item_name: formatItemNameForDisplay(formData.category.trim(), formData.item_name.trim()),
      average_volume: Number(formData.average_volume),
      unit: "m³"
    };

    if (editingItem) {
      return await handleUpdateItem(payload);
    }

    return await handleCreateItem(payload);
  };




  // ---------------------------------------------
  // FILTER FUNCTIONS
  // ---------------------------------------------
  const handleSearch = (term) => {
    setSearchTerm(term);
    let filtered = items;

    if (term) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(term.toLowerCase()) ||
        item.category.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    let filtered = items;

    if (category !== "All") {
      filtered = filtered.filter(item => item.category === category);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  // ---------------------------------------------
  // INITIAL FETCH
  // ---------------------------------------------
  useEffect(() => {
    fetchInventory();
  }, []);

  // ---------------------------------------------
  // FETCH CATEGORIES
  // ---------------------------------------------
  const fetchCategories = async () => {
    try {
      const res = await api.post(
        "localmoves.api.dashboard.get_all_inventory_categories"
      );

      console.log("Categories API Response:", res);

      const categoryList = res.data?.message?.categories ||
        res.data?.categories ||
        [];

      console.log("Extracted categories:", categoryList);

      // Add "All" at the beginning
      setCategories(["All", ...categoryList]);
    } catch (error) {
      console.error("Failed to load categories:", error);
      console.error("Error response:", error.response);
    }
  };

  // ---------------------------------------------
  // INITIAL FETCH
  // ---------------------------------------------
  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  return (
    <div
      className={`space-y-6 p-4 transition-colors ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
        }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-xl font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}
          >
            Inventory Management
          </h1>
          <p
            className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
          >
            Manage items used for move size and volume calculations. {items.length} items total.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition flex items-center gap-2 ${isDarkMode
              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
              : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              }`}
          >
            + Add Category
          </button>
          <button
            onClick={handleAddClick}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition flex items-center gap-2 ${isDarkMode
              ? "bg-pink-600 text-white hover:bg-pink-700"
              : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className={`grid grid-cols-2 md:grid-cols-7 gap-3 ${isDarkMode ? "text-slate-300" : "text-gray-600"
        }`}>
        {categorySummary.map((summary) => (
          <div
            key={summary.category}
            className={`rounded-xl p-3 text-center transition-colors ${isDarkMode ? "bg-slate-800" : "bg-pink-50"
              }`}
          >
            <div className="text-lg font-semibold">{summary.count}</div>
            <div className="text-xs truncate">{summary.category.split(' ')[0]}</div>
            <div className="text-xs opacity-75">{summary.total_volume.toFixed(1)} m³</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className={`rounded-2xl border p-4 transition-colors ${isDarkMode
        ? "bg-slate-800 border-slate-700"
        : "bg-white border-pink-100"
        }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? "text-slate-400" : "text-gray-400"
                }`} size={16} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border transition-colors ${isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-pink-500"
                  : "bg-white border-pink-200 text-gray-900 placeholder-gray-400 focus:border-pink-500"
                  }`}
              />
            </div>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-transparent">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                  ? isDarkMode
                    ? "bg-pink-600 text-white"
                    : "bg-pink-600 text-white"
                  : isDarkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INVENTORY LIST */}
      <div
        className={`rounded-2xl border transition-colors ${isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-pink-100"
          }`}
      >
        <div className={`p-4 border-b ${isDarkMode ? "border-slate-700" : "border-pink-100"
          }`}>
          <h2
            className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"
              }`}
          >
            Inventory Items ({filteredItems.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`mt-4 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
              Loading inventory...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? "bg-slate-700" : "bg-pink-100"
              }`}>
              <FiFilter size={24} className={isDarkMode ? "text-slate-400" : "text-pink-500"} />
            </div>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}>
              {searchTerm || selectedCategory !== "All"
                ? "No items match your filters"
                : "No inventory items found. Add your first item!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredItems.map((item) => (
              <div
                key={item.name}
                className={`px-4 py-3 transition-colors hover:${isDarkMode ? "bg-slate-750" : "bg-pink-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"
                          }`}
                      >
                        {item.item_name}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getCategoryColor(
                          item.category,
                          isDarkMode
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      Avg Volume: <span className="font-semibold">{item.average_volume}</span> {item.unit}
                      {item.modified && (
                        <span className="ml-3">
                          Updated: {new Date(item.modified).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* RIGHT - ACTIONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode
                        ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                        : "text-pink-500 hover:text-pink-700 hover:bg-pink-100"
                        }`}
                      title="Edit item"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode
                        ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                        }`}
                      title="Delete item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      <InventoryFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isEditing={!!editingItem}
        categories={categories.filter(c => c !== "All")}
        isDarkMode={isDarkMode}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteItem}
        itemName={itemToDelete?.item_name}
        isDarkMode={isDarkMode}
      />

      {/* ADD CATEGORY MODAL */}
      <AddCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleCreateCategory}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ManageInventory;