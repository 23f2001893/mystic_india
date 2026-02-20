import { useState, useEffect } from 'react';

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState(() => {
        const saved = localStorage.getItem('bookmarks');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    const toggleBookmark = (storyId) => {
        setBookmarks((prev) =>
            prev.includes(storyId)
                ? prev.filter((id) => id !== storyId)
                : [...prev, storyId]
        );
    };

    const isBookmarked = (storyId) => bookmarks.includes(storyId);

    return { bookmarks, toggleBookmark, isBookmarked };
}
