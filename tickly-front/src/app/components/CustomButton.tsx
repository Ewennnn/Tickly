import React, {ReactNode} from "react";
import {primaryColor} from "@/app/globals";

export const CustomButton = (
    {
        children,
        onClick,
        primary = true,
        fullWidth = false,
        disabled = false,
        loading = false,
    }: {
        children: ReactNode;
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
        primary?: boolean;
        fullWidth?: boolean;
        disabled?: boolean;
        loading?: boolean;
    }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center hover:cursor-pointer
                ${primary ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-blue-600 border border-blue-600 hover:bg-gray-100"}
                ${fullWidth ? "w-full" : ""}
                ${disabled || loading ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" : ""}
            `}
            style={primary && !disabled ? { backgroundColor: primaryColor } : {}}
        >
            {loading && (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            )}
            {children}
        </button>
    );
};