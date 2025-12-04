import React from "react";
import { motion as Motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BookingConfirmationPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    onClose?.();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <Motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 12 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center relative"
      >
        {/* Success Icon */}
        <Motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <CheckCircle className="text-pink-600" size={64} strokeWidth={1.5} />
        </Motion.div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 leading-snug">
          Your Details Have Been Sent To{" "}
          <span className="text-pink-600 font-bold">HelpboxUK</span>
        </h2>

        <p className="text-gray-700 mb-2">
          You will be contacted within{" "}
          <span className="text-pink-600 font-semibold">24 hours</span>.
        </p>

        <p className="text-gray-700 mb-8">
          You can also{" "}
          <span className="text-pink-600 font-semibold">
            contact other accountants
          </span>{" "}
          free of charge for better options.
        </p>

        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBack}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
        >
          BACK TO SEARCH PAGE
        </Motion.button>
      </Motion.div>
    </div>
  );
};

export default BookingConfirmationPopup;
