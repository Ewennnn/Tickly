'use client'
import React, { useState, useEffect } from 'react';
import { User, Lock, Mail } from 'lucide-react';

// Interface for user details
interface User {
    id: string;
    name: string;
    email: string;
    role: "ROLE_ADMIN" | "ROLE_USER";
}

const AccountPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Feedback and error states
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Retrieve refresh token from cookies
    const getRefreshToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('refreshToken='))
            ?.split('=')[1];
    };

    // Fetch user details on component mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoadingUser(true);
                const token = getRefreshToken();
                if (!token) {
                    setUnauthorized(true);
                    return;
                }
                const response = await fetch("http://localhost:3000/auth/retrieve", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    setUnauthorized(true);
                    return;
                }
                const userData: User = await response.json();
                setUser(userData);

                // Populate form with current user details
                setName(userData.name);
                setEmail(userData.email);
            } catch (error) {
                setUnauthorized(true);
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, []);

    // Handle account update
    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset previous messages
        setSuccessMessage('');
        setErrorMessage('');

        // Validation
        if (!name.trim()) {
            setErrorMessage('Le nom ne peut pas être vide.');
            return;
        }

        // Prepare update payload
        const updatePayload: any = {
            id: user?.id,
            name: name.trim(),
            email: email.trim()
        };

        // Password update logic
        if (newPassword) {
            // Validate password match
            if (newPassword !== confirmPassword) {
                setErrorMessage('Les nouveaux mots de passe ne correspondent pas.');
                return;
            }

            // Require current password for password change
            if (!currentPassword) {
                setErrorMessage('Veuillez saisir votre mot de passe actuel pour changer de mot de passe.');
                return;
            }

            updatePayload.currentPassword = currentPassword;
            updatePayload.password = newPassword;
        }

        try {
            const response = await fetch("http://localhost:3000/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getRefreshToken()}`
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour du compte');
            }

            // Success handling
            setSuccessMessage('Compte mis à jour avec succès.');

            // Reset password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Optionally update user state
            setUser(prev => prev ? {...prev, name, email} : null);
        } catch (error: any) {
            setErrorMessage(error.message || 'Une erreur est survenue.');
        }
    };

    // Redirect to home if unauthorized
    useEffect(() => {
        if (unauthorized) {
            window.location.href = "/";
        }
    }, [unauthorized]);

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Chargement en cours...</p>
            </div>
        );
    }

    if (unauthorized) {
        return null; // Redirection handled by useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="container mx-auto max-w-md bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                    <User className="mr-3 text-gray-600" />
                    Gestion du Compte
                </h1>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleUpdateAccount} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-500" />
                            Nom
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            placeholder="Votre nom"
                            required
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-gray-500" />
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            placeholder="Votre email"
                            required
                        />
                    </div>

                    {/* Current Password Input */}
                    <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 flex items-center">
                            <Lock className="mr-2 h-4 w-4 text-gray-500" />
                            Mot de passe actuel (requis pour les changements)
                        </label>
                        <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            placeholder="Mot de passe actuel"
                        />
                    </div>

                    {/* New Password Input */}
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 flex items-center">
                            <Lock className="mr-2 h-4 w-4 text-gray-500" />
                            Nouveau mot de passe (optionnel)
                        </label>
                        <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            placeholder="Nouveau mot de passe"
                        />
                    </div>

                    {/* Confirm New Password Input */}
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 flex items-center">
                            <Lock className="mr-2 h-4 w-4 text-gray-500" />
                            Confirmer le nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            placeholder="Confirmer le nouveau mot de passe"
                        />
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Mettre à jour le compte
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountPage;