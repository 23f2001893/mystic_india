import { useEffect, useState } from 'react';
import { fetchCategories, fetchRelatedStories, fetchStories, fetchStoryBySlug } from '../services/api';

export function useStoriesData(options = {}) {
    const [stories, setStories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const [storiesData, categoriesData] = await Promise.all([
                    fetchStories(options),
                    fetchCategories(),
                ]);

                if (!ignore) {
                    setStories(storiesData);
                    setCategories(categoriesData);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Unable to load stories');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, [options.category, options.sort]);

    return { stories, categories, loading, error };
}

export function useStoryDetail(slug) {
    const [story, setStory] = useState(null);
    const [relatedStories, setRelatedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function loadStory() {
            try {
                setLoading(true);
                setError(null);
                const storyData = await fetchStoryBySlug(slug);
                const relatedData = await fetchRelatedStories(storyData.id, 3);

                if (!ignore) {
                    setStory(storyData);
                    setRelatedStories(relatedData);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Unable to load story');
                    setStory(null);
                    setRelatedStories([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        if (slug) {
            loadStory();
        }

        return () => {
            ignore = true;
        };
    }, [slug]);

    return { story, relatedStories, loading, error };
}
