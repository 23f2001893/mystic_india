import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiCheckCircle, FiEdit2, FiFileText, FiImage, FiPlus, FiSave, FiSend, FiTrash2, FiUploadCloud, FiVideo } from 'react-icons/fi';
import {
    createStory,
    deleteStory,
    publishStory,
    updateStory,
    uploadAdminFile,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useStoriesData } from '../hooks/useStoriesData';
import AdminSidePanel from '../components/AdminSidePanel';
import AdminModal from '../components/AdminModal';

const emptyForm = {
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    category: '',
    thumbnail: '',
    videoUrl: '',
    pdfUrl: '',
    pdfpagecount: 0,
    moral: '',
    duration: '',
    popularity: 0,
    isComingSoon: true,
    createdAt: new Date().toISOString().slice(0, 10),
};

const normalizeSlug = (value) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export default function AdminStoriesPage() {
    const { token, user, isAdmin } = useAuth();
    const { stories, categories, loading, error } = useStoriesData({ sort: 'newest' });
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
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
        return {
            totalStories,
            comingSoon,
            published,
        };
    }, [stories]);
    if (loading) return null;
    if (!user) return <Navigate to="/" replace />;
    if (!isAdmin) return <Navigate to="/stories" replace />;

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const resetForm = () => {
        setForm({ ...emptyForm, category: categoryOptions[0] || '' });
        setEditingId(null);
        setFormError('');
        setIsFormOpen(false);
    };

    const openNewStoryForm = () => {
        setForm({ ...emptyForm, category: categoryOptions[0] || '' });
        setEditingId(null);
        setFormError('');
        setMessage('');
        setIsFormOpen(true);
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
            pdfUrl: story.pdfUrl || '',
            pdfpagecount: story.pdfpagecount || 0,
            moral: story.moral || '',
            duration: story.duration || '',
            popularity: story.popularity || 0,
            isComingSoon: Boolean(story.isComingSoon),
            createdAt: story.createdAt || new Date().toISOString().slice(0, 10),
        });
        setFormError('');
        setIsFormOpen(true);
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
                slug: normalizeSlug(form.slug),
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

    const handleFileUpload = async (event, fileType, fieldName) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldName);
        setFormError('');
        setMessage('');

        try {
            const result = await uploadAdminFile(file, fileType, token);
            setForm((current) => ({
                ...current,
                [fieldName]: result.url,
                ...(fileType === 'pdf' && result.pageCount ? { pdfpagecount: result.pageCount } : {}),
            }));
            setMessage(`${file.name} uploaded successfully.`);
        } catch (err) {
            setFormError(err.message || 'Unable to upload file');
        } finally {
            setUploadingField('');
            event.target.value = '';
        }
    };

    return (
        <div className="min-h-screen pt-20 sm:pt-24 parchment-bg">
            <div className="grid lg:grid-cols-[220px_1fr]">
                <AdminSidePanel />
                <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-saffron">
                                    Admin Workspace
                                </p>
                                <h1 className="font-heading text-3xl text-[var(--text-primary)] sm:text-4xl">
                                    Story Management
                                </h1>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={openNewStoryForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-saffron-dark"
                                >
                                    <FiPlus />
                                    Add Story
                                </button>
                            </div>
                        </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <AnalyticsCard label="Total Stories" value={loading ? '...' : analytics.totalStories} />
                    <AnalyticsCard label="Published" value={loading ? '...' : analytics.published} />
                    <AnalyticsCard label="Coming Soon" value={loading ? '...' : analytics.comingSoon} />
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

                <div className="space-y-8">
                    {isFormOpen && (
                    <AdminModal title={editingId ? 'Edit Story' : 'Add Story'} onClose={resetForm}>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <AdminInput label="Slug" value={form.slug} onChange={(value) => updateField('slug', normalizeSlug(value))} required />
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

                            <div className="grid gap-3 sm:grid-cols-3">
                                <UploadField
                                    id="thumbnail-upload"
                                    label="Thumbnail"
                                    helper="Image file"
                                    accept="image/*"
                                    value={form.thumbnail}
                                    icon={FiImage}
                                    uploading={uploadingField === 'thumbnail'}
                                    onChange={(event) => handleFileUpload(event, 'thumbnail', 'thumbnail')}
                                />
                                <UploadField
                                    id="video-upload"
                                    label="Video"
                                    helper="Story video"
                                    accept="video/*"
                                    value={form.videoUrl}
                                    icon={FiVideo}
                                    uploading={uploadingField === 'videoUrl'}
                                    onChange={(event) => handleFileUpload(event, 'video', 'videoUrl')}
                                />
                                <UploadField
                                    id="pdf-upload"
                                    label="PDF"
                                    helper="Story PDF"
                                    accept="application/pdf"
                                    value={form.pdfUrl}
                                    icon={FiFileText}
                                    uploading={uploadingField === 'pdfUrl'}
                                    onChange={(event) => handleFileUpload(event, 'pdf', 'pdfUrl')}
                                />
                            </div>
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
                    </AdminModal>
                    )}

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
                </main>
            </div>
        </div>
    );
}

function UploadField({ id, label, helper, accept, value, icon: Icon, uploading, onChange }) {
    return (
        <label
            htmlFor={id}
            className="group flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-4 text-center transition-all hover:border-saffron hover:bg-saffron/5"
        >
            <input id={id} type="file" accept={accept} onChange={onChange} className="sr-only" />
            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-saffron/10 text-saffron transition-all group-hover:bg-saffron group-hover:text-white">
                {uploading ? <FiUploadCloud className="animate-pulse text-xl" /> : <Icon className="text-xl" />}
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
            <span className="mt-1 text-xs text-[var(--text-muted)]">
                {uploading ? 'Uploading...' : value ? 'Uploaded' : helper}
            </span>
            {value && !uploading && (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600">
                    <FiCheckCircle />
                    Ready
                </span>
            )}
        </label>
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
