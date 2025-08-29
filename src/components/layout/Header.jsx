import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Link } from "react-router-dom";
import {
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiRotateCcw,
  FiTarget,
  FiHome,
  FiMenu,
  FiHelpCircle,
  FiShield,
  FiFileText,
  FiLogIn,
} from "react-icons/fi";
import { FaBrain, FaPuzzlePiece } from "react-icons/fa";

const Header = ({
  onViewAttempts,
  onViewHome,
  onViewWelcome,
  onAIGenerator,
  onLoginClick,
  currentView,
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [logoHovered, setLogoHovered] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuCloseTimerRef = React.useRef(null);
  const [avatarError, setAvatarError] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-nav-content") &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMenuOpen(false);
      }
      if (
        isUserMenuOpen &&
        !event.target.closest(".user-menu-panel") &&
        !event.target.closest(".user-menu-trigger")
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (userMenuCloseTimerRef.current) {
        clearTimeout(userMenuCloseTimerRef.current);
      }
    };
  }, [isMenuOpen, isUserMenuOpen]);

  const openUserMenu = () => {
    if (userMenuCloseTimerRef.current) {
      clearTimeout(userMenuCloseTimerRef.current);
    }
    setIsUserMenuOpen(true);
  };
  const scheduleCloseUserMenu = () => {
    if (userMenuCloseTimerRef.current) {
      clearTimeout(userMenuCloseTimerRef.current);
    }
    userMenuCloseTimerRef.current = setTimeout(
      () => setIsUserMenuOpen(false),
      150
    );
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 safe-area-top ${
        theme === "dark"
          ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-gray-900/20"
          : "bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-200/40"
      } border-b`}
    >
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6">
          {/* Enhanced Logo - Mobile Optimized */}
          <div cl assName="flex items-center flex-1 min-w-0">
            <button
              onClick={() => onViewHome && onViewHome()}
              className="group flex items-center relative"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
             <div
                className={`mr-3 p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white transform transition-all duration-300 shadow-lg shadow-orange-500/20 ${
                  logoHovered
                    ? "scale-110 rotate-3 shadow-xl shadow-orange-500/40"
                    : ""
                }`}
              >
                <FaPuzzlePiece
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ${
                    logoHovered ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-lg sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent transition-all duration-300 truncate drop-shadow-sm ${
                    logoHovered ? "tracking-wider" : ""
                  }`}
                >
                  QuizMaster
                </span>
                <span
                  className={`h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 transition-all duration-500 ${
                    logoHovered ? "w-full" : "w-0"
                  }`}
                ></span>
                <span
                  className={`absolute -bottom-3 text-xs text-orange-600 dark:text-orange-400 font-medium transition-all duration-300 ${
                    logoHovered ? "opacity-100" : "opacity-0"
                  } hidden sm:block`}
                >
                  Test Your Knowledge
                </span>
              </div>
            </button>
          </div>

          {/* Enhanced Mobile Controls */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`group relative p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 border-gray-700/50"
                  : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200/60"
              }`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <div className="relative">
                {theme === "dark" ? (
                  <FiSun className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-500" />
                ) : (
                  <FiMoon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              </div>
            </button>

            <button
              className={`group relative p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 border-gray-700/50"
                  : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200/60"
              }`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <div className="relative">
                <FiMenu className="w-5 h-5 transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation & Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Menu */}
            {currentUser && (
              <nav className="flex items-center mr-4 max-w-[60vw] xl:max-w-[65vw] 2xl:max-w-[70vw] overflow-x-auto no-scrollbar">
                <div
                  className={`flex space-x-1 whitespace-nowrap rounded-lg p-1 shadow-inner border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700/50"
                      : "bg-slate-100 border-slate-200/60"
                  }`}
                >
                  <button
                    onClick={() => onViewHome && onViewHome()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700 hover:shadow-sm"
                        : "text-slate-700 hover:bg-white hover:shadow-sm"
                    }`}
                    title="Test Series"
                  >
                    <FiHome className="icon-responsive" />
                    <span className="text-sm font-medium">Test Series</span>
                  </button>

                  <button
                    onClick={() => onViewAttempts && onViewAttempts()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700 hover:shadow-sm"
                        : "text-slate-700 hover:bg-white hover:shadow-sm"
                    }`}
                    title="My Progress"
                  >
                    <FiTarget className="icon-responsive" />
                    <span className="text-sm font-medium">My Progress</span>
                  </button>

                  {onAIGenerator && isAdmin && (
                    <button
                      onClick={() => onAIGenerator()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                        theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700 hover:shadow-sm"
                          : "text-slate-700 hover:bg-white hover:shadow-sm"
                      }`}
                      title="AI Generator"
                    >
                      <FaBrain className="icon-responsive" />
                      <span className="text-sm font-medium">AI Generator</span>
                    </button>
                  )}
                </div>
              </nav>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`group relative p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md border ${
                theme === "dark"
                  ? "text-gray-200 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 border-gray-700/50"
                  : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200/60"
              }`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <div className="relative">
                {theme === "dark" ? (
                  <FiSun className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-500" />
                ) : (
                  <FiMoon className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
              </div>
            </button>

            {/* User menu */}
            {currentUser ? (
              <div
                className="relative flex items-center gap-3"
                onMouseEnter={openUserMenu}
                onMouseLeave={scheduleCloseUserMenu}
              >
                <button
                  className={`user-menu-trigger flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                      : "bg-white border-slate-200/60 hover:bg-slate-50"
                  }`}
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full overflow-hidden ${
                      theme === "dark"
                        ? "bg-blue-900/30 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {currentUser?.photoURL && !avatarError ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || "User"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <FiUser className="icon-responsive" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium max-w-40 truncate ${
                      theme === "dark" ? "text-gray-200" : "text-slate-800"
                    }`}
                  >
                    {currentUser.displayName ||
                      currentUser.email?.split("@")[0] ||
                      "User"}
                  </span>
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className={`user-menu-panel absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 backdrop-blur-xl ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-slate-200/60"
                    }`}
                  >
                    {/* Enhanced User Profile Section */}
                    <div
                      className={`px-6 py-5 border-b ${
                        theme === "dark"
                          ? "border-gray-700 bg-gradient-to-br from-blue-900/20 to-purple-900/20"
                          : "border-slate-200/60 bg-gradient-to-br from-blue-50/50 to-purple-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden shadow-lg">
                          {currentUser?.photoURL && !avatarError ? (
                            <img
                              src={currentUser.photoURL}
                              alt={currentUser.displayName || "User"}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={() => setAvatarError(true)}
                            />
                          ) : (
                            <FiUser className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-base font-bold truncate mb-1 ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {currentUser.displayName ||
                              currentUser.email?.split("@")[0] ||
                              "User"}
                          </div>
                          <div
                            className={`text-sm truncate ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-slate-600"
                            }`}
                          >
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Navigation Links */}
                    <nav className="py-3">
                      <div className="px-3">
                        <Link
                          to="/privacy"
                          className={`group flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all duration-200 hover:shadow-sm ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-blue-800/20"
                              : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                              theme === "dark"
                                ? "bg-blue-900/30 text-blue-400 group-hover:bg-blue-800/40"
                                : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                            }`}
                          >
                            <FiShield className="w-4 h-4" />
                          </div>
                          <span className="font-medium">Privacy Policy</span>
                        </Link>

                        <Link
                          to="/terms"
                          className={`group flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all duration-200 hover:shadow-sm ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gradient-to-r hover:from-green-900/20 hover:to-green-800/20"
                              : "text-slate-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                              theme === "dark"
                                ? "bg-green-900/30 text-green-400 group-hover:bg-green-800/40"
                                : "bg-green-100 text-green-600 group-hover:bg-green-200"
                            }`}
                          >
                            <FiFileText className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            Terms & Conditions
                          </span>
                        </Link>

                        <Link
                          to="/refunds"
                          className={`group flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all duration-200 hover:shadow-sm ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-orange-800/20"
                              : "text-slate-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                              theme === "dark"
                                ? "bg-orange-900/30 text-orange-400 group-hover:bg-orange-800/40"
                                : "bg-orange-100 text-orange-600 group-hover:bg-orange-200"
                            }`}
                          >
                            <FiRotateCcw className="w-4 h-4" />
                          </div>
                          <span className="font-medium">
                            Cancellations & Refunds
                          </span>
                        </Link>

                        <Link
                          to="/contact"
                          className={`group flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all duration-200 hover:shadow-sm ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-purple-800/20"
                              : "text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                              theme === "dark"
                                ? "bg-purple-900/30 text-purple-400 group-hover:bg-purple-800/40"
                                : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                            }`}
                          >
                            <FiHelpCircle className="w-4 h-4" />
                          </div>
                          <span className="font-medium">Contact Us</span>
                        </Link>
                      </div>
                    </nav>

                    {/* Enhanced Sign Out Section */}
                    <div
                      className={`border-t px-3 py-3 ${
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-slate-200/60"
                      }`}
                    >
                      <button
                        onClick={handleLogout}
                        className={`group w-full flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all duration-200 hover:shadow-sm font-medium ${
                          theme === "dark"
                            ? "text-red-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20"
                            : "text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                            theme === "dark"
                              ? "bg-red-900/30 text-red-400 group-hover:bg-red-800/40"
                              : "bg-red-100 text-red-600 group-hover:bg-red-200"
                          }`}
                        >
                          <FiLogOut className="w-4 h-4" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login button for non-logged-in users */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // Direct redirect to login page
                    if (onLoginClick) onLoginClick();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all duration-200 transform hover:scale-105"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Beautified Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <div
              className={`mobile-nav-content ${
                isMenuOpen ? "mobile-nav-open" : "mobile-nav-closed"
              }`}
            >
              {currentUser ? (
                <div className="flex flex-col h-full">
                  {/* Enhanced User Profile */}
                  <div
                    className={`relative p-6 border-b transition-all duration-300 ${
                      theme === "dark"
                        ? "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-t-2xl transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                          : "bg-gradient-to-br from-blue-50 to-purple-50"
                      }`}
                    ></div>
                    <div className="relative flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-gradient-to-br from-blue-600 to-purple-700 border-gray-700 shadow-blue-500/20"
                              : "bg-gradient-to-br from-blue-600 to-purple-700 border-white shadow-slate-300/20"
                          }`}
                        >
                          <FiUser className="w-7 h-7" />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 shadow-lg transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-green-500 border-gray-800"
                              : "bg-green-500 border-white"
                          }`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-xl truncate transition-all duration-300 ${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {currentUser.displayName ||
                            currentUser.email?.split("@")[0] ||
                            "User"}
                        </p>
                        <p
                          className={`text-sm truncate transition-all duration-300 ${
                            theme === "dark"
                              ? "text-gray-300"
                              : "text-slate-600"
                          }`}
                        >
                          {currentUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-300 ${
                              theme === "dark"
                                ? "bg-green-600 text-green-100 border border-green-500"
                                : "bg-green-100 text-green-800 border border-green-300"
                            }`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full mr-1.5 transition-all duration-300 ${
                                theme === "dark"
                                  ? "bg-green-400"
                                  : "bg-green-600"
                              }`}
                            ></span>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Navigation Links */}
                  <nav
                    className={`flex-1 py-6 transition-all duration-300 ${
                      theme === "dark" ? "bg-gray-900" : "bg-white"
                    }`}
                  >
                    <div className="space-y-2 px-4">
                      <button
                        onClick={() => {
                          onViewHome && onViewHome();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800 border border-transparent hover:border-blue-500/30"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-blue-900/50 text-blue-400 group-hover:bg-blue-800/60 border border-blue-700/50"
                              : "bg-blue-100 text-blue-600 group-hover:bg-blue-200 border border-blue-200"
                          }`}
                        >
                          <FiHome className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Test Series</span>
                      </button>

                      <button
                        onClick={() => {
                          onViewAttempts && onViewAttempts();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800 border border-transparent hover:border-purple-500/30"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-purple-900/50 text-purple-400 group-hover:bg-purple-800/60 border border-purple-700/50"
                              : "bg-purple-100 text-purple-600 group-hover:bg-purple-200 border border-purple-200"
                          }`}
                        >
                          <FiTarget className="w-5 h-5" />
                        </div>
                        <span className="font-medium">My Progress</span>
                      </button>

                      <button
                        onClick={() => {
                          onViewWelcome && onViewWelcome();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800 border border-transparent hover:border-orange-500/30"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-orange-900/50 text-orange-400 group-hover:bg-orange-800/60 border border-orange-700/50"
                              : "bg-orange-100 text-orange-600 group-hover:bg-orange-200 border border-orange-200"
                          }`}
                        >
                          <FaPuzzlePiece className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Welcome</span>
                      </button>

                      {onAIGenerator && isAdmin && (
                        <button
                          onClick={() => {
                            onAIGenerator();
                            setIsMenuOpen(false);
                          }}
                          className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                            theme === "dark"
                              ? "text-gray-200 hover:bg-gray-800 border border-transparent hover:border-green-500/30"
                              : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                              theme === "dark"
                                ? "bg-green-900/50 text-green-400 group-hover:bg-green-800/60 border border-green-700/50"
                                : "bg-green-100 text-green-600 group-hover:bg-green-200 border border-green-200"
                            }`}
                          >
                            <FaBrain className="w-5 h-5" />
                          </div>
                          <span className="font-medium">AI Generator</span>
                        </button>
                      )}
                    </div>
                  </nav>

                  {/* Enhanced Sign Out Section */}
                  <div
                    className={`border-t px-4 py-4 transition-all duration-300 ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-900"
                        : "bg-white"
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className={`group w-full flex items-center gap-4 px-4 py-3 text-sm rounded-xl transition-all duration-300 hover:shadow-md font-medium ${
                        theme === "dark"
                          ? "text-red-400 hover:bg-gray-800 border border-transparent hover:border-red-500/30"
                          : "text-red-600 hover:bg-slate-50 border border-transparent hover:border-red-200"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-red-900/50 text-red-400 group-hover:bg-red-800/60 border border-red-700/50"
                            : "bg-red-100 text-red-600 group-hover:bg-red-200 border border-red-200"
                        }`}
                      >
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Mobile menu for non-logged-in users */
                <div className="flex flex-col h-full">
                  {/* Welcome Message */}
                  <div
                    className={`relative p-6 border-b transition-all duration-300 ${
                      theme === "dark"
                        ? "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-t-2xl transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-orange-500/20 to-red-500/20"
                          : "bg-gradient-to-br from-orange-50 to-red-50"
                      }`}
                    ></div>
                    <div className="relative flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl border-2 transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-gradient-to-br from-orange-500 to-red-600 border-gray-700 shadow-orange-500/20"
                              : "bg-gradient-to-br from-orange-500 to-red-600 border-white shadow-slate-300/20"
                          }`}
                        >
                          <FaPuzzlePiece className="w-7 h-7" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-xl truncate transition-all duration-300 ${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          }`}
                        >
                          Welcome to QuizMaster
                        </p>
                        <p
                          className={`text-sm truncate transition-all duration-300 ${
                            theme === "dark"
                              ? "text-gray-300"
                              : "text-slate-600"
                          }`}
                        >
                          Browse test series and login to access features
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links for Non-logged-in Users */}
                  <nav
                    className={`flex-1 py-6 transition-all duration-300 ${
                      theme === "dark" ? "bg-gray-900" : "bg-white"
                    }`}
                  >
                    <div className="space-y-2 px-4">
                      <button
                        onClick={() => {
                          onViewHome && onViewHome();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800 border border-transparent hover:border-blue-500/30"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-blue-900/50 text-blue-400 group-hover:bg-blue-800/60 border border-blue-700/50"
                              : "bg-blue-100 text-blue-600 group-hover:bg-blue-200 border border-blue-200"
                          }`}
                        >
                          <FiHome className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Test Series</span>
                      </button>

                      <button
                        onClick={() => {
                          onViewWelcome && onViewWelcome();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                          theme === "dark"
                            ? "text-gray-200 hover:bg-gray-800 border border-transparent hover:border-orange-500/30"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                            theme === "dark"
                              ? "bg-orange-900/50 text-orange-400 group-hover:bg-orange-800/60 border border-orange-700/50"
                              : "bg-orange-100 text-orange-600 group-hover:bg-orange-200 border border-orange-200"
                          }`}
                        >
                          <FaPuzzlePiece className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Welcome</span>
                      </button>
                    </div>
                  </nav>

                  {/* Login Button */}
                  <div
                    className={`border-t px-4 py-4 transition-all duration-300 ${
                      theme === "dark"
                        ? "border-gray-700 bg-gray-900"
                        : "bg-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        // Direct redirect to login page
                        if (onLoginClick) onLoginClick();
                        setIsMenuOpen(false);
                      }}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300 hover:shadow-md font-medium transform hover:scale-105"
                    >
                      <FiLogIn className="w-5 h-5" />
                      <span>Login / Sign Up</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
