import React from 'react';
import ProfessionalDropdown from './ProfessionalDropdown';

const MobileFiltersSheet = ({
  showMobileFilters,
  setShowMobileFilters,
  selectedSubcategory,
  setSelectedSubcategory,
  activeFilter,
  setActiveFilter,
  subcategoryOptions,
  filterOptions,
  isDark
}) => {
  if (!showMobileFilters) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={() => setShowMobileFilters(false)}
      />
      <div className={`fixed bottom-0 left-0 right-0 z-60 rounded-t-xl p-3 pb-4 border ${
        isDark ? 'bg-gray-900/80 border-gray-700/40' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-700'}`}>Filters</div>
          <button
            onClick={() => setShowMobileFilters(false)}
            className={`${isDark ? 'text-gray-400' : 'text-slate-500'} px-2 py-1 rounded-md hover:bg-gray-700/20`}
          >
            Close
          </button>
        </div>
        <div className="space-y-2">
          <ProfessionalDropdown
            options={subcategoryOptions}
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            placeholder="All Exams"
            isDark={isDark}
          />
          <ProfessionalDropdown
            options={filterOptions}
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            placeholder="Filter Series"
            isDark={isDark}
          />
          <div className="flex gap-2 pt-2">
            {selectedSubcategory && (
              <button
                onClick={() => { setSelectedSubcategory(''); }}
                className={`flex-1 px-3 py-2 rounded-lg border font-semibold ${
                  isDark ? 'bg-red-900/30 border-red-700/40 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFiltersSheet;
