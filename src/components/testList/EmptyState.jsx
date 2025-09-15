import React from 'react';
import { FiPlus, FiTarget, FiBookOpen } from 'react-icons/fi';
import { FaRocket, FaCrown, FaGem } from 'react-icons/fa';

const EmptyState = ({
  searchTerm,
  selectedSubcategory,
  activeFilter,
  filteredSeries,
  isAdmin,
  isDark,
  onCreateSeries,
  setSearchTerm,
  setActiveFilter
}) => {
  return (
    <div className="text-center py-16 sm:py-24 lg:py-32">
      {/* Enhanced Text Content */}
      <div className="relative mb-8 sm:mb-12">
        <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-transparent bg-clip-text mb-4 sm:mb-6 leading-tight ${
          isDark 
            ? 'bg-gradient-to-r from-white via-blue-200 to-purple-200'
            : 'bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600'
        }`}>
          {(() => {
            if (searchTerm) return 'No Matching Series Found';
            if (selectedSubcategory && filteredSeries.length === 0) return 'No Test Series in This Subcategory';
            if (activeFilter === 'my-series') return 'No Subscribed Series';
            if (activeFilter === 'free') return 'No Free Series Available';
            if (activeFilter === 'paid') return 'No Premium Series Available';
            return 'Ready to Begin Your Journey?';
          })()}
        </h3>
        <p className={`text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-slate-600'
        }`}>
          {(() => {
            if (searchTerm) return 'Try adjusting your search criteria or exploring different categories to find the perfect test series for you.';
            if (selectedSubcategory && filteredSeries.length === 0) return `No test series currently exist in the "${selectedSubcategory}" subcategory. Try selecting a different subcategory or check back later for new content.`;
            if (activeFilter === 'my-series') return 'You haven\'t subscribed to any test series yet. Explore our collection and subscribe to start your learning journey!';
            if (activeFilter === 'free') return 'Currently no free test series are available. Check back later or explore our premium offerings.';
            if (activeFilter === 'paid') return 'No premium test series are currently available. Browse our free series or check back later for premium content.';
            return 'Create your first comprehensive test series and start building an engaged learning community today. Transform your knowledge into powerful learning experiences.';
          })()}
        </p>

        {/* Free Access specific content */}
        {!searchTerm && activeFilter === 'free' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 text-center hover-lift">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaGem className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Premium Series</h4>
              <p className="text-sm text-emerald-200">Explore our premium test series</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center hover-lift">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiBookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">All Series</h4>
              <p className="text-sm text-blue-200">Browse all available test series</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
        {isAdmin && (
          <button
            onClick={onCreateSeries}
            className="group relative bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl sm:rounded-3xl px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-purple-500/25 border border-purple-400/30"
          >
            <div className="absolute inset-0 bg-purple-400/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <FiPlus className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl">Create Your First Series</span>
              <FaRocket className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
            </div>
          </button>
        )}
        
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
            }}
            className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-2 border-gray-600/60 text-gray-300 hover:text-white hover:bg-gray-600/80 hover:border-gray-500/60 rounded-2xl sm:rounded-3xl transition-all duration-300 flex items-center gap-3 sm:gap-4 text-base sm:text-lg lg:text-xl font-semibold shadow-lg hover:shadow-xl"
          >
            <FiTarget className="w-5 h-5 sm:w-6 sm:h-6" />
            View All Series
          </button>
        )}

        {/* Free Access specific buttons */}
        {!isAdmin && !searchTerm && activeFilter === 'free' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setActiveFilter('paid')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 border-2 border-yellow-500/60 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <FaCrown className="w-5 h-5" />
              View Premium Series
            </button>
            <button 
              onClick={() => setActiveFilter('all')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600/80 to-blue-700/80 border-2 border-blue-500/60 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <FiBookOpen className="w-5 h-5" />
              Browse All Series
            </button>
          </div>
        )}

        {/* My Series specific buttons */}
        {!isAdmin && !searchTerm && activeFilter === 'my-series' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setActiveFilter('all')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600/80 to-blue-700/80 border-2 border-blue-500/60 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-3 hover:scale-105 shadow-lg"
            >
              <FiBookOpen className="w-5 h-5" />
              Browse All Series
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
