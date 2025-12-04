import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll or navigate and then scroll
  const handleScrollOrNavigate = (targetId) => {
    if (location.pathname === "/") {
      const section = document.querySelector(targetId);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.querySelector(targetId);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  };

  const goToAbout = () => {
    scrollToTop();
    navigate("/about");
  };

  const goToContact = () => {
    scrollToTop();
    navigate("/contact");
  };

  return (
    <footer
      className="relative bg-[#0B0B0F] px-6 pt-16 pb-6 text-white md:px-16 font-sans"
      aria-label="Footer"
    >
      {/* Scroll-to-top button */}
      <div className="absolute -top-6 right-5 md:right-10">
        <button
          onClick={scrollToTop}
          className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#E5007D] shadow-lg transition-all duration-300 hover:bg-[#ff5ca9] hover:shadow-[0_0_15px_#ff5ca9]"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} color="white" />
        </button>
      </div>

      {/* Upper section */}
      <div className="flex flex-col items-center justify-between border-b border-[#2A2A2E] pb-4 text-center md:flex-row md:items-start md:text-left">
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <img
              src={logo}
              alt="Local Moves logo"
              loading="lazy"
              className="h-10 w-10 md:h-8 md:w-8"
            />
            <p className="text-[11px] font-medium tracking-wide text-gray-300">
              Moving, Packing, Storage, Cleaning, Clearance
            </p>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <button
            className="rounded-full border border-white px-8 py-2 text-sm font-semibold transition-all duration-300 hover:border-[#E5007D] hover:bg-[#E5007D] hover:text-white hover:shadow-[0_0_10px_#E5007D]"
            aria-label="Start"
          >
            Start
          </button>
        </div>
      </div>

      {/* Middle section */}
      <div className="mt-6 flex flex-col justify-between border-b border-[#2A2A2E] pb-5 text-center md:flex-row md:text-left">
        <p className="mx-auto max-w-xs text-[13px] leading-relaxed text-gray-400 md:mx-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas nec
          libero non mauris tincidunt aliquam.
        </p>

        {/* Links */}
        <div className="mt-5 flex flex-col text-[13px] font-medium text-gray-400 md:mt-0 md:flex-row md:gap-10">
          <div className="flex flex-col gap-1.5">
            <p className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D]">
              Benefits
            </p>

            <p
              onClick={() => handleScrollOrNavigate("#faq")}
              className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D]"
            >
              Frequently Asked Questions
            </p>

            <p
              onClick={() => handleScrollOrNavigate("#testimonials")}
              className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D]"
            >
              Testimonials
            </p>

            <p
              onClick={goToAbout}
              className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D] md:hidden"
            >
              About Us
            </p>

            <p
              onClick={goToContact}
              className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D] md:hidden"
            >
              Contact Us
            </p>

            <p className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D] md:hidden">
              News
            </p>
          </div>

          {/* About & Contact (desktop) */}
          <div className="hidden flex-col gap-1.5 md:flex">
            <p
              onClick={goToAbout}
              className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D]"
            >
              About Us
            </p>
            <p
              onClick={goToContact}
              className="cursor-pointer transition-colors duration-200 hover:text-[#E5007D]"
            >
              Contact Us
            </p>
          </div>
        </div>

        {/* Social icons */}
        <div className="mt-6 flex justify-center gap-6 md:mt-0 md:justify-start">
          <a
            href="#"
            aria-label="LinkedIn"
            className="text-gray-400 transition-all duration-300 hover:scale-110 hover:text-[#E5007D]"
          >
            <FaLinkedinIn size={18} />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            className="text-gray-400 transition-all duration-300 hover:scale-110 hover:text-[#E5007D]"
          >
            <FaYoutube size={18} />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            className="text-gray-400 transition-all duration-300 hover:scale-110 hover:text-[#E5007D]"
          >
            <FaInstagram size={18} />
          </a>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-5 flex flex-col items-center justify-between text-center text-[12px] text-gray-500 md:flex-row md:text-left">
        <p className="font-medium">
          © {new Date().getFullYear()} Local Moves ·{" "}
          <span className="cursor-pointer font-semibold transition-colors duration-300 hover:text-[#E5007D]">
            Privacy Policy
          </span>
        </p>

        <div className="mt-2 flex items-center justify-center gap-2 font-medium md:mt-0">
          <p>Designed By</p>
          <img
            src={logo}
            alt="Designed by Local Moves logo"
            loading="lazy"
            className="h-4 w-4"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
