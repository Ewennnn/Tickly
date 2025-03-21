import React from "react";

export const CustomInput = (
    { type = "text", label, placeholder = "" }:
    { type?: string, label: string, placeholder: string}
) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:shadow-sm transition-all"
        />
    </div>
);