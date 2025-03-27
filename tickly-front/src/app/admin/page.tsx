'use client'
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, User, Calendar, Plus, Lock, TicketIcon } from 'lucide-react';

// Interfaces remain the same (no change)
interface User {
    id: string;
    name: string;
    age: number;
    email: string;
    role: "ROLE_ADMIN" | "ROLE_USER";
}

interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    seats: number;
    location: string;
    images: string[];
    isActive: boolean;
    remainingSeats?: number;
}

interface Ticket {
    id: string;
    userId: string;
    eventId: string;
    bookedAt: string;
    user?: User;
    event?: Event;
}

const AdminPanelPage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedItem, setSelectedItem] = useState<User | Event | null>(null);
    const [modalType, setModalType] = useState<"user" | "event" | null>(null);
    const [activeTab, setActiveTab] = useState<"users" | "events" | "tickets">("users");
    const [newPassword, setNewPassword] = useState<string>('');

    const getRefreshToken = () => {
        return document.cookie.split('; ').find(row => row.startsWith('refreshToken='))
            ?.split('=')[1];
    };

    const navigateHome = () => {
        window.location.href = "/";
    };

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
                const body: User = await response.json();
                if (body.role !== "ROLE_ADMIN") {
                    setUnauthorized(true);
                    return;
                }
                setUser(body);
            } catch (error) {
                setUnauthorized(true);
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (unauthorized) {
            navigateHome();
        }
    }, [unauthorized]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, eventsRes, ticketsRes] = await Promise.all([
                    fetch("http://localhost:3000/users"),
                    fetch("http://localhost:3000/events/all"),
                    fetch("http://localhost:3000/ticket"),
                ]);
                const fetchedUsers = await usersRes.json();
                const fetchedEvents = await eventsRes.json();
                const fetchedTickets = await ticketsRes.json();

                // Enrich tickets with user and event details
                const enrichedTickets = fetchedTickets.map((ticket: Ticket) => ({
                    ...ticket,
                    user: fetchedUsers.find((user: User) => user.id === ticket.userId),
                    event: fetchedEvents.find((event: Event) => event.id === ticket.eventId)
                }));

                setUsers(fetchedUsers);
                setEvents(fetchedEvents);
                setTickets(enrichedTickets);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            }
        };
        fetchData();
    }, []);

    // Function to delete a ticket
    const deleteTicket = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/ticket/${id}`, { method: "DELETE" });
            setTickets(tickets.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression du ticket:", error);
        }
    };

    // Render ticket list
    const renderTicketList = () => (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center">
                <TicketIcon className="mr-2 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Tickets</h2>
            </div>
            {tickets.map((ticket) => (
                <div
                    key={ticket.id}
                    className="flex justify-between items-center border-b p-4 hover:bg-gray-50 transition-colors"
                >
                    <div>
                        <p className="font-medium">
                            Ticket #{ticket.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500">
                            Réservé le {new Date(ticket.bookedAt).toLocaleString()}
                        </p>
                        {ticket.user && (
                            <p className="text-sm text-gray-600">
                                Utilisateur: {ticket.user.name} ({ticket.user.email})
                            </p>
                        )}
                        {ticket.event && (
                            <p className="text-sm text-gray-600">
                                Événement: {ticket.event.name}
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const deleteUser = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/user/${id}`, { method: "DELETE" });
            setUsers(users.filter((u) => u.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/events/${id}`, { method: "DELETE" });
            setEvents(events.filter((e) => e.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression de l'événement:", error);
        }
    };

    const openModal = (item: User | Event, type: "user" | "event") => {
        // Créer une copie profonde pour éviter de modifier directement l'état
        setSelectedItem(JSON.parse(JSON.stringify(item)));
        setModalType(type);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setModalType(null);
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;

        try {
            let url = '';
            let body: any = { ...selectedItem };

            if (modalType === "user") {
                url = "http://localhost:3000/user";
                // Only include password if it's not empty
                if (newPassword) {
                    body.password = newPassword;
                }
                // Remove unnecessary fields
                delete body.age;
                delete body.email;
                delete body.role;
            } else if (modalType === "event") {
                url = "http://localhost:3000/events";
                // Remove unnecessary fields
                delete body.remainingSeats;
            }

            const response = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Mise à jour échouée');
            }

            // Mise à jour de l'état local en fonction du type
            if (modalType === "user") {
                setUsers(users.map(u =>
                    u.id === selectedItem.id
                        ? { ...u, name: selectedItem.name }
                        : u
                ));
            } else {
                setEvents(events.map(e =>
                    e.id === selectedItem.id
                        ? { ...selectedItem as Event }
                        : e
                ));
            }

            // Reset password field
            setNewPassword('');
            closeModal();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            // Optionnel : afficher un message d'erreur à l'utilisateur
        }
    };


    const renderUserList = () => (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center">
                <User className="mr-2 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Utilisateurs</h2>
            </div>
            {users.map((u) => (
                <div
                    key={u.id}
                    className="flex justify-between items-center border-b p-4 hover:bg-gray-50 transition-colors"
                >
                    <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <span className={`
                            inline-block px-2 py-1 rounded-full text-xs
                            ${u.role === "ROLE_ADMIN" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}
                        `}>
                            {u.role}
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => openModal(u, "user")}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => deleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderEditModal = () => {
        if (!modalType || !selectedItem) return null;

        return (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                    <h2 className="text-xl font-semibold mb-4">
                        Modifier {modalType === "user" ? "Utilisateur" : "Événement"}
                    </h2>
                    <div className="space-y-4">
                        {/* Champs communs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                type="text"
                                value={selectedItem.name}
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, name: e.target.value} : null
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                                placeholder="Nom"
                            />
                        </div>

                        {/* Champs spécifiques aux utilisateurs */}
                        {modalType === "user" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <Lock className="mr-2 h-4 w-4 text-gray-500" />
                                    Nouveau Mot de Passe
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full p-2 border rounded-md"
                                    placeholder="Laisser vide si pas de changement"
                                />
                            </div>
                        )}

                        {/* Champs spécifiques aux événements */}
                        {modalType === "event" && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={(selectedItem as Event).description}
                                        onChange={(e) => setSelectedItem(prev =>
                                            prev ? {...prev, description: e.target.value} : null
                                        )}
                                        className="mt-1 block w-full p-2 border rounded-md"
                                        placeholder="Description de l'événement"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="datetime-local"
                                        value={(selectedItem as Event).date
                                            ? new Date(selectedItem.date).toISOString().slice(0, 16)
                                            : ''
                                        }
                                        onChange={(e) => setSelectedItem(prev =>
                                            prev ? {...prev, date: new Date(e.target.value).toISOString()} : null
                                        )}
                                        className="mt-1 block w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre de Places</label>
                                    <input
                                        type="number"
                                        value={(selectedItem as Event).seats}
                                        onChange={(e) => setSelectedItem(prev =>
                                            prev ? {...prev, seats: parseInt(e.target.value)} : null
                                        )}
                                        className="mt-1 block w-full p-2 border rounded-md"
                                        placeholder="Nombre de places"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lieu</label>
                                    <input
                                        type="text"
                                        value={(selectedItem as Event).location}
                                        onChange={(e) => setSelectedItem(prev =>
                                            prev ? {...prev, location: e.target.value} : null
                                        )}
                                        className="mt-1 block w-full p-2 border rounded-md"
                                        placeholder="Lieu de l'événement"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Images (URLs séparées par des virgules)</label>
                                    <input
                                        type="text"
                                        value={(selectedItem as Event).images?.join(',') || ''}
                                        onChange={(e) => setSelectedItem(prev =>
                                            prev ? {...prev, images: e.target.value.split(',').map(url => url.trim())} : null
                                        )}
                                        className="mt-1 block w-full p-2 border rounded-md"
                                        placeholder="URLs des images, séparées par des virgules"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={(selectedItem as Event).isActive}
                                        onChange={(e) => setSelectedItem(prev =>
                                            prev ? {...prev, isActive: e.target.checked} : null
                                        )}
                                        className="mr-2"
                                        id="isActiveCheckbox"
                                    />
                                    <label htmlFor="isActiveCheckbox" className="text-sm text-gray-700">
                                        Événement actif
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const createEvent = async () => {
        if (!selectedItem) return;

        try {
            const response = await fetch("http://localhost:3000/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedItem),
            });

            if (!response.ok) {
                throw new Error('Création de l\'événement échouée');
            }

            const newEvent = await response.json();
            setEvents([...events, newEvent]);
            closeModal();
        } catch (error) {
            console.error("Erreur lors de la création de l'événement:", error);
            // Optionnel : afficher un message d'erreur à l'utilisateur
        }
    };

    const renderCreateEventModal = () => {
        if (modalType !== "create-event") return null;

        return (
            <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                    <h2 className="text-xl font-semibold mb-4">Créer un Événement</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                type="text"
                                value={(selectedItem as Event)?.name || ''}
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, name: e.target.value} : {
                                        name: e.target.value,
                                        description: '',
                                        date: '',
                                        seats: 0,
                                        location: '',
                                        images: [],
                                        isActive: true
                                    }
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                                placeholder="Nom de l'événement"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={(selectedItem as Event)?.description || ''}
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, description: e.target.value} : {
                                        name: '',
                                        description: e.target.value,
                                        date: '',
                                        seats: 0,
                                        location: '',
                                        images: [],
                                        isActive: true
                                    }
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                                placeholder="Description de l'événement"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                type="datetime-local"
                                value={(selectedItem as Event)?.date ?
                                    new Date(selectedItem.date).toISOString().slice(0, 16) :
                                    ''
                                }
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, date: new Date(e.target.value).toISOString()} : {
                                        name: '',
                                        description: '',
                                        date: new Date(e.target.value).toISOString(),
                                        seats: 0,
                                        location: '',
                                        images: [],
                                        isActive: true
                                    }
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre de Places</label>
                            <input
                                type="number"
                                value={(selectedItem as Event)?.seats || 0}
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, seats: parseInt(e.target.value)} : {
                                        name: '',
                                        description: '',
                                        date: '',
                                        seats: parseInt(e.target.value),
                                        location: '',
                                        images: [],
                                        isActive: true
                                    }
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                                placeholder="Nombre de places"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lieu</label>
                            <input
                                type="text"
                                value={(selectedItem as Event)?.location || ''}
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, location: e.target.value} : {
                                        name: '',
                                        description: '',
                                        date: '',
                                        seats: 0,
                                        location: e.target.value,
                                        images: [],
                                        isActive: true
                                    }
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                                placeholder="Lieu de l'événement"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Images (URLs séparées par des virgules)</label>
                            <input
                                type="text"
                                value={(selectedItem as Event)?.images?.join(',') || ''}
                                onChange={(e) => setSelectedItem(prev =>
                                    prev ? {...prev, images: e.target.value.split(',').map(url => url.trim())} : {
                                        name: '',
                                        description: '',
                                        date: '',
                                        seats: 0,
                                        location: '',
                                        images: e.target.value.split(',').map(url => url.trim()),
                                        isActive: true
                                    }
                                )}
                                className="mt-1 block w-full p-2 border rounded-md"
                                placeholder="URLs des images, séparées par des virgules"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={createEvent}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Créer
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderEventList = () => (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Événements</h2>
                </div>
                <button
                    onClick={() => {
                        setSelectedItem(null);
                        setModalType("create-event");
                    }}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>
            {events.map((e) => (
                // Existing event rendering code remains the same
                <div
                    key={e.id}
                    className="flex justify-between items-center border-b p-4 hover:bg-gray-50 transition-colors"
                >
                    <div>
                        <p className="font-medium">{e.name}</p>
                        <p className="text-sm text-gray-500">{e.date}</p>
                        <span className={`
                            inline-block px-2 py-1 rounded-full text-xs
                            ${e.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        `}>
                            {e.isActive ? "Actif" : "Inactif"}
                        </span>
                        <p className="text-sm text-gray-500">
                            Places: {e.remainingSeats || e.seats} / {e.seats}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => openModal(e, "event")}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => deleteEvent(e.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    // Existing code for rendering edit modal remains the same

    // Modify the return statement to include the create event modal
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="container mx-auto max-w-4xl bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Panel Administrateur</h1>

                {loadingUser ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-600">Chargement en cours...</p>
                    </div>
                ) : unauthorized ? (
                    <div className="bg-black/30 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">Vous n'êtes pas autorisé à accéder à cette page.</span>
                    </div>
                ) : user ? (
                    <div>
                        <div className="flex mb-4 border-b">
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`
                                px-4 py-2 -mb-px border-b-2 
                                ${activeTab === "users"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"}
                            `}
                            >
                                Utilisateurs
                            </button>
                            <button
                                onClick={() => setActiveTab("events")}
                                className={`
                                px-4 py-2 -mb-px border-b-2 
                                ${activeTab === "events"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"}
                            `}
                            >
                                Événements
                            </button>
                            <button
                                onClick={() => setActiveTab("tickets")}
                                className={`
                                px-4 py-2 -mb-px border-b-2 
                                ${activeTab === "tickets"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"}
                            `}
                            >
                                Tickets
                            </button>
                        </div>

                        {activeTab === "users" && renderUserList()}
                        {activeTab === "events" && renderEventList()}
                        {activeTab === "tickets" && renderTicketList()}
                    </div>
                ) : null}

                {renderEditModal()}
                {renderCreateEventModal()}
            </div>
        </div>
    );
};

export default AdminPanelPage;