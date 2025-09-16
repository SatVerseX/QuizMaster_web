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
    <div ref={dropdownRef} className={`relative ${isOpen ? 'z-60' : 'z-10'} ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full h-10 px-3 pr-10 rounded-lg backdrop-blur-xs border shadow-xs text-left flex items-center justify-between transition-all duration-300 font-normal text-xs focus:outline-none ${
          disabled
            ? isDark 
              ? 'bg-gray-800/30 border-gray-700/30 text-gray-400 cursor-not-allowed' 
              : 'bg-slate-100/70 border-slate-200/40 text-slate-400 cursor-not-allowed'
            : isDark 
              ? 'bg-gray-900/50 border-gray-600/30 text-white hover:bg-gray-800/50 hover:border-gray-500/30 focus:ring-2 focus:ring-blue-500/20' 
              : 'bg-white/80 border-slate-300/60 text-slate-800 hover:bg-gray-50 hover:border-slate-400/70 focus:ring-2 focus:ring-blue-500/20'
        } ${isOpen ? 'ring-4 ring-blue-500/30 border-blue-500/50' : ''}`}
      >
        <span className={selectedOption ? '' : isDark ? 'text-gray-400' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <div className={`rounded-full w-7 h-7 flex items-center justify-center border transition-all duration-200 ${
          isDark 
            ? 'bg-gray-800/60 border-gray-600/30' 
            : 'bg-white border-slate-200/40 shadow-xs'
        }`}>
          <FiChevronDown 
            className={`w-3 h-3 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            } ${isDark ? 'text-gray-400' : 'text-slate-400'}`} 
          />
        </div>
      </button>

      {/* Enhanced Dropdown Menu with Hidden Scrollbar */}
      {isOpen && (
        <>
          {isMobile && (
             <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setIsOpen(false)} />
          )}
          <div 
            className={`${isMobile ? 'relative mt-2' : 'absolute top-full left-0 right-0 mt-2'} py-1.5 rounded-lg border shadow backdrop-blur-md max-h-60 transition-all duration-200 professional-dropdown z-60 ${
              isDark 
                ? 'bg-gray-900/80 border-gray-600/30' 
                : 'bg-white/90 border-slate-200/40'
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
                className={`w-full px-3 py-3 text-left text-xs font-normal transition hover:scale-100 ${
                  selectedOption?.value === option.value
                    ? isDark 
                      ? 'bg-blue-600/70 text-white shadow' 
                      : 'bg-blue-600 text-white shadow'
                    : isDark
                      ? 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {selectedOption?.value === option.value && (
                    <FiCheck className="w-3 h-3 flex-shrink-0 ml-1" />
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

export default memo(ProfessionalDropdown)
