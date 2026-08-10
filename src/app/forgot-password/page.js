"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";

const OTP_LENGTH = 4;

export default function ForgotPasswordPage() {
  const router = useRouter();

  // State management
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP
  const [mobile, setMobile] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const otpRefs = useRef([]);
  const otp = otpDigits.join("");

  // Auto-focus the first OTP box whenever the OTP step becomes active
  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  // --- OTP box handlers ---
  const handleOtpChange = (index, value) => {
    // only allow a single digit
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        // clear current box
        const next = [...otpDigits];
        next[index] = "";
        setOtpDigits(next);
      } else if (index > 0) {
        // move to previous box and clear it
        otpRefs.current[index - 1]?.focus();
        const next = [...otpDigits];
        next[index - 1] = "";
        setOtpDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  // STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/change-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to request OTP");
      }

      setMessage(data.message);
      setStep(2); // Move to OTP entry screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Set New Password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/change-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setMessage("Password reset successful! Redirecting to login...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-light p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Reset Password
        </h2>

        {/* Display Success or Error Messages */}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* --- STEP 1 FORM --- */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-md font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-2xl border border-dark/10 bg-light/50 px-4 py-3.5 text-dark transition-all placeholder:text-gray-400 focus:border-taupe-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-taupe-500/10"
                placeholder="Enter your registered mobile number"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-[#061E29] px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-[#0a2a3a] hover:shadow-lg hover:shadow-[#061E29]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <p className="mt-3 text-center text-sm text-gray-500">
              The OTP will be sent to your registered email address.
            </p>
          </form>
        )}

        {/* --- STEP 2 FORM --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                6-Digit OTP Code
              </label>
              <div
                className="flex items-center justify-between gap-2"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="h-14 w-12 rounded-xl border border-dark/10 bg-light/50 text-center text-xl font-semibold text-dark transition-all focus:border-taupe-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-taupe-500/10"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                required
                minLength="6"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-dark/10 bg-light/50 px-4 py-3.5 text-dark transition-all placeholder:text-gray-400 focus:border-taupe-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-taupe-500/10"
                placeholder="Minimum 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== OTP_LENGTH}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-[#061E29] px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-[#0a2a3a] hover:shadow-lg hover:shadow-[#061E29]/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify & Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-blue-600 hover:underline mt-2"
            >
              Didn&apos;t receive code? Try again
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-medium text-blue-600 hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}