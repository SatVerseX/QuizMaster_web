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
        className="fixed inset-0 bg-black/50 z-[95]"
        onClick={() => setShowMobileFilters(false)}
      />
      <div className={`fixed bottom-0 left-0 right-0 z-[100] rounded-t-2xl p-4 pb-6 border-t ${
        isDark ? 'bg-gray-900/95 border-gray-700/60' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Filters</div>
          <button
            onClick={() => setShowMobileFilters(false)}
            className={`${isDark ? 'text-gray-300' : 'text-slate-600'} px-3 py-1 rounded-lg hover:bg-gray-700/30`}
          >
            Close
          </button>
        </div>
        <div className="space-y-3">
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
                className={`flex-1 px-4 py-3 rounded-xl border font-semibold ${
                  isDark ? 'bg-red-900/40 border-red-700/60 text-red-200' : 'bg-red-50 border-red-200 text-red-700'
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
