import React from 'react';

const LoadingPlaceholder = ({ isDark }) => {
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' 
        : 'bg-white'
    }`}>
      <div className="container-responsive">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-48 sm:w-80 h-48 sm:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 animate-pulse space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="h-8 sm:h-10 bg-gray-700/50 rounded-lg w-48 sm:w-64 mb-3 sm:mb-4"></div>
              <div className="h-4 sm:h-6 bg-gray-700/30 rounded w-64 sm:w-96"></div>
            </div>
            <div className="h-10 sm:h-12 bg-gray-700/50 rounded-xl w-40 sm:w-48"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="h-10 sm:h-12 bg-gray-700/50 rounded-xl flex-1"></div>
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 sm:h-12 bg-gray-700/50 rounded-xl w-24 sm:w-32"></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-72 sm:h-80 bg-gray-700/30 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
