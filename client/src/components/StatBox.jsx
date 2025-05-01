import React from 'react';

export default function StatBox({ title, value, icon, children }) {
  return (
    <div className="flex flex-col items-start bg-[var(--background)] shadow-md rounded-lg p-4 h-full w-full border border-gray-200 hover:shadow-lg transition duration-300 ease-in-out">
      {/* Header */}
      <div className="w-full flex items-center justify-center">
        <span className="text-[var(--text)] text-sm font-medium">{title}</span>
      </div>

      {/* Body */}
      {children ? (
        <div className="w-full overflow-auto ">
          {children}
        </div>
      ) : (
        <div className="w-full flex items-center my-auto items-center justify-center">
          <span className="text-xl font-bold text-[var(--nav-text)] items-center justify-center">{value}</span>
          {icon && <span className="ml-2 items-center justify-center">{icon}</span>}
        </div>
      )}
    </div>
  );
}
