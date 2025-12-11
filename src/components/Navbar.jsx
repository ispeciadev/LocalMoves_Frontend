// // src/components/Navbar.jsx
// import React, { useState } from "react";
// import { Menu, X, User, LogOut, LayoutDashboard, Home } from "lucide-react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuthStore } from "../stores/useAuthStore";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-toastify";
// import logo from "../assets/logo.png";
// import api from "../api/axios";
// import { FaTag } from "react-icons/fa"; // added for Plan Details icon

// const Navbar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, logout } = useAuthStore();

//   const handleLogout = () => {
//     logout();
//     setMenuOpen(false);
//     setProfileOpen(false);
//     toast.success("You've been logged out successfully!");
//     navigate("/login");
//   };

//   const handleDashboardRedirect = async () => {
//     setProfileOpen(false);

//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     if (user.role === "User") {
//       navigate("/dashboard");
//       return;
//     }

//     if (user.role === "Admin") {
//       navigate("/admin");
//       return;
//     }

//     if (user.role === "Logistics Manager") {
//       try {
//         const res = await api.get("localmoves.api.company.get_my_company", {
//           params: { email: user.email },
//         });

//         const companies = res.data?.message?.data || [];
//         const company = companies[0];

//         if (!company || !company.company_name?.trim()) {
//           navigate("/register-company");
//           return;
//         }

//         const sub = company.subscription_plan;
//         if (!sub || sub.toLowerCase() === "free") {
//           navigate("/onboarding-subscription");
//           return;
//         }

//         navigate("/logistic-dashboard/home");
//         return;
//       } catch (err) {
//         console.error("Navbar company check error:", err);
//         navigate("/register-company");
//         return;
//       }
//     }

//     navigate("/");
//   };

//   const linkClasses = (path) =>
//     `flex items-center gap-2 px-5 py-2 rounded-xl transition-all ${
//       location.pathname === path
//         ? "bg-pink-100 text-pink-600 font-semibold"
//         : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
//     }`;

//   return (
//     <header className="w-full font-sans relative z-50">
//       <div className="hidden md:flex bg-black text-white justify-between items-center px-6 md:px-10 py-2 rounded-b-3xl">
//         <p className="text-xs md:text-sm flex items-center gap-2">
//           <span className="text-pink-500 text-lg">🎉</span>
//           <span className="font-semibold">Local Moves is now open!</span> We’re celebrating!
//         </p>
//         <div className="flex items-center space-x-6">
//           <a href="/blog" className="text-sm hover:text-pink-500 transition-colors">
//             Read our Blog <span className="text-xs">›</span>
//           </a>
//           <div className="flex items-center gap-4 text-white">
//             <a href="#" className="hover:text-pink-500 transition-colors">
//               <i className="fab fa-linkedin-in text-lg" />
//             </a>
//             <a href="#" className="hover:text-pink-500 transition-colors">
//               <i className="fab fa-youtube text-lg" />
//             </a>
//             <a href="#" className="hover:text-pink-500 transition-colors">
//               <i className="fab fa-instagram text-lg" />
//             </a>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white flex justify-between items-center px-6 md:px-10 py-4 shadow-sm relative">
//         <div
//           className="flex items-center gap-4 cursor-pointer select-none"
//           onClick={() => navigate("/")}
//         >
//           <img src={logo} alt="Local Moves logo" className="h-10 md:h-12 w-auto" />
//           <p className="hidden md:block text-sm text-gray-700">
//             Moving, <span className="text-gray-600">Packing, Storage, Cleaning</span>
//           </p>
//         </div>

//         <div className="flex items-center gap-3 md:gap-5 relative">
//           {user && (
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setProfileOpen(!profileOpen)}
//                 className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition"
//               >
//                 <User size={18} />
//                 <span className="hidden sm:inline">{user.fullName?.split(" ")[0]}</span>
//               </button>

//               <AnimatePresence>
//                 {profileOpen && (
//                   <Motion.div
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl py-2 z-50"
//                   >
//                     <button
//                       onClick={handleDashboardRedirect}
//                       className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
//                     >
//                       <LayoutDashboard size={16} />
//                       Dashboard
//                     </button>

//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
//                     >
//                       <LogOut size={16} />
//                       Logout
//                     </button>
//                   </Motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           )}

//           <button
//             type="button"
//             onClick={() => setMenuOpen((prev) => !prev)}
//             className="bg-black text-white p-2.5 md:p-3 rounded-full hover:bg-gray-800 transition"
//           >
//             {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </button>
//         </div>

//         <AnimatePresence>
//           {menuOpen && (
//             <>
//               <Motion.div
//                 className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
//                 onClick={() => setMenuOpen(false)}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//               />

//               <Motion.div
//                 initial={{ x: "100%" }}
//                 animate={{ x: 0 }}
//                 exit={{ x: "100%" }}
//                 transition={{ type: "spring", stiffness: 70, damping: 15 }}
//                 className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 flex flex-col py-6"
//               >
//                 <div className="flex justify-between items-center px-6 mb-4">
//                   <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
//                   <button
//                     onClick={() => setMenuOpen(false)}
//                     className="p-1 rounded hover:bg-gray-100"
//                   >
//                     <X className="h-5 w-5 text-gray-600" />
//                   </button>
//                 </div>

