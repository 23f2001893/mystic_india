import { useEffect, useState } from 'react';
import { searchStoriesApi } from '../services/api';

export function useSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);

    useEffect(() => {
        let ignore = false;

        if (query.trim().length < 2) {
            setResults(null);
            return undefined;
        }

        searchStoriesApi(query)
            .then((stories) => {
                if (!ignore) setResults(stories);
            })
            .catch(() => {
                if (!ignore) setResults([]);
            });

        return () => {
            ignore = true;
        };
    }, [query]);

    return { query, setQuery, results };
}
