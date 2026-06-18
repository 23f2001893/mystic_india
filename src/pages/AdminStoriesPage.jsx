import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiEdit2, FiPlus, FiSave, FiSend, FiTrash2, FiX } from 'react-icons/fi';
import {
    createStory,
    deleteStory,
    publishStory,
    updateStory,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useStoriesData } from '../hooks/useStoriesData';

const emptyForm = {
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    category: '',
    thumbnail: '',
    videoUrl: '',
    moral: '',
    duration: '',
    popularity: 0,
    isComingSoon: true,
    createdAt: new Date().toISOString().slice(0, 10),
};

export default function AdminStoriesPage() {
    const { token, user, isAdmin } = useAuth();
    const { stories, categories, loading, error } = useStoriesData({ sort: 'newest' });
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const categoryOptions = useMemo(() => categories.map((category) => category.id), [categories]);
    const filteredStories = useMemo(() => {
        if (selectedCategory === 'all') return stories;
        return stories.filter((story) => story.category === selectedCategory);
    }, [selectedCategory, stories]);
    const analytics = useMemo(() => {
        const totalStories = stories.length;
        const comingSoon = stories.filter((story) => story.isComingSoon).length;
        const published = totalStories - comingSoon;
        const averagePopularity = totalStories
            ? Math.round(stories.reduce((sum, story) => sum + (Number(story.popularity) || 0), 0) / totalStories)
            : 0;
        const topStory = [...stories].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
        const activeCategories = new Set(stories.map((story) => story.category)).size;

        return {
            totalStories,
            comingSoon,
            published,
            averagePopularity,
            topStory,
            activeCategories,
        };
    }, [stories]);

    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/stories" replace />;

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const resetForm = () => {
        setForm({ ...emptyForm, category: categoryOptions[0] || '' });
        setEditingId(null);
        setFormError('');
    };

    const startEdit = (story) => {
        setEditingId(story.id);
        setForm({
            slug: story.slug || '',
            title: story.title || '',
            subtitle: story.subtitle || '',
            description: story.description || '',
            category: story.category || '',
            thumbnail: story.thumbnail || '',
            videoUrl: story.videoUrl || '',
            moral: story.moral || '',
            duration: story.duration || '',
            popularity: story.popularity || 0,
            isComingSoon: Boolean(story.isComingSoon),
            createdAt: story.createdAt || new Date().toISOString().slice(0, 10),
        });
        setFormError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage('');
        setFormError('');

        try {
            const payload = {
                ...form,
                popularity: Number(form.popularity) || 0,
                category: form.category || categoryOptions[0],
            };

            if (editingId) {
                await updateStory(editingId, payload, token);
                setMessage('Story updated successfully.');
            } else {
                await createStory(payload, token);
                setMessage('Story created successfully.');
            }

            resetForm();
            window.location.reload();
        } catch (err) {
            setFormError(err.message || 'Unable to save story');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (storyId) => {
        const shouldDelete = window.confirm('Delete this story?');
        if (!shouldDelete) return;

        try {
            await deleteStory(storyId, token);
            setMessage('Story deleted successfully.');
            window.location.reload();
        } catch (err) {
            setFormError(err.message || 'Unable to delete story');
        }
    };

    const handlePublish = async (storyId) => {
        try {
            await publishStory(storyId, token);
            setMessage('Story published successfully.');
            window.location.reload();
        } catch (err) {
            setFormError(err.message || 'Unable to publish story');
        }
    };

    return (
        <div className="min-h-screen pt-24 sm:pt-28 px-4 pb-16 parchment-bg">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <p className="text-saffron text-sm tracking-[0.3em] uppercase mb-2 font-medium">
                            Admin Workspace
                        </p>
                        <h1 className="font-heading text-3xl sm:text-4xl text-[var(--text-primary)]">
                            Story Management
                        </h1>
                        
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/admin/categories" className="text-sm font-medium text-saffron hover:underline">
                            Manage Categories
                        </Link>
                        <Link to="/stories" className="text-sm font-medium text-saffron hover:underline">
                            View public stories
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                    <AnalyticsCard label="Total Stories" value={loading ? '...' : analytics.totalStories} />
                    <AnalyticsCard label="Published" value={loading ? '...' : analytics.published} />
                    <AnalyticsCard label="Coming Soon" value={loading ? '...' : analytics.comingSoon} />
                    <AnalyticsCard label="Avg Popularity" value={loading ? '...' : `${analytics.averagePopularity}%`} />
                    <AnalyticsCard
                        label="Top Story"
                        value={loading ? '...' : analytics.topStory?.title || 'No stories'}
                        compact
                    />
                </div>

                {/* <div className="mb-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-saffron">
                                Category Coverage
                            </p>
                            <h2 className="font-heading text-2xl text-[var(--text-primary)]">
                                {analytics.activeCategories} of {categories.length} categories have stories
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {categories.map((category) => {
                                const count = stories.filter((story) => story.category === category.id).length;
                                return (
                                    <div
                                        key={category.id}
                                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2"
                                    >
                                        <p className="truncate text-xs text-[var(--text-muted)]">{category.name}</p>
                                        <p className="font-heading text-xl text-saffron">{count}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 sm:p-6 shadow-lg h-fit"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-heading text-2xl text-[var(--text-primary)]">
                                {editingId ? 'Edit Story' : 'New Story'}
                            </h2>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-saffron/10 hover:text-saffron"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <AdminInput label="Slug" value={form.slug} onChange={(value) => updateField('slug', value)} required />
                            <AdminInput label="Title" value={form.title} onChange={(value) => updateField('title', value)} required />
                            <AdminInput label="Subtitle" value={form.subtitle} onChange={(value) => updateField('subtitle', value)} />
                            <AdminTextarea label="Description" value={form.description} onChange={(value) => updateField('description', value)} />

                            <label className="block">
                                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                    Category
                                </span>
                                <select
                                    value={form.category || categoryOptions[0] || ''}
                                    onChange={(e) => updateField('category', e.target.value)}
                                    className="mt-2 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-saffron"
                                    required
                                >
                                    {categoryOptions.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <AdminInput label="Thumbnail URL" value={form.thumbnail} onChange={(value) => updateField('thumbnail', value)} />
                            <AdminInput label="Video URL / Embed Link" value={form.videoUrl} onChange={(value) => updateField('videoUrl', value)} />
                            <AdminTextarea label="Moral" value={form.moral} onChange={(value) => updateField('moral', value)} />

                            <div className="grid grid-cols-2 gap-4">
                                <AdminInput label="Duration" value={form.duration} onChange={(value) => updateField('duration', value)} />
                                <AdminInput label="Popularity" type="number" value={form.popularity} onChange={(value) => updateField('popularity', value)} />
                            </div>

                            <AdminInput label="Created At" type="date" value={form.createdAt} onChange={(value) => updateField('createdAt', value)} />

                            <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)]">
                                <input
                                    type="checkbox"
                                    checked={form.isComingSoon}
                                    onChange={(e) => updateField('isComingSoon', e.target.checked)}
                                    className="h-4 w-4 accent-saffron"
                                />
                                Coming soon
                            </label>
                        </div>

                        {formError && (
                            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                                {formError}
                            </p>
                        )}

                        {message && (
                            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-saffron px-5 py-3 font-semibold text-white transition-all hover:bg-saffron-dark disabled:opacity-60"
                        >
                            {editingId ? <FiSave /> : <FiPlus />}
                            {saving ? 'Saving...' : editingId ? 'Update Story' : 'Create Story'}
                        </button>
                    </form>

                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg overflow-hidden">
                        <div className="border-b border-[var(--border-color)] px-5 py-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <h2 className="font-heading text-2xl text-[var(--text-primary)]">Stories</h2>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {loading ? 'Loading...' : `${filteredStories.length} of ${stories.length} stories shown`}
                                    </p>
                                </div>
                                <label className="block md:w-64">
                                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                        Filter by Category
                                    </span>
                                    <select
                                        value={selectedCategory}
                                        onChange={(event) => setSelectedCategory(event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-saffron"
                                    >
                                        <option value="all">All categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        {error && <p className="p-5 text-sm text-red-500">{error}</p>}

                        <div className="divide-y divide-[var(--border-color)]">
                            {filteredStories.map((story) => (
                                <div key={story.id} className="grid gap-4 p-5 md:grid-cols-[88px_1fr_auto] md:items-center">
                                    <img
                                        src={story.thumbnail}
                                        alt={story.title}
                                        className="h-20 w-full rounded-xl object-cover md:w-22"
                                    />
                                    <div>
                                        <p className="font-heading text-xl text-[var(--text-primary)]">{story.title}</p>
                                        <p className="text-xs text-saffron">
                                            {story.category} {story.isComingSoon ? '· Draft' : '· Published'}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                                            {story.description}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {story.isComingSoon && (
                                            <button
                                                type="button"
                                                onClick={() => handlePublish(story.id)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-500/10"
                                            >
                                                <FiSend /> Publish
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => startEdit(story)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-saffron hover:text-saffron"
                                        >
                                            <FiEdit2 /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(story.id)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsCard({ label, value, compact = false }) {
    return (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {label}
            </p>
            <p
                className={`mt-2 font-heading text-saffron ${compact ? 'text-xl leading-snug line-clamp-2' : 'text-3xl'}`}
            >
                {value}
            </p>
        </div>
    );
}

function AdminInput({ label, value, onChange, type = 'text', required = false }) {
    return (
        <label className="block">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="mt-2 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-saffron"
            />
        </label>
    );
}

function AdminTextarea({ label, value, onChange }) {
    return (
        <label className="block">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-saffron"
            />
        </label>
    );
}
