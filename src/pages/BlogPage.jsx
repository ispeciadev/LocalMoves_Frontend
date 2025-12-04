import React, { useState } from "react";
import { Calendar, ArrowRight, X } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Tips for a Smooth Home Move",
    date: "October 25, 2025",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description:
      "Planning a home move? Discover expert tips on packing, organizing, and ensuring a stress-free relocation experience.",
    content:
      "Moving can be stressful, but preparation is key. Start by decluttering your home weeks before moving day. Label every box clearly and keep essentials handy. Make a moving day checklist to avoid last-minute surprises. Use sturdy boxes and bubble wrap for fragile items. Finally, take photos of electronics before disconnecting them to simplify reassembly. ".repeat(
        10
      ),
  },
  {
    id: 2,
    title: "How to Choose the Right Moving Company",
    date: "October 20, 2025",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description:
      "Not all movers are the same. Learn what to look for when comparing moving providers and securing the best deal.",
    content:
      "Always research a moving company's reputation. Check reviews, licenses, and insurance. Request in-home quotes to compare fair pricing. Avoid unusually low bids—they often indicate hidden charges. A transparent contract and customer references can help ensure you’re hiring professionals.",
  },
  {
    id: 3,
    title: "Packing Fragile Items the Right Way",
    date: "October 12, 2025",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description:
      "Broken glass and damaged electronics are common — unless you follow these professional packing tips for fragile items.",
    content:
      "When packing fragile items, use double-walled boxes and cushioning materials like foam or paper. Wrap each item individually, and fill empty spaces with packing peanuts. Clearly mark boxes as 'FRAGILE' and avoid stacking them under heavy loads.",
  },
];

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <section className="bg-white min-h-screen text-gray-800 flex flex-col relative">
      {/* Custom scrollbar styling */}
      <style>
        {`
          /* Light pink scrollbar for mobile */
          @media (max-width: 768px) {
            .custom-scroll::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background-color: rgba(248, 176, 193, 0.2);
              border-radius: 4px;
            }
            .custom-scroll:hover::-webkit-scrollbar-thumb {
              background-color: rgba(248, 176, 193, 0.4);
            }
          }

          /* Hide scrollbar for desktop */
          @media (min-width: 769px) {
            .custom-scroll {
              scrollbar-width: none; /* Firefox */
              -ms-overflow-style: none; /* IE 10+ */
            }
            .custom-scroll::-webkit-scrollbar {
              display: none; /* Chrome/Safari */
            }
          }
        `}
      </style>

      {/* Hero Section */}
      <div className="bg-pink-600 text-white text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Blog</h1>
        <p className="text-sm md:text-base opacity-90 max-w-2xl mx-auto">
          Insights, moving guides, and expert advice to make your relocation easier.
        </p>
      </div>

      {/* Blog Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16 grow">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar size={16} className="mr-2 text-pink-600" />
                  <time>{post.date}</time>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {post.description}
                </p>
                <button
                  onClick={() => setSelectedPost(post)}
                  className="inline-flex items-center text-pink-600 font-semibold hover:underline text-sm"
                >
                  Read More <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-50 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Want to Stay Updated?
        </h2>
        <p className="text-gray-700 mb-6 text-sm md:text-base">
          Subscribe to our newsletter for the latest moving tips and offers.
        </p>
        <form
          className="flex justify-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="px-4 py-2 border border-gray-300 rounded-l-lg w-64 focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-pink-600 text-white px-5 py-2 rounded-r-lg font-semibold text-sm hover:bg-pink-700 transition"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Popup Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg rounded-3xl shadow-2xl relative overflow-hidden p-6 border border-pink-100 transform scale-95 animate-zoomIn">
            
            {/* Close Button (with round soft background) */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full p-2 shadow-sm transition"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Image */}
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4"
            />

            {/* Date */}
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <Calendar size={16} className="mr-2 text-pink-600" />
              <time>{selectedPost.date}</time>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 leading-tight">
              {selectedPost.title}
            </h2>

            {/* Scrollable Content (custom scroll) */}
            <div
              className="text-gray-700 text-sm leading-relaxed max-h-48 sm:max-h-56 overflow-y-auto pr-2 rounded custom-scroll"
            >
              {selectedPost.content}
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setSelectedPost(null)}
                className="bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogPage;
