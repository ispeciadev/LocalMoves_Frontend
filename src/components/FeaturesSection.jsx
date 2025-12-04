import React from "react";
import {
  FaBalanceScale,
  FaMousePointer,
  FaCommentDots,
  FaCheckCircle,
} from "react-icons/fa";
import featureImage from "../assets/FeaturesSection.png"; //  Proper image import

const FeaturesSection = () => {
  return (
    <section
      className="relative w-full bg-white py-14 md:py-20 overflow-hidden"
      aria-label="Features Section"
    >
      {/* Background glow behind image */}
      <div
        className="absolute left-1/2 top-[45%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E5007D]/25 blur-[100px]"
        aria-hidden="true"
      />

      {/* Layout container */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col-reverse gap-12 px-5 md:px-10 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        {/* Text + icons */}
        <div className="order-2 mt-10 flex flex-col items-center text-center lg:order-2 lg:mt-0 lg:items-start lg:text-left">
          <h2 className="mb-3 text-[26px] font-bold leading-tight text-[#E5007D] sm:text-[30px] md:text-[36px]">
            The Complete Moving Service
          </h2>
          <p className="mb-8 text-[14px] text-gray-700 sm:text-[15px]">
            Compare Removal Providers In{" "}
            <span className="font-semibold text-[#E5007D]">Cricklewood</span>
          </p>

          {/* Icons grid */}
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
            {[
              {
                icon: <FaBalanceScale />,
                title: "Impartiality",
                desc: "By remaining impartial we can help advise which providers services are most suited to your move requirements.",
              },
              {
                icon: <FaMousePointer />,
                title: "Accuracy",
                desc: "Realistic prices — we follow up with all compare customers to ensure the quoted price is the price ultimately paid.",
              },
              {
                icon: <FaCommentDots />,
                title: "Reliability",
                desc: "Our removal providers upload their availability live, ensuring the dates you see are up to date.",
              },
              {
                icon: <FaCheckCircle />,
                title: "Privacy",
                desc: "We don’t sell your data. You’ll only be contacted by the companies you select.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="mx-auto flex max-w-[280px] flex-col items-center space-y-2 text-center lg:mx-0 lg:items-start lg:text-left"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5007D] bg-white text-[20px] text-[#E5007D] shadow-sm"
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
                <h4 className="text-[15px] font-semibold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-[13px] leading-snug text-gray-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Image section */}
        <div className="relative order-1 flex items-center justify-center lg:order-1">
          <div className="relative flex w-[190px] items-center justify-center sm:w-[210px] md:w-60">
            <div
              className="absolute inset-0 -z-10 rounded-full bg-[#E5007D]/25 blur-[90px]"
              aria-hidden="true"
            />
            <img
              src={featureImage}
              alt="Feature section showcase"
              loading="lazy"
              className="h-auto w-full rounded-[28px] border border-gray-200 object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Bottom white line */}
      <div
        className="absolute bottom-0 left-0 z-20 h-0.5 w-full bg-white"
        aria-hidden="true"
      />
    </section>
  );
};

export default FeaturesSection;
