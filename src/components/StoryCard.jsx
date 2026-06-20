import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiBookmark, FiClock } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import CategoryBadge from './CategoryBadge';

export default function StoryCard({ story, isBookmarked, onToggleBookmark, index = 0, viewMode = 'grid' }) {
    const isList = viewMode === 'list';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: isList ? 0 : -8, x: isList ? 8 : 0, transition: { duration: 0.3 } }}
            className={`group relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg hover:shadow-2xl transition-all duration-300 ${isList ? 'flex flex-col sm:flex-row' : ''}`}
        >
            {/* Thumbnail */}
            <div className={`relative overflow-hidden ${isList ? 'h-56 sm:h-auto sm:w-80 shrink-0' : 'h-48'}`}>
                <img
                    src={story.thumbnail}
                    alt={story.title}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${story.isComingSoon ? 'grayscale-[0.4] opacity-80' : ''}`}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Duration badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <FiClock className="text-gold text-xs" />
                    <span className="text-white text-xs font-medium">{story.duration}</span>
                </div>

                {/* Bookmark button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleBookmark?.(story.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-saffron/80 transition-all duration-300"
                >
                    {isBookmarked ? (
                        <FaBookmark className="text-gold text-sm" />
                    ) : (
                        <FiBookmark className="text-white text-sm" />
                    )}
                </button>

                {/* Category badge - hidden on mobile list view if redundant */}
                <div className={`absolute bottom-3 right-3 ${isList ? 'hidden sm:flex' : 'flex'}`}>
                    {story.isComingSoon && (
                        <span className="rounded-full bg-saffron/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                            Coming Soon
                        </span>
                    )
                }
                </div>
            </div>

            {/* Content */}
            <div className={`flex flex-col flex-1 ${isList ? 'p-6 sm:p-8' : 'p-5'}`}>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <Link to={`/story/${story.slug}`} className="flex-1">
                            <h3 className={`font-heading text-[var(--text-primary)] group-hover:text-saffron transition-colors duration-300 ${isList ? 'text-2xl mb-2' : 'text-xl mb-1'}`}>
                                {story.title}
                            </h3>
                        </Link>
                        {isList && (
                            <div className="hidden sm:block">
                                {story.isComingSoon && (
                                    <span className="rounded-full bg-saffron/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-saffron">
                                        Coming Soon
                                    </span>
                                ) }
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-saffron font-medium mb-3 tracking-wide uppercase">
                        {story.subtitle}
                    </p>
                    <p className={`text-[var(--text-muted)] leading-relaxed ${isList ? 'text-base mb-6 line-clamp-3' : 'text-sm mb-4 line-clamp-2'}`}>
                        {story.description}
                    </p>
                </div>

                {/* Decorative bottom border */}
                <div className={`pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-4 mt-auto`}>
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="text-xs text-[var(--text-muted)]">
                            ⭐ {story.popularity}% popularity
                        </span>
                        {isList && story.moral && (
                            <span className="hidden lg:inline text-xs italic text-[var(--text-muted)] border-l border-[var(--border-color)] pl-4">
                                "{story.moral}"
                            </span>
                        )}
                    </div>
                    <Link to={`/story/${story.slug}`} className="shrink-0 text-xs font-medium text-saffron group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                        {story.isComingSoon ? 'Details →' : 'Watch Story →'}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
