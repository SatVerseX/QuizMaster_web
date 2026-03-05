import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { getUserAvatar } from "../../utils/userUtils";
import { getSubcategoryById } from "../../utils/constants/examCategories";
import {
  Sun,
  Moon,
  User,
  LogOut,
  Target,
  Home,
  Menu,
  Calendar,
  Layers,
  Plus,
  LogIn,
  ChevronDown,
  X,
  Sparkles,
  Settings,
  CreditCard,
  ChevronRight
} from "lucide-react";

const Header = ({
  onLoginClick,
  examGoal,
  onChangeGoal,
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userMenuCloseTimerRef = useRef(null);

  const userAvatar = useMemo(() => getUserAvatar(currentUser), [currentUser]);

  // Reset states on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [logout, navigate]);

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-panel") && !event.target.closest(".user-menu-trigger")) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const openUserMenu = () => {
    if (userMenuCloseTimerRef.current) clearTimeout(userMenuCloseTimerRef.current);
    setIsUserMenuOpen(true);
  };

  const scheduleCloseUserMenu = () => {
    if (userMenuCloseTimerRef.current) clearTimeout(userMenuCloseTimerRef.current);
    userMenuCloseTimerRef.current = setTimeout(() => setIsUserMenuOpen(false), 200);
  };

  // --- Components ---

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    const isDark = theme === "dark";

    return (
      <Link
        to={to}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 group
          ${isDark
            ? isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
            : isActive ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
      >
        <Icon className={`w-4 h-4 transition-colors ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : 'group-hover:text-current'}`} />
        <span>{label}</span>
      </Link>
    );
  };

  // Simplified Mobile Link (Less Noisy)
  const MobileNavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    const isDark = theme === "dark";

    return (
      <Link
        to={to}
        onClick={() => setIsMenuOpen(false)}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200
          ${isActive
            ? (isDark ? "bg-white/5 text-blue-400" : "bg-blue-50 text-blue-700")
            : (isDark ? "text-gray-400 hover:text-gray-200 hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")
          }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "" : "opacity-70"}`} />
        <span className="font-medium text-sm">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current"></div>}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 h-16 transition-all duration-300 ${theme === "dark"
          ? "bg-gray-950/80 backdrop-blur-xl border-b border-gray-800"
          : "bg-white/80 backdrop-blur-xl border-b border-slate-200"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex justify-between items-center h-full gap-4">

            {/* --- Restored Logo Section --- */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => navigate('/homepage')}
                className="group flex flex-col justify-center relative outline-none"
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                <span
                  className={`text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent transition-all duration-300 ${logoHovered ? "tracking-wide" : "tracking-normal"
                    }`}
                >
                  QuizMaster
                </span>
                <span
                  className={`h-0.5 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 transition-all duration-300 ${logoHovered ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                ></span>
              </button>
            </div>

            {/* --- Desktop Nav --- */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              {currentUser && (
                <nav className={`flex items-center gap-1 px-2 py-1.5 rounded-full border shadow-sm ${theme === "dark"
                  ? "bg-gray-900/60 border-gray-700 shadow-black/20"
                  : "bg-white/60 border-slate-200 shadow-slate-200/50"
                  }`}>
                  <NavLink to="/test-series" icon={Home} label="Series" />
                  <NavLink to="/study-planner" icon={Calendar} label="Plan" />
                  <NavLink to="/test-history" icon={Target} label="History" />
                  <NavLink to="/flashcards" icon={Layers} label="Flashcards" />
                </nav>
              )}
            </div>

            {/* --- Right Actions --- */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 ${theme === "dark"
                  ? " text-yellow-400 hover:text-white"
                  : " text-slate-600  hover:text-orange-500"
                  }`}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isAdmin && (
                <Link
                  to="/create-series"
                  className={`hidden sm:flex items-center justify-center p-2 rounded-full transition-all duration-300 active:scale-95 ${theme === "dark"
                    ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                    }`}
                  title="Create"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              )}

              {/* Desktop User Menu (With Avatar) */}
              <div className="hidden md:block relative z-50"
                onMouseEnter={openUserMenu}
                onMouseLeave={scheduleCloseUserMenu}
              >
                {currentUser ? (
                  <>
                    <button
                      className={`user-menu-trigger flex items-center gap-2   rounded-full border transition-all duration-200 ${theme === "dark"
                        ? `bg-gray-900 border-gray-700 hover:border-gray-600 ${isUserMenuOpen ? 'ring-2 ring-blue-500/30' : ''}`
                        : `bg-white border-slate-200 hover:border-slate-300 ${isUserMenuOpen ? 'ring-2 ring-blue-500/20' : ''}`
                        }`}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 ${theme === "dark" ? "border-gray-800 bg-gray-800" : "border-white bg-blue-50"}`}>
                        {userAvatar && !avatarError ? (
                          <img
                            src={userAvatar}
                            alt="User"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <User className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </button>

                    {/* Dropdown Panel */}
                    <div className={`user-menu-panel absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl border overflow-hidden transform transition-all duration-300 origin-top-right
                      ${isUserMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                      ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-slate-100"}
                    `}>
                      {/* Dropdown Header */}
                      <div className={`p-4 ${theme === "dark" ? "bg-gray-800/50" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-white bg-white shadow-sm'}`}>
                            {userAvatar && !avatarError ? (
                              <img src={userAvatar} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className={`text-sm font-bold truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                              {currentUser.displayName || "User"}
                            </p>
                            <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Links */}
                      <div className="p-1.5 space-y-0.5">
                        <Link to="/profile" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-slate-600 hover:bg-slate-50"
                          }`}>
                          <Settings className="w-4 h-4" /> Settings
                        </Link>

                        <div className={`h-px mx-2 my-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-slate-100'}`}></div>
                        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${theme === "dark" ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"
                          }`}>
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => onLoginClick ? onLoginClick() : navigate('/login')}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <LogIn className="w-4 h-4" /> Login
                  </button>
                )}
              </div>

              {/* Mobile Menu Trigger */}
              <button
                className={`md:hidden relative z-50 p-2  ${theme === "dark"
                  ? "text-gray-300  "
                  : "text-slate-700 "
                  }`}
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Mobile Sidebar (Less Noisy) --- */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-out ${isMenuOpen ? 'visible' : 'invisible delay-300'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-[300px] shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            } ${theme === "dark"
              ? "bg-gray-900 border-l border-gray-800"
              : "bg-white border-l border-slate-100"
            }`}
        >
          <div className="flex flex-col h-full">

            {/* Sidebar Header */}
            <div className={`flex items-center justify-between p-5 ${theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-slate-100'}`}>
              <span className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-1.5 rounded-full transition-colors ${theme === "dark" ? "text-gray-400 hover:bg-gray-800" : "text-slate-400 hover:bg-slate-100"}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto px-2 py-4">
              {currentUser && (
                <div className="mb-6 px-2">
                  {/* Simplified User Info */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-white shadow-sm'}`}>
                      {userAvatar && !avatarError ? (
                        <img src={userAvatar} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {currentUser.displayName || "User"}
                      </p>
                      <p className={`text-xs truncate ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {currentUser ? (
                  <>
                    <MobileNavLink to="/test-series" icon={Home} label="Test Series" />
                    <MobileNavLink to="/study-planner" icon={Calendar} label="Study Plan" />
                    <MobileNavLink to="/test-history" icon={Target} label="My Progress" />
                    <MobileNavLink to="/flashcards" icon={Layers} label="Flashcards" />
                    <div className={`my-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-slate-100'}`}></div>
                    <MobileNavLink to="/profile" icon={Settings} label="Settings" />

                  </>
                ) : (
                  <div className="text-center py-10 px-4">
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                      Log in to access your dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-colors ${theme === 'dark'
                    ? "bg-gray-800 text-red-400 hover:bg-gray-700"
                    : "bg-slate-100 text-red-600 hover:bg-slate-200"
                    }`}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onLoginClick) onLoginClick(); else navigate('/login');
                  }}
                  className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Login / Sign Up
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Header;