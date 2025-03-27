import React from "react";

export const CustomInput = (
    {
        type = "text",
        name,
        label,
        placeholder = "",
        value,
        onChange,
        error,
        disable = false,
    }: {
        type?: string;
        name: string;
        label: string;
        placeholder?: string;
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        error?: string;
        disable?: boolean;
    }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disable}
            className={`w-full px-3 py-2 border text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:shadow-sm transition-all
                ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);