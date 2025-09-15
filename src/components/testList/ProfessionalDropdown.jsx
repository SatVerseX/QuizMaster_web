import React, { useState, useEffect, useRef, memo } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const ProfessionalDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option...",
  disabled = false,
  isDark = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Find selected option from value
  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedOption(selected || null);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure only one dropdown open at a time
  useEffect(() => {
    const onCloseAll = (e) => {
      if (dropdownRef.current && e.detail !== dropdownRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('close-all-professional-dropdowns', onCloseAll);
    return () => window.removeEventListener('close-all-professional-dropdowns', onCloseAll);
  }, []);

  // Prevent body scroll on mobile when open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    return () => {
      if (isMobile) document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange({ target: { value: option.value } });
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      const next = !isOpen;
      if (next) {
        const evt = new CustomEvent('close-all-professional-dropdowns', { detail: dropdownRef.current });
        window.dispatchEvent(evt);
      }
      setIsOpen(next);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${isOpen ? 'z-[100]' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full h-11 px-4 pr-12 rounded-xl backdrop-blur-sm border shadow-sm text-left flex items-center justify-between transition-all duration-300 font-medium text-sm focus:outline-none ${
          disabled
            ? isDark 
              ? 'bg-gray-800/40 border-gray-700/40 text-gray-500 cursor-not-allowed' 
              : 'bg-slate-100/80 border-slate-200/60 text-slate-500 cursor-not-allowed'
            : isDark 
              ? 'bg-gray-900/60 border-gray-600/40 text-white hover:bg-gray-800/70 hover:border-gray-500/60 focus:ring-4 focus:ring-blue-500/30' 
              : 'bg-white/80 border-slate-300/60 text-slate-800 hover:bg-gray-50 hover:border-slate-400/70 focus:ring-4 focus:ring-blue-500/30'
        } ${isOpen ? 'ring-4 ring-blue-500/30 border-blue-500/50' : ''}`}
      >
        <span className={selectedOption ? '' : isDark ? 'text-gray-400' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className={`rounded-full w-7 h-7 flex items-center justify-center border transition-all duration-200 ${
          isDark 
            ? 'bg-gray-800/70 border-gray-600/50' 
            : 'bg-white border-slate-200/80 shadow-sm'
        }`}>
          <FiChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            } ${isDark ? 'text-gray-300' : 'text-slate-500'}`} 
          />
        </div>
      </button>

      {/* Enhanced Dropdown Menu with Hidden Scrollbar */}
      {isOpen && (
        <>
          {isMobile && (
            <div className="fixed inset-0 bg-black/40 z-[90]" onClick={() => setIsOpen(false)} />
          )}
          <div 
            className={`${isMobile ? 'relative mt-2' : 'absolute top-full left-0 right-0 mt-2'} py-2 rounded-xl border shadow-2xl backdrop-blur-xl max-h-60 transition-all duration-200 professional-dropdown z-[100] ${
              isDark 
                ? 'bg-gray-900/98 border-gray-600/40' 
                : 'bg-white/98 border-slate-200/60'
            }`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-150 hover:scale-[1.01] ${
                  selectedOption?.value === option.value
                    ? isDark 
                      ? 'bg-blue-600/90 text-white shadow-lg' 
                      : 'bg-blue-600 text-white shadow-lg'
                    : isDark
                      ? 'text-gray-200 hover:bg-gray-800/60 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {selectedOption?.value === option.value && (
                    <FiCheck className="w-4 h-4 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(ProfessionalDropdown);
