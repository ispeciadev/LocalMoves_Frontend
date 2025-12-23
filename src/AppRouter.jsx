// src/AppRouter.jsx
import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ComparePage from "./pages/ComparePage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import ScrollToTop from "./components/ScrollToTop";
import BookServicePage from "./pages/BookServicePage";
import PricePlansDetails from "./pages/PricePlansDetails";

import ResetPassword from "./pages/ResetPassword";


// Step 4 Page
import RefineOptionsPage from "./pages/RefineOptionsPage";

// Filtered Providers Page
import FilteredProvidersPage from "./pages/FilteredProvidersPage";

// User Payment Page
import PaymentPageUser from "./pages/PaymentPage";

// Logistic Pages
import LogisticDashboard from "./pages/logistic/LogisticDashboard";
import DashboardHome from "./pages/logistic/DashboardHome";
import Customers from "./pages/logistic/Customers";
import RequestDetails from "./pages/logistic/RequestDetails";
import SubscriptionPlans from "./pages/logistic/SubscriptionPlans";
import PaymentPage from "./pages/logistic/PaymentPage";
import PaymentSuccess from "./pages/logistic/PaymentSuccess";
import Settings from "./pages/logistic/Settings";
import RegisterCompany from "./pages/RegisterCompany";
import EditCompany from "./pages/logistic/EditCompany";
import BoltOnUpgrade from "./pages/logistic/BoltOnUpgrade";
// import AvailableRequests from "./pages/logistic/AvailableRequests";

// Onboarding Pages
import NewSubscriptionPlans from "./pages/onboarding/NewSubscriptionPlans";
import OnboardingPaymentPage from "./pages/onboarding/PaymentPage";
import OnboardingPaymentSuccess from "./pages/onboarding/PaymentSuccess";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageRequests from "./pages/admin/ManageRequests";
import ManagePayments from "./pages/admin/ManagePayments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSupport from "./pages/admin/AdminSupport";
import ManageInventory from "./pages/admin/ManageInventory";
import Configuration from "./pages/admin/Configuration";

import api from "./api/axios";
import { useAuthStore } from "./stores/useAuthStore";

