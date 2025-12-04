import React from "react";

const PartnerLogos = () => {
  const logos = [
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
  ];

  return (
    <section
      className="w-full bg-white border-t border-gray-100 py-8 overflow-hidden"
      aria-label="Partner logos scrolling section"
    >
      <div className="relative flex overflow-hidden">
        {/* Two identical tracks for continuous motion */}
        <div className="scroll-track flex items-center space-x-16">
          {logos.map((logo, index) => (
            <img
              key={`set1-${index}`}
              src={logo}
              alt={`Partner logo ${index + 1}`}
              loading="lazy"
              className="h-10 md:h-12 object-contain transform transition-transform duration-300 ease-in-out hover:scale-110"
            />
          ))}
        </div>
        <div className="scroll-track flex items-center space-x-16">
          {logos.map((logo, index) => (
            <img
              key={`set2-${index}`}
              src={logo}
              alt={`Duplicate partner logo ${index + 1}`}
              loading="lazy"
              className="h-10 md:h-12 object-contain transform transition-transform duration-300 ease-in-out hover:scale-110"
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollLoop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .scroll-track {
          flex-shrink: 0;
          display: flex;
          animation: scrollLoop 15s linear infinite;
        }

        /* Equal gaps between images (matches space-x-16) */
        .scroll-track img {
          margin-right: 4rem;
        }

        /* Hide scrollbars */
        ::-webkit-scrollbar { display: none; }
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </section>
  );
};

export default PartnerLogos;
