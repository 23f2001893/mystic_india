import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';
import { GiScrollUnfurled } from 'react-icons/gi';
import StoryCard from '../components/StoryCard';
import ScrollReveal from '../components/ScrollReveal';
import { stories, categories } from '../data/stories';
import { useBookmarks } from '../hooks/useBookmarks';

const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'az', label: 'A to Z' },
];

export default function StoriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'all';
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const { isBookmarked, toggleBookmark } = useBookmarks();

    const setCategory = (cat) => {
        if (cat === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', cat);
        }
        setSearchParams(searchParams);
    };

    const filteredStories = useMemo(() => {
        let result =
            activeCategory === 'all'
                ? [...stories]
                : stories.filter((s) => s.category === activeCategory);

        switch (sortBy) {
            case 'popular':
                result.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'az':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return result;
    }, [activeCategory, sortBy]);

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

            {/* Filters */}
            <section className="px-4 mb-10">
                <div className="max-w-7xl mx-auto">
                    {/* Top Controls Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                            {/* Category Filter Dropdown */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Series:</span>
                                <div className="relative flex-1 sm:flex-initial">
                                    <GiScrollUnfurled className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron text-sm pointer-events-none" />
                                    <select
                                        value={activeCategory}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="bg-[var(--bg-card)] text-[var(--text-primary)] text-sm border border-[var(--border-color)] rounded-xl pl-9 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all cursor-pointer w-full sm:min-w-[240px] appearance-none"
                                    >
                                        <option value="all">All Series (50 Stories)</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                                </div>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Sort:</span>
                                <div className="relative flex-1 sm:flex-initial">
                                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron text-sm pointer-events-none" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-[var(--bg-card)] text-[var(--text-primary)] text-sm border border-[var(--border-color)] rounded-xl pl-9 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all cursor-pointer w-full sm:min-w-[170px] appearance-none"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline">View Mode:</span>
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


                    {/* Results count */}
                    <p className="text-xs text-[var(--text-muted)] mt-6">
                        Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                        {activeCategory !== 'all' && (
                            <span> in <span className="text-saffron font-medium">{categories.find(c => c.id === activeCategory)?.name}</span></span>
                        )}
                    </p>
                </div>
            </section>

            {/* Stories Grid */}
            <section className="px-4 pb-20">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory + sortBy + viewMode}
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

                    {filteredStories.length === 0 && (
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
                                    setSortBy('popular');
                                }}
                                className="bg-saffron text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                View all stories
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
