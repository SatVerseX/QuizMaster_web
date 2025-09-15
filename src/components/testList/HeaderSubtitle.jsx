import React from 'react';
import { FiZap } from 'react-icons/fi';

const HeaderSubtitle = ({ isDark }) => {
  return (
    <div className="relative z-[60] mb-8 sm:mb-12">
      <div className="text-center mb-8 sm:mb-12">
        {/* Subtitle with enhanced styling */}
        <div className="relative mt-6 mb-6 sm:mb-8">
          <p className={`text-lg sm:text-xl lg:text-2xl flex items-center justify-center gap-3 mb-4 ${
            isDark ? 'text-gray-300' : 'text-slate-600'
          }`}>
            <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-pulse" />
            <span className="hidden sm:inline">Comprehensive test series to accelerate your success</span>
            <span className="sm:hidden">Accelerate your success</span>
            <FiZap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse delay-1000" />
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 mx-auto rounded-full shadow-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSubtitle;
