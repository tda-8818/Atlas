// errorToast.jsx
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

/**
 * Shows an error toast notification for HTTP errors
 * @param {string} message - The error message to display
 * @param {string|number} errorCode - Error code (400, 404, etc.)
 * @param {Object} options - Additional toast options
 */
export const showErrorToast = (message, errorCode = '404', options = {}) => {
  // Don't show auth errors on the login page
  if (errorCode === '401' && window.location.pathname === '/login') {
    return null;
  }
  
  // Check if this might be a logout-related error
  if (errorCode === '401' && message.includes('Authentication required')) {
    const recentSuccessToast = document.querySelector('[role="status"]');
    if (recentSuccessToast && recentSuccessToast.textContent.includes('Logged out successfully')) {
      // Don't show error if we just showed a successful logout message
      return null;
    }
  }
  
  // Determine error title based on code
  const errorTitle = errorCode === 404 || errorCode === '404' 
    ? 'Not Found' 
    : errorCode === 400 || errorCode === '400'
      ? 'Bad Request'
      : errorCode === 401 || errorCode === '401'
        ? 'Unauthorized'
        : 'Error';

  // Create styled toast
  return toast.error(
    // Content
    (t) => (
      <div className="flex items-start">
        <AlertCircle className="mr-2 flex-shrink-0 text-red-500" size={18} />
        <div>
          <div className="font-medium">{errorCode} Error - {errorTitle}</div>
          <div className="text-sm text-gray-500">{message}</div>
        </div>
        <button 
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
    ),
    // Options
    {
      duration: 5000,
      position: 'bottom-right',
      style: {
        padding: '16px',
        backgroundColor: '#ffffff',
        borderLeft: '4px solid',
        borderColor: errorCode === '404' ? '#f59e0b' : '#ef4444',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        ...options?.style
      },
      ...options
    }
  );
};

/**
 * Handles API errors and shows appropriate toast notifications
 * @param {Object} error - Error object from API
 */
export const handleApiError = (error) => {
  if (!error) return;
  
  const statusCode = error?.status || error?.statusCode;
  const message = error?.data?.message || error?.message || 'An error occurred';
  
  // Don't show auth errors on login page (likely from logout)
  if (statusCode === 401 && window.location.pathname === '/login') {
    return;
  }
  
  // Skip error toast if this looks like a logout-related error
  if (statusCode === 401 && message.includes('Authentication required')) {
    // Check if we just showed a logout success message
    const successToasts = document.querySelectorAll('[role="status"]');
    for (const toast of successToasts) {
      if (toast.textContent.includes('Logged out successfully')) {
        return; // Skip showing this error
      }
    }
  }
  
  if (statusCode === 404) {
    showErrorToast(message, '404');
  } else if (statusCode === 400) {
    showErrorToast(message, '400');
  } else if (statusCode === 401) {
    showErrorToast(message, '401');
  } else if (statusCode) {
    showErrorToast(message, statusCode.toString());
  } else {
    showErrorToast(message);
  }
};
// errorToast.jsx
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

/**
 * Shows an error toast notification for HTTP errors
 * @param {string} message - The error message to display
 * @param {string|number} errorCode - Error code (400, 404, etc.)
 * @param {Object} options - Additional toast options
 */
export const showErrorToast = (message, errorCode = '404', options = {}) => {
  // Don't show auth errors on the login page
  if (errorCode === '401' && window.location.pathname === '/login') {
    return null;
  }
  
  // Check if this might be a logout-related error
  if (errorCode === '401' && message.includes('Authentication required')) {
    const recentSuccessToast = document.querySelector('[role="status"]');
    if (recentSuccessToast && recentSuccessToast.textContent.includes('Logged out successfully')) {
      // Don't show error if we just showed a successful logout message
      return null;
    }
  }
  
  // Determine error title based on code
  const errorTitle = errorCode === 404 || errorCode === '404' 
    ? 'Not Found' 
    : errorCode === 400 || errorCode === '400'
      ? 'Bad Request'
      : errorCode === 401 || errorCode === '401'
        ? 'Unauthorized'
        : 'Error';

  // Create styled toast
  return toast.error(
    // Content
    (t) => (
      <div className="flex items-start">
        <AlertCircle className="mr-2 flex-shrink-0 text-red-500" size={18} />
        <div>
          <div className="font-medium">{errorCode} Error - {errorTitle}</div>
          <div className="text-sm text-gray-500">{message}</div>
        </div>
        <button 
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
    ),
    // Options
    {
      duration: 5000,
      position: 'bottom-right',
      style: {
        padding: '16px',
        backgroundColor: '#ffffff',
        borderLeft: '4px solid',
        borderColor: errorCode === '404' ? '#f59e0b' : '#ef4444',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        ...options?.style
      },
      ...options
    }
  );
};

/**
 * Handles API errors and shows appropriate toast notifications
 * @param {Object} error - Error object from API
 */
export const handleApiError = (error) => {
  if (!error) return;
  
  const statusCode = error?.status || error?.statusCode;
  const message = error?.data?.message || error?.message || 'An error occurred';
  
  // Don't show auth errors on login page (likely from logout)
  if (statusCode === 401 && window.location.pathname === '/login') {
    return;
  }
  
  // Skip error toast if this looks like a logout-related error
  if (statusCode === 401 && message.includes('Authentication required')) {
    // Check if we just showed a logout success message
    const successToasts = document.querySelectorAll('[role="status"]');
    for (const toast of successToasts) {
      if (toast.textContent.includes('Logged out successfully')) {
        return; // Skip showing this error
      }
    }
  }
  
  if (statusCode === 404) {
    showErrorToast(message, '404');
  } else if (statusCode === 400) {
    showErrorToast(message, '400');
  } else if (statusCode === 401) {
    showErrorToast(message, '401');
  } else if (statusCode) {
    showErrorToast(message, statusCode.toString());
  } else {
    showErrorToast(message);
  }
};

/**
 * Shows a success toast notification
 * @param {string} message - The success message to display
 * @param {Object} options - Additional toast options
 */
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    duration: 2000,
    position: 'bottom-right',
    ...options
  });
};