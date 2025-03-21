import React from "react";
import {Modal} from "@/app/components/Modal";
import {SignupForm} from "@/app/forms/SignupForm";
import {LoginForm} from "@/app/forms/LoginForm";

export const AuthModal = (
    {
        activeTab,
        isLoginModalOpen,
        isSignupModalOpen,
        setActiveTab,
        setIsLoginModalOpen,
        setIsSignupModalOpen
    }:
    {
        activeTab: string,
        isLoginModalOpen: boolean,
        isSignupModalOpen: boolean,
        setActiveTab: (arg: string) => void,
        setIsLoginModalOpen: (arg: boolean) => void,
        setIsSignupModalOpen: (arg: boolean) => void
    }
) => {
    const isOpen = isLoginModalOpen || isSignupModalOpen;
    return (
        <Modal isOpen={isOpen} onClose={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(false);
        }}>
            {activeTab === 'login'
                ? <LoginForm setActiveTab={setActiveTab}/>
                : <SignupForm setActiveTab={setActiveTab}/>
            }
        </Modal>
    );
};