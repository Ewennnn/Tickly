'use client'
import React, {useEffect, useState} from 'react';
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";

interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    role: "ROLE_ADMIN" | "ROLE_USER";
}

const AdminPanelPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoadingUser(true);
                const token = Cookies.get("refreshToken");

                if (!token) {
                    console.warn("Aucun token trouvé");
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
                    console.error("Erreur lors de la récupération de l'utilisateur:", response.status);
                    setUnauthorized(true);
                    return;
                }

                const body: User = await response.json();

                if (body.role !== "ROLE_ADMIN") {
                    console.warn("Utilisateur non autorisé");
                    setUnauthorized(true);
                    return;
                }

                setUser(body);
            } catch (error) {
                console.error("Erreur réseau ou serveur:", error);
                setUnauthorized(true);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser().finally();
    }, []);

    // Redirection si l'utilisateur n'est pas autorisé
    useEffect(() => {
        if (unauthorized) {
            router.push("/");
        }
    }, [unauthorized, router]);

    return (
        <div>
            <h1>Panel Administrateur</h1>
            {loadingUser ? (
                <p>Chargement en cours...</p>
            ) : user ? (
                <div>
                    <p>Bienvenue, {user.name}</p>
                    {/* Ajoute ici les autres informations de l'utilisateur */}
                </div>
            ) : null}
        </div>
    );
};

export default AdminPanelPage;