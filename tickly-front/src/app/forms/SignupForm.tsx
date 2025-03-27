import React, {useEffect, useState} from "react";
import {CustomInput} from "@/app/components/CustomInput";
import {CustomButton} from "@/app/components/CustomButton";
import {primaryColor} from "@/app/globals";
import Cookies from "js-cookie";

export const SignupForm = (
    {
        setIsSignupModalOpen,
        setActiveTab,
        triggerReloadUser
    }: {
        setIsSignupModalOpen: (arg: boolean) => void
        setActiveTab: (arg: string) => void
        triggerReloadUser: () => void
    }) => {
    // Déclaration du formulaire
    const [formData, setFormData] = useState({
        pseudo: "",
        age: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Déclaration des erreurs
    const [errors, setErrors] = useState({
        pseudo: "",
        age: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Déclaration de l'état de chargement
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [apiErrors, setApiErrors] = useState<string | null>(null);

    // Gestion de l'événement onChange
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (errors) {
            setApiErrors(null)
            validateForm()
        }
    }, [formData]);

    // Validation du formulaire
    const validateForm = () => {
        const newErrors: any = {};

        // Validation des champs requis
        if (!formData.pseudo) newErrors.pseudo = "Le pseudo est requis.";
        if (!formData.age) newErrors.age = "L'âge est requis.";
        if (parseInt(formData.age) < 0) newErrors.age ="L'âge doit être supérieur à 0"
        if (!formData.email) newErrors.email = "L'email est requis.";
        if (!formData.password) newErrors.password = "Le mot de passe est requis.";
        if (!formData.confirmPassword) newErrors.confirmPassword = "La confirmation du mot de passe est requise.";

        // Validation de l'égalité des mots de passe
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Validation de la confirmation du mot de passe
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitted(true)

        if (!validateForm()) {
            return; // Si la validation échoue, on arrête la soumission
        }

        setLoading(true); // On active le chargement
        const data = {
            name: formData.pseudo,
            age: parseInt(formData.age),
            email: formData.email,
            password: formData.password,
        }
        console.log(data)

        try {
            const response = await fetch("http://localhost:3000/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                const loginResponse = await fetch("http://localhost:3000/auth/login", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    })
                })

                if (loginResponse.ok) {
                    const { refreshToken } = await loginResponse.json()
                    Cookies.set('refreshToken', refreshToken, {
                        expires: 7,
                        secure: true,
                        sameSite: "strict"
                    })
                    setIsSignupModalOpen(false)
                    triggerReloadUser()
                } else {
                    setActiveTab('login')
                }

                setLoading(false);
                setIsSubmitted(false);
                setFormData({
                    pseudo: "",
                    age: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            } else {
                setLoading(false);
                setApiErrors(result.error || "Une erreur est survenue. Essayez à nouveau.");
            }
        } catch (err) {
            console.log(err)
            setLoading(false);
            setApiErrors("Erreur de connexion. Vérifiez votre réseau.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                Créer un compte
            </h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                        label="Pseudo"
                        placeholder="JeanDupont"
                        value={formData.pseudo}
                        name="pseudo"
                        onChange={handleChange}
                        disable={loading}
                        error={isSubmitted ? errors.pseudo : undefined}
                    />
                    <CustomInput
                        label="Âge"
                        placeholder="25"
                        type="number"
                        value={formData.age}
                        name="age"
                        onChange={handleChange}
                        disable={loading}
                        error={isSubmitted ? errors.age : undefined}
                    />
                </div>

                <CustomInput
                    label="Email"
                    placeholder="votre@email.com"
                    type="email"
                    value={formData.email}
                    name="email"
                    onChange={handleChange}
                    disable={loading}
                    error={isSubmitted ? errors.email : undefined}
                />
                <CustomInput
                    label="Mot de passe"
                    placeholder="Mot de passe"
                    type="password"
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                    disable={loading}
                    error={isSubmitted ? errors.password : undefined}
                />
                <CustomInput
                    label="Confirmer le mot de passe"
                    placeholder="Confirmer le mot de passe"
                    type="password"
                    value={formData.confirmPassword}
                    name="confirmPassword"
                    onChange={handleChange}
                    disable={loading}
                    error={isSubmitted ? errors.confirmPassword : undefined}
                />

                <CustomButton
                    primary={true}
                    fullWidth={true}
                    onClick={handleSubmit}
                    disabled={loading}
                    loading={loading}
                >
                    S'inscrire
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
                        onClick={() => setActiveTab("login")}
                        style={{ color: primaryColor }}
                    >
                        Déjà un compte ? Se connecter
                    </a>
                </div>
            </div>
        </div>
    );
};