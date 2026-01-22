import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [cardTransform, setCardTransform] = useState({ x: 0, y: 0 });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setCardTransform({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setCardTransform({ x: 0, y: 0 });
  };

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
  window.location.href =
    "http://localhost:8080/oauth2/authorization/google";
};

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="bg-train train-1">🚂</div>
        <div className="bg-train train-2">🚃</div>
        <div className="bg-train train-3">🚃</div>
      </div>

      <div className="login-container animate-fadeIn">
        <div className="login-header">
          <div className="logo-wrapper">
            <Train className="logo-icon" />
          </div>
          <h1 className="logo-text">IRCTC</h1>
          <p className="tagline">Indian Railway Reservation</p>
        </div>

        <Card 
          className="login-card glass-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${cardTransform.y}deg) rotateY(${cardTransform.x}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Animated Train on Card */}
          <div className="card-train-animation">
            <div className="running-train">🚂</div>
          </div>

          <CardHeader>
            <div className="tab-switch">
              <button
                className={`tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="error-banner animate-scaleIn">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">{!isLogin && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field with-icon"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field with-icon"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field with-icon"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : isLogin ? (
                'Login to Account'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button className="btn btn-google google-btn" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20">
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
          </CardContent>
        </Card>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          position: relative;
          overflow: hidden;
          padding: 2rem;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .bg-train {
          position: absolute;
          font-size: 3rem;
          opacity: 0.15;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }

        .train-1 {
          bottom: 20%;
          left: -5%;
          animation: moveTrain 15s linear infinite;
        }

        .train-2 {
          bottom: 20%;
          left: -10%;
          animation: moveTrain 15s linear infinite 0.5s;
        }

        .train-3 {
          bottom: 20%;
          left: -15%;
          animation: moveTrain 15s linear infinite 1s;
        }

        @keyframes moveTrain {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(120vw);
          }
        }

        .login-container {
          width: 100%;
          max-width: 440px;
          z-index: 1;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInDown 0.8s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(102, 126, 234, 0.5),
            inset 0 0 20px rgba(255, 255, 255, 0.8);
          animation: float 3s ease-in-out infinite;
          position: relative;
        }

        .logo-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
          border-radius: 22px;
          z-index: -1;
          opacity: 0.7;
          filter: blur(10px);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          color: hsl(var(--primary));
          filter: drop-shadow(0 2px 8px rgba(102, 126, 234, 0.5));
        }

        .logo-text {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0ff 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        .tagline {
          color: rgba(255, 255, 255, 0.95);
          font-size: 1rem;
          margin-top: 0.5rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .login-card {
          padding: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.3),
            0 0 60px rgba(102, 126, 234, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          animation: cardEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: scale(0.8) rotateY(20deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }

        .login-card:hover::before {
          left: 100%;
        }

        .login-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(102, 126, 234, 0.1) 0%,
            transparent 70%
          );
          animation: rotateGlow 10s linear infinite;
          pointer-events: none;
        }

        @keyframes rotateGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-card > * {
          position: relative;
          z-index: 1;
        }

        .card-train-animation {
          position: absolute;
          top: -20px;
          left: 0;
          width: 100%;
          height: 40px;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }

        .running-train {
          position: absolute;
          top: 0;
          font-size: 2rem;
          animation: trainRun 8s linear infinite;
          filter: drop-shadow(0 4px 8px rgba(245, 124, 0, 0.6));
        }

        @keyframes trainRun {
          0% {
            left: -60px;
          }
          100% {
            left: calc(100% + 60px);
          }
        }

        .login-card [class*="CardHeader"] {
          padding: 2rem 2rem 1rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }

        .login-card [class*="CardContent"] {
          padding: 2rem;
        }

        .tab-switch {
          display: flex;
          gap: 0.5rem;
          background: rgba(102, 126, 234, 0.1);
          padding: 0.375rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(102, 126, 234, 0.2);
          box-shadow: 
            0 4px 15px rgba(102, 126, 234, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .tab-btn {
          flex: 1;
          padding: 0.875rem;
          border: none;
          background: transparent;
          color: hsl(var(--muted-foreground));
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }

        .tab-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tab-btn.active {
          background: white;
          color: hsl(var(--primary));
          box-shadow: 
            0 8px 25px rgba(102, 126, 234, 0.25),
            0 0 20px rgba(102, 126, 234, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          transform: scale(1.05) translateY(-2px);
        }

        .tab-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.02);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, hsla(var(--destructive), 0.15), hsla(var(--destructive), 0.05));
          border: 2px solid hsla(var(--destructive), 0.4);
          border-radius: 12px;
          color: hsl(var(--destructive));
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          box-shadow: 0 4px 15px hsla(var(--destructive), 0.2);
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          animation: slideInUp 0.5s ease-out backwards;
        }

        .input-group:nth-child(1) { animation-delay: 0.1s; }
        .input-group:nth-child(2) { animation-delay: 0.2s; }
        .input-group:nth-child(3) { animation-delay: 0.3s; }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: hsl(var(--foreground));
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: hsl(var(--primary));
          pointer-events: none;
          transition: all 0.3s ease;
          z-index: 1;
        }

        .input-field {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          box-shadow: 
            inset 0 2px 5px rgba(0, 0, 0, 0.05),
            0 0 0 rgba(102, 126, 234, 0);
        }

        .input-field.with-icon {
          padding-left: 3rem;
        }

        .input-field:focus {
          outline: none;
          border-color: hsl(var(--primary));
          background: white;
          box-shadow: 
            inset 0 2px 5px rgba(0, 0, 0, 0.05),
            0 0 0 3px rgba(102, 126, 234, 0.1),
            0 8px 25px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .input-field:focus + .input-icon,
        .input-wrapper:focus-within .input-icon {
          color: hsl(var(--primary));
          transform: scale(1.1);
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1;
          border-radius: 8px;
        }

        .password-toggle:hover {
          color: hsl(var(--primary));
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.1);
        }

        .submit-btn {
          margin-top: 0.5rem;
          padding: 1rem;
          font-size: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 
            0 8px 25px rgba(102, 126, 234, 0.4),
            0 0 20px rgba(102, 126, 234, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .submit-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 12px 35px rgba(102, 126, 234, 0.5),
            0 0 30px rgba(102, 126, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(1);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: hsl(var(--muted-foreground));
          font-size: 0.9rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(102, 126, 234, 0.3),
            transparent
          );
        }

        .google-btn {
          width: 100%;
          padding: 0.875rem;
          font-size: 0.95rem;
          background: white;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          color: hsl(var(--foreground));
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .google-btn:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: hsl(var(--primary));
          box-shadow: 
            0 8px 25px rgba(102, 126, 234, 0.25),
            0 0 20px rgba(102, 126, 234, 0.15);
        }

        .google-btn svg {
          flex-shrink: 0;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 1rem;
          }

          .login-card [class*="CardHeader"],
          .login-card [class*="CardContent"] {
            padding: 1.5rem;
          }

          .logo-wrapper {
            width: 64px;
            height: 64px;
          }

          .logo-icon {
            width: 36px;
            height: 36px;
          }

          .logo-text {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
