// PaymentPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const PAYPAL_CONFIG = {
  CLIENT_ID:
    "ASm02TPJYiJIF3UDo_zN68nJF54cPpet9-mxExj7oQlczR6qy3bfQ4M57hw-CfGDXjtSJbYvYlV-eiWc",
  CURRENCY: "USD",
  INR_TO_USD_RATE: 85,
};

const API_URL =
  "http://127.0.0.1:8000/api/method/localmoves.api.request_payment.create_request_with_payment";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const originalAmount = location.state?.amount || 0;
  const amount = originalAmount * 0.10;

  const companyName = location.state?.companyName || "";
  const bookingPayload = location.state?.payload || null;

  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const scriptLoaded = useRef(false);
  const buttonRendered = useRef(false);

  const convertINRtoUSD = (inr) =>
    (Number(inr || 0) / PAYPAL_CONFIG.INR_TO_USD_RATE).toFixed(2);

  const loadPayPalScript = () => {
    return new Promise((resolve, reject) => {
      if (window.paypal) return resolve();
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&currency=${PAYPAL_CONFIG.CURRENCY}`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // ⭐ MOVED TO TOP (fixes ReferenceError)
  const renderPayPalButton = useCallback(() => {
    const usdAmount = convertINRtoUSD(amount);

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: usdAmount },
                description: "Move Booking Payment (10% Deposit)",
              },
            ],
          });
        },

        onApprove: async (data, actions) => {
          try {
            const paymentDetails = await actions.order.capture();
            toast.success("Payment successful!");

            try {
              const payloadToSend = {
                ...bookingPayload,
                company_name: companyName,
                payment_method: "PayPal",
                process_deposit: true,
                transaction_ref: paymentDetails.id,
                deposit_amount: amount,
              };

              const token =
                JSON.parse(localStorage.getItem("user"))?.token || "";

              await axios.post(API_URL, payloadToSend, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            } catch (err) {
              console.error("Backend Error:", err);
              toast.error("Failed to create request on server.");
            }

            document.getElementById("paypal-container").style.display = "none";
            setShowSuccessPopup(true);
          } catch (err) {
            toast.error("Payment failed.");
            console.error(err);
          }
        },

        onCancel: () => toast.warning("Payment cancelled"),
        onError: (err) => {
          toast.error("Payment error.");
          console.error(err);
        },
      })
      .render("#paypal-container")
      .then(() => setLoading(false));
  }, [amount, bookingPayload, companyName]);

  // ⭐ useEffect AFTER the function exists
  useEffect(() => {
    if (!originalAmount || !companyName || !bookingPayload) {
      toast.error("Missing payment data.");
      navigate(-1);
      return;
    }

    const init = async () => {
      try {
        if (!scriptLoaded.current) {
          await loadPayPalScript();
          scriptLoaded.current = true;
        }

        if (buttonRendered.current) return;
        buttonRendered.current = true;

        await new Promise((res) => setTimeout(res, 300));
        renderPayPalButton();
      } catch (err) {
        toast.error("PayPal failed to load.");
        console.error(err);
      }
    };

    init();
  }, [
    originalAmount,
    companyName,
    bookingPayload,
    navigate,
    renderPayPalButton, // now safe
  ]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6 relative">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Complete Your Payment
        </h2>

        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Company: {companyName}</p>

          <p className="text-xl font-semibold mt-2">
            Deposit Amount: €{amount.toFixed(2)}
          </p>

          <p className="text-sm text-gray-500">
            ≈ ${convertINRtoUSD(amount)} USD
          </p>
        </div>

        {loading && <p>Loading PayPal...</p>}
        <div id="paypal-container" className="min-h-[80px]"></div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm w-full">
            <h3 className="text-xl font-bold text-green-600 mb-3">
              Payment Successful! 🎉
            </h3>
            <p className="text-gray-700 mb-5">
              Your payment was completed successfully.
            </p>

            <div className="flex flex-col gap-3">
              <button
                className="px-5 py-2 bg-pink-600 text-white rounded-lg"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </button>

              <button
                className="px-5 py-2 bg-gray-200 rounded-lg"
                onClick={() => navigate("/")}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
