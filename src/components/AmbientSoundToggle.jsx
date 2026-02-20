import { useState, useRef, useEffect } from 'react';
import { GiIndianPalace } from 'react-icons/gi';
import { IoMusicalNotes, IoMusicalNotesOutline } from 'react-icons/io5';

export default function AmbientSoundToggle() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Create audio context with oscillator for ambient sound
        // Using a simple tone since we can't load external audio
        return () => {
            if (audioRef.current) {
                audioRef.current.close();
            }
        };
    }, []);

    const toggleSound = async () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.close();
                audioRef.current = null;
            }
            setIsPlaying(false);
        } else {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(220, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.03, ctx.currentTime);

                // Create a gentle ambient pulse
                gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
                gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 4);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.start();

                audioRef.current = ctx;
                setIsPlaying(true);
            } catch (err) {
                console.log('Audio not available');
            }
        }
    };

    return (
        <button
            onClick={toggleSound}
            className={`p-2 rounded-lg transition-all duration-300 ${isPlaying
                    ? 'bg-saffron/20 text-saffron glow-saffron'
                    : 'text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/10'
                }`}
            title={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
        >
            {isPlaying ? (
                <IoMusicalNotes className="text-lg" />
            ) : (
                <IoMusicalNotesOutline className="text-lg" />
            )}
        </button>
    );
}
