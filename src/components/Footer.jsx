import { Link } from 'react-router-dom';
import { GiIndianPalace } from 'react-icons/gi';
import { FiHeart } from 'react-icons/fi';
import DecorativeBorder from './DecorativeBorder';

const footerLinks = [
    {
        title: 'Explore',
        links: [
            { label: 'All Stories', path: '/stories' },
            { label: 'Devotion', path: '/stories?category=devotion' },
            { label: 'Wisdom', path: '/stories?category=wisdom' },
            { label: 'Sacrifice', path: '/stories?category=sacrifice' },
        ],
    },
    {
        title: 'About',
        links: [
            { label: 'Our Mission', path: '/about' },
            { label: 'Contact', path: '/about' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
            <DecorativeBorder />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <GiIndianPalace className="text-saffron text-3xl" />
                            <div>
                                <h3 className="font-heading text-xl gradient-text">Mystic India</h3>
                                <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">
                                    Stories from the Land of Gods
                                </p>
                            </div>
                        </Link>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
                            Preserving the timeless tales of Indian mythology, culture, and history
                            through beautifully animated storytelling videos. Every story carries
                            a moral that resonates across generations.
                        </p>
                    </div>

                    {/* Links */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-heading text-lg text-saffron mb-4">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.path}
                                            className="text-sm text-[var(--text-muted)] hover:text-saffron transition-colors duration-300"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[var(--text-muted)]">
                        © 2025 Mystic India. All rights reserved.
                    </p>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        Made with <FiHeart className="text-saffron" /> for Indian Heritage
                    </p>
                </div>
            </div>
        </footer>
    );
}
