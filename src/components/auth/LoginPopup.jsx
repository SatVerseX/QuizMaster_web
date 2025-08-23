import React, { useState, useEffect } from 'react';
import { FiX, FiLogIn, FiArrowRight, FiCheck, FiStar, FiUsers, FiAward } from 'react-icons/fi';
import { FaPuzzlePiece, FaRocket, FaGraduationCap } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const LoginPopup = ({ isOpen, onClose, onLoginClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 transition-all duration-500 ${
      isDark ? 'bg-black/70' : 'bg-slate-900/20'
    }`}>
      {/* Professional Background Elements - Matching WelcomePage */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse transition-all duration-500 ${
          isDark ? 'bg-blue-400/8' : 'bg-blue-400/6'
        }`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-500 ${
          isDark ? 'bg-indigo-400/6' : 'bg-indigo-400/4'
        }`}></div>
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 transition-all duration-500 ${
          isDark ? 'bg-blue-300/5' : 'bg-blue-300/3'
        }`}></div>
      </div>

      <div className={`rounded-3xl shadow-xl max-w-sm sm:max-w-lg w-full mx-2 sm:mx-4 relative overflow-hidden border transition-all duration-500 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${
        isDark 
          ? 'bg-slate-800/90 shadow-slate-900/40 border-slate-700/60' 
          : 'bg-white shadow-slate-200/40 border-slate-200/60'
      }`}>
        {/* Top Decorative Dots */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 w-2 h-2 bg-blue-500 rounded-full"></div>
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-2 h-2 bg-pink-500 rounded-full"></div>

        {/* Enhanced Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center z-20 backdrop-blur-sm rounded-full hover:scale-110 transition-all duration-200 shadow-lg border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-700/90 border-slate-600/50 text-slate-300 hover:bg-slate-600/90 hover:text-white hover:border-slate-500' 
              : 'bg-white/90 border-slate-200/60 text-slate-500 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <FiX size={18} className="sm:w-5 sm:h-5" />
        </button>

        {/* Floating Particles - Matching WelcomePage style */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-6 sm:top-8 left-6 sm:left-8 w-2 h-2 rounded-full animate-bounce delay-100 transition-all duration-300 ${
            isDark ? 'bg-blue-400/20' : 'bg-blue-400/30'
          }`}></div>
          <div className={`absolute top-12 sm:top-16 right-8 sm:right-12 w-1.5 h-1.5 rounded-full animate-bounce delay-300 transition-all duration-300 ${
            isDark ? 'bg-purple-400/20' : 'bg-purple-400/30'
          }`}></div>
          <div className={`absolute bottom-16 sm:bottom-20 left-8 sm:left-12 w-1 h-1 rounded-full animate-bounce delay-500 transition-all duration-300 ${
            isDark ? 'bg-cyan-400/20' : 'bg-cyan-400/30'
          }`}></div>
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          {/* Enhanced Logo Section with Better Spacing - Matching WelcomePage */}
          <div className="flex justify-center mb-6 sm:mb-8 lg:mb-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl sm:rounded-3xl shadow-lg shadow-orange-500/25 transition-all duration-300">
                  <FaPuzzlePiece className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold">
                  <span className={`transition-all duration-300 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>Quiz</span>
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Master</span>
                </div>
                <div className={`text-sm font-medium transition-all duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>Test Your Knowledge</div>
              </div>
            </div>
          </div>

          {/* Enhanced Title with Better Spacing - Matching WelcomePage */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Welcome!
            </h2>
            <p className={`text-base sm:text-lg transition-all duration-300 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Unlock your full potential with QuizMaster
            </p>
          </div>

          {/* Feature Highlights with Better Alignment and Spacing - Matching WelcomePage */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
            <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border shadow-sm transition-all duration-300 ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600/50' 
                : 'bg-white border-slate-200/60'
            }`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-sm transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-600/50 border-slate-500/50' 
                  : 'bg-white border-blue-200/60'
              }`}>
                <FaGraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold mb-1 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>Premium Tests</div>
                <div className={`text-xs transition-all duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>Access exclusive content</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border shadow-sm transition-all duration-300 ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600/50' 
                : 'bg-white border-slate-200/60'
            }`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-sm transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-600/50 border-slate-500/50' 
                  : 'bg-white border-purple-200/60'
              }`}>
                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold mb-1 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>Leaderboards</div>
                <div className={`text-xs transition-all duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>Compete with peers</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border shadow-sm transition-all duration-300 ${
              isDark 
                ? 'bg-slate-700/50 border-slate-600/50' 
                : 'bg-white border-slate-200/60'
            }`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-sm transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-600/50 border-slate-500/50' 
                  : 'bg-white border-green-200/60'
              }`}>
                <FiAward className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold mb-1 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}>Progress Tracking</div>
                <div className={`text-xs transition-all duration-300 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>Monitor your growth</div>
              </div>
            </div>
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
            <span className="text-base sm:text-lg">Get Started Now</span>
            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Enhanced Cancel Button with Better Spacing - Matching WelcomePage */}
          <div className="text-center">
            <button
              onClick={onClose}
              className={`inline-flex items-center gap-2 font-medium py-2 sm:py-3 transition-all duration-200 rounded-xl px-3 sm:px-4 transition-all duration-300 ${
                isDark 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
