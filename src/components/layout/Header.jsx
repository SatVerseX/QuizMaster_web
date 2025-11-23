import React, { useCallback } from "react";
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
  FiPlus,
} from "react-icons/fi";
import { FaPuzzlePiece } from "react-icons/fa";

const Header = ({
  onViewAttempts,
  onViewHome,
  onViewTestSeries,
  onViewWelcome,
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

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [logout]);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

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
          ? "bg-gray-900/95 backdrop-blur-lg border-gray-700/30 shadow-lg shadow-gray-900/20"
          : "bg-white/95 backdrop-blur-lg border-slate-200/40 shadow-md shadow-slate-200/40"
      } border-b`}
    >
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16 px-3 sm:px-5">
          {/* Enhanced Logo - Mobile Optimized */}
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => onViewHome && onViewHome()}
              className="group flex items-center relative"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent transition duration-200 truncate drop-shadow-sm ${
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
                  className={`absolute -bottom-3 text-xs text-orange-600 dark:text-orange-400 font-normal transition duration-200 ${
                    logoHovered ? "opacity-90" : "opacity-0"
                  } hidden sm:block`}
                >
                  Test Your Knowledge
                </span>
              </div>
            </button>
          </div>

          {/* Enhanced Mobile Controls */}
          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            {isAdmin && (
              <Link
                to="/create-series"
                className={`group relative p-2 rounded-lg transition duration-200 shadow-xs hover:shadow-sm border ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-indigo-900/30 border-gray-700/30"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border-slate-200/40"
                }`}
                title="Create Test Series"
                aria-label="Create Test Series"
              >
                <div className="relative flex items-center justify-center">
                  <FiPlus className="w-4 h-4 transition duration-200 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-200"></div>
                </div>
              </Link>
            )}
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`group relative p-2 rounded-lg transition duration-200 shadow-xs hover:shadow-sm border ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 border-gray-700/30"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200/40"
              }`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <div className="relative flex items-center justify-center">
                {theme === "dark" ? (
                  <FiSun className="w-4 h-4 transition duration-200 group-hover:scale-105 group-hover:text-yellow-500" />
                ) : (
                  <FiMoon className="w-4 h-4 transition duration-200 group-hover:scale-105 group-hover:text-blue-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-200"></div>
              </div>
            </button>

            <button
              className={`group relative p-2 rounded-lg transition duration-200 shadow-xs hover:shadow-sm border ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 border-gray-700/30"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200/40"
              }`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <div className="relative flex items-center justify-center">
                <FiMenu className="w-4 h-4 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-200"></div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation & Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Navigation Menu */}
            {currentUser && (
              <nav className="flex items-center mr-3 max-w-[60vw] xl:max-w-[65vw] 2xl:max-w-[70vw] overflow-x-auto no-scrollbar">
                <div
                  className={`flex space-x-1 whitespace-nowrap rounded-lg p-1 shadow-inner border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700/30"
                      : "bg-slate-100 border-slate-200/40"
                  }`}
                >
                  <button
                    onClick={() => onViewTestSeries && onViewTestSeries()}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition duration-200 hover:cursor-pointer ${
                      theme === "dark"
                        ? "text-gray-400 hover:bg-gray-600 hover:shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:shadow-xs"
                    }`}
                    title="Test Series"
                  >
                    <FiHome className="icon-responsive" />
                    <span className="text-xs font-normal">Test Series</span>
                  </button>

                  <button
                    onClick={() => onViewAttempts && onViewAttempts()}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition duration-200 hover:cursor-pointer ${
                      theme === "dark"
                        ? "text-gray-400 hover:bg-gray-600 hover:shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:shadow-xs"
                    }`}
                    title="My Progress"
                  >
                    <FiTarget className="icon-responsive" />
                    <span className="text-xs font-normal">My Progress</span>
                  </button>
                </div>
              </nav>
            )}

            {/* Create Test Series - Admin only */}
            {isAdmin && (
              <Link
                to="/create-series"
                className={`group relative p-2 rounded-lg transition duration-200 shadow-xs hover:shadow-sm border ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-indigo-900/30 border-gray-700/30"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 border-slate-200/40"
                }`}
                title="Create Test Series"
                aria-label="Create Test Series"
              >
                <div className="relative flex items-center gap-2">
                  <FiPlus className="w-4 h-4" />
                </div>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`group relative p-2 rounded-lg transition duration-200 shadow-xs hover:shadow-sm border ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 border-gray-700/30"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-slate-200/40"
              }`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <div className="relative">
                {theme === "dark" ? (
                  <FiSun className="w-4 h-4 transition duration-200 group-hover:scale-105 group-hover:text-yellow-500" />
                ) : (
                  <FiMoon className="w-4 h-4 transition duration-200 group-hover:scale-105 group-hover:text-blue-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-200"></div>
              </div>
            </button>

            {/* User menu */}
            {currentUser ? (
              <div
                className="relative flex items-center gap-2"
                onMouseEnter={openUserMenu}
                onMouseLeave={scheduleCloseUserMenu}
              >
                <button
                  className={`user-menu-trigger flex items-center gap-2 px-3 py-2 rounded-lg shadow-xs border transition duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700/30 hover:bg-gray-600"
                      : "bg-white border-slate-200/40 hover:bg-slate-100"
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
                        loading="eager"
                        decoding="sync"
                        fetchPriority="high"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <FiUser className="icon-responsive" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-normal max-w-40 truncate ${
                      theme === "dark" ? "text-gray-300" : "text-slate-600"
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
                    className={`user-menu-panel absolute right-0 top-full mt-3 w-80 rounded-xl shadow-lg border overflow-hidden z-50 backdrop-blur-lg ${
                      theme === "dark"
                        ? "bg-gray-800 border-gray-700/30"
                        : "bg-white border-slate-200/40"
                    }`}
                  >
                    {/* Enhanced User Profile Section */}
                    <div
                      className={`px-5 py-4 border-b ${
                        theme === "dark"
                          ? "border-gray-700/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20"
                          : "border-slate-200/40 bg-gradient-to-br from-blue-50/50 to-purple-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white overflow-hidden shadow-md">
                          {currentUser?.photoURL && !avatarError ? (
                            <img
                              src={currentUser.photoURL}
                              alt={currentUser.displayName || "User"}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              loading="eager"
                              decoding="sync"
                              fetchPriority="high"
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
                            className={`text-xs truncate ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-slate-600"
                            }`}
                          >
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Navigation Links */}
                    <nav className="py-2.5">
                      <div className="px-2.5">
                        <Link
                          to="/subscriptions"
                          className={`group flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition duration-200 hover:shadow-xs ${
                            theme === "dark"
                              ? "text-gray-300 hover:bg-gradient-to-r hover:from-indigo-900/20 hover:to-indigo-800/20"
                              : "text-slate-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg transition duration-200 ${
                              theme === "dark"
                                ? "bg-indigo-900/30 text-indigo-400 group-hover:bg-indigo-800/40"
                                : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
                            }`}
                          >
                            <FiFileText className="w-3 h-3" />
                          </div>
                          <span className="font-normal">Subscriptions</span>
                        </Link>
                      </div>
                    </nav>

                    {/* Enhanced Sign Out Section */}
                    <div
                      className={`border-t px-2.5 py-2.5 ${
                        theme === "dark"
                          ? "border-gray-700/30"
                          : "border-slate-200/40"
                      }`}
                    >
                      <button
                        onClick={handleLogout}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition duration-200 hover:shadow-xs font-normal ${
                          theme === "dark"
                            ? "text-red-400 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20"
                            : "text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-red-900/30 text-red-400 group-hover:bg-red-800/40"
                              : "bg-red-100 text-red-600 group-hover:bg-red-200"
                          }`}
                        >
                          <FiLogOut className="w-3 h-3" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login button for non-logged-in users */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onLoginClick) onLoginClick();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition duration-200 transform hover:scale-105"
                >
                  <FiLogIn className="w-3 h-3" />
                  <span className="text-xs font-normal">Login</span>
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
                <div className="flex flex-col h-[100vh]">
                  {/* Enhanced User Profile */}
                  <div
                    className={`relative p-5 border-b transition duration-200 ${
                      theme === "dark"
                        ? "border-gray-700/30 bg-gradient-to-br from-gray-800 to-gray-900"
                        : "border-slate-200/40 bg-white"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-t-xl transition duration-200 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                          : "bg-gradient-to-br from-blue-50 to-purple-50"
                      }`}
                    ></div>
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md border-2 transition duration-200 ${
                            theme === "dark"
                              ? "bg-gradient-to-br from-blue-600 to-purple-700 border-gray-700/30 shadow-blue-500/20"
                              : "bg-gradient-to-br from-blue-600 to-purple-700 border-white shadow-slate-300/20"
                          }`}
                        >
                          <FiUser className="w-7 h-7" />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 shadow-md transition duration-200 ${
                            theme === "dark"
                              ? "bg-green-500 border-gray-800"
                              : "bg-green-500 border-white"
                          }`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-lg truncate transition duration-200 ${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {currentUser.displayName ||
                            currentUser.email?.split("@")[0] ||
                            "User"}
                        </p>
                        <p
                          className={`text-xs truncate transition duration-200 ${
                            theme === "dark"
                              ? "text-gray-400"
                              : "text-slate-600"
                          }`}
                        >
                          {currentUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-normal shadow-xs transition duration-200 ${
                              theme === "dark"
                                ? "bg-green-600 text-green-100 border border-green-500"
                                : "bg-green-100 text-green-800 border border-green-300"
                            }`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full mr-1.5 transition duration-200 ${
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
                    className={`flex-1 py-5 transition duration-200 ${
                      theme === "dark" ? "bg-gray-900" : "bg-white"
                    }`}
                  >
                    <div className="space-y-2 px-3">
                      <button
                        onClick={() => {
                          onViewTestSeries && onViewTestSeries();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition duration-200 hover:shadow-sm ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800 border border-transparent hover:border-blue-500/30"
                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-blue-900/50 text-blue-400 group-hover:bg-blue-800/60 border border-blue-700/30"
                              : "bg-blue-100 text-blue-600 group-hover:bg-blue-200 border border-blue-200/40"
                          }`}
                        >
                          <FiHome className="w-4 h-4" />
                        </div>
                        <span className="font-normal">Test Series</span>
                      </button>

                      <button
                        onClick={() => {
                          window.location.href = "/subscriptions";
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition duration-200 hover:shadow-sm hover:cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800 border border-transparent hover:border-blue-500/30"
                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-blue-900/50 text-blue-400 group-hover:bg-blue-800/60 border border-blue-700/30"
                              : "bg-blue-100 text-blue-600 group-hover:bg-blue-200 border border-blue-200/40"
                          }`}
                        >
                          <FiFileText className="w-4 h-4" />
                        </div>
                        <span className="font-normal">Subscriptions</span>
                      </button>

                      <button
                        onClick={() => {
                          onViewAttempts && onViewAttempts();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition duration-200 hover:shadow-sm hover:cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800 border border-transparent hover:border-purple-500/30"
                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-purple-900/50 text-purple-400 group-hover:bg-purple-800/60 border border-purple-700/30"
                              : "bg-purple-100 text-purple-600 group-hover:bg-purple-200 border border-purple-200/40"
                          }`}
                        >
                          <FiTarget className="w-4 h-4" />
                        </div>
                        <span className="font-normal">My Progress</span>
                      </button>

                      <button
                        onClick={() => {
                          onViewWelcome && onViewWelcome();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition duration-200 hover:shadow-sm hover:cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800 border border-transparent hover:border-orange-500/30"
                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-orange-900/50 text-orange-400 group-hover:bg-orange-800/60 border border-orange-700/30"
                              : "bg-orange-100 text-orange-600 group-hover:bg-orange-200 border border-orange-200/40"
                          }`}
                        >
                          <FaPuzzlePiece className="w-4 h-4" />
                        </div>
                        <span className="font-normal">Welcome</span>
                      </button>
                    </div>
                  </nav>

                  {/* Enhanced Sign Out Section */}
                  <div
                    className={`border-t border-slate-400 px-3 py-3 transition duration-200 ${
                      theme === "dark"
                        ? "border-slate-700/30 bg-gray-900"
                        : "bg-white"
                    }`}
                  >
                    <button
                      onClick={handleLogout}
                      className={`group w-full flex  mb-30  items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition duration-200 hover:shadow-sm font-normal hover:cursor-pointer ${
                        theme === "dark"
                          ? "text-red-400 hover:bg-gray-800 border border-transparent hover:border-red-500/30"
                          : "text-red-600 hover:bg-slate-100 border border-transparent hover:border-red-200/40"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition duration-200 ${
                          theme === "dark"
                            ? "bg-red-900/50 text-red-400 group-hover:bg-red-800/60 border border-red-700/30"
                            : "bg-red-100 text-red-600 group-hover:bg-red-200 border border-red-200/40"
                        }`}
                      >
                        <FiLogOut className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-[17px]  ">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Mobile menu for non-logged-in users */
                <div className="flex flex-col h-full">
                  {/* Welcome Message */}
                  <div
                    className={`relative p-5 border-b transition duration-200 ${
                      theme === "dark"
                        ? "border-gray-700/30 bg-gradient-to-br from-gray-800 to-gray-900"
                        : "border-slate-200/40 bg-white"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-t-xl transition duration-200 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-orange-500/20 to-red-500/20"
                          : "bg-gradient-to-br from-orange-50 to-red-50"
                      }`}
                    ></div>
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md border-2 transition duration-200 ${
                            theme === "dark"
                              ? "bg-gradient-to-br from-orange-500 to-red-600 border-gray-700/30 shadow-orange-500/20"
                              : "bg-gradient-to-br from-orange-500 to-red-600 border-white shadow-slate-300/20"
                          }`}
                        >
                          <FaPuzzlePiece className="w-7 h-7" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-lg truncate transition duration-200 ${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          }`}
                        >
                          Welcome to QuizMaster
                        </p>
                        <p
                          className={`text-xs truncate transition duration-200 ${
                            theme === "dark"
                              ? "text-gray-400"
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
                    className={`flex-1 py-5 transition duration-200 ${
                      theme === "dark" ? "bg-gray-900" : "bg-white"
                    }`}
                  >
                    <div className="space-y-2 px-3">
                      <button
                        onClick={() => {
                          onViewTestSeries && onViewTestSeries();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition duration-200 hover:shadow-sm hover:cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800 border border-transparent hover:border-blue-500/30"
                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-blue-900/50 text-blue-400 group-hover:bg-blue-800/60 border border-blue-700/30"
                              : "bg-blue-100 text-blue-600 group-hover:bg-blue-200 border border-blue-200/40"
                          }`}
                        >
                          <FiHome className="w-4 h-4" />
                        </div>
                        <span className="font-normal">Test Series</span>
                      </button>

                      <button
                        onClick={() => {
                          onViewWelcome && onViewWelcome();
                          setIsMenuOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 p-3 rounded-lg transition duration-200 hover:shadow-sm hover:cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800 border border-transparent hover:border-orange-500/30"
                            : "text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/40"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition duration-200 ${
                            theme === "dark"
                              ? "bg-orange-900/50 text-orange-400 group-hover:bg-orange-800/60 border border-orange-700/30"
                              : "bg-orange-100 text-orange-600 group-hover:bg-orange-200 border border-orange-200/40"
                          }`}
                        >
                          <FaPuzzlePiece className="w-4 h-4" />
                        </div>
                        <span className="font-normal">Welcome</span>
                      </button>
                    </div>
                  </nav>

                  {/* Login Button */}
                  <div
                    className={`border-t px-3 py-3 transition duration-200 ${
                      theme === "dark"
                        ? "border-gray-700/30 bg-gray-900"
                        : "bg-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (onLoginClick) onLoginClick();
                        setIsMenuOpen(false);
                      }}
                      className="group w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition duration-200 hover:shadow-sm font-normal transform hover:scale-105 hover:cursor-pointer"
                    >
                      <FiLogIn className="w-4 h-4" />
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
