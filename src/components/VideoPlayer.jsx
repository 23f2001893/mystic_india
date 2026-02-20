import { Suspense, lazy } from 'react';
import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';

export default function VideoPlayer({ videoUrl, thumbnail, title, isComingSoon }) {
    const [isLoaded, setIsLoaded] = useState(false);

    if (isComingSoon) {
        return (
            <div className="video-container relative group overflow-hidden">
                <div className="absolute inset-0 bg-dark-bg">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover opacity-70 grayscale-[0.4] transition-all duration-500"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 text-gold/30">
                            <FiPlay className="text-6xl opacity-20" />
                        </div>
                        <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-2xl border border-gold/20 shadow-2xl">
                            <h3 className="font-heading text-2xl text-gold mb-1">Coming Soon</h3>
                            <p className="text-parchment-dark/70 text-sm">This sacred tale is being prepared...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className="video-container cursor-pointer group"
                onClick={() => setIsLoaded(true)}
            >
                <div className="absolute inset-0 bg-dark-bg">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-saffron/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg glow-saffron">
                            <FiPlay className="text-white text-3xl ml-1" />
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                        <p className="text-white text-sm font-medium drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Click to play the divine story
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="video-container">
            <iframe
                src={`${videoUrl}?autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
            />
        </div>
    );
}
