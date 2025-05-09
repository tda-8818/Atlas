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
  // Determine error title based on code
  const errorTitle = errorCode === 404 || errorCode === '404' 
    ? 'Not Found' 
    : errorCode === 400 || errorCode === '400'
      ? 'Bad Request'
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

// Example usage in API requests
export const handleApiError = (error) => {
  if (!error) return;
  
  const statusCode = error?.status || error?.statusCode;
  const message = error?.data?.message || error?.message || 'An error occurred';
  
  if (statusCode === 404) {
    showErrorToast(message, '404');
  } else if (statusCode === 400) {
    showErrorToast(message, '400');
  } else if (statusCode) {
    showErrorToast(message, statusCode.toString());
  } else {
    showErrorToast(message);
  }
};