function AppRouter() {
  const [isCompanyRegistered, setIsCompanyRegistered] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const { refreshAuth } = useAuthStore();

  const checkCompanyStatus = useCallback(async () => {
    refreshAuth();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "Logistics Manager") {
      setIsCompanyRegistered(false);
      setHasSubscription(false);
      return;
    }

    // Check if user just paid - trust localStorage immediately
    const justPaid = localStorage.getItem("justPaid");
    if (justPaid === "true") {
      console.log("✅ User just paid - trusting localStorage subscription status");
      setIsCompanyRegistered(true);
      setHasSubscription(true);

      // Clear flag after 5 seconds to allow redirect to complete
      setTimeout(() => {
        console.log("🧹 Clearing justPaid flag after delay");
        localStorage.removeItem("justPaid");
      }, 5000);

      return;
    }

    try {
      const res = await api.get("localmoves.api.company.get_my_company", {
        params: { email: user.email },
      });

      const companies = res.data?.message?.data || [];
      const company = companies[0];

      const hasCompany =
        company?.company_name && company.company_name.trim().length > 0;

      const subscriptionActive =
        company?.subscription_plan &&
        company.subscription_plan.trim().toLowerCase() !== "free" &&
        company.subscription_plan.trim() !== "";

      setIsCompanyRegistered(!!hasCompany);
      setHasSubscription(!!subscriptionActive);
    } catch (err) {
      console.error("Company status check failed:", err);
      setIsCompanyRegistered(false);
      setHasSubscription(false);
    }
  }, [refreshAuth]); // 👈 ESLint-safe & behavior same


  // 🔧 FIXED: Added missing dependency
  useEffect(() => {
    checkCompanyStatus();
  }, [checkCompanyStatus]);

  // 🔧 FIXED: Added missing dependency
  useEffect(() => {
    const handler = () => {
      setHasSubscription(true);
      checkCompanyStatus();
    };

    window.addEventListener("subscription-updated", handler);
    return () => window.removeEventListener("subscription-updated", handler);
  }, [checkCompanyStatus]);

  return (
    <Router>
      <ScrollToTop />
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/refine-options" element={<RefineOptionsPage />} />
        <Route path="/filtered-providers" element={<FilteredProvidersPage />} />
        <Route path="/book-service" element={<BookServicePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/plan-details" element={<PricePlansDetails />} />

        <Route path="/reset-password" element={<ResetPassword />} />


        {/* USER PAYMENT */}
        <Route path="/payment" element={<PaymentPageUser />} />

        {/* REGISTER COMPANY */}
        <Route
          path="/register-company"
          element={
            !isCompanyRegistered ? (
              <RegisterCompany />
            ) : !hasSubscription ? (
              <Navigate to="/onboarding-subscription" replace />
            ) : (
              <Navigate to="/logistic-dashboard/home" replace />
            )
          }
        />

        {/* ONBOARDING FLOW */}
        <Route
          path="/onboarding-subscription"
          element={
            isCompanyRegistered ? (
              <NewSubscriptionPlans />
            ) : (
              <Navigate to="/register-company" replace />
            )
          }
        />

        <Route
          path="/onboarding/payment"
          element={
            isCompanyRegistered ? (
              <OnboardingPaymentPage />
            ) : (
              <Navigate to="/register-company" replace />
            )
          }
        />

        <Route
          path="/onboarding/payment-success"
          element={
            isCompanyRegistered ? (
              <OnboardingPaymentSuccess />
            ) : (
              <Navigate to="/register-company" replace />
            )
          }
        />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* USER REQUEST DETAILS */}
        <Route
          path="/user/request-details/:id"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />

        {/* LOGISTIC DASHBOARD */}
        <Route
          path="/logistic-dashboard/*"
          element={
            <ProtectedRoute requiredRole="Logistics Manager">
              {isCompanyRegistered ? (
                hasSubscription ? (
                  <LogisticDashboard />
                ) : (
                  <Navigate to="/onboarding-subscription" replace />
                )
              ) : (
                <Navigate to="/register-company" replace />
              )}
            </ProtectedRoute>
          }
        >
          {/* Redirect to bolt-on upgrade if user hasn't seen it and has paid plan (but no bolt-on) */}
          <Route
            index
            element={
              (() => {
                const boltOnSeen = localStorage.getItem("boltOnOfferSeen");
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const subscriptionPlan = user.subscription_plan || "Free";
                const planLower = subscriptionPlan.toLowerCase().trim();
                const hasPaidPlan = planLower !== "free" && planLower !== "";

                // Check if user already has a bolt-on plan (case-insensitive)
                const hasBoltOn =
                  planLower.includes("extra leads") ||
                  planLower.includes("additional jobs") ||
                  planLower.includes("extra_leads") ||
                  planLower.includes("additional_jobs");

                // If user has bolt-on, always go to home
                if (hasBoltOn) {
                  return <Navigate to="/logistic-dashboard/home" replace />;
                }

                // If user has paid plan but no bolt-on and hasn't seen the offer, show bolt-on page
                if (hasPaidPlan && !boltOnSeen) {
                  return <Navigate to="/logistic-dashboard/bolt-on-upgrade" replace />;
                }

                return <Navigate to="/logistic-dashboard/home" replace />;
              })()
            }
          />
          <Route path="home" element={<DashboardHome />} />
          <Route path="bolt-on-upgrade" element={<BoltOnUpgrade />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<RequestDetails />} />
          <Route path="subscription-plan" element={<SubscriptionPlans />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="settings" element={<Settings />} />
          <Route path="edit-company" element={<EditCompany />} />
          {/* <Route path="available-requests" element={<AvailableRequests />} /> */}
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="requests" element={<ManageRequests />} />
          <Route path="payments" element={<ManagePayments />} />
          <Route path="ManageInventory" element={<ManageInventory />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default AppRouter;
