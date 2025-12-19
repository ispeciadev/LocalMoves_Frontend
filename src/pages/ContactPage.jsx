import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/method/localmoves.api.dashboard.submit_contact_form",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (data.message?.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error(
          data.message?.error || "Something went wrong. Please try again."
        );
      }
    } catch {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white min-h-screen text-gray-800">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-pink-600 text-white text-center py-16 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          Contact Local Moves
        </h1>
        <p className="text-sm md:text-base opacity-90 max-w-2xl mx-auto">
          Have questions or need assistance? Our Local Moves team is here to
          help you every step of the way.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Left Section - Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Get in Touch
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Fill out the form or reach us through the contact options below.
              Our support team usually replies within 24 hours.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <Mail className="text-pink-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Email</h4>
                <p className="text-sm text-gray-700">
                  support@localmoves.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-pink-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Phone</h4>
                <p className="text-sm text-gray-700">+44 123 456 7890</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="text-pink-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Office</h4>
                <p className="text-sm text-gray-700">
                  221B Baker Street, London, NW1 6XE, United Kingdom
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2381.692534918051!2d-0.15855508431183486!3d51.52376741743285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761acfa0f7b3ff%3A0x4fdbd2b05df0c22!2sBaker%20St%2C%20London!5e0!3m2!1sen!2suk!4v1638288382052!5m2!1sen!2suk"
              width="100%"
              height="250"
              loading="lazy"
              allowFullScreen
              className="rounded-lg border border-gray-300"
            ></iframe>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold transition ${loading
                ? "bg-pink-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
                }`}
            >
              <Send size={16} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </main>
    </section>
  );
};

export default ContactPage;
