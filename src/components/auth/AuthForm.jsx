import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiChevronRight, FiArrowLeft, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaPuzzlePiece } from 'react-icons/fa';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateForm, setAnimateForm] = useState(false);
  const { login, signup, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Animation effect on mount and form toggle
  useEffect(() => {
    setAnimateForm(true);
    const timer = setTimeout(() => setAnimateForm(false), 600);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await signup(formData.email, formData.password, formData.displayName);
      }
      navigate('/test-series');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/test-series');
    } catch (error) {
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign in was cancelled';
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-all duration-500 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-white'
    }`}>
      {/* Background Effects matching the theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle background gradients */}
        <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-blue-600/20 to-indigo-700/20' 
            : 'bg-gradient-to-br from-blue-400/8 to-indigo-400/6'
        }`}></div>
        <div className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-tr from-slate-800/30 to-slate-700/30' 
            : 'bg-gradient-to-tr from-slate-200/20 to-slate-300/20'
        }`}></div>
        <div className={`absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-3xl transition-all duration-500 ${
          isDark 
            ? 'bg-gradient-to-tr from-orange-500/10 to-red-500/10' 
            : 'bg-gradient-to-tr from-orange-400/8 to-red-400/8'
        }`}></div>
        
        {/* Grid pattern overlay */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isDark 
            ? 'bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:20px_20px]' 
            : 'bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:20px_20px]'
        }`}></div>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/test-series')}
        className={`absolute top-6 left-6 z-20 group flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg font-medium transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800/80 border border-slate-700/50 text-slate-300 hover:bg-slate-700/80 hover:text-white hover:border-slate-600' 
            : 'bg-white/90 border border-slate-200/60 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-lg'
        }`}
      >
        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Back to Home</span>
      </button>

      <div className="max-w-md w-full relative z-10">
        {/* Logo matching the image style */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-500/25">
                <FaPuzzlePiece className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold">
                <span className={`transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>Quiz</span>
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Master</span>
              </div>
              <div className={`text-sm font-medium transition-all duration-300 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>Test Your Knowledge</div>
            </div>
          </div>
        </div>

        {/* Form Container matching the theme */}
        <div 
          className={`relative backdrop-blur-xl p-6 sm:p-8 shadow-2xl rounded-2xl border transition-all duration-700 transform ${animateForm ? 'scale-105' : 'scale-100'} hover:scale-102 ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700/50 hover:shadow-blue-500/10 hover:border-slate-600/50' 
              : 'bg-white/90 border-slate-200/60 hover:shadow-slate-300/20 hover:border-slate-300'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-3 transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              {isLogin ? 'Welcome Back!' : 'Join QuizMaster'}
            </h2>
            <p className={`transition-all duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {isLogin 
                ? 'Sign in to continue your quiz journey' 
                : 'Create your account and start exploring'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 border rounded-lg text-sm transition-all duration-300 ${
              isDark 
                ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <FiShield className={`w-4 h-4 ${
                  isDark ? 'text-red-400' : 'text-red-500'
                }`} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3 border rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 mb-6 disabled:opacity-50 ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 focus:ring-blue-500/50' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-blue-500/50'
            }`}
          >
            {googleLoading ? (
              <div className={`animate-spin rounded-full h-5 w-5 border-2 border-t-current ${
                isDark ? 'border-white/30' : 'border-slate-400'
              }`}></div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                <FcGoogle className="w-4 h-4" />
              </div>
            )}
            <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 flex items-center transition-all duration-300 ${
              isDark ? 'border-slate-600/50' : 'border-slate-300'
            }`}>
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-800/50 text-slate-400' 
                  : 'bg-white text-slate-500'
              }`}>OR</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  name="displayName"
                  placeholder="Full Name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600/50 text-white' 
                      : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
                  }`}
                  required={!isLogin}
                  disabled={loading || googleLoading}
                />
              </div>
            )}

            <div className="relative">
              <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-700/30 border-slate-600/50 text-white' 
                    : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
                }`}
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div className="relative">
              <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-700/30 border-slate-600/50 text-white' 
                    : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
                }`}
                required
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
                disabled={loading || googleLoading}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 ${
                    isDark 
                      ? 'bg-slate-700/30 border-slate-600/50 text-white' 
                      : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
                  }`}
                  required={!isLogin}
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  disabled={loading || googleLoading}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            )}

            {/* Submit Button matching the green "Next" button style from image */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <FiChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle form */}
          <div className="mt-6 text-center">
            <p className={`transition-all duration-300 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setAnimateForm(true);
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({
                    email: '',
                    password: '',
                    displayName: '',
                    confirmPassword: ''
                  });
                }}
                className="ml-2 font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 focus:outline-none"
                disabled={loading || googleLoading}
              >
                {isLogin ? 'Sign up now' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        {/* Feature badges matching the theme */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className={`backdrop-blur-sm px-4 py-2 rounded-full border text-sm flex items-center gap-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800/30 border-slate-700/50 text-slate-300' 
              : 'bg-white/80 border-slate-200/60 text-slate-700 shadow-sm'
          }`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            AI-Powered Quizzes
          </div>
          <div className={`backdrop-blur-sm px-4 py-2 rounded-full border text-sm flex items-center gap-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800/30 border-slate-700/50 text-slate-300' 
              : 'bg-white/80 border-slate-200/60 text-slate-700 shadow-sm'
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Real-time Leaderboards
          </div>
          <div className={`backdrop-blur-sm px-4 py-2 rounded-full border text-sm flex items-center gap-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800/30 border-slate-700/50 text-slate-300' 
              : 'bg-white/80 border-slate-200/60 text-slate-700 shadow-sm'
          }`}>
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Progress Tracking
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
