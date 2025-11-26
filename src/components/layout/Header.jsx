import React, { useCallback, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useSubscription } from "../../contexts/SubscriptionContext";
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
  Puzzle,
  ChevronDown,
  X
} from "lucide-react";

const Header = ({
  onViewAttempts,
  onViewHome,
  onViewTestSeries,
  onViewWelcome,
  onLoginClick,
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userMenuCloseTimerRef = useRef(null);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [logout, navigate]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".mobile-nav-content") &&
        !event.target.closest(".mobile-menu-trigger")
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
      if (userMenuCloseTimerRef.current) clearTimeout(userMenuCloseTimerRef.current);
    };
  }, [isMenuOpen, isUserMenuOpen]);

  const openUserMenu = () => {
    if (userMenuCloseTimerRef.current) clearTimeout(userMenuCloseTimerRef.current);
    setIsUserMenuOpen(true);
  };
  
  const scheduleCloseUserMenu = () => {
    if (userMenuCloseTimerRef.current) clearTimeout(userMenuCloseTimerRef.current);
    userMenuCloseTimerRef.current = setTimeout(() => setIsUserMenuOpen(false), 200);
  };

  // Helper for Nav Links to keep code DRY
  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          theme === "dark"
            ? isActive 
              ? "bg-gray-800 text-white shadow-sm ring-1 ring-gray-700" 
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            : isActive 
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : ''}`} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-900/90 backdrop-blur-xl border-b border-gray-800"
          : "bg-white/90 backdrop-blur-xl border-b border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex justify-between items-center h-full gap-4">
          
          {/* --- Logo Section --- */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => navigate('/homepage')}
              className="group flex flex-col justify-center relative outline-none"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <span
                className={`text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent transition-all duration-300 ${
                  logoHovered ? "tracking-wide" : "tracking-normal"
                }`}
              >
                QuizMaster
              </span>
              <span
                className={`h-0.5 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 transition-all duration-300 ${
                  logoHovered ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              ></span>
            </button>
          </div>

          {/* --- Desktop Navigation --- */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            {currentUser && (
              <nav className={`flex items-center p-1 rounded-xl ${
                theme === "dark" ? "bg-gray-900/50" : "bg-slate-50/50"
              }`}>
                <NavLink to="/test-series" icon={Home} label="Series" />
                <NavLink to="/study-planner" icon={Calendar} label="Plan" />
                <NavLink to="/test-history" icon={Target} label="Progress" />
                <NavLink to="/flashcards" icon={Layers} label="Flashcards" />
              </nav>
            )}
          </div>

          {/* --- Right Actions --- */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 border ${
                theme === "dark"
                  ? "text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-yellow-400"
                  : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-orange-500"
              }`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin Action */}
            {isAdmin && (
              <Link
                to="/create-series"
                className={`hidden sm:flex items-center justify-center p-2 rounded-lg border transition-all ${
                  theme === "dark"
                    ? "text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-purple-400"
                    : "text-slate-500 border-transparent hover:bg-slate-100 hover:text-purple-600"
                }`}
                title="Create"
              >
                <Plus className="w-4 h-4" />
              </Link>
            )}

            {/* User Menu / Login Button */}
            {currentUser ? (
              <div
                className="relative"
                onMouseEnter={openUserMenu}
                onMouseLeave={scheduleCloseUserMenu}
              >
                <button
                  className={`user-menu-trigger flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-200 ${
                    theme === "dark"
                      ? `bg-gray-800 border-gray-700 hover:border-gray-600 ${isUserMenuOpen ? 'ring-2 ring-blue-500/20' : ''}`
                      : `bg-white border-slate-200 hover:border-slate-300 ${isUserMenuOpen ? 'ring-2 ring-blue-500/10' : ''}`
                  }`}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-blue-100 text-blue-600"}`}>
                    {currentUser?.photoURL && !avatarError ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs font-medium max-w-[100px] truncate hidden sm:block ${theme === "dark" ? "text-gray-200" : "text-slate-700"}`}>
                    {currentUser.displayName || "Account"}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className={`user-menu-panel absolute right-0 top-full mt-2 w-72 rounded-xl shadow-xl border overflow-hidden z-50 transform origin-top-right transition-all duration-200 ${
                    theme === "dark" ? "bg-gray-800 border-gray-700 shadow-black/50" : "bg-white border-slate-200 shadow-slate-200/50"
                  }`}>
                    {/* Header */}
                    <div className={`px-5 py-4 border-b ${
                      theme === "dark" ? "border-gray-700 bg-gradient-to-r from-blue-900/10 to-purple-900/10" : "border-slate-100 bg-slate-50/50"
                    }`}>
                      <p className={`text-sm font-bold truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {currentUser.displayName || currentUser.email?.split("@")[0]}
                      </p>
                      <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                        {currentUser.email}
                      </p>
                    </div>

                    {/* Subscription Info */}
                    {!subscriptionLoading && subscription && (
                      <div className={`px-5 py-3 border-b ${theme === "dark" ? "border-gray-700" : "border-slate-100"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-[10px] uppercase tracking-wider font-semibold ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>
                            Current Plan
                          </p>
                          {subscription.isActive && (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                           <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                            {subscription.plan?.name || subscription.name}
                          </p>
                          <Link
                            to="/subscriptions"
                            className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Puzzle className="w-3 h-3" /> Manage
                          </Link>
                        </div>
                        <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                           {subscription.planType === "free"
                              ? "Upgrade to unlock full access"
                              : `${subscription.daysRemaining ?? "∞"} days remaining`}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="p-1.5">
                      <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          theme === "dark" ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"
                        }`}>
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { if (onLoginClick) onLoginClick(); else navigate('/login'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-lg border mobile-menu-trigger transition-colors ${
                theme === "dark"
                  ? "text-gray-400 border-gray-800 hover:bg-gray-800"
                  : "text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Navigation Drawer --- */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full md:hidden z-40 mobile-nav-content">
           {/* Backdrop Shadow Overlay */}
           <div className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
           
           {/* Content */}
           <div className={`relative border-b shadow-xl transition-all duration-300 ${
             theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"
           }`}>
             <div className="p-4 space-y-4">
               {currentUser ? (
                 <>
                   {/* Profile Header Mobile */}
                   <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                     theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-slate-50 border-slate-100"
                   }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-600'}`}>
                         {currentUser.photoURL ? <img src={currentUser.photoURL} className="w-full h-full object-cover"/> : <User className="w-5 h-5"/>}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          {currentUser.displayName || "User"}
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                          {currentUser.email}
                        </p>
                      </div>
                   </div>

                   {/* Links */}
                   <div className="space-y-1">
                      {[
                        { to: "/test-series", icon: Home, label: "Test Series" },
                        { to: "/study-planner", icon: Calendar, label: "Study Plan" },
                        { to: "/test-history", icon: Target, label: "My Progress" },
                        { to: "/flashcards", icon: Layers, label: "Flashcards" },
                      ].map((item) => (
                        <Link 
                          key={item.to}
                          to={item.to} 
                          onClick={() => setIsMenuOpen(false)} 
                          className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                            theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                           <item.icon className="w-4 h-4" /> {item.label}
                        </Link>
                      ))}
                   </div>

                   <div className={`pt-3 mt-2 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-slate-100'}`}>
                     <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                        <LogOut className="w-4 h-4" /> Sign Out
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-6">
                    <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                      Log in to access all features
                    </p>
                    <button 
                      onClick={() => { if(onLoginClick) onLoginClick(); else navigate('/login'); setIsMenuOpen(false); }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-md active:scale-95 transition-transform"
                    >
                       Login / Sign Up
                    </button>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}
    </header>
  );
};

export default Header;