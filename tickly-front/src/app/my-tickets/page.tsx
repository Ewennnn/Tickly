'use client'
import React, { useState, useEffect } from 'react';
import { TicketIcon, TrashIcon, CalendarIcon } from 'lucide-react';

// Réutilisation des interfaces définies précédemment
interface User {
    id: string;
    name: string;
    email: string;
}

interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
}

interface Ticket {
    id: string;
    userId: string;
    eventId: string;
    bookedAt: string;
    event?: Event;
}

const UserTicketsPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getRefreshToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('refreshToken='))
            ?.split('=')[1];
    };

    useEffect(() => {
        const fetchUserAndTickets = async () => {
            try {
                const token = getRefreshToken();
                if (!token) {
                    setError("Vous devez vous connecter");
                    setLoading(false);
                    return;
                }

                // Récupérer les informations de l'utilisateur
                const userResponse = await fetch("http://localhost:3000/auth/retrieve", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!userResponse.ok) {
                    setError("Échec de la récupération des informations utilisateur");
                    setLoading(false);
                    return;
                }

                const userData: User = await userResponse.json();
                setUser(userData);

                // Récupérer les tickets de l'utilisateur
                const ticketsResponse = await fetch(`http://localhost:3000/ticket?userId=${userData.id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!ticketsResponse.ok) {
                    setError("Échec de la récupération des tickets");
                    setLoading(false);
                    return;
                }

                const ticketsData: Ticket[] = await ticketsResponse.json();
                setTickets(ticketsData);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
                setError("Une erreur est survenue");
                setLoading(false);
            }
        };

        fetchUserAndTickets();
    }, []);

    const cancelTicket = async (ticketId: string) => {
        try {
            const token = getRefreshToken();
            const response = await fetch(`http://localhost:3000/ticket/${ticketId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error('Annulation du ticket échouée');
            }

            // Mettre à jour la liste des tickets
            setTickets(tickets.filter(ticket => ticket.id !== ticketId));
        } catch (error) {
            console.error("Erreur lors de l'annulation du ticket:", error);
            setError("Impossible d'annuler le ticket");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600 text-xl">Chargement en cours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Mes Tickets</h1>

                {user && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-blue-800">Bonjour, {user.name}</h2>
                        <p className="text-blue-600">{user.email}</p>
                    </div>
                )}

                {tickets.length === 0 ? (
                    <div className="text-center py-12 bg-gray-100 rounded-lg">
                        <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">Vous n'avez aucun ticket réservé</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="bg-white border rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <div className="flex items-center mb-2">
                                        <TicketIcon className="h-5 w-5 mr-2 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {ticket.event?.name || 'Événement'}
                                        </h3>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                            {ticket.event ? new Date(ticket.event.date).toLocaleString() : 'Date non disponible (problème front)'}
                                        </p>
                                        <p>{ticket.event?.location || 'Lieu non spécifié (problème front)'}</p>
                                        <p className="text-xs text-gray-500">
                                            Réservé le {new Date(ticket.bookedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => cancelTicket(ticket.id)}
                                    className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-colors"
                                    title="Annuler le ticket"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTicketsPage;