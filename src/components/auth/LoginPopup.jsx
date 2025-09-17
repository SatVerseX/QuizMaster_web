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
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getActionDetails = (action) => {
    switch (action) {
      case "view-test-history":
      case "view-attempts":
        return {
          title: "Track Your Progress",
          subtitle: "Login to view your test history and analytics",
          features: [
            { icon: FiTrendingUp, title: "Performance Analytics", desc: "Track your improvement" },
            { icon: FiAward, title: "Achievement History", desc: "View completed tests" },
            { icon: FiBookOpen, title: "Detailed Reports", desc: "Analyze performance" },
          ],
        };
      case "take-test":
        return {
          title: "Take Tests",
          subtitle: "Login to access premium test series",
          features: [
            { icon: FaCrown, title: "Premium Content", desc: "Access exclusive tests" },
            { icon: FiUsers, title: "Leaderboards", desc: "Compete with others" },
            { icon: FiAward, title: "Certificates", desc: "Earn achievements" },
          ],
        };
      case "take-quiz":
        return {
          title: "Take Quizzes",
          subtitle: "Login to access quizzes and track performance",
          features: [
            { icon: FiStar, title: "Practice Tests", desc: "Improve your skills" },
            { icon: FiUsers, title: "Leaderboards", desc: "Compete with students" },
            { icon: FiAward, title: "Achievements", desc: "Earn progress badges" },
          ],
        };
      case "view-leaderboard":
        return {
          title: "View Leaderboards",
          subtitle: "Login to see your ranking",
          features: [
            { icon: FiAward, title: "Global Rankings", desc: "See your position" },
            { icon: FiTrendingUp, title: "Progress Tracking", desc: "Monitor improvements" },
            { icon: FiStar, title: "Achievements", desc: "Compare with top performers" },
          ],
        };
      case "create-series":
        return {
          title: "Create Test Series",
          subtitle: "Login to create and manage test series",
          features: [
            { icon: FiBookOpen, title: "Content Creation", desc: "Build test series" },
            { icon: FiUsers, title: "Student Management", desc: "Track progress" },
            { icon: FiAward, title: "Analytics", desc: "Get detailed reports" },
          ],
        };
      case "ai-generator":
        return {
          title: "AI Test Generator",
          subtitle: "Login to use AI-powered test generation",
          features: [
            { icon: FiStar, title: "AI-Powered", desc: "Generate with AI" },
            { icon: FiBookOpen, title: "Smart Content", desc: "Create quality questions" },
            { icon: FiAward, title: "Time Saving", desc: "Generate in minutes" },
          ],
        };
      default:
        return {
          title: "Welcome!",
          subtitle: "Unlock your potential with QuizMaster",
          features: [
            { icon: FaGraduationCap, title: "Premium Tests", desc: "Access exclusive content" },
            { icon: FiUsers, title: "Leaderboards", desc: "Compete with peers" },
            { icon: FiAward, title: "Progress Tracking", desc: "Monitor your growth" },
          ],
        };
    }
  };

  const actionDetails = getActionDetails(pendingAction);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center bg-black/50 p-4">
      <div
        className={`rounded-lg max-w-md w-full relative ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
          }`}
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 text-blue-600">
              {actionDetails.title}
            </h2>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {actionDetails.subtitle}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {actionDetails.features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded border ${
                  isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center ${
                    isDark ? "bg-gray-700" : "bg-blue-100"
                  }`}
                >
                  <feature.icon
                    className={`w-4 h-4 ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={onLoginClick}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded mb-4 transition-colors"
          >
            <FiLogIn className="w-4 h-4" />
            <span>
              {pendingAction === "view-test-history" || pendingAction === "view-attempts"
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

          {/* Cancel Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className={`text-sm ${
                isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
