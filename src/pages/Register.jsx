import React, { useState } from "react";
import { SfInput, SfButton, SfSelect } from "@storefront-ui/react";
import useApi from "../hooks/useApi";
import { otpAPI, userAPI } from "../api";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";

const initialFormState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  gender: "",
  country_code: "",
  mobile: "",
  otp: "",
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [errors, setErrors] = useState({});
  const [otpVerified, setOtpVerified] = useState(false);

  const { callApi, loading, error } = useApi();

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
        return value.trim() ? "" : "First name is required.";

      case "email":
        if (!value) return "Email is required.";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format.";
        return "";

      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        if (!/[A-Z]/.test(value))
          return "Must include at least one uppercase letter.";
        if (!/[a-z]/.test(value))
          return "Must include at least one lowercase letter.";
        if (!/[0-9]/.test(value)) return "Must include at least one number.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
          return "Must include at least one special character.";
        return "";

      case "confirm_password":
        if (!value) return "Please confirm your password.";
        if (value !== form.password) return "Passwords do not match.";
        return "";

      case "gender":
        return value ? "" : "Gender is required.";

      case "country_code":
        return value ? "" : "Country code is required.";

      case "mobile":
        if (!value) return "Mobile number is required.";
        if (!/^\+?\d{10,15}$/.test(value))
          return "Enter a valid mobile number.";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    if (!otpVerified) {
      toast.info("Please verify your email");
      return;
    }

    try {
      delete form.confirm_password;
      const res = await callApi(userAPI.registerUser(form));

      if (res.success) {
        toast.success("Registration Successfully");
        setForm(initialFormState);
        setErrors({});

        navigate("/login");
      }
    } catch (error) {
      console.error("User Login ", error);
      toast.error("Something went wrong");
    }
  };

  const handleSendOTP = async () => {
    try {
      if (form.email && !errors.email) {
        const res = await callApi(otpAPI.sendOTP({ email: form.email }));

        if (res.success) {
          setIsOtpSent(true);
          toast.success("OTP Sent to your email");
        }
      } else {
        toast.info("Please enter email first");
      }
    } catch (error) {
      setOtpError("Failed to send OTP. Please try again.");
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const res = await callApi(
        otpAPI.verifyOTP({ email: form.email, otp: form.otp })
      );

      if (res.success) {
        setOtpVerified(true);
        toast.success(res.message);
      }
    } catch (error) {
      console.error(error.data.message);
      toast.error(error.data.message || "Error while verifing otp");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="border border-rule bg-paper p-6 w-full max-w-lg h-[90vh] flex flex-col">
        <div className="flex flex-col items-center flex-shrink-0">
          <Link to="/" className="mb-2 font-serif italic text-3xl text-ink no-underline sm:text-4xl">
            Maati
          </Link>
          <h2 className="font-serif text-2xl text-center">Open an account</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 overflow-y-auto flex-1 space-y-6 p-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                First Name
              </label>
              <SfInput
                name="first_name"
                placeholder="First name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Last Name
              </label>
              <SfInput
                name="last_name"
                placeholder="Last name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">Email</label>
              <div className="relative">
                <SfInput
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full"
                />
                <SfButton
                  type="button"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-primary-500"
                  onClick={handleSendOTP}
                >
                  {isOtpSent ? "Resend OTP" : "Send OTP"}
                </SfButton>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* OTP Input (conditionally displayed) */}
            {isOtpSent && (
              <div className="md:col-span-2 relative">
                <label className="block mb-1 text-sm font-medium">
                  Enter OTP
                </label>
                <SfInput
                  name="otp"
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full"
                />
                {otpError && (
                  <p className="text-red-500 text-sm mt-1">{otpError}</p>
                )}

                <SfButton
                  type="button"
                  className="absolute right-0 top-[70%] transform -translate-y-1/2 bg-primary-500"
                  onClick={handleVerifyEmail}
                  disabled={otpVerified}
                >
                  {otpVerified ? "Verified" : "Verify"}
                </SfButton>
              </div>
            )}

            {/* Password */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">Password</label>
              <SfInput
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">
                Confirm Password
              </label>
              <SfInput
                name="confirm_password"
                type="password"
                placeholder="Re-enter password"
                value={form.confirm_password}
                onChange={handleChange}
                className="w-full"
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 text-sm font-medium">Gender</label>
              <SfSelect
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </SfSelect>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* Country Code */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Country Code
              </label>
              <SfSelect
                name="country_code"
                value={form.country_code}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">Select country code</option>
                <option value="+91">+91</option>
                <option value="+61">+61</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </SfSelect>
              {errors.country_code && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country_code}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">Mobile</label>
              <SfInput
                name="mobile"
                placeholder="Enter mobile number"
                value={form.mobile}
                onChange={handleChange}
                className="w-full"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>
          </div>

          <SfButton
            type="submit"
            className="w-full bg-primary-700 hover:bg-primary-800 text-white"
          >
            {loading ? "Creating..." : "Create Account"}
          </SfButton>
        </form>
      </div>
    </div>
  );
};

export default React.memo(Register);
