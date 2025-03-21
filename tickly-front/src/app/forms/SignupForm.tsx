import React from "react";
import {CustomInput} from "@/app/components/CustomInput";
import {CustomButton} from "@/app/components/CustomButton";
import {primaryColor} from "@/app/globals";

export const SignupForm = (
    { setActiveTab }:
    { setActiveTab: (arg: string) => void }
) => (
    <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>Créer un compte</h2>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <CustomInput label="Prénom" placeholder="Jean" />
                <CustomInput label="Nom" placeholder="Dupont" />
            </div>

            <CustomInput type="email" label="Email" placeholder="votre@email.com" />
            <CustomInput type="password" label="Mot de passe" placeholder="Mot de passe"/>
            <CustomInput type="password" label="Confirmer le mot de passe" placeholder="Mot de passe"/>

            <CustomButton primary={true} fullWidth={true}>
                S'inscrire
            </CustomButton>

            <div className="text-center text-sm">
                <a
                    href="#"
                    className="hover:underline"
                    onClick={() => setActiveTab('login')}
                    style={{ color: primaryColor }}
                >
                    Déjà un compte ? Se connecter
                </a>
            </div>
        </div>
    </div>
);