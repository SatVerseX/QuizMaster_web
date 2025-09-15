import React, { useState, useEffect } from "react";
import {
  FiX,
  FiLogIn,
  FiArrowRight,
  FiCheck,
  FiStar,
  FiUsers,
  FiAward,
  FiTarget,
  FiTrendingUp,
  FiBookOpen,
} from "react-icons/fi";
import {
  FaPuzzlePiece,
  FaRocket,
  FaGraduationCap,
  FaCrown,
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const LoginPopup = ({ isOpen, onClose, onLoginClick, pendingAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      // lock body scroll
      const scrollY = -window.scrollY;
      document.body.setAttribute("data-scroll-lock-position", String(scrollY));
      document.body.style.position = "fixed";
      document.body.style.top = `${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      // restore scroll
      const stored = document.body.getAttribute("data-scroll-lock-position");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (stored) {
        const y = parseInt(stored, 10) || 0;
        document.body.removeAttribute("data-scroll-lock-position");
        window.scrollTo(0, -y);
      }
    }
  }, [isOpen]);

  // Get specific message and icon based on pending action
  const getActionDetails = (action) => {
    switch (action) {
      case "view-test-history":
        return {
          title: "Track Your Progress",
          subtitle: "Login to view your test history and performance analytics",
          icon: FiTarget,
          color: "from-blue-500 to-indigo-500",
          features: [
            {
              icon: FiTrendingUp,
              title: "Performance Analytics",
              desc: "Track your improvement over time",
            },
            {
              icon: FiAward,
              title: "Achievement History",
              desc: "View all your completed tests and scores",
            },
            {
              icon: FiBookOpen,
              title: "Detailed Reports",
              desc: "Analyze your strengths and weaknesses",
            },
          ],
        };
      case "view-attempts":
        return {
          title: "View Your Attempts",
          subtitle: "Login to access your complete test attempt history",
          icon: FiTarget,
          color: "from-blue-500 to-indigo-500",
          features: [
            {
              icon: FiTrendingUp,
              title: "Performance Analytics",
              desc: "Track your improvement over time",
            },
            {
              icon: FiAward,
              title: "Achievement History",
              desc: "View all your completed tests and scores",
            },
            {
              icon: FiBookOpen,
              title: "Detailed Reports",
              desc: "Analyze your strengths and weaknesses",
            },
          ],
        };
      case "take-test":
        return {
          title: "Take Tests",
          subtitle:
            "Login to access premium test series and track your progress",
          icon: FiBookOpen,
          color: "from-green-500 to-emerald-500",
          features: [
            {
              icon: FaCrown,
              title: "Premium Content",
              desc: "Access exclusive test series",
            },
            {
              icon: FiUsers,
              title: "Leaderboards",
              desc: "Compete with other students",
            },
            {
              icon: FiAward,
              title: "Certificates",
              desc: "Earn certificates for your achievements",
            },
          ],
        };
      case "take-quiz":
        return {
          title: "Take Quizzes",
          subtitle: "Login to access quizzes and track your performance",
          icon: FiBookOpen,
          color: "from-purple-500 to-pink-500",
          features: [
            {
              icon: FiStar,
              title: "Practice Tests",
              desc: "Improve your skills with practice",
            },
            {
              icon: FiUsers,
              title: "Leaderboards",
              desc: "Compete with other students",
            },
            {
              icon: FiAward,
              title: "Achievements",
              desc: "Earn badges for your progress",
            },
          ],
        };
      case "view-leaderboard":
        return {
          title: "View Leaderboards",
          subtitle: "Login to see how you rank among other students",
          icon: FiUsers,
          color: "from-yellow-500 to-orange-500",
          features: [
            {
              icon: FiAward,
              title: "Global Rankings",
              desc: "See where you stand worldwide",
            },
            {
              icon: FiTrendingUp,
              title: "Progress Tracking",
              desc: "Monitor your ranking improvements",
            },
            {
              icon: FiStar,
              title: "Achievements",
              desc: "Compare with top performers",
            },
          ],
        };
      case "create-series":
        return {
          title: "Create Test Series",
          subtitle: "Login to create and manage your own test series",
          icon: FaRocket,
          color: "from-purple-500 to-pink-500",
          features: [
            {
              icon: FiBookOpen,
              title: "Content Creation",
              desc: "Build comprehensive test series",
            },
            {
              icon: FiUsers,
              title: "Student Management",
              desc: "Track student progress and performance",
            },
            {
              icon: FiAward,
              title: "Analytics",
              desc: "Get detailed insights and reports",
            },
          ],
        };
      case "ai-generator":
        return {
          title: "AI Test Generator",
          subtitle: "Login to use our AI-powered test generation tool",
          icon: FaRocket,
          color: "from-indigo-500 to-purple-500",
          features: [
            {
              icon: FiStar,
              title: "AI-Powered",
              desc: "Generate tests with artificial intelligence",
            },
            {
              icon: FiBookOpen,
              title: "Smart Content",
              desc: "Create relevant and challenging questions",
            },
            {
              icon: FiAward,
              title: "Time Saving",
              desc: "Generate tests in minutes, not hours",
            },
          ],
        };
      default:
        return {
          title: "Welcome!",
          subtitle: "Unlock your full potential with QuizMaster",
          icon: FaPuzzlePiece,
          color: "from-orange-500 to-red-500",
          features: [
            {
              icon: FaGraduationCap,
              title: "Premium Tests",
              desc: "Access exclusive content",
            },
            {
              icon: FiUsers,
              title: "Leaderboards",
              desc: "Compete with peers",
            },
            {
              icon: FiAward,
              title: "Progress Tracking",
              desc: "Monitor your growth",
            },
          ],
        };
    }
  };

  const actionDetails = getActionDetails(pendingAction);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-3xl p-4 transition-all duration-500 `}
    >
      <div
        className={`rounded-3xl shadow-xl max-w-sm sm:max-w-lg w-full mx-2 sm:mx-4 relative overflow-hidden border transition-all duration-500 transform ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } ${
          isDark
            ? "bg-black shadow-slate-900/40 border-slate-700/60"
            : "bg-black shadow-slate-900/40 border-slate-900/60"
        }`}
      >
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          

          {/* Enhanced Title with Better Spacing - Matching WelcomePage */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2
              className={`text-3xl sm:text-3xl font-inter font-bold mb-2 sm:mb-4 transition-all duration-300 ${
                isDark ? 'bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent ': "bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
              }`}
            >
              {actionDetails.title}
            </h2>
            <p
              className={`text-base sm:text-lg transition-all duration-300 ${
                isDark ? "text-yellow-300 font-medium" : "text-white"
              }`}
            >
              {actionDetails.subtitle}
            </p>
          </div>

          {/* Feature Highlights with Better Alignment and Spacing - Matching WelcomePage */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            {actionDetails.features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border shadow-sm transition-all duration-300 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600/50"
                    : "bg-black border-slate-500/60 "
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-sm transition-all duration-300 ${
                    isDark
                      ? "bg-slate-600/50 border-slate-500/50"
                      : "bg-black "
                  }`}
                >
                  <feature.icon
                    className={`${
                      isDark
                        ? "w-4 h-4 sm:w-5 sm:h-5 text-white"
                        : "w-4 h-4 sm:w-5 sm:h-5 text-white"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold mb-1 transition-all duration-300 ${
                      isDark ? "text-white" : "text-white"
                    }`}
                  >
                    {feature.title}
                  </div>
                  <div
                    className={`text-xs transition-all duration-300 ${
                      isDark ? "text-slate-400" : "text-white"
                    }`}
                  >
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Login Button with Better Spacing - Matching WelcomePage */}
          <button
            onClick={onLoginClick}
            className="group w-full flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 mb-4 sm:mb-6"
          >
            <div className="relative">
              <FiLogIn className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-base sm:text-lg">
              {pendingAction === "view-test-history" ||
              pendingAction === "view-attempts"
                ? "Login to View Progress"
                : pendingAction === "take-test"
                ? "Login to Take Tests"
                : pendingAction === "take-quiz"
                ? "Login to Take Quizzes"
                : pendingAction === "view-leaderboard"
                ? "Login to View Rankings"
                : pendingAction === "create-series"
                ? "Login to Create Series"
                : pendingAction === "ai-generator"
                ? "Login to Use AI Generator"
                : "Get Started Now"}
            </span>
          </button>

          {/* Enhanced Cancel Button with Better Spacing - Matching WelcomePage */}
          <div className="text-center">
            <button
              onClick={onClose}
              className={`inline-flex items-center gap-2 font-medium py-2 sm:py-3 transition-all duration-200 rounded-xl px-3 sm:px-4 transition-all duration-300 ${
                isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  : "text-slate-300 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Continue browsing
            </button>
          </div>

          {/* Bottom Decoration - Matching WelcomePage */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
