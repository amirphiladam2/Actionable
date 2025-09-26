// utils/toast.js
import Toast from 'react-native-toast-message';

export const ToastUtils = {
  // Success toast
  success: (title, message = null, options = {}) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
      ...options
    });
  },

  // Error toast
  error: (title, message = null, options = {}) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
      ...options
    });
  },

  // Info toast
  info: (title, message = null, options = {}) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 60,
      ...options
    });
  },

  // Warning toast
  warning: (title, message = null, options = {}) => {
    Toast.show({
      type: 'error', // Using error type for warning (customize as needed)
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
      ...options
    });
  },

  // Hide current toast
  hide: () => {
    Toast.hide();
  },

  // Custom toast configurations
  configs: {
    // Long duration for important messages
    long: { visibilityTime: 5000 },
    
    // Short duration for quick feedback
    short: { visibilityTime: 2000 },
    
    // Bottom position
    bottom: { position: 'bottom', bottomOffset: 60 },
    
    // No auto-hide for critical messages
    persistent: { autoHide: false, visibilityTime: 0 }
  }
};