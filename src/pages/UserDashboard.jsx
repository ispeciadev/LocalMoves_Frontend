import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUserCog,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";
import api from "../api/axios";

/* --------------------------- MAIN USER DASHBOARD --------------------------- */
const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  // Check for navigation state from RequestDetails
  useEffect(() => {
    const locationState = window.history.state?.usr;
    if (locationState?.activeSection === 'reviews') {
      setActiveSection('reviews');
      // Clear state
      window.history.replaceState({ ...window.history.state, usr: {} }, '');
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="md:w-64 w-full bg-pink-600 text-white flex flex-col justify-between py-8 px-4 md:min-h-screen shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-center mb-8 tracking-wide">
            User Dashboard
          </h2>

          <nav>
            <ul className="space-y-3">

              <li
                onClick={() => setActiveSection("home")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeSection === "home"
                    ? "bg-white text-pink-600 shadow-md"
                    : "hover:bg-pink-500/80"
                  }`}
              >
                <FaHome />
                <span className="font-medium">Home / My Requests</span>
              </li>

              <li
                onClick={() => setActiveSection("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeSection === "profile"
                    ? "bg-white text-pink-600 shadow-md"
                    : "hover:bg-pink-500/80"
                  }`}
              >
                <FaUserCog />
                <span className="font-medium">Profile Settings</span>
              </li>

              <li
                onClick={() => setActiveSection("reviews")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeSection === "reviews"
                    ? "bg-white text-pink-600 shadow-md"
                    : "hover:bg-pink-500/80"
                  }`}
              >
                ⭐
                <span className="font-medium">My Reviews</span>
              </li>

            </ul>
          </nav>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 mx-2 mt-10 px-4 py-3 bg-pink-700 rounded-lg hover:bg-pink-800 transition shadow-lg"
        >
          <FaSignOutAlt className="text-white" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeSection === "home" && <UserRequests />}
        {activeSection === "profile" && <ProfileSettings />}
        {activeSection === "reviews" && <UserReviews />}
      </main>

    </div>
  );
};

/* ------------------------------ USER REQUESTS ------------------------------ */
const UserRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Pagination
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const toastShown = React.useRef(false);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await api.get("localmoves.api.request.get_my_requests");
        const data = res.data?.message?.data || [];

        // ⭐ Sort latest first
        data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setRequests(data);
      } catch {
        if (!toastShown.current) {
          toast.error("Failed to load your requests");
          toastShown.current = true;
        }
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  // ⭐ Pagination logic
  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const paginated = requests.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">My Requests</h2>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No requests found.</p>
      ) : (
        <>
          <div className="grid gap-6">
            {paginated.map((req, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition duration-200 cursor-pointer"
                onClick={() => navigate(`/user/request-details/${req.name}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <FiMapPin className="text-pink-600 text-2xl" />
                  <p className="font-semibold text-xl">
                    {req.pickup_city} → {req.delivery_city}
                  </p>
                </div>

                <p className="text-gray-600 text-sm mb-1">
                  {req.pickup_pincode} → {req.delivery_pincode}
                </p>

                <p className="text-gray-600 text-sm italic">
                  {req.item_description}
                </p>

                <p className="text-xs text-gray-400 mt-3">
                  {new Date(req.created_at).toLocaleString()}
                </p>

                <div className="mt-2 text-sm text-gray-600 font-medium">
                  Status: {req.status}
                </div>
              </div>
            ))}
          </div>

          {/* ⭐ Pagination UI */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span className="font-semibold">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* --------------------------- PROFILE SETTINGS --------------------------- */
const ProfileSettings = () => {
  const { user, updateUser } = useAuthStore();

  const [form, setForm] = useState({
    fullName: user?.full_name || user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    oldPassword: "",
    newPassword: "",
  });

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const inputClass =
    "w-full border border-gray-300 px-4 py-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-pink-400 outline-none";

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();

    const oldPwd = form.oldPassword.trim();
    const newPwd = form.newPassword.trim();
    const wantsPasswordChange = oldPwd !== "" || newPwd !== "";

    try {
      if (wantsPasswordChange) {
        if (!oldPwd || !newPwd) {
          toast.error("Enter BOTH old and new password.");
          return;
        }

        if (oldPwd === newPwd) {
          toast.error("New password cannot be same as old password!");
          return;
        }

        const res = await api.post("localmoves.api.auth.change_password", {
          old_password: oldPwd,
          new_password: newPwd,
        });

        const msg = res.data?.message;
        if (msg?.success) toast.success(msg.message);
        else toast.error(msg?.message || "Failed to change password");

        setForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
        return;
      }

      const response = await api.post("localmoves.api.auth.update_profile", {
        full_name: form.fullName,
        phone: form.phone,
      });

      const msg = response.data?.message;

      if (msg?.success) {
        toast.success(msg.message);

        updateUser({
          ...user,
          full_name: msg.data.full_name,
          phone: msg.data.phone,
        });
      } else {
        toast.error(msg?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-8">Profile Settings</h2>

      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-xl"
      >
        <div className="space-y-5">

          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className={inputClass}
          />

          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
          />

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className={inputClass}
          />

          <div className="relative">
            <input
              type={showOldPass ? "text" : "password"}
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="Enter Old Password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowOldPass(!showOldPass)}
              className="absolute right-3 top-3 text-pink-500"
            >
              {showOldPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPass ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter New Password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3 top-3 text-pink-500"
            >
              {showNewPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition shadow-md"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

/* ---------------------------  USER REVIEWS SECTION  --------------------------- */
const UserReviews = () => {
  const [requests, setRequests] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratings, setRatings] = useState({});
  const [reviewTexts, setReviewTexts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const [activeTab, setActiveTab] = useState("pending");

  const ITEMS_PER_PAGE = 3;

  const [pendingPage, setPendingPage] = useState(1);
  const [submittedPage, setSubmittedPage] = useState(1);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res1 = await api.get("localmoves.api.request.get_my_requests");
        const reqData = res1.data?.message?.data || [];

        const res2 = await api.get(
          "localmoves.api.rating_review.get_my_ratings"
        );
        const ratingData = res2.data?.message?.data || [];

        reqData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        ratingData.sort(
          (a, b) => new Date(b.rated_at) - new Date(a.rated_at)
        );

        setRequests(reqData);
        setMyRatings(ratingData);

        ratingData.forEach((r) => {
          setRatings((prev) => ({ ...prev, [r.request_id]: r.rating }));
          setReviewTexts((prev) => ({
            ...prev,
            [r.request_id]: r.review_comment || "",
          }));
        });
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const reviewedIDs = new Set(myRatings.map((r) => r.request_id));

  const pending = requests
    .filter((req) => !reviewedIDs.has(req.name))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const submitted = requests
    .filter((req) => reviewedIDs.has(req.name))
    .sort((a, b) => {
      const A = myRatings.find((r) => r.request_id === a.name);
      const B = myRatings.find((r) => r.request_id === b.name);
      return new Date(B?.rated_at || 0) - new Date(A?.rated_at || 0);
    });

  const pendingTotal = Math.ceil(pending.length / ITEMS_PER_PAGE);
  const submittedTotal = Math.ceil(submitted.length / ITEMS_PER_PAGE);

  const pendingItems = pending.slice(
    (pendingPage - 1) * ITEMS_PER_PAGE,
    pendingPage * ITEMS_PER_PAGE
  );

  const submittedItems = submitted.slice(
    (submittedPage - 1) * ITEMS_PER_PAGE,
    submittedPage * ITEMS_PER_PAGE
  );

  const submitReview = async (requestId, isUpdate = false) => {
    const rating = ratings[requestId];
    const review_comment = reviewTexts[requestId] || "";

    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingId(requestId);

    try {
      const apiURL = isUpdate
        ? "localmoves.api.rating_review.update_rating_and_review"
        : "localmoves.api.rating_review.submit_rating_and_review";

      const res = await api.post(apiURL, {
        request_id: requestId,
        rating,
        review_comment,
      });

      const success = res.data?.message?.success;
      const msg = res.data?.message?.message;

      if (success) {
        toast.success(msg);

        const res2 = await api.get(
          "localmoves.api.rating_review.get_my_ratings"
        );
        const latestRatings = res2.data?.message?.data || [];

        latestRatings.sort(
          (a, b) => new Date(b.rated_at) - new Date(a.rated_at)
        );

        setMyRatings(latestRatings);

        setActiveTab("submitted");
        setSubmittedPage(1);
      } else {
        toast.error("Failed to save review");
      }
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-8">My Reviews</h2>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 text-sm font-medium rounded-lg ${activeTab === "pending"
              ? "bg-pink-600 text-white shadow"
              : "bg-pink-100 text-pink-600"
            }`}
        >
          Pending Reviews ({pending.length})
        </button>

        <button
          onClick={() => setActiveTab("submitted")}
          className={`px-6 py-3 text-sm font-medium rounded-lg ${activeTab === "submitted"
              ? "bg-pink-600 text-white shadow"
              : "bg-pink-100 text-pink-600"
            }`}
        >
          My Submitted Reviews ({submitted.length})
        </button>
      </div>

      {/* PENDING REVIEWS */}
      {activeTab === "pending" && (
        <div>
          {pending.length === 0 ? (
            <p className="text-gray-500">No pending reviews.</p>
          ) : (
            pendingItems.map((req) => (
              <div
                key={req.name}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
              >
                <h3 className="font-semibold text-xl text-gray-900">
                  {req.pickup_city} → {req.delivery_city}
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  {req.pickup_pincode} → {req.delivery_pincode}
                </p>

                {/* STAR RATING */}
                <div className="flex gap-2 my-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      onClick={() =>
                        setRatings((p) => ({ ...p, [req.name]: s }))
                      }
                      className={`cursor-pointer text-3xl ${s <= (ratings[req.name] || 0)
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  className="w-full border border-pink-300 rounded-lg p-4 bg-white"
                  placeholder="Write your review..."
                  value={reviewTexts[req.name] || ""}
                  onChange={(e) =>
                    setReviewTexts((p) => ({
                      ...p,
                      [req.name]: e.target.value,
                    }))
                  }
                />

                <button
                  onClick={() => submitReview(req.name, false)}
                  disabled={submittingId === req.name}
                  className="mt-4 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 shadow"
                >
                  {submittingId === req.name ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            ))
          )}

          {/* Pagination */}
          {pendingTotal > 1 && (
            <Pagination
              current={pendingPage}
              total={pendingTotal}
              setPage={setPendingPage}
            />
          )}
        </div>
      )}

      {/* SUBMITTED REVIEWS */}
      {activeTab === "submitted" && (
        <div>
          {submitted.length === 0 ? (
            <p className="text-gray-500">You haven’t reviewed anything yet.</p>
          ) : (
            submittedItems.map((req) => (
              <div
                key={req.name}
                className="bg-pink-50 p-6 rounded-xl shadow-md border border-pink-300 mb-8"
              >
                <h3 className="font-semibold text-xl text-gray-900">
                  {req.pickup_city} → {req.delivery_city}
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  {req.pickup_pincode} → {req.delivery_pincode}
                </p>

                {/* STAR RATING */}
                <div className="flex gap-2 my-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      onClick={() =>
                        setRatings((p) => ({ ...p, [req.name]: s }))
                      }
                      className={`cursor-pointer text-3xl ${s <= (ratings[req.name] || 0)
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <textarea
                  className="w-full border border-pink-300 rounded-lg p-4 bg-white"
                  value={reviewTexts[req.name] || ""}
                  onChange={(e) =>
                    setReviewTexts((p) => ({
                      ...p,
                      [req.name]: e.target.value,
                    }))
                  }
                />

                <button
                  onClick={() => submitReview(req.name, true)}
                  disabled={submittingId === req.name}
                  className="mt-4 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 shadow"
                >
                  {submittingId === req.name
                    ? "Updating..."
                    : "Update Review"}
                </button>
              </div>
            ))
          )}

          {submittedTotal > 1 && (
            <Pagination
              current={submittedPage}
              total={submittedTotal}
              setPage={setSubmittedPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* --------------------------- PAGINATION COMPONENT --------------------------- */
const Pagination = ({ current, total, setPage }) => (
  <div className="flex justify-center gap-4 mt-6">
    <button
      disabled={current === 1}
      onClick={() => setPage((p) => p - 1)}
      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
    >
      Prev
    </button>

    <span className="font-semibold">
      {current} / {total}
    </span>

    <button
      disabled={current === total}
      onClick={() => setPage((p) => p + 1)}
      className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
    >
      Next
    </button>
  </div>
);

export default UserDashboard;
