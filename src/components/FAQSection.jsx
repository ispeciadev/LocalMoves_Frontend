import React, { useState, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Who will contact me?",
      answer:
        "Unlike other comparison sites, you can manage all your quotes inside our portal. Only request contact from providers you’re interested in when you want to be contacted.",
    },
    {
      question: "Does this comparison cost anything?",
      answer:
        "No, using our comparison service is completely free. You only pay the moving company you choose to hire.",
    },
    {
      question: "Can I meet the team moving me?",
      answer:
        "Yes, you can contact and arrange meetings with your chosen provider once your booking is confirmed.",
    },
    {
      question: "How quickly can I get a quote?",
      answer:
        "Most users receive their quotes instantly, and all quotes are stored in your portal for easy access anytime.",
    },
    {
      question:
        "How do I know what to look out for when comparing removal providers?",
      answer:
        "We provide detailed provider profiles, ratings, and verified reviews so you can make an informed decision.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = useCallback(
    () => setActiveIndex((prev) => (prev + 1) % faqs.length),
    [faqs.length]
  );

  const handlePrev = useCallback(
    () => setActiveIndex((prev) => (prev - 1 + faqs.length) % faqs.length),
    [faqs.length]
  );

  return (
    <section
      id="faq"
      className="relative bg-[#E5007D] text-white py-20 px-6 md:px-12 lg:px-20 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="block w-full h-[100px] sm:h-[120px] md:h-[150px]"
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,40 C480,90 960,-20 1440,40 L1440,0 L0,0 Z"
          ></path>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center z-10">
        {/* Left List */}
        <Motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold mb-8 leading-snug"
          >
            Have Questions?
            <br />
            Look Here.
          </h2>

          <ul className="space-y-4 text-base">
            {faqs.map((faq, index) => {
              const isActive = activeIndex === index;
              return (
                <li
                  key={faq.question}
                  className={`cursor-pointer border-b border-pink-200/40 pb-2 flex items-center gap-2 transition-colors ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-pink-100 hover:text-white"
                  }`}
                >
                  <button
                    onClick={() => setActiveIndex(index)}
                    className="flex items-center gap-2 focus:outline-none"
                    aria-expanded={isActive}
                    aria-controls={`faq-answer-${index}`}
                  >
                    {isActive && <span className="text-white text-xs">›</span>}
                    {faq.question}
                  </button>
                </li>
              );
            })}
          </ul>
        </Motion.div>

        {/* Right Card */}
        <Motion.div
          className="relative flex flex-col items-center md:items-end text-center md:text-left"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="block md:hidden text-2xl font-bold mb-6 leading-snug">
            Have Questions?
            <br />
            Look Here.
          </h2>

          <div className="relative w-full max-w-lg flex justify-center md:justify-end">
            {/* Background Cards */}
            <Motion.div
              className="absolute inset-0 flex justify-center items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              aria-hidden="true"
            >
              <div className="absolute bg-white rounded-2xl shadow-lg w-[85%] h-[380px] rotate-[-5deg] -translate-x-5 translate-y-6 z-0"></div>
              <div className="absolute bg-white rounded-2xl shadow-lg w-[85%] h-[380px] rotate-[5deg] translate-x-5 translate-y-9 z-0"></div>
            </Motion.div>

            {/* Active Card */}
            <AnimatePresence mode="wait">
              <Motion.div
                key={activeIndex}
                className="relative bg-white rounded-2xl shadow-lg w-[85%] h-[390px] text-gray-800 p-8 md:p-10 z-10 flex flex-col justify-between mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                    <p className="text-sm uppercase text-[#E5007D] font-semibold tracking-wide">
                      Frequently Asked Questions
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrev}
                        className="bg-[#E5007D] text-white rounded-full p-2 hover:bg-[#c7006d] transition"
                        type="button"
                        aria-label="Previous question"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="bg-[#E5007D] text-white rounded-full p-2 hover:bg-[#c7006d] transition"
                        type="button"
                        aria-label="Next question"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <Motion.h3
                    className="text-lg font-bold mb-2 text-left"
                    id={`faq-question-${activeIndex}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faqs[activeIndex].question}
                  </Motion.h3>

                  <Motion.p
                    id={`faq-answer-${activeIndex}`}
                    className="text-gray-600 leading-relaxed text-left text-[15px]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {faqs[activeIndex].answer}
                  </Motion.p>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center gap-2 text-sm text-gray-600 mt-3">
                  <ChevronRight
                    size={16}
                    className="text-[#E5007D] shrink-0 mt-0.5"
                  />
                  <span>
                    Still have questions?{" "}
                    <a
                      href="mailto:support@localmoves.com"
                      className="text-[#E5007D] font-medium hover:underline"
                    >
                      support@localmoves.com
                    </a>
                  </span>
                </div>
              </Motion.div>
            </AnimatePresence>
          </div>
        </Motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
