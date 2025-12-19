import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A custom select component that supports icons in options.
 * 
 * @param {Object} props
 * @param {string} props.value - The currently selected value
 * @param {Function} props.onChange - Callback when value changes (passed value directly)
 * @param {Array} props.options - Array of options { value, label, icon: Component }
 * @param {string} props.placeholder - Placeholder text when no value is selected
 */
const CustomIconSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    // Mimic the event object structure if the parent expects validation or other logic based on standard events,
    // but here we just pass the value as the parent's updatePricingForm takes (key, value) directly in the onChange(e.target.value) pattern.
    // Wait, the parent uses `onChange={(e) => updatePricingForm("collection_parking", e.target.value)}`.
    // So I should probably expect `onChange` to just take the value, and I'll adapt the parent to use it.
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <selectedOption.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    selectedOption.iconClass || "text-gray-500"
                  }`}
                />
              )}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto py-1"
          role="listbox"
        >
          <li
            className="flex items-center px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleSelect("")}
            role="option"
            aria-selected={value === ""}
          >
            {placeholder}
          </li>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <li
                key={option.value}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-pink-50 hover:text-pink-700 ${
                  value === option.value
                    ? "bg-pink-50 text-pink-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      option.iconClass || "text-gray-500"
                    }`}
                  />
                )}
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomIconSelect;
