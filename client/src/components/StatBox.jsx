import React from 'react'

export default function StatBox({ title, value, icon }) {
    return (
        <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-4 h-full w-full border border-gray-200 hover:shadow-lg transition duration-300 ease-in-out">
        <div className="text-gray-500 text-sm">{title}</div>
        <div className="text-xl font-bold text-gray-800">{value}</div>
        <div className="mt-2">{icon}</div>
        </div>
    )
};