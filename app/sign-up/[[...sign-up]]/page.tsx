"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";

/* ─── Password strength helper ───────────────────────────── */
function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
  bg: string;
} {
  if (!pw) return { score: 0, label: "", color: "", bg: "bg-gray-200" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1)
    return { score, label: "WEAK", color: "text-red-500", bg: "bg-red-400" };
  if (score <= 3)
    return {
      score,
      label: "MEDIUM",
      color: "text-amber-500",
      bg: "bg-amber-400",
    };
  return {
    score,
    label: "STRONG",
    color: "text-emerald-600",
    bg: "bg-emerald-500",
  };
}

/* ─── Eye / EyeOff icons ──────────────────────────────────── */
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ─── Google color icon ───────────────────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

/* ─── Main component ──────────────────────────────────────── */
export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP step
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Error & loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const strength = getPasswordStrength(password);

  /* ── Google OAuth ──────────────────────────────────────── */
  const handleGoogleOAuth = useCallback(async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/grammar-theory",
      });
    } catch (err) {
      console.error("Google OAuth error:", err);
    }
  }, [isLoaded, signUp]);

  /* ── Submit step 1 ─────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) {
      return;
    }

    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (!agreed) errs.terms = "You must agree to the Terms and Privacy Policy.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const [firstName, ...rest] = fullName.trim().split(" ");
      const lastName = rest.join(" ");

      await signUp.create({
        firstName,
        lastName: lastName || undefined,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("otp");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code: string; message: string }[] };
      if (clerkErr?.errors) {
        const newErrs: Record<string, string> = {};
        clerkErr.errors.forEach((e) => {
          if (e.code.includes("email") || e.code === "form_identifier_exists") {
            newErrs.email =
              e.code === "form_identifier_exists"
                ? "Email already exists."
                : e.message;
          } else if (e.code.includes("password")) {
            newErrs.password = e.message;
          } else {
            newErrs.general = e.message;
          }
        });
        setErrors(newErrs);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input handler ─────────────────────────────────── */
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  /* ── Verify OTP ────────────────────────────────────────── */
  const handleVerifyOtp = async () => {
    if (!isLoaded) return;
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/grammar-theory");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setOtpError(
        clerkErr?.errors?.[0]?.message ?? "Invalid code. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Resend code ───────────────────────────────────────── */
  const handleResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setOtpError("");
      setOtp(["", "", "", "", "", ""]);
    } catch {
      setOtpError("Could not resend code. Please try again.");
    }
  };

  /* ─── Render ───────────────────────────────────────────── */

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10 text-[#1a3a5c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT: Navy branding panel ── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a3a5c 0%, #0f2540 100%)",
        }}
      >
        {/* Background decorative circles */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #4a90d9 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-40 -left-16 w-60 h-60 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #4a90d9 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <span className="text-2xl">📖</span>
          <span className="text-white font-bold text-lg tracking-tight">
            The Scholarly Perspective
          </span>
        </div>

        {/* Hero text */}
        <div className="z-10">
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Master the IELTS
            <br />
            with Academic
            <br />
            Precision.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Band 7 is achievable. Band 8 is a habit.
            <br />
            Start building yours today.
          </p>
        </div>

        {/* Testimonial card */}
        <div
          className="z-10 rounded-2xl p-5 border border-white/10"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p className="text-blue-100 text-sm italic leading-relaxed mb-4">
            &ldquo;The platform&apos;s focus on cognitive clarity changed how I
            approached the writing section entirely.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center font-bold text-slate-900 text-sm">
              ER
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Elena Rodriguez
              </p>
              <p className="text-blue-300 text-xs">IELTS Band 8.5 Achiever</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="flex-1 bg-white overflow-y-auto flex flex-col">
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-8 py-12">
          {step === "form" ? (
            <>
              {/* Step indicator */}
              <div className="mb-6">
                <span className="inline-block bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
                  Step 1 of 2
                </span>
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-1">
                Create your account
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Start improving your IELTS score today.
              </p>

              {/* General error */}
              {errors.general && (
                <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <span>⚠</span>
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Google OAuth */}
              <button
                onClick={handleGoogleOAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 font-medium text-sm shadow-sm mb-6"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-slate-400 text-xs">
                    or sign up with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="signup-fullname"
                      placeholder="Arthur Quiller-Couch"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full py-3 pl-4 pr-10 rounded-xl border text-slate-800 text-sm placeholder-slate-300 outline-none focus:ring-2 transition-all
                        ${
                          errors.fullName
                            ? "border-red-400 focus:ring-red-200"
                            : "border-slate-200 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c]"
                        }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">
                      👤
                    </span>
                  </div>
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⊘</span> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="signup-email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full py-3 pl-4 pr-10 rounded-xl border text-slate-800 text-sm placeholder-slate-300 outline-none focus:ring-2 transition-all
                        ${
                          errors.email
                            ? "border-red-400 focus:ring-red-200"
                            : "border-slate-200 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c]"
                        }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-xl">
                      @
                    </span>
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⊘</span>{" "}
                      {errors.email === "Email already exists." ? (
                        <>
                          Email already exists.{" "}
                          <Link
                            href="/sign-in"
                            className="underline font-semibold text-[#1a3a5c] ml-0.5"
                          >
                            Sign in?
                          </Link>
                        </>
                      ) : (
                        errors.email
                      )}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full py-3 pl-4 pr-10 rounded-xl border text-slate-800 text-sm placeholder-slate-300 outline-none focus:ring-2 transition-all
                        ${
                          errors.password
                            ? "border-red-400 focus:ring-red-200"
                            : "border-slate-200 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c]"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.bg : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>
                          Strength:{" "}
                          <span className={`font-bold ${strength.color}`}>
                            {strength.label}
                          </span>
                        </span>
                        <span className="text-slate-400">Min. 8 chars</span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <span>⊘</span> {errors.password}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="signup-terms"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#1a3a5c]"
                    />
                    <span className="text-xs text-slate-500 leading-relaxed">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-[#1a3a5c] font-semibold hover:underline"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-[#1a3a5c] font-semibold hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #1a3a5c 0%, #22527d 100%)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#1a3a5c] font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* ── OTP Verification Step ── */
            <>
              <div className="mb-6">
                <span className="inline-block bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
                  Step 2 of 2
                </span>
              </div>

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, #1a3a5c20 0%, #1a3a5c10 100%)",
                  border: "1.5px solid #1a3a5c20",
                }}
              >
                ✉️
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-1">
                Check your email
              </h2>
              <p className="text-slate-500 text-sm mb-2">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>
              <p className="text-slate-400 text-xs mb-8">
                Check your spam folder if you don&apos;t see it.
              </p>

              {/* OTP input boxes */}
              <div className="flex gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold text-slate-800 outline-none
                      transition-all duration-150 focus:scale-105
                      ${
                        otpError
                          ? "border-red-400 bg-red-50"
                          : digit
                            ? "border-[#1a3a5c] bg-[#1a3a5c08]"
                            : "border-slate-200 bg-white focus:border-[#1a3a5c]"
                      }`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <span>⊘</span>
                  <span>{otpError}</span>
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.join("").length < 6}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 mb-4
                  disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #1a3a5c 0%, #22527d 100%)",
                }}
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    Verifying…
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={handleResend}
                  className="text-[#1a3a5c] font-bold hover:underline"
                >
                  Resend code
                </button>
              </p>

              <button
                onClick={() => {
                  setStep("form");
                  setErrors({});
                }}
                className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to edit email
              </button>
            </>
          )}
        </div>
      </div>

      {/* Need Help button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:shadow-xl transition-shadow">
          <span className="text-base">❓</span>
          Need Help?
        </button>
      </div>
    </div>
  );
}
