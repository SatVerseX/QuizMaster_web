import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import ProfessionalDropdown from './ProfessionalDropdown';

const SearchFilterControls = ({
  searchTerm,
  setSearchTerm,
  selectedSubcategory,
  setSelectedSubcategory,
  activeFilter,
  setActiveFilter,
  showMobileFilters,
  setShowMobileFilters,
  subcategoryOptions,
  filterOptions,
  isDark
}) => {
  return (
    <div className="relative z-[70] mb-8 sm:mb-12">
      <div className={`backdrop-blur-md sm:rounded-2xl p-3 sm:p-5 lg:p-6 xl:p-8 ${
        isDark 
          ? ' border-gray-600/40 ' 
          : ' border-slate-200/40 shadow-slate-200/30'
      }`}>
        {/* Controls Row: Search + Exam Category + Specific Exam + Filter */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-5 items-stretch xl:items-end">
          {/* Row: Search + Mobile Filter Icon */}
          <div className="flex items-stretch gap-3 w-full">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <div className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search test series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl backdrop-blur-xs border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-normal text-sm shadow-md ${
                  isDark 
                    ? 'bg-gray-900/80 border-gray-700/60 text-white placeholder-gray-400' 
                    : 'bg-white/80 border-slate-300/60 text-slate-800 placeholder-slate-500'
                }`}
              />
            </div>

            {/* Mobile Filter Icon Button */}
            <div className="xl:hidden">
              <button
                type="button"
                aria-label="Open filters"
                onClick={() => setShowMobileFilters(true)}
                className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all shadow-sm ${
                  isDark
                    ? 'bg-gray-900/80 border-gray-600/40 text-white hover:bg-gray-800'
                    : 'bg-white/80 border-slate-300/60 text-slate-800 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Inline filters (desktop only) */}
          {/* Specific Exam */}
          <div className="hidden xl:block flex-1 min-w-[180px]">
            <ProfessionalDropdown
              options={subcategoryOptions}
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              placeholder="All Exams"
              isDark={isDark}
            />
          </div>

          {/* Series Filter Dropdown */}
          <div className="hidden xl:block w-full xl:w-56">
            <ProfessionalDropdown
              options={filterOptions}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              placeholder="Filter Series"
              isDark={isDark}
            />
          </div>

          {/* Clear button */}
          {(selectedSubcategory) && (
            <div className="hidden xl:block xl:ml-2">
              <button
                onClick={() => { 
                  setSelectedSubcategory(''); 
                }}
                className={`px-4 py-2.5 rounded-xl border font-normal text-sm transition-all duration-300 ${
                  isDark 
                    ? 'bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600/25 hover:border-red-500/50'
                    : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300'
                }`}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterControls;
