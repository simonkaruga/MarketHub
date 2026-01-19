import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorMessage from '../../components/common/ErrorMessage';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center">
            <img src="/hub2.png" alt="MarketHub Logo" className="h-28 w-28 object-contain mb-3" />
            <span className="text-3xl font-bold text-orange-400">MarketHub</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">
            Sign in to your account
          </h2>
        </div>

        {/* Form */}
        <div className="bg-slate-800 py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} />}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={<FiMail size={20} />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                icon={<FiLock size={20} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-orange-400 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton onSuccess={handleGoogleSuccess} />

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
