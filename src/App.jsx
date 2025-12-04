import React, { useEffect } from "react";
import AppRouter from "./AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { useAuthStore } from "./stores/useAuthStore"; // import auth store

function App() {
  const refreshAuth = useAuthStore((state) => state.refreshAuth);

  //  Restore token + user to Axios on every app load
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <>
      <AppRouter />

      {/* Toast Container (notifications) */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
