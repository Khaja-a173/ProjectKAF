import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useLogo } from "../contexts/BrandingContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [magicSent, setMagicSent] = useState(false);
  const { logoHeader } = useLogo();

  useEffect(() => {
    const lastUsedMethod = localStorage.getItem("authMethod");
    if (lastUsedMethod === 'password' || lastUsedMethod === 'magic' || lastUsedMethod === 'phone_otp') {
      setAuthMethod(lastUsedMethod);
    }
  }, []);

  const [authMethod, setAuthMethod] = useState<'password' | 'magic' | 'phone_otp'>('password');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  // Normalize dashboard navigation so we never end up at /login#/dashboard
  const normalizeAndGoToDashboard = () => {
    // If the current URL has any hash fragment, strip it first to avoid hash routing artifacts
    if (window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch {}
    }
    navigate('/dashboard', { replace: true });
  };

  // On first render of Login page, if a hash like #/something is present, strip it (keeps user on /login)
  useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get('next');
    if (next && next.startsWith('/')) {
      try {
        sessionStorage.setItem('kaf_next', next);
        localStorage.setItem('kaf_next', next);
      } catch {}
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (authMethod === 'password') {
        result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        normalizeAndGoToDashboard();
      } else if (authMethod === 'magic') {
        const params = new URLSearchParams(location.search);
        const next = params.get('next');
        const emailRedirectTo = next && next.startsWith('/')
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
          : `${window.location.origin}/auth/callback`;
        result = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo } });
        if (result.error) throw result.error;
        setMagicSent(true);
        toast.success("Magic link sent! Check your email.");
      } else if (authMethod === 'phone_otp') {
        result = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
        if (result.error) throw result.error;
        normalizeAndGoToDashboard();
      }
    } catch (err: any) {
      console.error("Login error:", err.message);
      toast.error(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            {logoHeader ? (
              <div className="mb-6">
                <img
                  src={logoHeader}
                  alt="Restaurant Logo"
                  className="h-16 w-auto object-contain filter brightness-0 invert"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4">RestaurantOS</h1>
            <p className="text-xl text-blue-100 mb-8">
              Complete enterprise restaurant management platform
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Multi-Tenant Architecture
                </h3>
                <p className="text-blue-100">
                  Manage multiple restaurant locations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                <p className="text-blue-100">Track performance and revenue</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Enterprise Security</h3>
                <p className="text-blue-100">
                  Bank-level security and compliance
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
            <p className="text-sm text-blue-100 mb-2">
              Trusted by 10,000+ restaurants worldwide
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white"
                  ></div>
                ))}
              </div>
              <span className="text-sm font-medium">+10,000 more</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {logoHeader ? (
              <div className="lg:hidden mb-4">
                <img
                  src={logoHeader}
                  alt="Restaurant Logo"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your RestaurantOS account
            </p>
          </div>


          <div className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col gap-2 mb-6">
              <button
                onClick={() => {
                  localStorage.setItem('authMethod', 'password');
                  setAuthMethod('password');
                }}
                className={`py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${authMethod === 'password' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <Mail className="w-5 h-5" />
                <span>Email & Password</span>
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('authMethod', 'magic');
                  setAuthMethod('magic');
                }}
                className={`py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${authMethod === 'magic' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <ArrowRight className="w-5 h-5" />
                <span>Magic Link</span>
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('authMethod', 'phone_otp');
                  setAuthMethod('phone_otp');
                }}
                className={`py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${authMethod === 'phone_otp' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <Lock className="w-5 h-5" />
                <span>Phone OTP</span>
              </button>
              {/* OAuth login button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await supabase.auth.signInWithOAuth({ provider: 'google' });
                  } catch {
                    toast.error("Google login failed.");
                  }
                }}
                className="py-2 px-4 mt-2 rounded-lg flex items-center justify-center bg-white border text-gray-800 hover:bg-gray-100"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
                Sign in with Google
              </button>
            </div>

            <div className="relative min-h-[320px] w-full flex items-center justify-center">
              {/* Container for auth method transitions and layout stability */}
              <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                className="w-full h-full transition-all duration-500 ease-in-out flex items-center"
                style={{ minHeight: 360 }}
              >
                <div className="relative w-full h-full min-h-[320px] flex items-center justify-center">
                  {/* Email & Password */}
                  <div
                    className={`absolute inset-0 transition-opacity transition-transform duration-300 ease-in-out
                      ${authMethod === 'password' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                      flex flex-col justify-center`}
                  >
                    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-center min-h-[320px]">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-2">Sign in with Email & Password</h3>
                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                            placeholder="Enter your email"
                            required
                            aria-label="Email address"
                            name="email"
                            autoFocus={authMethod === 'password'}
                            autoComplete="off"
                          />
                        </div>
                      </div>
                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                            placeholder="Enter your password"
                            required
                            aria-label="Password"
                            name="password"
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Use the eye icon to toggle password visibility
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            autoComplete="off"
                            aria-label="Remember me"
                            name="remember"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            Remember me
                          </span>
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-green-600 hover:text-green-500 font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 h-12 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            Sign in to Dashboard
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Magic Link */}
                  <div
                    className={`absolute inset-0 transition-opacity transition-transform duration-300 ease-in-out
                      ${authMethod === 'magic' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                      flex flex-col justify-center`}
                  >
                    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-center min-h-[320px]">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-2">Sign in with Magic Link</h3>
                      <p className="text-sm text-gray-500 mb-5">We will send a magic sign-in link to your email address.</p>
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                            placeholder="Enter your email"
                            required
                            aria-label="Email address"
                            name="email"
                            autoFocus={authMethod === 'magic'}
                            autoComplete="off"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                    disabled={loading || magicSent}
                    onClick={async () => {
                      if (!email) {
                        toast.error("Please enter your email.");
                        return;
                      }
                      setLoading(true);
                      try {
                        const params = new URLSearchParams(location.search);
                        const next = params.get('next');
                        const emailRedirectTo = next && next.startsWith('/')
                          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
                          : `${window.location.origin}/auth/callback`;
                        const { error } = await supabase.auth.signInWithOtp({
                          email,
                          options: {
                            shouldCreateUser: false,
                            emailRedirectTo
                          }
                        });
                        if (error) throw error;
                        setMagicSent(true);
                        toast.success("Magic link sent! Check your email.");
                      } catch (err: any) {
                        console.error("Magic link error:", err?.message || err);
                        toast.error(err?.message || "Failed to send magic link.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 h-12 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            Send Magic Link
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </button>
                  {magicSent && (
                    <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      Check your email for a login link. Open it on this device to finish signing in.
                    </p>
                  )}
                    </div>
                  </div>
                  {/* Phone OTP */}
                  <div
                    className={`absolute inset-0 transition-opacity transition-transform duration-300 ease-in-out
                      ${authMethod === 'phone_otp' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                      flex flex-col justify-center`}
                  >
                    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-center min-h-[320px]">
                      <div className="mb-5">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-2">Sign in with Phone OTP</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter your phone number and OTP to sign in.</p>
                        <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                              placeholder="Enter your phone number"
                              required
                              aria-label="Phone number"
                              name="phone"
                              autoFocus={authMethod === 'phone_otp'}
                              autoComplete="off"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!phone) {
                                toast.error("Please enter a phone number.");
                                return;
                              }
                              setLoading(true);
                              try {
                                const result = await supabase.auth.signInWithOtp({ phone });
                                if (result.error) throw result.error;
                                toast.success("OTP sent to your phone.");
                              } catch (err: any) {
                                toast.error(err.message || "Failed to send OTP.");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="w-full bg-gray-100 border border-gray-300 text-sm text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors mb-4"
                          >
                            Send OTP
                          </button>
                          <div className="mb-0">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="w-full h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                              placeholder="Enter the OTP"
                              required
                              aria-label="OTP code"
                              name="otp"
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 h-12 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            Login with Phone OTP
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-green-600 hover:text-green-500 font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-green-600 hover:text-green-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-green-600 hover:text-green-500">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
