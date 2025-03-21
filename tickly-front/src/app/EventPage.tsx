'use client'
import React, {useState} from 'react';
import {CustomButton} from "@/app/components/CustomButton";
import {AuthModal} from "@/app/components/AuthModal";
import {primaryColor} from "@/app/globals";

const EventsPage = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('login');

    // Exemple de données d'événements
    const events = [
        {
            id: 1,
            title: "Concert de Jazz",
            date: "2025-04-15T19:30:00",
            location: "Salle Apollo, Paris",
            totalSeats: 200,
            remainingSeats: 45,
            images: ["https://media.istockphoto.com/id/1806011581/fr/photo/des-jeunes-gens-heureux-et-ravis-de-danser-de-sauter-et-de-chanter-pendant-le-concert-de-leur.jpg?s=612x612&w=0&k=20&c=d1GQ5j33_Ie7DBUM0gTxQcaPhkEIQxkBlWO0TLNPB8M="],
            description: "Un soir de jazz avec les meilleurs musiciens de la scène parisienne."
        },
        {
            id: 2,
            title: "Atelier Photographie",
            date: "2025-04-22T10:00:00",
            location: "Studio Lumière, Lyon",
            totalSeats: 30,
            remainingSeats: 8,
            images: ["https://media.istockphoto.com/id/1319479588/fr/photo/les-musiciens-jouaient-de-la-musique-rock-sur-sc%C3%A8ne-il-y-avait-un-public-plein-de-gens-qui.jpg?s=612x612&w=0&k=20&c=nYGHPpQaqhsZj_uR4NbNQBnQalQOgVWFtryyJDscupo="],
            description: "Apprenez les techniques de photographie professionnelle lors de cet atelier interactif."
        },
        {
            id: 3,
            title: "Festival de Cuisine",
            date: "2025-05-10T11:00:00",
            location: "Parc des Expositions, Bordeaux",
            totalSeats: 500,
            remainingSeats: 213,
            images: ["https://media.istockphoto.com/id/874747066/fr/photo/foule-festival-de-musique-de.jpg?s=612x612&w=0&k=20&c=-MVjqx4YdZT4UTF8KG75wr8dfzGrGeMHQc0gK5zulu8="],
            description: "Dégustations, démonstrations et ateliers avec des chefs renommés."
        },
        {
            id: 4,
            title: "Exposition d'Art Contemporain",
            date: "2025-04-18T10:00:00",
            location: "Galerie Moderne, Toulouse",
            totalSeats: 150,
            remainingSeats: 72,
            images: ["https://media.istockphoto.com/id/1331434818/fr/photo/groupe-damis-dansant-lors-dun-concert.jpg?s=612x612&w=0&k=20&c=YJ2PWI-L--8nzSdVIic2JKou8UdXAOLLuTkKJq8SjxE="],
            description: "Découvrez les œuvres des artistes contemporains les plus prometteurs de la région."
        },
        {
            id: 5,
            title: "Conférence Tech",
            date: "2025-05-05T09:00:00",
            location: "Centre de Congrès, Nantes",
            totalSeats: 350,
            remainingSeats: 124,
            images: ["https://media.istockphoto.com/id/1137781483/fr/photo/guitariste-m%C3%A2le-noir-chantant-et-jouant-la-guitare-acoustique-sur-la-sc%C3%A8ne.jpg?s=612x612&w=0&k=20&c=izt7gW0nmXVO4HTwSJn6YnLY-dG2BCYOcRn88HQZvzc="],
            description: "Les dernières innovations technologiques présentées par des experts du domaine."
        },
        {
            id: 6,
            title: "Spectacle de Danse",
            date: "2025-04-28T20:00:00",
            location: "Théâtre Municipal, Lille",
            totalSeats: 180,
            remainingSeats: 35,
            images: ["https://media.istockphoto.com/id/1464613356/fr/photo/le-chanteur-ferme-les-yeux-en-se-produisant-sur-sc%C3%A8ne-avec-un-groupe.jpg?s=612x612&w=0&k=20&c=6UZKzm7yFJX5c_Br5u8jpWGcubBkN7thXasrL1HUXUw="],
            description: "Une soirée exceptionnelle de danse contemporaine avec des artistes internationaux."
        }
    ];

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
            <header className="shadow-md" style={{ backgroundColor: primaryColor }}>
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-white">Tickly</div>
                    <div className="flex space-x-4">
                        <CustomButton
                            onClick={toggleLoginModal}
                            primary={false}
                        >
                            Connexion
                        </CustomButton>
                        <CustomButton
                            onClick={toggleSignupModal}
                            primary={true}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                        >
                            S'inscrire
                        </CustomButton>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8" style={{ color: primaryColor }}>Événements à venir</h1>

                <div className="flex flex-wrap -mx-3">
                    {events.map((event) => (
                        <div key={event.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-3 mb-6">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-lg transition-all duration-300 flex flex-col">
                                {/* Image */}
                                <div className="relative h-48 bg-gray-200">
                                    <img
                                        src={event.images[0]}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>{event.title}</h2>

                                    <div className="mb-4 text-sm text-gray-600">
                                        <div className="flex items-center mb-1">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            {formatDate(event.date)}
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            {event.location}
                                        </div>
                                    </div>

                                    <div className="mb-4 flex-grow">
                                        <p className="text-sm text-gray-700">{event.description}</p>
                                    </div>

                                    {/* Places availability */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-medium text-gray-700">Places disponibles</span>
                                            <span className="font-medium text-gray-700">{event.remainingSeats} / {event.totalSeats}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${calculateProgressColor(event.totalSeats, event.remainingSeats)}`}
                                                style={{ width: `${(event.remainingSeats / event.totalSeats) * 100}%` }}
                                            ></div>
                                        </div>
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
            />
        </div>
    );
};

export default EventsPage;