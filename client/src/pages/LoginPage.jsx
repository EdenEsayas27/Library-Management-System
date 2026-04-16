import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  // Test credentials for demo
  const TEST_CREDENTIALS = {
    email: "admin@library.com",
    password: "Admin@12345",
  };

  const fillTestCredentials = () => {
    setForm({ email: TEST_CREDENTIALS.email, password: TEST_CREDENTIALS.password });
    setShowTestCredentials(false);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await auth.login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
      </div>

      {/* Floating Mini Decorations */}
      <div className="absolute top-5 left-5 hidden animate-float text-3xl opacity-20 lg:block">📚</div>
      <div className="absolute bottom-5 right-5 hidden animate-float-delayed text-4xl opacity-20 lg:block">📖</div>

      <div className="relative flex min-h-screen items-center justify-center p-3">
        <div className="w-full max-w-md">
          {/* Compact Library Brand Header */}
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-xl font-bold text-white">Library Management System</h1>
            <p className="mt-0.5 text-xs text-amber-100/70">Sign in to your account</p>
          </div>

          {/* Login Card - Compact */}
          <form
            className="group relative rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl"
            onSubmit={handleSubmit}
          >
            <div className="absolute inset-x-0 -top-px mx-auto h-px w-2/3 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

            <div className="p-5">
              {/* Test Credentials Banner - Compact */}
              <div className="mb-4 rounded-lg bg-amber-500/20 p-2 backdrop-blur-sm">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-300 text-xs">🔐</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-amber-200">Demo Access</p>
                      <button
                        type="button"
                        onClick={() => setShowTestCredentials(!showTestCredentials)}
                        className="text-xs text-amber-300 underline hover:text-amber-200 transition"
                      >
                        {showTestCredentials ? "Hide" : "Show"}
                      </button>
                    </div>
                    {showTestCredentials && (
                      <div className="mt-1.5 space-y-1 rounded-md bg-white/10 p-1.5 text-[11px] font-mono">
                        <p className="text-amber-100">
                          <span className="text-amber-300">📧</span> {TEST_CREDENTIALS.email}
                        </p>
                        <p className="text-amber-100">
                          <span className="text-amber-300">🔑</span> {TEST_CREDENTIALS.password}
                        </p>
                        <button
                          type="button"
                          onClick={fillTestCredentials}
                          className="mt-1 w-full rounded-md bg-amber-500/30 py-1 text-[11px] font-medium text-white hover:bg-amber-500/50 transition"
                        >
                          ⚡ Auto-fill
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Field - Compact */}
              <div className="mb-3 space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <span>📧</span> Email
                </label>
                <input
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  required
                  type="email"
                  placeholder="admin@library.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              {/* Password Field - Compact */}
              <div className="mb-3 space-y-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <span>🔒</span> Password
                </label>
                <input
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
                  required
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              {/* Error Message - Compact */}
              {error && (
                <div className="mb-3 rounded-lg bg-rose-500/20 p-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-rose-200">
                    <span>⚠️</span> {error}
                  </p>
                </div>
              )}

              {/* Submit Button - Compact */}
              <button
                className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:shadow-md hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    📖 Sign In
                  </span>
                )}
              </button>

              {/* Footer */}
              <div className="mt-3 text-center">
                <p className="text-[10px] text-white/30">Secure access for authorized staff only</p>
              </div>
            </div>
          </form>

          {/* Footer Note - Compact */}
          <p className="mt-3 text-center text-[10px] text-white/25">
            © 2024 Library System
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;