import React from "react";
import {CustomInput} from "@/app/components/CustomInput";
import {CustomButton} from "@/app/components/CustomButton";
import {primaryColor} from "@/app/globals";

export const LoginForm = (
    { setActiveTab }:
    { setActiveTab: (arg: string) => void }
) => (
    <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>Connexion</h2>
        <div className="space-y-4">
            <CustomInput type="email" label="Email" placeholder="votre@email.com" />
            <CustomInput type="password" label="Mot de passe" placeholder="Mot de passe"/>

            <CustomButton primary={true} fullWidth={true}>
                Se connecter
            </CustomButton>

            <div className="text-center text-sm">
                <a
                    href="#"
                    className="hover:underline"
                    onClick={() => setActiveTab('signup')}
                    style={{ color: primaryColor }}
                >
                    Pas encore de compte ? S'inscrire
                </a>
            </div>
        </div>
    </div>
);