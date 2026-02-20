import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchStories } from '../data/stories';
import { Link } from 'react-router-dom';

export default function SearchBar({ onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (query.trim().length > 1) {
            setResults(searchStories(query));
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <FiSearch className="text-saffron text-lg shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search stories, characters, themes..."
                    className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
                />
                {query && (
                    <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-saffron transition-colors">
                        <FiX />
                    </button>
                )}
                {onClose && (
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-saffron transition-colors ml-1">
                        <FiX className="text-lg" />
                    </button>
                )}
            </div>

            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {results.map((story) => (
                        <Link
                            key={story.id}
                            to={`/story/${story.slug}`}
                            onClick={() => {
                                setQuery('');
                                onClose?.();
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-saffron/10 transition-colors border-b border-[var(--border-color)] last:border-0"
                        >
                            <img
                                src={story.thumbnail}
                                alt={story.title}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{story.title}</p>
                                <p className="text-xs text-[var(--text-muted)] capitalize">{story.category}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {query.trim().length > 1 && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl p-6 text-center z-50">
                    <p className="text-[var(--text-muted)] text-sm">No stories found for "{query}"</p>
                </div>
            )}
        </div>
    );
}
