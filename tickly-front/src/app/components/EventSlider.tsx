import React, { useState } from "react";

const EventSlider = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

    const prevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        }
    };

    return (
        <div className="relative h-48 bg-gray-200 overflow-hidden">
            {/* Container for all images */}
            <div
                className="transition-transform duration-500 ease-in-out flex"
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`, // Défilement horizontal des images
                }}
            >
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Event Image ${index + 1}`}
                        className="w-full h-full object-cover inline-block"
                    />
                ))}
            </div>

            {/* Prev Button - Only visible if not at the first image */}
            {currentIndex > 0 && (
                <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white p-2 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 hover:translate-x-1"
                    style={{ zIndex: 10 }}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
            )}

            {/* Next Button - Only visible if not at the last image */}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110 hover:translate-x-1"
                    style={{ zIndex: 10 }}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default EventSlider;