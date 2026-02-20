import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import {
    GiLotus,
    GiScrollUnfurled,
    GiFlame,
    GiIndianPalace,
    GiGalaxy,
    GiTrident,
    GiBowman,
    GiElephant,
    GiJewelCrown,
    GiDiamondHard,
    GiRead,
    GiCandleFlame
} from 'react-icons/gi';
import ScrollReveal from '../components/ScrollReveal';
import DecorativeBorder from '../components/DecorativeBorder';
import { stories, categories } from '../data/stories';

const categoryIcons = {
    'cosmic-myths': GiGalaxy,
    'legends-gods': GiTrident,
    'heroic-journeys': GiBowman,
    'wisdom-sages': GiScrollUnfurled,
    'divine-love': GiLotus,
    'animals-symbolism': GiElephant,
    'power-responsibility': GiJewelCrown,
    'hidden-gems': GiDiamondHard,
    'modern-lessons': GiRead,
    'festivals': GiCandleFlame,
};

export default function HomePage() {

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-surface to-brown-dark">
                    {/* Floating particles */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gold/30 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.2, 0.8, 0.2],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}

                    {/* Radial glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-saffron/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl animate-float" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    {/* Om Symbol */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="mb-6"
                    >
                        <span className="text-6xl sm:text-7xl text-gold/60">ॐ</span>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-saffron/80 text-sm sm:text-base tracking-[0.3em] uppercase mb-4 font-medium"
                    >
                        Discover the Ancient Tales
                    </motion.p>

                    {/* Main Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-parchment mb-6 leading-tight"
                    >
                        <span className="gradient-text">Mystic India</span>
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="font-heading text-xl sm:text-2xl md:text-3xl text-parchment-dark/80 mb-8"
                    >
                        Stories from the Land of Gods
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="text-parchment-dark/60 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Journey through the timeless tales of devotion, wisdom, and sacrifice
                        that have shaped the soul of Indian civilization for millennia.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.1 }}
                    >
                        <Link
                            to="/stories"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-saffron to-saffron-dark text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg hover:shadow-saffron/30 transition-all duration-300 group glow-saffron"
                        >
                            <FiPlay className="group-hover:scale-110 transition-transform" />
                            Explore Stories
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="mt-16 flex items-center justify-center gap-8 sm:gap-16"
                    >
                        {[
                            { value: '50', label: 'Stories' },
                            { value: '10', label: 'Categories' },
                            { value: '∞', label: 'Wisdom' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl sm:text-3xl font-heading text-gold">{stat.value}</p>
                                <p className="text-xs text-parchment-dark/50 uppercase tracking-widest mt-1">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-gold/30 flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-gold/50 rounded-full" />
                    </div>
                </motion.div>
            </section>


            <DecorativeBorder />

            {/* Categories */}
            <section className="py-20 sm:py-28 px-4">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                                Browse by Theme
                            </p>
                            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] mb-4">
                                Story Categories
                            </h2>
                            <div className="decorative-divider max-w-xs mx-auto">
                                <span className="icon">✦</span>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {categories.map((cat, i) => {
                            const Icon = categoryIcons[cat.id];
                            const count = stories.filter((s) => s.category === cat.id).length;
                            return (
                                <ScrollReveal key={cat.id} delay={i * 0.15}>
                                    <Link
                                        to={`/stories?category=${cat.id}`}
                                        className="group block"
                                    >
                                        <motion.div
                                            whileHover={{ y: -6 }}
                                            className={`relative h-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 sm:p-10 text-center transition-shadow duration-300 hover:shadow-2xl flex flex-col items-center justify-center`}
                                        >
                                            {/* Background gradient */}
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                                            />

                                            <div className="relative z-10 flex flex-col items-center h-full">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-saffron/10 mb-6 group-hover:bg-saffron/20 transition-colors duration-300 shrink-0">
                                                    <Icon className="text-3xl text-saffron" />
                                                </div>

                                                <h3 className="font-heading text-2xl text-[var(--text-primary)] mb-3 group-hover:text-saffron transition-colors">
                                                    {cat.name}
                                                </h3>
                                                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 flex-grow">
                                                    {cat.description}
                                                </p>
                                                <span className="text-xs text-saffron font-medium tracking-wide uppercase mt-auto">
                                                    {count} Stories →
                                                </span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            <DecorativeBorder />

            {/* About Preview */}
            <section className="py-20 sm:py-28 px-4 parchment-bg">
                <div className="max-w-4xl mx-auto text-center">
                    <ScrollReveal>
                        <GiIndianPalace className="text-5xl text-saffron/60 mx-auto mb-6" />
                        <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                            Our Purpose
                        </p>
                        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] mb-6">
                            Preserving Sacred Heritage
                        </h2>
                        <p className="text-[var(--text-muted)] leading-relaxed mb-4 max-w-2xl mx-auto">
                            Through beautifully animated storytelling videos, we bring to life the
                            ancient tales that have shaped Indian civilization. From the Vedas to the
                            Puranas, from the Mahabharata to the Jataka tales — every story carries
                            a moral that transcends time and speaks to the human soul.
                        </p>
                        <p className="text-[var(--text-muted)] leading-relaxed mb-8 max-w-2xl mx-auto">
                            Our mission is to make these timeless stories accessible to the modern
                            world, preserving the wisdom of our ancestors for future generations.
                        </p>
                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 border-2 border-saffron text-saffron px-6 py-3 rounded-xl font-medium hover:bg-saffron hover:text-white transition-all duration-300"
                        >
                            Learn More About Us
                            <FiArrowRight />
                        </Link>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
