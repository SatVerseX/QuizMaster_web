import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const BeautifulPopup = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  showConfirm = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  autoClose = false,
  autoCloseDelay = 3000,
  showCloseButton = true,
  className = ''
}) => {
  const { isDark } = useTheme();
  const popupRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getTypeStyles = () => {
    const baseStyles = {
      success: {
        icon: '✅',
        bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
        borderColor: isDark ? 'border-green-700' : 'border-green-200',
        textColor: isDark ? 'text-green-300' : 'text-green-800',
        iconColor: 'text-green-500'
      },
      error: {
        icon: '❌',
        bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50',
        borderColor: isDark ? 'border-red-700' : 'border-red-200',
        textColor: isDark ? 'text-red-300' : 'text-red-800',
        iconColor: 'text-red-500'
      },
      warning: {
        icon: '⚠️',
        bgColor: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
        borderColor: isDark ? 'border-yellow-700' : 'border-yellow-200',
        textColor: isDark ? 'text-yellow-300' : 'text-yellow-800',
        iconColor: 'text-yellow-500'
      },
      info: {
        icon: 'ℹ️',
        bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
        borderColor: isDark ? 'border-blue-700' : 'border-blue-200',
        textColor: isDark ? 'text-blue-300' : 'text-blue-800',
        iconColor: 'text-blue-500'
      }
    };
    return baseStyles[type] || baseStyles.info;
  };

  const typeStyles = getTypeStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Container */}
      <div
        ref={popupRef}
        className={`
          relative w-full max-w-md sm:max-w-lg lg:max-w-xl
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl
          border border-gray-200 dark:border-gray-700
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4
          ${className}
        `}
        style={{
          animation: 'popupSlideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between p-6 pb-4
          border-b border-gray-200 dark:border-gray-700
        `}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{typeStyles.icon}</span>
            <h3 className={`
              text-lg font-semibold
              text-gray-900 dark:text-white
            `}>
              {title}
            </h3>
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`
                p-2 rounded-full transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-400 hover:text-gray-600
                dark:text-gray-500 dark:hover:text-gray-300
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <div className={`
            ${typeStyles.bgColor} ${typeStyles.borderColor}
            border rounded-xl p-4 mb-4
          `}>
            <p className={`
              text-sm leading-relaxed
              ${typeStyles.textColor}
            `}>
              {message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`
          flex items-center justify-end space-x-3 p-6 pt-0
          border-t border-gray-200 dark:border-gray-700
        `}>
          {showConfirm ? (
            <>
              <button
                onClick={onClose}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  border border-gray-300 dark:border-gray-600
                `}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  bg-blue-600 hover:bg-blue-700
                  text-white shadow-sm
                `}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors
                bg-blue-600 hover:bg-blue-700
                text-white shadow-sm
              `}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in-0 {
          animation-name: fadeIn;
        }
        
        .zoom-in-95 {
          animation-name: zoomIn;
        }
        
        .slide-in-from-bottom-4 {
          animation-name: slideInFromBottom;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        
        @keyframes slideInFromBottom {
          from { transform: translateY(10px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BeautifulPopup; 