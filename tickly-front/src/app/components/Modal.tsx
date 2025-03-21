import React, {ReactNode} from "react";

export const Modal = (
    { isOpen, onClose, children }:
    { isOpen: boolean, onClose: () => void, children: ReactNode}
) => {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
            onKeyDown={handleKeyDown}
        >
            <div
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};