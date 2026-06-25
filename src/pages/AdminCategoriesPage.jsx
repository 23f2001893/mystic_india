import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiEdit2, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { createCategory, deleteCategory, updateCategory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useStoriesData } from '../hooks/useStoriesData';
import AdminSidePanel from '../components/AdminSidePanel';
import AdminModal from '../components/AdminModal';

const emptyCategoryForm = {
    slug: '',
    name: '',
    description: '',
    icon: '',
};

export default function AdminCategoriesPage() {
    const { token, user, isAdmin } = useAuth();
    const { categories, loading, error } = useStoriesData({ sort: 'newest' });
    const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [message, setMessage] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/stories" replace />;

    const updateCategoryField = (field, value) => {
        setCategoryForm((current) => ({ ...current, [field]: value }));
    };

    const resetCategoryForm = () => {
        setCategoryForm(emptyCategoryForm);
        setEditingCategoryId(null);
        setFormError('');
        setIsFormOpen(false);
    };

    const openNewCategoryForm = () => {
        setCategoryForm(emptyCategoryForm);
        setEditingCategoryId(null);
        setFormError('');
        setMessage('');
        setIsFormOpen(true);
    };

    const startCategoryEdit = (category) => {
        setEditingCategoryId(category.dbId);
        setCategoryForm({
            slug: category.slug || '',
            name: category.name || '',
            description: category.description || '',
            icon: category.icon || '',
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategorySubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage('');
        setFormError('');

        try {
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, categoryForm, token);
                setMessage('Category updated successfully.');
            } else {
                await createCategory(categoryForm, token);
                setMessage('Category created successfully.');
            }

            resetCategoryForm();
            window.location.reload();
        } catch (err) {
            setFormError(err.message || 'Unable to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleCategoryDelete = async (category) => {
        const shouldDelete = window.confirm(`Delete category "${category.name}"?`);
        if (!shouldDelete) return;

        try {
            await deleteCategory(category.dbId, token);
            setMessage('Category deleted successfully.');
            window.location.reload();
        } catch (err) {
            setFormError(err.message || 'Unable to delete category');
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
                                    Category Management
                                </h1>
                            </div>
                            <button
                                type="button"
                                onClick={openNewCategoryForm}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-saffron-dark"
                            >
                                <FiPlus />
                                Add Category
                            </button>
                        </div>

                <div className="space-y-8">
                    {isFormOpen && (
                    <AdminModal title={editingCategoryId ? 'Edit Category' : 'Add Category'} onClose={resetCategoryForm}>
                    <form
                        onSubmit={handleCategorySubmit}
                        className="space-y-5"
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <AdminInput label="Slug" value={categoryForm.slug} onChange={(value) => updateCategoryField('slug', value)} required />
                            <AdminInput label="Name" value={categoryForm.name} onChange={(value) => updateCategoryField('name', value)} required />
                            <AdminInput label="Icon" value={categoryForm.icon} onChange={(value) => updateCategoryField('icon', value)} />
                            <AdminTextarea label="Description" value={categoryForm.description} onChange={(value) => updateCategoryField('description', value)} />
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
                            {editingCategoryId ? <FiSave /> : <FiPlus />}
                            {saving ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Create Category'}
                        </button>
                    </form>
                    </AdminModal>
                    )}

                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg overflow-hidden">
                        <div className="border-b border-[var(--border-color)] px-5 py-4">
                            <h2 className="font-heading text-2xl text-[var(--text-primary)]">Categories</h2>
                            <p className="text-xs text-[var(--text-muted)]">
                                {loading ? 'Loading...' : `${categories.length} categories in database`}
                            </p>
                        </div>

                        {error && <p className="p-5 text-sm text-red-500">{error}</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-heading text-lg text-[var(--text-primary)]">
                                                {category.icon} {category.name}
                                            </p>
                                            <p className="text-xs text-saffron">{category.slug}</p>
                                            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
                                                {category.description}
                                            </p>
                                            <p className="mt-2 text-xs text-[var(--text-muted)]">
                                                {category.storyCount} stories
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startCategoryEdit(category)}
                                                className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-primary)] hover:border-saffron hover:text-saffron"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCategoryDelete(category)}
                                                className="rounded-lg border border-red-500/30 p-2 text-red-500 hover:bg-red-500/10"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
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
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-saffron"
            />
        </label>
    );
}
