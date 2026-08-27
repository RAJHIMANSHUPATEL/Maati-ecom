import React, { useState } from "react";
import { SfButton, SfInput, SfLoaderCircular } from "@storefront-ui/react";
import { Link, useNavigate } from "react-router";
import useApi from "../hooks/useApi";
import { otpAPI, userAPI } from "../api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { callApi, loading } = useApi();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await callApi(otpAPI.sendOTP({ email, purpose: "reset" }));
      if (res.success) {
        toast.success("OTP sent to your email");
        setStep(2);
      } else {
        toast.error(res.message || "Unable to send OTP");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Unable to send OTP");
    }
  };

  const verifyAndReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const verify = await callApi(otpAPI.verifyOTP({ email, otp }));
      if (!verify.success) {
        toast.error(verify.message || "Invalid OTP");
        return;
      }
      const res = await callApi(
        userAPI.resetPassword({ email, Otp: otp, newPassword })
      );
      if (res.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        toast.error(res.message || "Reset failed");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-6 gap-6">
      <Link to="/" className="font-serif italic text-3xl text-ink no-underline sm:text-4xl">
        Maati
      </Link>
      <form
        onSubmit={step === 1 ? sendOtp : verifyAndReset}
        className="border border-rule bg-paper p-6 w-full max-w-sm space-y-6"
      >
        <h2 className="font-serif text-2xl">Forgot password</h2>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <SfInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {step === 2 && (
          <>
            <div>
              <label className="block mb-1 text-sm font-medium">OTP</label>
              <SfInput value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">New password</label>
              <SfInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Confirm password</label>
              <SfInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <SfButton type="submit" className="w-full bg-primary-700 text-white">
          {loading ? (
            <SfLoaderCircular className="!ring-yellow-200" />
          ) : step === 1 ? (
            "Send OTP"
          ) : (
            "Reset password"
          )}
        </SfButton>
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary-700 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
