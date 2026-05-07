"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

/* ─── Icons ───────────────────────────────────────────────── */
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

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-[#1a3a5c]"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-[#1a3a5c]"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ─── Main component ──────────────────────────────────────── */
export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fallback client-side redirect khi middleware không đọc được cookie kịp thời
  // (Clerk dev mode: __session cookie cần JS client refresh trước)
  useEffect(() => {
    if (isSignedIn) {
      const redirectUrl = searchParams.get("redirect_url");
      // Chỉ dùng redirect_url nếu là relative path (bảo mật)
      const dest =
        redirectUrl && redirectUrl.startsWith("/")
          ? redirectUrl
          : "/grammar-theory";
      router.replace(dest);
    }
  }, [isSignedIn, router, searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /* ── Google OAuth ──────────────────────────────────────── */
  const handleGoogleOAuth = useCallback(async () => {
    if (!isLoaded) return;
    // Guard: nếu đã login thì redirect thay vì gọi lại OAuth (tránh lỗi "already signed in")
    if (isSignedIn) {
      router.push("/grammar-theory");
      return;
    }
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/grammar-theory",
    });
  }, [isLoaded, isSignedIn, signIn, router]);

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/grammar-theory");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code: string; message: string }[] };
      if (clerkErr?.errors) {
        const newErrs: Record<string, string> = {};
        clerkErr.errors.forEach((e) => {
          if (
            e.code === "form_password_incorrect" ||
            e.code.includes("password")
          ) {
            newErrs.password = "Incorrect password, please try again.";
          } else if (
            e.code === "form_identifier_not_found" ||
            e.code.includes("identifier")
          ) {
            newErrs.email = "No account found with this email.";
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

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-y-auto py-10 px-4"
      style={{ background: "#eef0f3" }}
    >
      {/* Logo header */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl shadow-md"
          style={{
            background: "linear-gradient(135deg, #1a3a5c 0%, #22527d 100%)",
          }}
        >
          <span className="text-white text-2xl">📖</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          The Scholarly Perspective
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Empowering your academic path with expert insights.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          Welcome back 👋
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Let&apos;s continue your IELTS journey.
        </p>

        {/* Progress widget */}
        <div className="mb-6 flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
          {/* Circle progress */}
          <div className="relative flex-shrink-0 w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="#1a3a5c"
                strokeWidth="3"
                strokeDasharray="40 60"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1a3a5c]">
              40%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-0.5">
              Keep up the momentum!
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              You&apos;re 40% through your Grammar module. Ready to hit 50%
              today?
            </p>
          </div>
        </div>

        {/* General error */}
        {errors.general && (
          <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <span>⊘</span>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleOAuth}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 font-medium text-sm shadow-sm mb-5"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-slate-400 text-xs uppercase tracking-widest">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                id="signin-email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-3 pl-10 pr-4 rounded-2xl border text-slate-800 text-sm placeholder-slate-300 outline-none focus:ring-2 transition-all
                  ${
                    errors.email
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c]"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⊘</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <a
                href="#"
                className="hidden text-xs text-[#1a3a5c] font-semibold hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="signin-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-3 pl-10 pr-12 rounded-2xl border text-slate-800 text-sm placeholder-slate-300 outline-none focus:ring-2 transition-all
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
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⊘</span> {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm tracking-wide transition-all duration-200 mt-2
              disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #1a3a5c 0%, #22527d 100%)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      {/* Sign up prompt */}
      <p className="mt-6 text-sm text-slate-500">
        New to the platform?{" "}
        <Link
          href="/sign-up"
          className="text-[#1a3a5c] font-bold hover:underline"
        >
          Start for free
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-8 flex items-start gap-8 text-center">
        <div className="flex flex-col items-center gap-1 max-w-[130px]">
          <ShieldIcon />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Secure Access
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            We protect your study data with military-grade encryption.
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 max-w-[130px]">
          <CheckCircleIcon />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            IELTS Verified
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aligned with the latest British Council academic standards.
          </p>
        </div>
      </div>
    </div>
  );
}
