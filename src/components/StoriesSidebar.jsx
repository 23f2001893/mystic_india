import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { FiChevronRight, FiChevronDown, FiPlay, FiX } from 'react-icons/fi';
import { LuBookOpen } from 'react-icons/lu';
import { useStoriesData } from '../hooks/useStoriesData';

export default function StoriesSidebar({ onClose }) {
    const { slug } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const { stories, categories, loading } = useStoriesData({ sort: 'popular' });
    const [expandedCats, setExpandedCats] = useState(new Set());

    const isStoriesPage = location.pathname === '/stories';
    const activeCategory = searchParams.get('category') || 'all';
    const activeView = searchParams.get('view') || 'video';

    const activeStory = stories.find((s) => s.slug === slug);

    // Auto-expand the category of the current story
    useEffect(() => {
        if (activeStory?.category) {
            setExpandedCats((prev) => new Set([...prev, activeStory.category]));
        }
    }, [activeStory?.category]);

    // Auto-expand when category filter is set on stories page
    useEffect(() => {
        if (isStoriesPage && activeCategory !== 'all') {
            setExpandedCats((prev) => new Set([...prev, activeCategory]));
        }
    }, [isStoriesPage, activeCategory]);

    const toggleCat = (catId) => {
        setExpandedCats((prev) => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)] shrink-0">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                        EXPLORE
                </p>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1 rounded-lg text-[var(--text-muted)] hover:text-saffron transition-colors"
                    aria-label="Close menu"
                >
                    <FiX />
                </button>
            </div>

            {/* Nav tree */}
            <nav className="flex-1 overflow-y-auto py-2">
                {/* All Series */}
                <Link
                    to="/stories"
                    onClick={onClose}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm border-l-2 transition-all ${
                        isStoriesPage && activeCategory === 'all'
                            ? 'border-saffron bg-saffron/10 text-saffron'
                            : 'border-transparent text-[var(--text-secondary)] hover:border-saffron/40 hover:bg-saffron/5 hover:text-saffron'
                    }`}
                >
                    <span className="font-medium">All Series</span>
                    {!loading && (
                        <span className="text-xs opacity-60">{stories.length}</span>
                    )}
                </Link>

                {/* Category accordion */}
                {categories.map((cat) => {
                    const catStories = stories.filter((s) => s.category === cat.id);
                    const isExpanded = expandedCats.has(cat.id);
                    const isCatActive = isStoriesPage && activeCategory === cat.id;

                    return (
                        <div key={cat.id}>
                            {/* Category header row */}
                            <div className={`flex items-stretch border-l-2 transition-all ${
                                isCatActive
                                    ? 'border-saffron bg-saffron/10'
                                    : 'border-transparent hover:border-saffron/40 hover:bg-saffron/5'
                            }`}>
                                {/* Chevron toggle */}
                                <button
                                    onClick={() => toggleCat(cat.id)}
                                    className={`flex items-center justify-center w-8 shrink-0 py-2.5 transition-colors ${
                                        isCatActive ? 'text-saffron' : 'text-[var(--text-muted)] hover:text-saffron'
                                    }`}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                    {isExpanded
                                        ? <FiChevronDown className="text-xs" />
                                        : <FiChevronRight className="text-xs" />
                                    }
                                </button>

                                {/* Category name — clicking filters stories page */}
                                <Link
                                    to={`/stories?category=${cat.id}`}
                                    onClick={() => {
                                        toggleCat(cat.id);
                                        onClose();
                                    }}
                                    className={`flex-1 py-2.5 pr-4 text-sm transition-colors ${
                                        isCatActive
                                            ? 'text-saffron'
                                            : 'text-[var(--text-secondary)] hover:text-saffron'
                                    }`}
                                >
                                    <span className="block font-medium leading-snug">{cat.name}</span>
                                    <span className="block text-xs opacity-60 mt-0.5">
                                        {cat.publishedStoryCount || 0} {cat.publishedStoryCount === 1 ? 'story' : 'stories'}
                                    </span>
                                </Link>
                            </div>

                            {/* Stories under category */}
                            {isExpanded && catStories.length > 0 && (
                                <div className="border-l border-[var(--border-color)] ml-4">
                                    {catStories.map((story) => {
                                        const isActive = story.slug === slug;
                                        const hasPdf = Boolean(story.pdfUrl);

                                        return (
                                            <div key={story.id}>
                                                <Link
                                                    to={`/story/${story.slug}`}
                                                    onClick={onClose}
                                                    className={`flex items-start gap-2 pl-5 pr-4 py-2 text-sm border-l-2 -ml-px transition-all ${
                                                        isActive
                                                            ? 'border-saffron text-saffron'
                                                            : 'border-transparent text-[var(--text-muted)] hover:border-saffron/40 hover:text-saffron hover:bg-saffron/5'
                                                    }`}
                                                >
                                                    <span className="mt-0.5 shrink-0 text-[10px] opacity-50">•</span>
                                                    <span className="line-clamp-2 leading-snug">{story.title}</span>
                                                </Link>

                                                {/* Video / PDF buttons — only under active story */}
                                                {isActive && (
                                                    <div className="pl-6 pr-4 pb-3 pt-1 flex flex-col gap-1.5">
                                                        <Link
                                                            to={`/story/${story.slug}?view=video`}
                                                            replace
                                                            onClick={onClose}
                                                            className={`inline-flex items-center gap-3 w-full px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                                                                activeView === 'video'
                                                                    ? 'bg-saffron text-white'
                                                                    : 'text-[var(--text-muted)] border border-(--border-color) hover:border-saffron hover:text-saffron'
                                                            }`}
                                                        >
                                                            <FiPlay className="shrink-0" />
                                                            Video
                                                        </Link>
                                                        {hasPdf && (
                                                            <Link
                                                                to={`/story/${story.slug}?view=pdf`}
                                                                replace
                                                                onClick={onClose}
                                                                className={`inline-flex items-center gap-3 w-full px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                                                                    activeView === 'pdf'
                                                                        ? 'bg-saffron text-white'
                                                                        : 'text-[var(--text-muted)] border border-(--border-color) hover:border-saffron hover:text-saffron'
                                                                }`}
                                                            >
                                                                <LuBookOpen className="shrink-0" />
                                                                PDF
                                                            </Link>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <p className="px-4 py-4 text-xs text-[var(--text-muted)]">Loading…</p>
                )}
            </nav>
        </div>
    );
}
