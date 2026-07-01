import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList } from 'react-icons/fi';
import StoryCard from '../components/StoryCard';
import ScrollReveal from '../components/ScrollReveal';
import { useStoriesData } from '../hooks/useStoriesData';
import { useBookmarks } from '../hooks/useBookmarks';

const statusOptions = [
    { value: 'all', label: 'All Stories' },
    { value: 'published', label: 'Watch Now' },
    { value: 'coming-soon', label: 'Coming Soon' },
];

export default function StoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'all';
    const activeStatus = searchParams.get('status') || 'all';
    const [viewMode, setViewMode] = useState('grid');
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { stories, categories, loading, error } = useStoriesData({
        category: activeCategory,
        sort: 'popular',
    });
    const totalStoryCount = categories.reduce((sum, category) => sum + (category.storyCount ?? 0), 0);

    const setCategory = (cat) => {
        const nextParams = new URLSearchParams(searchParams);
        if (cat === 'all') {
            nextParams.delete('category');
        } else {
            nextParams.set('category', cat);
        }
        setSearchParams(nextParams);
    };

    const setStatus = (status) => {
        const nextParams = new URLSearchParams(searchParams);
        if (status === 'all') {
            nextParams.delete('status');
        } else {
            nextParams.set('status', status);
        }
        setSearchParams(nextParams);
    };

    const filteredStories = useMemo(() => {
        if (activeStatus === 'published') {
            return stories.filter((story) => !story.isComingSoon);
        }

        if (activeStatus === 'coming-soon') {
            return stories.filter((story) => story.isComingSoon);
        }

        return stories;
    }, [activeStatus, stories]);

    return (
        <div className="min-h-screen pt-24 sm:pt-28">
            {/* Header */}
            <section className="px-4 mb-12">
                <div className="max-w-7xl mx-auto text-center">
                    <ScrollReveal>
                        <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-3 font-medium">
                            Video Gallery
                        </p>
                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--text-primary)] mb-4">
                            Explore All Stories
                        </h1>
                        <p className="text-[var(--text-muted)] max-w-xl mx-auto text-sm sm:text-base">
                            Discover tales of devotion, wisdom, and sacrifice from the rich tapestry
                            of Indian mythology and history.
                        </p>
                        <div className="decorative-divider max-w-xs mx-auto mt-4">
                            <span className="icon">✦</span>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="px-4 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div>
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">
                                {loading ? 'Loading stories...' : `Showing ${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'}`}
                                {activeCategory !== 'all' && (
                                    <span> in <span className="text-saffron font-medium">{categories.find(c => c.id === activeCategory)?.name}</span></span>
                                )}
                                {activeStatus !== 'all' && (
                                    <span> marked <span className="text-saffron font-medium">{statusOptions.find(option => option.value === activeStatus)?.label}</span></span>
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)] p-1">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setStatus(option.value)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeStatus === option.value
                                            ? 'bg-saffron text-white shadow-md'
                                            : 'text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/5'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-card)] p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'grid'
                                        ? 'bg-saffron text-white shadow-md'
                                        : 'text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/5'}`}
                                >
                                    <FiGrid className="text-lg" />
                                    <span className="text-sm font-medium">Grid</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${viewMode === 'list'
                                        ? 'bg-saffron text-white shadow-md'
                                        : 'text-[var(--text-muted)] hover:text-saffron hover:bg-saffron/5'}`}
                                >
                                    <FiList className="text-lg" />
                                    <span className="text-sm font-medium">List</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory + activeStatus + viewMode}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeCategory === 'all' ? (
                                // Grouped View
                                categories.map((cat) => {
                                    const categoryStories = filteredStories.filter(s => s.category === cat.id);
                                    if (categoryStories.length === 0) return null;

                                    return (
                                        <div key={cat.id} className="mb-20">
                                            <div className="flex items-center gap-4 mb-8">
                                                <span className="text-3xl filter grayscale-[0.5] group-hover:grayscale-0 transition-all">{cat.icon}</span>
                                                <div>
                                                    <h2 className="font-heading text-2xl text-[var(--text-primary)]">
                                                        {cat.name}
                                                    </h2>
                                                    <p className="text-sm text-[var(--text-muted)] italic max-w-2xl">
                                                        {cat.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={viewMode === 'grid'
                                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                                                : "flex flex-col gap-6"
                                            }>
                                                {categoryStories.map((story, i) => (
                                                    <StoryCard
                                                        key={story.id}
                                                        story={story}
                                                        isBookmarked={isBookmarked(story.id)}
                                                        onToggleBookmark={toggleBookmark}
                                                        index={i}
                                                        viewMode={viewMode}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                // Filtered Grid/List View
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                                    : "flex flex-col gap-6"
                                }>
                                    {filteredStories.map((story, i) => (
                                        <StoryCard
                                            key={story.id}
                                            story={story}
                                            isBookmarked={isBookmarked(story.id)}
                                            onToggleBookmark={toggleBookmark}
                                            index={i}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {!loading && filteredStories.length === 0 && (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mb-6 text-4xl">
                                🪷
                            </div>
                            <h3 className="text-xl font-heading text-[var(--text-primary)] mb-2">
                                No stories found
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm mb-6 max-w-md mx-auto">
                                We couldn't find any stories matching your current filters. Try exploring a different category or sort option.
                            </p>
                            <button
                                onClick={() => {
                                    setCategory('all');
                                    setStatus('all');
                                }}
                                className="bg-saffron text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                View all stories
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </section>
        </div>
    );
}

