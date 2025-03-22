import React from 'react';

const Button = ({ label, onClick, type = 'button', className = '' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            //className={`px-4 py-2 bg-[#2596be] text-white rounded hover:bg-[#187cb4] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${className}`}
            className={className}
        >
            {label}
        </button>
    );
};

export default Button;