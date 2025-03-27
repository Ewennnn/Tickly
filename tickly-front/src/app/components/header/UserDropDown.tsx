import React from 'react';

interface UserDropdownProps {
    user: any;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    handleLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, isDropdownOpen, setIsDropdownOpen, handleLogout }) => {
    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-white flex items-center space-x-2"
            >
                <span>{user.name}</span>
                <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
                    <ul>
                        <li>
                            <a href="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Gestion de compte
                            </a>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Se déconnecter
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;