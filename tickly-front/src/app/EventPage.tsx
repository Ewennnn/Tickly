'use client'
import React, {useEffect, useState} from 'react';
import {CustomButton} from "@/app/components/CustomButton";
import {AuthModal} from "@/app/components/AuthModal";
import {primaryColor} from "@/app/globals";
import Cookies from "js-cookie";
import Header from "@/app/components/header/Header";
import EventSlider from "@/app/components/EventSlider";

type Event = {
    id: string
    name: string
    description: string
    date: string
    seats: number
    remainingSeats?: number
    location: string
    images: string[]
}

export const EventsPage = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [loadingUser, setLoadingUser] = useState(false)
    const [reloadUser, setReloadUser] = useState(true)
    const [user, setUser] = useState<any>()

    const [events, setEvents] = useState<Event[]>()

    useEffect(() => {
        (async () => {
            const response = await fetch("http://localhost:3000/events")

            if (response.ok) {
                const body = await response.json()

                console.log(body)
                setEvents(body)
            }
        })()
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            setLoadingUser(true)
            const token = Cookies.get('refreshToken');
            if (token) {
                const response = await fetch("http://localhost:3000/auth/retrieve", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                const body = await response.json()

                if (response.ok) {
                    setUser(body);
                }
            }
            setLoadingUser(false)
        };

        fetchUser().finally();
    }, [reloadUser]);

    const triggerReload = () => {
        setReloadUser(prev => !prev);
    };

    const handleLogout = () => {
        Cookies.remove('refreshToken');
        setUser(null);
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const calculateProgressColor = (total: number, remaining: number) => {
        const percentage = (remaining / total) * 100;
        if (percentage < 20) return "bg-red-500";
        if (percentage < 50) return "bg-orange-400";
        return "bg-green-500";
    };

    const toggleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
        setIsSignupModalOpen(false);
        setActiveTab('login');
    };

    const toggleSignupModal = () => {
        setIsSignupModalOpen(!isSignupModalOpen);
        setIsLoginModalOpen(false);
        setActiveTab('signup');
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header
                user={user}
                loadingUser={loadingUser}
                handleLogout={handleLogout}
                toggleLoginModal={toggleLoginModal}
                toggleSignupModal={toggleSignupModal}
            />


            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8" style={{ color: primaryColor }}>Événements à venir</h1>

                <div className="flex flex-wrap -mx-3">
                    {events?.map((event) => (
                        <div key={event.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-3 mb-6">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-lg transition-all duration-300 flex flex-col">
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200">
                                    <EventSlider images={event.images} />
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>{event.name}</h2>

                                    <div className="mb-4 text-sm text-gray-600">
                                        <div className="flex items-center mb-1">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            {formatDate(event.date)}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            {event.location}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" aria-hidden="true" fill="none" strokeWidth='2' viewBox="0 0 24 24">
                                                <path stroke="currentColor" d="M18.5 12A2.5 2.5 0 0 1 21 9.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2.5a2.5 2.5 0 0 1 0 5V17a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                                            </svg>
                                            <span className="text-medium text-gray-700">
                                                {event.seats} places
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex-grow">
                                        <p className="text-sm text-gray-700">{event.description}</p>
                                    </div>

                                    {/* Places availability */}
                                    <div className="mb-6">
                                        {event.remainingSeats !== undefined ? (
                                            <>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-medium text-gray-700">Places restantes</span>
                                                    <span className="font-medium text-gray-700">
                                            {event.remainingSeats} / {event.seats}
                                        </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className={`h-2.5 rounded-full ${calculateProgressColor(event.seats, event.remainingSeats)}`}
                                                        style={{ width: `${(event.remainingSeats / event.seats) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-red-500">
                                                Le service de tickets est inaccessible
                                            </div>
                                        )}
                                    </div>

                                    <CustomButton
                                        onClick={toggleLoginModal}
                                        primary={true}
                                        fullWidth={true}
                                    >
                                        S'inscrire à l'événement
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="text-white mt-12 py-8" style={{ backgroundColor: primaryColor }}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap">
                        <div className="w-full md:w-1/2 mb-6 md:mb-0">
                            <h3 className="text-xl font-bold mb-4">Tickly</h3>
                            <p className="text-white text-opacity-80">La plateforme idéale pour découvrir et participer à des événements exceptionnels.</p>
                        </div>
                        <div className="w-full md:w-1/2">
                            <div className="flex flex-wrap">
                                <div className="w-1/2">
                                    <h4 className="text-lg font-medium mb-3">À propos</h4>
                                    <ul className="space-y-2 text-white text-opacity-80">
                                        <li><a href="/history" className="hover:text-white">Notre histoire</a></li>
                                        <li><a href="/team" className="hover:text-white">Équipe</a></li>
                                        <li><a href="/career" className="hover:text-white">Carrières</a></li>
                                    </ul>
                                </div>
                                <div className="w-1/2">
                                    <h4 className="text-lg font-medium mb-3">Liens rapides</h4>
                                    <ul className="space-y-2 text-white text-opacity-80">
                                        <li><a href="/contact" className="hover:text-white">Contact</a></li>
                                        <li><a href="/cgu" className="hover:text-white">Conditions d'utilisation</a></li>
                                        <li><a href="/rgpd" className="hover:text-white">Politique de confidentialité</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white border-opacity-20 text-center text-white text-opacity-70 text-sm">
                        &copy; {new Date().getFullYear()} Tickly. Tous droits réservés.
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal
                activeTab={activeTab}
                isLoginModalOpen={isLoginModalOpen}
                isSignupModalOpen={isSignupModalOpen}
                setActiveTab={setActiveTab}
                setIsLoginModalOpen={setIsLoginModalOpen}
                setIsSignupModalOpen={setIsSignupModalOpen}
                triggerReloadUser={triggerReload}
            />
        </div>
    );
};

export default EventsPage;