//                 <nav className="flex flex-col space-y-2 px-4">
//                   <Link
//                     to="/"
//                     onClick={() => setMenuOpen(false)}
//                     className={linkClasses("/")}
//                   >
//                     <Home size={16} /> Home
//                   </Link>

//                   {!user ? (
//                     <>
//                       <Link
//                         to="/login"
//                         onClick={() => setMenuOpen(false)}
//                         className={linkClasses("/login")}
//                       >
//                         <User size={16} /> Login
//                       </Link>

//                       <Link
//                         to="/register"
//                         onClick={() => setMenuOpen(false)}
//                         className={linkClasses("/register")}
//                       >
//                         <User size={16} /> Register
//                       </Link>
//                     </>
//                   ) : (
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center gap-2 w-full text-left px-5 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
//                     >
//                       <LogOut size={16} /> Logout
//                     </button>
//                   )}

//                   <Link
//                     to="/plan-details"
//                     onClick={() => setMenuOpen(false)}
//                     className="flex items-center gap-2 px-5 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition"
//                   >
//                     <FaTag size={16} />
//                     Plan Details
//                   </Link>
//                 </nav>
//               </Motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </div>
//     </header>
//   );
// };

// export default Navbar;


// src/components/Navbar.jsx
import React, { useState } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, Home } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import api from "../api/axios";
import { FaTag } from "react-icons/fa"; // added for Plan Details icon
import { Building } from "lucide-react"; // ⭐ ONLY ADDITION

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    toast.success("You've been logged out successfully!");
    navigate("/login");
  };

  const handleDashboardRedirect = async () => {
    setProfileOpen(false);

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "User") {
      navigate("/dashboard");
      return;
    }

    if (user.role === "Admin") {
      navigate("/admin");
      return;
    }

    if (user.role === "Logistics Manager") {
      try {
        const res = await api.get("localmoves.api.company.get_my_company", {
          params: { email: user.email },
        });

        const companies = res.data?.message?.data || [];
        const company = companies[0];

        if (!company || !company.company_name?.trim()) {
          navigate("/register-company");
          return;
        }

        const sub = company.subscription_plan;
        if (!sub || sub.toLowerCase() === "free") {
          navigate("/onboarding-subscription");
          return;
        }

        navigate("/logistic-dashboard/home");
        return;
      } catch (err) {
        console.error("Navbar company check error:", err);
        navigate("/register-company");
        return;
      }
    }

    navigate("/");
  };

  const linkClasses = (path) =>
    `flex items-center gap-2 px-5 py-2 rounded-xl transition-all ${
      location.pathname === path
        ? "bg-pink-100 text-pink-600 font-semibold"
        : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
    }`;

  return (
    <header className="w-full font-sans relative z-50">
      <div className="hidden md:flex bg-black text-white justify-between items-center px-6 md:px-10 py-2 rounded-b-3xl">
        <p className="text-xs md:text-sm flex items-center gap-2">
          <span className="text-pink-500 text-lg">🎉</span>
          <span className="font-semibold">Local Moves is now open!</span> We’re celebrating!
        </p>
        <div className="flex items-center space-x-6">
          <a href="/blog" className="text-sm hover:text-pink-500 transition-colors">
            Read our Blog <span className="text-xs">›</span>
          </a>
          <div className="flex items-center gap-4 text-white">
            <a href="#" className="hover:text-pink-500 transition-colors">
              <i className="fab fa-linkedin-in text-lg" />
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors">
              <i className="fab fa-youtube text-lg" />
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors">
              <i className="fab fa-instagram text-lg" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white flex justify-between items-center px-6 md:px-10 py-4 shadow-sm relative">
        <div
          className="flex items-center gap-4 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Local Moves logo" className="h-10 md:h-12 w-auto" />
          <p className="hidden md:block text-sm text-gray-700">
            Moving, <span className="text-gray-600">Packing, Storage, Cleaning</span>
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-5 relative">
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition"
              >
                <User size={18} />
                <span className="hidden sm:inline">{user.fullName?.split(" ")[0]}</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl py-2 z-50"
                  >
                    <button
                      onClick={handleDashboardRedirect}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="bg-black text-white p-2.5 md:p-3 rounded-full hover:bg-gray-800 transition"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <>
              <Motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <Motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 70, damping: 15 }}
                className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 flex flex-col py-6"
              >
                <div className="flex justify-between items-center px-6 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-2 px-4">
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className={linkClasses("/")}
                  >
                    <Home size={16} /> Home
                  </Link>

                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className={linkClasses("/login")}
                      >
                        <User size={16} /> Login
                      </Link>

                      {/* <Link
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className={linkClasses("/register")}
                      >
                        <User size={16} /> Register User
                      </Link> */}
                    </>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-5 py-2 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  )}

                  {/* ⭐ ONLY NEW ADDED LINK */}
                  <Link
                    to="/register-company"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-5 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition"
                  >
                    <Building size={16} />
                    Register Company 
                  </Link>

                  <Link
                    to="/plan-details"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-5 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition"
                  >
                    <FaTag size={16} />
                    Plan Details
                  </Link>
                </nav>
              </Motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
