import React, { useRef, useEffect, memo, useState } from "react";

// =======================
// STORIES (Delivery + Local Moves Only)
// =======================
const stories = [
  {
    text: `"Local Moves handled everything with such professionalism. My fragile items and wardrobe were delivered safely and right on time."`,
    name: "Lauren",
    image:
      "https://images.pexels.com/photos/7464700/pexels-photo-7464700.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    text: `"Even during peak hours, the delivery was quick and smooth. The team was polite, careful and extremely well-coordinated."`,
    name: "Carmen",
    image:
      "https://images.pexels.com/photos/5025669/pexels-photo-5025669.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    text: `"Needed a same-day shift. The Local Moves delivery crew was fast, organised and handled everything like pros."`,
    name: "Michael",
    image:
      "https://images.pexels.com/photos/7464591/pexels-photo-7464591.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    text: `"Everything arrived in perfect condition. The team ensured a seamless delivery—from pickup to doorstep drop-off."`,
    name: "David",
    image:
      "https://images.pexels.com/photos/7464704/pexels-photo-7464704.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    text: `"Super organised! They handled my fragile household items like decor and electronics with utmost care during delivery."`,
    name: "Rachel",
    image:
      "https://images.pexels.com/photos/5025501/pexels-photo-5025501.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    text: `"Professional delivery service! From loading to transporting to unloading — everything was safe, quick and hassle-free."`,
    name: "Priya",
    image:
      "https://images.pexels.com/photos/4245920/pexels-photo-4245920.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

// =======================
// Testimonial Card
// =======================
const Card = memo(({ story }) => (
  <div
    className="flex items-center bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-300 w-72 h-40 shrink-0"
    aria-label={`Testimonial from ${story.name}`}
  >
    <img
      src={story.image}
      alt={`${story.name}'s testimonial`}
      className="w-1/2 h-full object-cover rounded-l-2xl"
      loading="lazy"
    />
    <div className="p-4 text-left w-1/2 flex flex-col justify-between">
      <p className="text-sm text-gray-700 leading-relaxed mb-2 line-clamp-3">
        {story.text}
      </p>
      <p className="text-pink-600 font-semibold text-sm">{story.name}</p>
    </div>
  </div>
));

// =======================
// Animated Counter (Runs every time section enters view)
// =======================
const AnimatedCounter = ({ endValue, duration, className, children, trigger }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    let start = 0;
    if (ref.current) ref.current.textContent = "0";

    const increment = endValue / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString();

      if (start >= endValue) {
        clearInterval(counter);
        if (ref.current) ref.current.textContent = endValue.toLocaleString();
      }
    }, 16);

    return () => clearInterval(counter);
  }, [trigger, endValue, duration]);

  return (
    <p className={className}>
      <span ref={ref} className="font-semibold text-pink-600">0</span>{" "}
      {children}
    </p>
  );
};

// =======================
// Main Component
// =======================
const HappyStories = () => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  //  Run counter every time section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting); // true = animate, false = reset
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  const repeatedStories = [...stories, ...stories];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="bg-white py-16 px-6 md:px-10 lg:px-16 text-center overflow-hidden"
      aria-labelledby="happy-stories-heading"
    >
      {/*  Counter restarts on every section entry */}
      <AnimatedCounter
        endValue={2157}
        duration={1800}
        trigger={inView}
        className="text-sm text-gray-700 mb-2 font-medium"
      >
        moving services compared… and counting
      </AnimatedCounter>

      <h2
        id="happy-stories-heading"
        className="text-2xl md:text-3xl font-bold text-pink-600 mb-12"
      >
        Happy stories behind Local Moves
      </h2>

      <div className="relative space-y-10 overflow-hidden">
        <div className="flex gap-8 min-w-max animate-scroll-left">
          {repeatedStories.map((story, index) => (
            <Card key={`row1-${index}`} story={story} />
          ))}
        </div>

        <div className="flex gap-8 min-w-max animate-scroll-right translate-x-16">
          {repeatedStories.map((story, index) => (
            <Card key={`row2-${index}`} story={story} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-45%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-45%); }
          100% { transform: translateX(0); }
        }

        .animate-scroll-left {
          animation: scroll-left 48s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 48s linear infinite;
        }

        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default HappyStories;
