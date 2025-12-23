// src/stores/useAuthStore.js
import { create } from "zustand";
import api from "../api/axios";

/**
 * Auth store (Zustand)
 * - normalizes user shape
 * - centralizes company/subscription updates
 * - exposes helper methods for the rest of the app
 */

// If token exists at module load, set axios header so calls are authenticated
try {
  const _stored = JSON.parse(localStorage.getItem("user") || "null");
  if (_stored?.token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${_stored.token}`;
  } else if (localStorage.getItem("authToken")) {
    api.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("authToken")}`;
  }
} catch {
  // ignore parse errors
}

const makeEmptyUser = () => ({
  email: "",
  fullName: "",
  role: "",
  phone: "",

  token: "",
  company_registered: false,
  company_name: "",
  subscription_plan: "Free",
});

export const useAuthStore = create((set, get) => ({
  user: (() => {
    try {
      const raw = JSON.parse(localStorage.getItem("user") || "null");
      if (!raw) return null;
      return {
        email: raw.email || "",
        fullName: raw.fullName || raw.full_name || "",
        role: raw.role || "",
        phone: raw.phone || "",
        token: raw.token || raw.accessToken || "",
        company_registered: raw.company_registered || raw.companyRegistered || false,
        company_name: raw.company_name || raw.companyName || "",
        subscription_plan: raw.subscription_plan || raw.subscriptionPlan || raw.subscription || "Free",
      };
    } catch {
      return null;
    }
  })(),

  isAuthenticated: !!(localStorage.getItem("user") && JSON.parse(localStorage.getItem("user") || "{}")?.token),

  // ---------- REGISTER ----------
  register: async (formData) => {
    try {
      const payload = {
        full_name: formData.fullName?.trim(),
        email: formData.email?.trim(),
        password: formData.password,
        phone: formData.phone,
        otp: formData.otp,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        role: formData.userType === "logistic" ? "Logistics Manager" : "User",
      };

      const response = await api.post("localmoves.api.auth.signup", payload);
      const res = response.data?.message || response.data;

      if (res?.success) return { success: true };
      return { success: false, message: res?.message || "Registration failed" };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Server error",
      };
    }
  },

  // ---------- FETCH COMPANY ----------
  fetchCompany: async (email) => {
    try {
      if (!email) return { success: false, message: "No email provided" };

      const r = await api.get("localmoves.api.company.get_my_company", {
        params: { email },
      });

      const companies = r.data?.message?.data || [];
      if (companies.length === 0) {
        set((state) => {
          const user = state.user ? { ...state.user, company_registered: false } : null;
          if (user) localStorage.setItem("user", JSON.stringify(user));
          return { user };
        });
        localStorage.setItem("companyRegistered", "false");
        return { success: true, companyExists: false, companies: [] };
      }

      const c = companies[0];
      const company_name = c.company_name || "";
      const subscription_plan = c.subscription_plan || "Free";

      set((state) => {
        const base = state.user || makeEmptyUser();
        const newUser = {
          ...base,
          company_registered: !!company_name,
          company_name,
          subscription_plan,
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("companyRegistered", newUser.company_registered ? "true" : "false");
        return { user: newUser, isAuthenticated: !!newUser.token };
      });

      return { success: true, companyExists: true, company: c };
    } catch (err) {
      console.error("fetchCompany error:", err);
      return { success: false, message: err?.response?.data || err?.message || "Failed to fetch company" };
    }
  },

  // ---------- LOGIN ----------
  login: async (email, password) => {
    try {
      const response = await api.post("localmoves.api.auth.login", { email, password });
      const res = response.data?.message;
      if (!res?.success) return { success: false, message: res?.message || "Invalid credentials" };

      const data = res.data || {};

      const user = {
        email: data.email || email,
        fullName: data.full_name || data.fullName || "",
        role: data.role || "",
        phone: data.phone || "",
        token: data.token || data.accessToken || "",
        company_registered: false,
        company_name: "",
        subscription_plan: "Free",
      };

      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
      set({ user, isAuthenticated: true });
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Logistics Manager") {
        try {
          const fetchRes = await get().fetchCompany(user.email);
          if (!fetchRes?.success) {
            return { success: true, user: get().user, redirect: "/register-company" };
          }

          if (!fetchRes.companyExists) {
            return { success: true, user: get().user, redirect: "/register-company" };
          }

          const subscriptionPlan = get().user?.subscription_plan || "Free";
          const planLower = subscriptionPlan.toLowerCase().trim();

          // If user has Free plan or empty plan, redirect to onboarding subscription page
          if (planLower === "free" || planLower === "") {
            return { success: true, user: get().user, redirect: "/onboarding-subscription" };
          }

          // Check if user has a bolt-on plan (Extra Leads or Additional Jobs)
          // Case-insensitive check for bolt-on plans
          const hasBoltOn =
            planLower.includes("extra leads") ||
            planLower.includes("additional jobs") ||
            planLower.includes("extra_leads") ||
            planLower.includes("additional_jobs");

          if (hasBoltOn) {
            // User has bolt-on plan, go directly to dashboard
            localStorage.setItem("boltOnOfferSeen", "true");
            return { success: true, user: get().user, redirect: "/logistic-dashboard/home" };
          } else {
            // User has paid plan but no bolt-on, show bolt-on upgrade page
            // Clear the flag so they see the bolt-on offer
            localStorage.removeItem("boltOnOfferSeen");
            return { success: true, user: get().user, redirect: "/logistic-dashboard/bolt-on-upgrade" };
          }
        } catch (err) {
          console.error("login -> fetchCompany failed:", err);
          return { success: true, user: get().user, redirect: "/register-company" };
        }
      }

      return { success: true, user: get().user || user, redirect: "/dashboard" };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Server error",
      };
    }
  },

  // ---------- LOGOUT ----------
  logout: () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("companyRegistered");
      localStorage.removeItem("hasSubscription");
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false });
    delete api.defaults.headers.common["Authorization"];
  },

  // ---------- UPDATE USER ----------
  updateUser: (updatedFields) => {
    set((state) => {
      const currentUser = state.user || makeEmptyUser();
      const newUser = { ...currentUser, ...updatedFields };
      try {
        localStorage.setItem("user", JSON.stringify(newUser));
      } catch {
        console.error("updateUser localStorage error");
      }
      return { user: newUser };
    });
  },

  // ---------- ACTIVATE SUBSCRIPTION LOCALLY ----------
  activateSubscriptionLocal: (planName) => {
    set((state) => {
      const currentUser = state.user || makeEmptyUser();
      const newUser = {
        ...currentUser,
        subscription_plan: planName,
        company_registered: true,
      };
      try {
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("hasSubscription", "true");
        localStorage.setItem("companyRegistered", "true");
      } catch {
        console.error("activateSubscriptionLocal localStorage error");
      }
      try {
        window.dispatchEvent(new Event("subscription-updated"));
      } catch {
        // ignore
      }
      return { user: newUser, isAuthenticated: true };
    });
  },

  // ---------- REFRESH AUTH ----------
  refreshAuth: () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser?.token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedUser.token}`;
      }
      set({
        user: storedUser || null,
        isAuthenticated: !!(storedUser && storedUser.token),
      });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
