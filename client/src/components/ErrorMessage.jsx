import React from 'react';

const ErrorMessage = ({ message }) => {
    if (!message) return null; // Don't render if there's no message

    return (
        <p className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded-full mt-2">
            {message}
        </p>
    );
};

export default ErrorMessage;