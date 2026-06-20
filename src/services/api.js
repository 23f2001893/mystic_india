const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(path) {
    const response = await fetch(`${API_BASE_URL}${path}`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}
export async function uploadAdminFile(file, fileType, token) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/admin/upload?file_type=${fileType}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || `File upload failed: ${response.status}`);
    }
    return response.json();
}

async function requestWithBody(path, { method = 'POST', body, token } = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || `API request failed: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
}

export function fetchCategories() {
    return request('/api/categories');
}

export function fetchStories({ category = 'all', sort = 'popular' } = {}) {
    const params = new URLSearchParams({ sort });
    if (category && category !== 'all') {
        params.set('category', category);
    }
    return request(`/api/stories?${params.toString()}`);
}

export function fetchStoryBySlug(slug) {
    return request(`/api/stories/${encodeURIComponent(slug)}`);
}

export function fetchRelatedStories(storyId, limit = 3) {
    return request(`/api/stories/${storyId}/related?limit=${limit}`);
}

export function searchStoriesApi(query) {
    return request(`/api/search/stories?q=${encodeURIComponent(query)}`);
}

export function registerUser(payload) {
    return requestWithBody('/api/auth/register', { body: payload });
}

export function loginUser(payload) {
    return requestWithBody('/api/auth/login', { body: payload });
}

export function createStory(payload, token) {
    return requestWithBody('/api/admin/stories', { body: payload, token });
}

export function updateStory(storyId, payload, token) {
    return requestWithBody(`/api/admin/stories/${storyId}`, {
        method: 'PUT',
        body: payload,
        token,
    });
}

export function deleteStory(storyId, token) {
    return requestWithBody(`/api/admin/stories/${storyId}`, {
        method: 'DELETE',
        token,
    });
}

export function publishStory(storyId, token) {
    return updateStory(storyId, { isComingSoon: false }, token);
}

export function createCategory(payload, token) {
    return requestWithBody('/api/admin/categories', { body: payload, token });
}

export function updateCategory(categoryId, payload, token) {
    return requestWithBody(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: payload,
        token,
    });
}

export function deleteCategory(categoryId, token) {
    return requestWithBody(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        token,
    });
}
