import { motion } from 'framer-motion';
import { GiIndianPalace, GiLotus, GiScrollUnfurled, GiFlame, GiOmega } from 'react-icons/gi';
import { FiHeart, FiBookOpen, FiUsers, FiGlobe } from 'react-icons/fi';
import ScrollReveal from '../components/ScrollReveal';
import DecorativeBorder from '../components/DecorativeBorder';

const values = [
    {
        icon: FiBookOpen,
        title: 'Preservation',
        description: 'Safeguarding ancient stories that have been passed down through generations of oral and written tradition.',
    },
    {
        icon: FiUsers,
        title: 'Accessibility',
        description: 'Making the wisdom of Indian mythology accessible to everyone through modern animated storytelling.',
    },
    {
        icon: FiHeart,
        title: 'Inspiration',
        description: 'Inspiring young minds with tales of courage, wisdom, devotion, and the triumph of dharma.',
    },
    {
        icon: FiGlobe,
        title: 'Global Reach',
        description: 'Sharing India\'s timeless heritage with audiences around the world, bridging cultures through stories.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-24 sm:pt-28">
            {/* Hero */}
            <section className="px-4 mb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <ScrollReveal>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-saffron/10 mb-6"
                        >
                            <GiIndianPalace className="text-4xl text-saffron" />
                        </motion.div>

                        <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                            Our Sacred Mission:
                        </p>
                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-6">
                            Preserving India's
                            <br />
                            <span className="gradient-text">Timeless Heritage</span>
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
                            We believe that the stories of our ancestors carry the deepest truths
                            about life, dharma, and the human spirit. Through the art of animated
                            storytelling, we bring these sacred narratives to a new generation.
                        </p>
                        <div className="decorative-divider max-w-xs mx-auto mt-6">
                            <span className="icon">✦</span>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Mission */}
            <section className="px-4 mb-20 parchment-bg py-16 sm:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal direction="left">
                            <div className="relative">
                                <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop"
                                        alt="Indian Temple"
                                        className="w-full h-80 object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                {/* Floating card */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute -bottom-6 -right-4 sm:right-6 bg-[var(--bg-card)] rounded-xl border border-gold/30 p-4 shadow-xl"
                                >
                                    <p className="text-gold font-heading text-lg">5000+</p>
                                    <p className="text-xs text-[var(--text-muted)]">Years of Stories</p>
                                </motion.div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right">
                            <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                                Why We Exist
                            </p>
                            <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] mb-6">
                                Stories That Shape Souls
                            </h2>
                            <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
                                <p>
                                    India's mythology is not merely a collection of tales — it is a vast
                                    ocean of wisdom, philosophy, and moral teachings that have guided
                                    humanity for thousands of years.
                                </p>
                                <p>
                                    From the selfless devotion of Shravan Kumar to the fearless wisdom
                                    of Nachiketa, from the sacrifice of Eklavya to the enlightenment of
                                    Buddha — each story illuminates a different facet of the human experience.
                                </p>
                                <p>
                                    Our animated storytelling approach brings these ancient narratives to
                                    life with vivid visuals, emotional music, and authentic narration,
                                    making them accessible and engaging for audiences of all ages.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            <DecorativeBorder />

            {/* Values */}
            <section className="px-4 py-20 sm:py-28">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                                What Drives Us
                            </p>
                            <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)] mb-4">
                                Our Core Values
                            </h2>
                            <div className="decorative-divider max-w-xs mx-auto">
                                <span className="icon">✦</span>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        {values.map((value, i) => (
                            <ScrollReveal key={value.title} delay={i * 0.15}>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-saffron/10 mb-4">
                                        <value.icon className="text-xl text-saffron" />
                                    </div>
                                    <h3 className="font-heading text-xl text-[var(--text-primary)] mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <DecorativeBorder />

            {/* Quote */}
            <section className="px-4 py-20 sm:py-28 parchment-bg">
                <div className="max-w-3xl mx-auto text-center">
                    <ScrollReveal>
                        <span className="text-5xl text-gold/40 mb-6 block">ॐ</span>
                        <blockquote className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)] leading-relaxed mb-6">
                            "The stories we tell our children today shape the world they will build tomorrow."
                        </blockquote>
                        <div className="decorative-divider max-w-xs mx-auto">
                            <span className="icon">✦</span>
                        </div>
                        <p className="text-[var(--text-muted)] mt-4 text-sm">
                            — Ancient Indian Wisdom
                        </p>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
