import React, { useState } from "react";
import { SfButton, SfInput, SfLoaderCircular } from "@storefront-ui/react";
import { Link, useNavigate, useLocation } from "react-router";
import useApi from "../hooks/useApi";
import { userAPI } from "../api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";


const initialFormState = { email: "", password: "" };

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const location = useLocation();

  const { callApi, loading } = useApi();

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required.";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const isFormValid = () => {
    const newErrors = {};
    Object.entries(form).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      const loginResp = await callApi(userAPI.loginUser(form));

      // if (loginResp.success) {
      //   toast.success("Login Successfully");

      //   // 1) Save token + user in AuthContext
      //   login(loginResp.data, loginResp.authToken);

      //   // 2) CartContext's useEffect([user]) will now run,
      //   //    fetch / merge / sync the cart automatically.

      //   setForm(initialFormState);
      //   setErrors({});
      //   navigate("/");
      // }

      if (loginResp.success) {
  toast.success("Login Successfully");

  // Save auth token (in case AuthContext doesn't)
  if (loginResp.authToken) {
    localStorage.setItem("authToken", loginResp.authToken);
  }

  // Update AuthContext
  login(loginResp.data, loginResp.authToken);

  // Reset form
  setForm(initialFormState);
  setErrors({});

  // ---- RESUME LOGIC (IMPORTANT) ----
  // Cart page redirected user with: navigate("/login", { state: { from: "/cart", resumeStep: 1 } })
  const from = (location.state && location.state.from) || "/";
  const resumeStep = (location.state && location.state.resumeStep) ?? null;

  if (from) {
    if (resumeStep !== null) {
      navigate(from, { state: { resumeStep }, replace: true });
    } else {
      navigate(from, { replace: true });
    }
  } else {
    navigate("/", { replace: true });
  }
}

    } catch (error) {
      console.error("User Login ", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6">
      <Link to="/" className="mb-8 font-serif italic text-3xl text-ink no-underline sm:text-4xl">
        Maati
      </Link>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-6 border border-rule bg-paper p-6"
      >
        <h2 className="font-serif text-2xl">Sign in</h2>

        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <SfInput
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="w-full"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <SfInput
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className="w-full"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <SfButton
          type="submit"
          className="w-full bg-primary-700 hover:bg-primary-800 text-white"
        >
          {loading ? (
            <SfLoaderCircular className="!ring-yellow-200" />
          ) : (
            "Login"
          )}
        </SfButton>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-primary-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-primary-700 hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default React.memo(Login);
