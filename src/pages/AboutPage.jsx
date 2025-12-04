import React from "react";
import { Truck, ShieldCheck, Clock, Users } from "lucide-react";

const AboutPage = () => {
  const features = [
    {
      icon: <Truck className="w-10 h-10 text-pink-600" />,
      title: "Reliable Transport",
      desc: "Our fleet of modern vehicles ensures timely and safe delivery of your goods.",
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-pink-600" />,
      title: "Fully Insured",
      desc: "Comprehensive insurance coverage for every move for your complete peace of mind.",
    },
    {
      icon: <Clock className="w-10 h-10 text-pink-600" />,
      title: "On-Time Guarantee",
      desc: "We value your time — punctuality is at the heart of everything we do.",
    },
    {
      icon: <Users className="w-10 h-10 text-pink-600" />,
      title: "Expert Team",
      desc: "Trained and background-verified professionals who handle every item with care.",
    },
  ];

  return (
    <section
      className="bg-white text-gray-800 min-h-screen flex flex-col"
      aria-label="About Local Moves"
    >
      {/* === Hero Section === */}
      <div className="bg-pink-600 text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About Local Moves
        </h1>
        <p className="max-w-2xl mx-auto text-sm md:text-base opacity-90">
          Making every move smoother, safer, and stress-free — one customer at a
          time.
        </p>
      </div>

      {/* === Company Story === */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grow">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <img
            src="https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=800&q=80"
            alt="Local Moves truck on the road"
            loading="lazy"
            className="rounded-2xl shadow-md w-full object-cover"
          />

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Who We Are
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At <strong>Local Moves</strong>, we specialize in providing
              efficient and affordable moving solutions for homes and businesses
              across the UK. Our goal is simple — to make relocation effortless
              through professional service, real-time updates, and secure
              handling of every item.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From single-room moves to full-scale relocations, we combine
              technology and trusted movers to deliver smooth, stress-free
              experiences tailored to every customer’s needs.
            </p>
          </div>
        </div>
      </div>

      {/* === Mission & Vision === */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Our Mission & Vision
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            We aim to redefine local and long-distance moving by making it
            transparent, customer-friendly, and supported by modern digital
            tools. Our vision is to become the most trusted name in relocation
            services through consistency, care, and commitment to excellence.
          </p>
        </div>
      </div>

      {/* === Why Choose Us === */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Why Choose Local Moves?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === Call to Action === */}
      <div className="bg-pink-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Move?</h2>
        <p className="opacity-90 mb-6">
          Compare, book, and move with confidence — Local Moves is here to help.
        </p>
        <a
          href="/"
          className="bg-white text-pink-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Get Started
        </a>
      </div>
    </section>
  );
};

export default AboutPage;
