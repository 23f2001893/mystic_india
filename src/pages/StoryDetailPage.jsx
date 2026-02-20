import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBookmark, FiShare2, FiClock } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { GiScrollUnfurled } from 'react-icons/gi';
import VideoPlayer from '../components/VideoPlayer';
import StoryCard from '../components/StoryCard';
import CategoryBadge from '../components/CategoryBadge';
import ScrollReveal from '../components/ScrollReveal';
import DecorativeBorder from '../components/DecorativeBorder';
import { getStoryBySlug, getRelatedStories } from '../data/stories';
import { useBookmarks } from '../hooks/useBookmarks';

export default function StoryDetailPage() {
    const { slug } = useParams();
    const story = getStoryBySlug(slug);
    const { isBookmarked, toggleBookmark } = useBookmarks();

    if (!story) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-6xl mb-4">🪷</p>
                    <h2 className="font-heading text-2xl text-[var(--text-primary)] mb-2">
                        Story Not Found
                    </h2>
                    <p className="text-[var(--text-muted)] mb-6">
                        This tale has yet to be told...
                    </p>
                    <Link
                        to="/stories"
                        className="text-saffron hover:underline inline-flex items-center gap-2"
                    >
                        <FiArrowLeft /> Back to Stories
                    </Link>
                </div>
            </div>
        );
    }

    const relatedStories = getRelatedStories(story.id, 3);

    return (
        <div className="min-h-screen pt-20 sm:pt-24">
            {/* Back Navigation */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <Link
                    to="/stories"
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-saffron transition-colors"
                >
                    <FiArrowLeft /> Back to Stories
                </Link>
            </div>

            {/* Video Player */}
            <section className="max-w-6xl mx-auto px-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]"
                >
                    <VideoPlayer
                        videoUrl={story.videoUrl}
                        thumbnail={story.thumbnail}
                        title={story.title}
                        isComingSoon={story.isComingSoon}
                    />
                </motion.div>
            </section>

            {/* Story Info */}
            <section className="max-w-6xl mx-auto px-4 mb-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <CategoryBadge category={story.category} size="md" />
                                    <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] mt-3">
                                        {story.title}
                                    </h1>
                                    <p className="text-saffron font-medium mt-1">{story.subtitle}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => toggleBookmark(story.id)}
                                        className={`p-3 rounded-xl border transition-all duration-300 ${isBookmarked(story.id)
                                            ? 'bg-saffron/10 border-saffron text-saffron'
                                            : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-saffron hover:text-saffron'
                                            }`}
                                    >
                                        {isBookmarked(story.id) ? <FaBookmark /> : <FiBookmark />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-6">
                                <span className="flex items-center gap-1">
                                    <FiClock className="text-saffron" /> {story.duration}
                                </span>
                                <span>⭐ {story.popularity}% loved</span>
                            </div>

                            <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-8">
                                {story.description}
                            </p>

                            <DecorativeBorder className="mb-8" />

                            {/* Moral of the Story */}
                            <ScrollReveal>
                                <div className="relative rounded-2xl border border-gold/30 bg-gradient-to-br from-saffron/5 to-gold/5 p-6 sm:p-8 mb-10">
                                    <div className="absolute -top-4 left-6 bg-[var(--bg-primary)] px-3">
                                        <span className="font-heading text-lg text-gold flex items-center gap-2">
                                            <GiScrollUnfurled className="text-saffron" />
                                            Moral of the Story
                                        </span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] leading-relaxed italic mt-2 text-lg">
                                        "{story.moral}"
                                    </p>
                                </div>
                            </ScrollReveal>
                        </motion.div>

                        {/* Timeline */}
                        {story.timeline && story.timeline.length > 0 && (
                            <ScrollReveal>
                                <div className="mb-12">
                                    <h2 className="font-heading text-2xl text-[var(--text-primary)] mb-8">
                                        Story Timeline
                                    </h2>
                                    <div className="relative pl-14">
                                        <div className="timeline-line" />
                                        {story.timeline.map((event, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                                className="relative mb-8 last:mb-0"
                                            >
                                                <div className="timeline-dot" style={{ top: '4px' }} />
                                                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 hover:border-saffron/30 transition-colors duration-300">
                                                    <span className="text-xs text-saffron font-mono font-bold">
                                                        {event.time}
                                                    </span>
                                                    <h4 className="font-heading text-lg text-[var(--text-primary)] mt-1">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollReveal>
                        )}
                    </div>

                    {/* Sidebar - Progress */}
                    <div className="lg:w-72 shrink-0">
                        <div className="sticky top-28 space-y-6">
                            {/* Story Progress Card */}
                            {story.timeline && story.timeline.length > 0 && (
                                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                                    <h3 className="font-heading text-lg text-[var(--text-primary)] mb-4">
                                        Story Progress
                                    </h3>
                                    <div className="space-y-3">
                                        {story.timeline.map((event, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div
                                                    className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold ${i === 0
                                                        ? 'bg-saffron text-white'
                                                        : 'bg-[var(--border-color)] text-[var(--text-muted)]'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                                    {event.title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                                <h3 className="font-heading text-lg text-[var(--text-primary)] mb-3">
                                    Quick Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-muted)]">Category</span>
                                        <CategoryBadge category={story.category} size="sm" />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-muted)]">Duration</span>
                                        <span className="text-[var(--text-primary)]">{story.duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-muted)]">Popularity</span>
                                        <span className="text-gold">{story.popularity}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <DecorativeBorder />

            {/* Related Stories */}
            <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                            Continue Your Journey
                        </p>
                        <h2 className="font-heading text-2xl sm:text-3xl text-[var(--text-primary)]">
                            Related Stories
                        </h2>
                        <div className="decorative-divider max-w-xs mx-auto mt-2">
                            <span className="icon">✦</span>
                        </div>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {relatedStories.map((s, i) => (
                        <ScrollReveal key={s.id} delay={i * 0.1}>
                            <StoryCard
                                story={s}
                                isBookmarked={isBookmarked(s.id)}
                                onToggleBookmark={toggleBookmark}
                                index={i}
                            />
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
}
