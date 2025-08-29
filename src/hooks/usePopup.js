import { useState, useCallback } from 'react';

const usePopup = () => {
  const [popupState, setPopupState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showConfirm: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    autoClose: false,
    autoCloseDelay: 3000
  });

  const showPopup = useCallback(({
    title,
    message,
    type = 'info',
    showConfirm = false,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm = null,
    autoClose = false,
    autoCloseDelay = 3000
  }) => {
    setPopupState({
      isOpen: true,
      title,
      message,
      type,
      showConfirm,
      confirmText,
      cancelText,
      onConfirm,
      autoClose,
      autoCloseDelay
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods for different popup types
  const showSuccess = useCallback((message, title = 'Success', options = {}) => {
    showPopup({
      title,
      message,
      type: 'success',
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    });
  }, [showPopup]);

  const showError = useCallback((message, title = 'Error', options = {}) => {
    showPopup({
      title,
      message,
      type: 'error',
      ...options
    });
  }, [showPopup]);

  const showWarning = useCallback((message, title = 'Warning', options = {}) => {
    showPopup({
      title,
      message,
      type: 'warning',
      ...options
    });
  }, [showPopup]);

  const showInfo = useCallback((message, title = 'Information', options = {}) => {
    showPopup({
      title,
      message,
      type: 'info',
      autoClose: true,
      autoCloseDelay: 3000,
      ...options
    });
  }, [showPopup]);

  const showConfirm = useCallback((message, title = 'Confirm', onConfirm, options = {}) => {
    showPopup({
      title,
      message,
      type: 'warning',
      showConfirm: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
      ...options
    });
  }, [showPopup]);

  return {
    popupState,
    showPopup,
    hidePopup,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};

export default usePopup; 