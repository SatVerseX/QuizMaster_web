import React, { useState, useEffect } from 'react';
import { FiX, FiLogIn, FiArrowRight, FiCheck, FiStar, FiUsers, FiAward } from 'react-icons/fi';
import { FaPuzzlePiece, FaRocket, FaGraduationCap } from 'react-icons/fa';

const LoginPopup = ({ isOpen, onClose, onLoginClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-teal-300/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className={`bg-white dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Top Decorative Dots */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full"></div>

        {/* Enhanced Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-600 hover:scale-110 transition-all duration-200 shadow-lg border border-gray-200/50 dark:border-gray-600/50"
        >
          <FiX size={20} />
        </button>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-16 right-12 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-20 left-12 w-1 h-1 bg-teal-400 rounded-full animate-bounce delay-500"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-10">
          {/* Enhanced Logo Section with Better Spacing */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-3xl shadow-2xl animate-pulse">
                <FaPuzzlePiece className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
            </div>
          </div>

          {/* Enhanced Title with Better Spacing */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Unlock your full potential with QuizMaster
            </p>
          </div>

          {/* Feature Highlights with Better Alignment and Spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">Premium Tests</div>
                <div className="text-xs text-blue-600 dark:text-blue-300">Access exclusive content</div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">Leaderboards</div>
                <div className="text-xs text-purple-600 dark:text-purple-300">Compete with peers</div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <FiAward className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">Progress Tracking</div>
                <div className="text-xs text-green-600 dark:text-green-300">Monitor your growth</div>
              </div>
            </div>
          </div>

          {/* Enhanced Login Button with Better Spacing */}
          <button
            onClick={onLoginClick}
            className="group w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 mb-6"
          >
            <div className="relative">
              <FiLogIn className="w-5 h-5 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-lg">Get Started Now</span>
            <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Enhanced Cancel Button with Better Spacing */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium py-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl px-4"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Continue browsing
            </button>
          </div>

          {/* Bottom Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
