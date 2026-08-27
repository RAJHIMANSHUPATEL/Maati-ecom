import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Route, Routes } from "react-router";
import StoreSelectorModal from "./components/StoreSelectorModal";
import ScrollToTop from "./components/ScrollToTop";
import { lazy, Suspense } from "react";

const DefaultLayout = lazy(() => import("./layouts/DefaultLayout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="bg-paper px-6 py-16 font-serif text-ink/60">Opening the shop…</div>}>
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
        </Suspense>
        <StoreSelectorModal />
      </BrowserRouter>
      {/* ✅ Global Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}

export default App;
