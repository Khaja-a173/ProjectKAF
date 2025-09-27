import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  type SignupMethod = 'password' | 'magiclink' | 'otp-phone';
  const [method, setMethod] = useState<SignupMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      let res;
      switch (method) {
        case 'password':
          res = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                restaurant_name: restaurantName,
                role: "tenant_admin",
              }
            }
          });
          if (res.error?.message.includes("User already registered")) {
            setMessage("Account already exists. Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          break;
        case 'magiclink':
          res = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: true,
              data: {
                first_name: firstName,
                last_name: lastName,
                restaurant_name: restaurantName,
                role: "tenant_admin",
              },
            },
          });
          if (res.error?.message.includes("User already registered")) {
            setMessage("Account already exists. Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          setOtpSent(false);
          break;
        case 'otp-phone':
          res = await supabase.auth.signInWithOtp({
            phone,
            options: {
              shouldCreateUser: true,
              data: {
                first_name: firstName,
                last_name: lastName,
                restaurant_name: restaurantName,
                role: "tenant_admin",
              },
            },
          });
          if (res.error?.message.includes("User already registered")) {
            setMessage("Account already exists. Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          setOtpSent(true);
          let cooldown = 60;
          setResendCooldown(cooldown);
          const interval = setInterval(() => {
            cooldown -= 1;
            setResendCooldown(cooldown);
            if (cooldown <= 0) clearInterval(interval);
          }, 1000);
          break;
      }

      if (res.error) {
        setMessage(res.error.message);
      } else {
        setMessage('Check your inbox or phone for verification instructions.');
        if (method === 'password') {
          navigate('/login');
        }
      }
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    let res;
    if (method === 'magiclink' as SignupMethod) {
      // magiclink does not require OTP verification step
      setLoading(false);
      return;
    } else if (method === 'otp-phone' as SignupMethod) {
      res = await supabase.auth.verifyOtp({ type: 'sms', phone, token: otp });
    }

    if (res && res.error) {
      setMessage(res.error.message);
    } else if (res) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Branding Section */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white justify-center items-center p-10">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold">Welcome to RestaurantOS</h1>
          <p className="text-lg">Multi-tenant restaurant platform with real-time dashboards and secure access.</p>
          <ul className="list-disc list-inside text-left text-sm">
            <li>Passwordless, secure sign-in</li>
            <li>Tenant-isolated data with RLS</li>
            <li>Realtime KDS & analytics</li>
          </ul>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <img src="/logo.svg" alt="RestaurantOS Logo" className="h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center">Sign up to create your restaurant account</h2>

          <form onSubmit={handleSignup} className="bg-white shadow-md rounded-lg p-6 space-y-4">
            {/* Method Selection */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['password', 'magiclink', 'otp-phone'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMethod(m as any);
                    setOtpSent(false);
                    setMessage('');
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium border ${
                    method === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {m === 'password'
                    ? 'Email & Password'
                    : m === 'magiclink'
                    ? 'Magic Link'
                    : 'Phone OTP'}
                </button>
              ))}
            </div>

            {(method === 'password' || method === 'magiclink') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your First Name"
                    value={firstName}
                    required
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Your Last Name"
                    value={lastName}
                    required
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Restaurant or Business Name"
                    value={restaurantName}
                    required
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    required
                    pattern=".+@.+\..+"
                    title="Enter a valid email address"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
            {method === 'password' && (
              <div className="mt-2">
                <input
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            {method === 'otp-phone' && (
              <div>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  required
                  pattern="[0-9]{10,15}"
                  title="Enter a valid phone number"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                I agree to the <a href="/terms" className="underline text-indigo-600">Terms</a> and <a href="/privacy" className="underline text-indigo-600">Privacy Policy</a>.
              </label>
            </div>

            {!otpSent && (
              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                  disabled={loading || !agreed}
                >
                  {loading ? 'Processing...' : 'Create Account'}
                </button>
              </div>
            )}
          </form>

          {otpSent && (
            <div className="space-y-4 mt-4">
              <input
                type="text"
                placeholder="Enter the OTP sent to your phone"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={verifyOtp}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {otpSent && (
            <>
              <div className="text-sm text-center text-gray-600 mt-2 w-full max-w-md">
                {resendCooldown > 0 ? (
                  <p>Resend OTP in {resendCooldown}s</p>
                ) : (
                  <button
                    onClick={handleSignup}
                    className="text-indigo-600 hover:underline"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 text-center mt-4 w-full max-w-md">
                By signing up, you agree to our <a href="/terms" className="underline text-indigo-600">Terms</a> and <a href="/privacy" className="underline text-indigo-600">Privacy Policy</a>.
              </p>
            </>
          )}

          {message && <p className="text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2 text-center">{message}</p>}

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}