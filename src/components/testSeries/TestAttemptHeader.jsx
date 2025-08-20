import React from 'react';
import { FiArrowLeft, FiDownload, FiShare2 } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

const TestAttemptHeader = ({ attempt, onBack, onDownload, onShare }) => {
  return (
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
      <button
        onClick={onBack}
        className="group bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/40 text-gray-300 rounded-xl px-4 sm:px-6 py-2 sm:py-3 font-medium hover:from-gray-700/80 hover:to-gray-600/80 transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
        <span className="hidden sm:inline">Back to History</span>
        <span className="sm:hidden">Back</span>
      </button>
      
      <div className="flex-1">
        <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-1 sm:mb-2 leading-tight">
          Test Analysis
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 flex items-center gap-2">
          <FaGraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          {attempt.testTitle} • {attempt.testSeriesTitle}
        </p>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onDownload}
          className="group bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/40 text-green-300 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
        
        <button 
          onClick={onShare}
          className="group bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/40 text-blue-300 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <FiShare2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

export default TestAttemptHeader;
