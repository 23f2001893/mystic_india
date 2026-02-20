import { useState, useMemo } from 'react';
import { searchStories } from '../data/stories';

export function useSearch() {
    const [query, setQuery] = useState('');

    const results = useMemo(() => {
        if (!query.trim()) return null;
        return searchStories(query);
    }, [query]);

    return { query, setQuery, results };
}
