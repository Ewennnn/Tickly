import React, {ReactNode} from "react";
import {primaryColor} from "@/app/globals";

export const CustomButton = (
    { children, onClick, primary = true, fullWidth = false, className = "" }:
    { children: ReactNode, onClick?: () => void, primary?: boolean, fullWidth?: boolean, className?: string}
) => {
    const baseClasses = "px-4 py-2 rounded-xl transition-all duration-200 hover:cursor-pointer";
    const primaryClasses = `text-white hover:shadow-md ${fullWidth ? 'w-full' : ''}`;
    const secondaryClasses = `bg-white text-[${primaryColor}] hover:bg-gray-100`;

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses} ${className}`}
            style={{ backgroundColor: primary ? primaryColor : 'white', color: primary ? 'white' : primaryColor }}
        >
            {children}
        </button>
    );
};