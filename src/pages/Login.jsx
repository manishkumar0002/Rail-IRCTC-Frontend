import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Loader from '../components/Loader';
import { API_BASE_URL } from '../config/api';
import trainBgImage from '../assets/train-hero.jpg'; // Vite asset

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await register(formData.name, formData.email, formData.password);
        setIsLogin(true);
        setError('');
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Visual Panel & Stats */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center flex-col justify-between p-12 text-white"
        style={{
          backgroundImage: `url(${trainBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/70 z-0"></div>
        
        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-md">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wider uppercase">IRCTC</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest -mt-0.5">Indian Railway Reservation</p>
          </div>
        </div>

        {/* Bottom Metrics Section */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-2xl font-bold leading-snug max-w-md text-slate-100">
            Book your train tickets with ease and comfort. Secure, fast, and optimal booking solutions.
          </h1>
          <div className="flex gap-8 border-t border-white/20 pt-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">System Uptime</p>
              <p className="text-xl font-bold text-slate-100 mt-1">99.98%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Daily Bookings</p>
              <p className="text-xl font-bold text-slate-100 mt-1">14,204</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white relative">
        <div className="max-w-md w-full space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {isLogin ? "Login to Account" : "Create Account"}
            </h2>
            <p className="text-sm text-slate-500">
              {isLogin 
                ? "Welcome back! Please enter your details to access your booking dashboard." 
                : "Register with your details below to setup your IRCTC travel profile."}
            </p>
          </div>

          {/* Login/Signup Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => alert("Please check your email to reset password or contact support.")} 
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-xs font-medium text-slate-500 select-none">
                  Remember this device for 30 days
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : isLogin ? "Login to Account" : "Create Account"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              {isLogin && (
                <>
                  <div className="flex items-center gap-4 my-2">
                    <span className="h-px w-full bg-slate-200"></span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">Or continue with</span>
                    <span className="h-px w-full bg-slate-200"></span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2.5 w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300 text-sm"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Bottom toggle link */}
          <div className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
            <span>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-blue-600 hover:underline"
            >
              {isLogin ? "Create one" : "Login here"}
            </button>
          </div>

          {/* Encryption indicator */}
          <div className="flex justify-center items-center gap-1.5 py-1.5 px-3 bg-slate-100 rounded-full w-fit mx-auto">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Security Verified: AES-256 Encrypted</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
