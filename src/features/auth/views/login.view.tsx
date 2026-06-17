import { motion } from "motion/react";
import { Link, useSearch } from "@tanstack/react-router";
import { LoginForm } from "../components/login-form";
import { RegisterForm } from "../components/register-form";
import { ForgotPasswordForm } from "../components/forgot-password-form";
import { ResetPasswordForm } from "../components/reset-password-form";

export function LoginView() {
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const mode = search.mode || "login";
  const token = search.token || "";

  // Title and subtext mapping based on auth mode
  let title = "Sign in to your account";
  let subtextText = "New here?";
  let subtextLink = "Create an account";
  let subtextMode: "login" | "register" | "forgot-password" | "reset-password" = "register";

  if (mode === "register") {
    title = "Create an account";
    subtextText = "Already have an account?";
    subtextLink = "Sign in instead";
    subtextMode = "login";
  } else if (mode === "forgot-password") {
    title = "Reset your password";
    subtextText = "Remember your password?";
    subtextLink = "Sign in instead";
    subtextMode = "login";
  } else if (mode === "reset-password") {
    title = "Set new password";
    subtextText = "Remember your password?";
    subtextLink = "Sign in instead";
    subtextMode = "login";
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50/50 px-4 py-12 select-none">
      {/* Main Split-Screen Container Card */}
      <div className="w-full max-w-[1000px] min-h-[600px] grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        
        {/* Left Panel - Forms & Brand Header */}
        <div className="col-span-12 md:col-span-7 p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* Branding Header */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-white text-sm select-none">
                B
              </div>
              <span className="font-semibold text-zinc-900 text-sm tracking-tight">Budgeting</span>
            </div>

            {/* Inner Content with Animation */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-12 space-y-6"
            >
              <div className="space-y-1.5 text-left">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                  {title}
                </h1>
                <p className="text-sm text-zinc-500">
                  {subtextText}{" "}
                  <Link
                    to="/"
                    search={{ mode: subtextMode }}
                    className="text-zinc-900 font-medium underline underline-offset-4 hover:opacity-85 transition-opacity"
                  >
                    {subtextLink}
                  </Link>
                </p>
              </div>

              {mode === "login" && <LoginForm />}
              {mode === "register" && <RegisterForm />}
              {mode === "forgot-password" && <ForgotPasswordForm />}
              {mode === "reset-password" && (
                token ? (
                  <ResetPasswordForm token={token} />
                ) : (
                  <div className="text-center py-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <p className="text-sm text-destructive font-medium mb-3">
                      Reset token is invalid or missing in the URL.
                    </p>
                    <Link
                      to="/"
                      search={{ mode: "login" }}
                      className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80"
                    >
                      Back to sign in
                    </Link>
                  </div>
                )
              )}
            </motion.div>
          </div>

          {/* Footer Copyright */}
          <div className="text-xs text-zinc-400 text-left mt-8 pt-4 border-t border-zinc-100">
            © {new Date().getFullYear()} Budgeting. Clean & secure financial portal.
          </div>
        </div>

        {/* Right Panel - Custom Geometric Line-Art SVG */}
        <div className="hidden md:flex col-span-5 bg-zinc-50/50 border-l border-zinc-100 items-center justify-center p-12 relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#e4e4e7 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
          
          {/* Main SVG graphic */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="max-w-[320px] max-h-[320px] z-10"
          >
            {/* Decorative overlapping circles */}
            <circle cx="200" cy="180" r="100" stroke="#e4e4e7" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="200" cy="180" r="80" stroke="#d4d4d8" strokeWidth="1.5" />
            <circle cx="230" cy="210" r="60" stroke="#a1a1aa" strokeWidth="1" />
            <circle cx="160" cy="150" r="40" stroke="#e4e4e7" strokeWidth="1" />

            {/* Diagonal and polygon geometric shapes */}
            <path
              d="M 100 180 L 300 180 M 200 80 L 200 280"
              stroke="#e4e4e7"
              strokeWidth="1"
            />
            <path
              d="M 120 100 L 280 260 M 120 260 L 280 100"
              stroke="#e4e4e7"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <polygon
              points="200,100 280,220 120,220"
              stroke="#a1a1aa"
              strokeWidth="1.5"
              fill="none"
            />

            {/* A few dots for visual accent */}
            <circle cx="200" cy="180" r="5" fill="#27272a" />
            <circle cx="280" cy="220" r="3" fill="#71717a" />
            <circle cx="120" cy="220" r="3" fill="#71717a" />
            <circle cx="200" cy="100" r="3" fill="#71717a" />
            <circle cx="230" cy="150" r="4" fill="#a1a1aa" />
            
            {/* Four squares at the bottom */}
            <rect x="130" y="320" width="18" height="18" rx="4" stroke="#a1a1aa" strokeWidth="1.5" fill="none" />
            <rect x="170" y="320" width="18" height="18" rx="4" stroke="#d4d4d8" strokeWidth="1.5" fill="#f4f4f5" />
            <rect x="210" y="320" width="18" height="18" rx="4" stroke="#a1a1aa" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
            <rect x="250" y="320" width="18" height="18" rx="4" stroke="#27272a" strokeWidth="1.5" fill="#27272a" />
          </svg>
        </div>

      </div>
    </div>
  );
}

export default LoginView;
