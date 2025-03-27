import React from 'react';
import { CustomButton } from '@/app/components/CustomButton';

interface AuthButtonsProps {
    toggleLoginModal: () => void;
    toggleSignupModal: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ toggleLoginModal, toggleSignupModal }) => {
    return (
        <>
            <CustomButton onClick={toggleLoginModal} primary={false}>
                Connexion
            </CustomButton>
            <CustomButton
                onClick={toggleSignupModal}
                primary={true}
            >
                S'inscrire
            </CustomButton>
        </>
    );
};

export default AuthButtons;