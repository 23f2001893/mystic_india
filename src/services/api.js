const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function buildApiUrl(path) {
    let normalizedPath = `/${path.replace(/^\/+/, '')}`;

    if (API_BASE_URL === '/api' && normalizedPath === '/api') {
        normalizedPath = '';
    } else if (API_BASE_URL === '/api' && normalizedPath.startsWith('/api/')) {
        normalizedPath = normalizedPath.slice(4);
    }

    return `${API_BASE_URL}${normalizedPath}`;
}

async function request(path) {
    const response = await fetch(buildApiUrl(path));

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}
export async function uploadAdminFile(file, fileType, token) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(buildApiUrl(`/admin/upload?file_type=${fileType}`), {
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
    const response = await fetch(buildApiUrl(path), {
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
    return request('/categories');
}

export function fetchStories({ category = 'all', sort = 'popular' } = {}) {
    const params = new URLSearchParams({ sort });
    if (category && category !== 'all') {
        params.set('category', category);
    }
    return request(`/stories?${params.toString()}`);
}

export function fetchStoryBySlug(slug) {
    return request(`/stories/${encodeURIComponent(slug)}`);
}

export function fetchRelatedStories(storyId, limit = 3) {
    return request(`/stories/${storyId}/related?limit=${limit}`);
}

export function searchStoriesApi(query) {
    return request(`/search/stories?q=${encodeURIComponent(query)}`);
}

export function registerUser(payload) {
    return requestWithBody('/auth/register', { body: payload });
}

export function loginUser(payload) {
    return requestWithBody('/auth/login', { body: payload });
}

export function createStory(payload, token) {
    return requestWithBody('/admin/stories', { body: payload, token });
}

export function updateStory(storyId, payload, token) {
    return requestWithBody(`/admin/stories/${storyId}`, {
        method: 'PUT',
        body: payload,
        token,
    });
}

export function deleteStory(storyId, token) {
    return requestWithBody(`/admin/stories/${storyId}`, {
        method: 'DELETE',
        token,
    });
}

export function publishStory(storyId, token) {
    return updateStory(storyId, { isComingSoon: false }, token);
}

export function createCategory(payload, token) {
    return requestWithBody('/admin/categories', { body: payload, token });
}

export function updateCategory(categoryId, payload, token) {
    return requestWithBody(`/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: payload,
        token,
    });
}

export function deleteCategory(categoryId, token) {
    return requestWithBody(`/admin/categories/${categoryId}`, {
        method: 'DELETE',
        token,
    });
}
export function fetchCurrentUser(token){
    return requestWithBody('/auth/me',{
        method:"GET",
        token
    })
}
