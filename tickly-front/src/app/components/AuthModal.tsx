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
        setIsSignupModalOpen,
        triggerReloadUser,
        onSuccessfulLogin
    }:
    {
        activeTab: string
        isLoginModalOpen: boolean
        isSignupModalOpen: boolean
        setActiveTab: (arg: string) => void
        setIsLoginModalOpen: (arg: boolean) => void
        setIsSignupModalOpen: (arg: boolean) => void
        triggerReloadUser: () => void
        onSuccessfulLogin?: () => void
    }
) => {
    const isOpen = isLoginModalOpen || isSignupModalOpen;
    return (
        <Modal isOpen={isOpen} onClose={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(false);
        }}>
            {activeTab === 'login'
                ? <LoginForm
                    setIsLoginModalOpen={setIsLoginModalOpen}
                    setActiveTab={setActiveTab}
                    triggerReloadUser={triggerReloadUser}
                    onSuccessfulLogin={onSuccessfulLogin}
                />
                : <SignupForm
                    setIsSignupModalOpen={setIsSignupModalOpen}
                    setActiveTab={setActiveTab}
                    triggerReloadUser={triggerReloadUser}
                />
            }
        </Modal>
    );
};

// export const AuthModal = (
//     {
//         activeTab,
//         isLoginModalOpen,
//         isSignupModalOpen,
//         setActiveTab,
//         setIsLoginModalOpen,
//         setIsSignupModalOpen,
//         triggerReloadUser,
//     }:
//     {
//         activeTab: string
//         isLoginModalOpen: boolean
//         isSignupModalOpen: boolean
//         setActiveTab: (arg: string) => void
//         setIsLoginModalOpen: (arg: boolean) => void
//         setIsSignupModalOpen: (arg: boolean) => void
//         triggerReloadUser: () => void
//     }
// ) => {
//     const isOpen = isLoginModalOpen || isSignupModalOpen;
//     return (
//         <Modal isOpen={isOpen} onClose={() => {
//             setIsLoginModalOpen(false);
//             setIsSignupModalOpen(false);
//         }}>
//             {activeTab === 'login'
//                 ? <LoginForm setIsLoginModalOpen={setIsLoginModalOpen} setActiveTab={setActiveTab} triggerReloadUser={triggerReloadUser}/>
//                 : <SignupForm setIsSignupModalOpen={setIsSignupModalOpen} setActiveTab={setActiveTab} triggerReloadUser={triggerReloadUser}/>
//             }
//         </Modal>
//     );
// };