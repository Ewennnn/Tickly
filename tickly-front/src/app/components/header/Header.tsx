'use client';
import React, {useState} from 'react';
import {primaryColor} from '@/app/globals';
import HeaderLogo from "@/app/components/header/HeaderLogo";
import UserDropDown from "@/app/components/header/UserDropDown";
import AuthButtons from "@/app/components/header/AuthButtons";

interface HeaderProps {
    user: any;
    loadingUser: boolean;
    handleLogout: () => void;
    toggleLoginModal: () => void;
    toggleSignupModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, loadingUser, handleLogout, toggleLoginModal, toggleSignupModal }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const fullHandleLogout = () => {
        handleLogout()
        setIsDropdownOpen(false)
    }

    return (
        <header className="shadow-md" style={{ backgroundColor: primaryColor }}>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <HeaderLogo />
                <div className="flex items-center space-x-4">
                    {loadingUser ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : user ? (
                        <UserDropDown
                            user={user}
                            isDropdownOpen={isDropdownOpen}
                            setIsDropdownOpen={setIsDropdownOpen}
                            handleLogout={fullHandleLogout}
                        />
                    ) : (
                        <AuthButtons toggleLoginModal={toggleLoginModal} toggleSignupModal={toggleSignupModal} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
