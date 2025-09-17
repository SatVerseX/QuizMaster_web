import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiChevronRight,
  FiArrowLeft,
  FiShield,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [animateForm, setAnimateForm] = useState(false);
  const { login, signup, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setAnimateForm(true);
    const timer = setTimeout(() => setAnimateForm(false), 600);
    return () => clearTimeout(timer);
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        await signup(formData.email, formData.password, formData.displayName);
      }
      navigate("/homepage");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      navigate("/homepage");
    } catch (error) {
      let errorMessage = "Failed to sign in with Google";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign in was cancelled";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Popup was blocked by browser. Please allow popups and try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign in was cancelled";
      }
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}
    >
      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-7 mt-3">
          <div className="text-center">
            <div className="text-3xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">
                Quiz
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">
                Master
              </span>
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              Test Your Knowledge
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div
          className={`relative p-6 sm:p-8 rounded-xl border ${
            animateForm ? "scale-105" : "scale-100"
          } transition-all duration-500
          ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200 shadow-md"
          }
        `}
        >
          <div className="text-center mb-6">
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isLogin
                ? "Sign in to continue your quiz journey"
                : "Create your account and start exploring"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-5 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm flex items-center gap-2 ${
                isDark && "bg-red-700/10 text-red-300 border-red-500/20"
              }`}
            >
              <FiShield className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className={`w-full flex items-center justify-center gap-3 px-5 py-2 rounded-lg border font-medium text-base transition-all duration-200 mb-5 ${
              isDark
                ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50"
            }`}
          >
            {googleLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-t-current border-blue-400"></span>
            ) : (
              <FcGoogle className="w-5 h-5" />
            )}
            <span>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center">
            <div
              className={`flex-grow border-t ${
                isDark ? "border-slate-600" : "border-slate-200"
              }`}
            />
            <span
              className={`mx-2 text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              OR
            </span>
            <div
              className={`flex-grow border-t ${
                isDark ? "border-slate-600" : "border-slate-200"
              }`}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <FiUser
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-slate-400"
                  }`}
                />
                <input
                  type="text"
                  name="displayName"
                  placeholder="Full Name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                  required={!isLogin}
                  disabled={loading || googleLoading}
                />
              </div>
            )}

            <div className="relative">
              <FiMail
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div className="relative">
              <FiLock
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
                required
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                disabled={loading || googleLoading}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <FiLock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-slate-400"
                  }`}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                  required={!isLogin}
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  disabled={loading || googleLoading}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiEye size={18} />
                  )}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-70 mt-3"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  <span>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </span>
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <FiChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setAnimateForm(true);
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({
                    email: "",
                    password: "",
                    displayName: "",
                    confirmPassword: "",
                  });
                }}
                className="ml-2 font-medium text-blue-600 hover:text-blue-500 transition-colors"
                disabled={loading || googleLoading}
              >
                {isLogin ? "Sign up now" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
