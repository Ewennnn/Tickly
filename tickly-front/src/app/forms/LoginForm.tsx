import React, {useState} from "react";
import {CustomInput} from "@/app/components/CustomInput";
import {CustomButton} from "@/app/components/CustomButton";
import {primaryColor} from "@/app/globals";
import Cookies from "js-cookie";

export const LoginForm = (
    {
        setIsLoginModalOpen,
        setActiveTab,
        triggerReloadUser,
    }: {
        setIsLoginModalOpen: (arg: boolean) => void
        setActiveTab: (arg: string) => void
        triggerReloadUser: () => void
    }
) => {
    // Déclaration du formulaire
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Déclaration des erreurs
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    // Déclaration de l'état de chargement
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState<string | null>(null);

    // Gestion de l'événement onChange
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Validation du formulaire
    const validateForm = () => {
        const newErrors: any = {};

        // Validation des champs requis
        if (!formData.email) newErrors.email = "L'email est requis.";
        if (!formData.password) newErrors.password = "Le mot de passe est requis.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Soumission du formulaire de connexion
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Si la validation échoue, on arrête la soumission
        }

        setLoading(true); // On active le chargement
        const data = {
            email: formData.email,
            password: formData.password,
        };

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                const { refreshToken } = result;
                Cookies.set("refreshToken", refreshToken, {
                    expires: 7,
                    secure: true,
                    sameSite: "strict",
                });
                // Rediriger ou fermer le modal de connexion
                setIsLoginModalOpen(false); // Exemple de redirection vers la page d'accueil
                triggerReloadUser()
            } else {
                setApiErrors(result.error || "Une erreur est survenue. Essayez à nouveau.");
            }
        } catch (err) {
            console.log(err);
            setApiErrors("Erreur de connexion. Vérifiez votre réseau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                Connexion
            </h2>
            <div className="space-y-4">
                <CustomInput
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    name="email"
                    onChange={handleChange}
                    error={errors.email}
                    disable={loading}
                />
                <CustomInput
                    type="password"
                    label="Mot de passe"
                    placeholder="Mot de passe"
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                    error={errors.password}
                    disable={loading}
                />

                <CustomButton
                    primary={true}
                    fullWidth={true}
                    onClick={handleSubmit}
                    disabled={loading}
                    loading={loading}
                >
                    Se connecter
                </CustomButton>

                {apiErrors && (
                    <div className="text-red-500 text-sm mt-2">
                        {apiErrors}
                    </div>
                )}

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
};