import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiMoon, FiSearch, FiSun, FiMenu, FiX } from 'react-icons/fi';
import { GiIndianPalace } from 'react-icons/gi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import AmbientSoundToggle from './AmbientSoundToggle';
import DecorativeBorder from './DecorativeBorder';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/stories', label: 'Stories' },
    { path: '/about', label: 'About' },
];

export default function Navbar() {
    const { isDark, toggleTheme } = useTheme();
    const { user, isAdmin, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileOpen(false);
        setIsSearchOpen(false);
    }, [location]);

    const visibleNavLinks = [
        ...navLinks,
        ...(isAdmin
            ? [
                { path: '/admin/stories', label: 'Story Admin' },
                { path: '/admin/categories', label: 'Category Admin' },
            ]
            : []),
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                        <GiIndianPalace className="text-saffron text-2xl sm:text-3xl group-hover:rotate-12 transition-transform duration-300" />
                        <div>
                            <h1 className="font-heading text-lg sm:text-xl gradient-text leading-tight">
                                Mystic India
                            </h1>
                            <p className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase hidden sm:block">
                                Stories from the Land of Gods
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {visibleNavLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${location.pathname === link.path
                                        ? 'text-saffron'
                                        : 'text-[var(--text-secondary)] hover:text-saffron hover:bg-saffron/5'
                                    }`}
                            >
                                {link.label}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-saffron rounded-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Search Toggle */}
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/10 transition-all duration-300"
                        >
                            <FiSearch className="text-lg" />
                        </button>

                        {/* Ambient Sound */}
                        <div className="hidden sm:block">
                            <AmbientSoundToggle />
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/10 transition-all duration-300"
                        >
                            {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
                        </button>

                        {user ? (
                            <button
                                onClick={logout}
                                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/10 transition-all duration-300"
                            >
                                <FiLogOut />
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden sm:inline-flex px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/10 transition-all duration-300"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-saffron md:hidden transition-all duration-300"
                        >
                            {isMobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                        </button>
                    </div>
                </div>

                {/* Search Bar Dropdown */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pb-4 overflow-hidden"
                        >
                            <SearchBar onClose={() => setIsSearchOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[var(--bg-card)] border-t border-[var(--border-color)] overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {visibleNavLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${location.pathname === link.path
                                            ? 'bg-saffron/10 text-saffron'
                                            : 'text-[var(--text-secondary)] hover:bg-saffron/5 hover:text-saffron'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {user ? (
                                <button
                                    onClick={logout}
                                    className="block w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-[var(--text-secondary)] hover:bg-saffron/5 hover:text-saffron transition-all duration-300"
                                >
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-saffron/5 hover:text-saffron transition-all duration-300"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-saffron/5 hover:text-saffron transition-all duration-300"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Border */}
            {isScrolled && <DecorativeBorder />}
        </nav>
    );
}
