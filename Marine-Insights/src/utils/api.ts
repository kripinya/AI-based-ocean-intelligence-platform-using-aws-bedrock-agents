// Centralized API helper for backend integration
// Uses Vite env var VITE_API_BASE; falls back to empty string (relative path) for proxy support

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE || '';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export function buildUrl(path: string, params?: QueryParams): string {
    if (path.startsWith('http')) {
        const url = new URL(path);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.set(key, String(value));
                }
            });
        }
        return url.toString();
    }

    // Ensure path doesn't have double leading slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // API_BASE_URL is /api from .env
    // We want to avoid /api//path or /api/api/path
    const base = API_BASE_URL || '';

    // Construct the result path
    let fullPath = '';
    if (cleanPath.startsWith('/api/')) {
        // Path already has /api/, just use it
        fullPath = cleanPath;
    } else {
        // Prepend base if it exists
        fullPath = base ? `${base}${cleanPath}` : cleanPath;
    }

    // Clean up any double slashes that might have been created
    fullPath = fullPath.replace(/\/+/g, '/');

    const url = new URL(fullPath, window.location.origin);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.pathname + url.search;
}

export async function getJson<T>(path: string, params?: QueryParams, init?: RequestInit): Promise<T> {
    const res = await fetch(buildUrl(path, params), {
        method: 'GET',
        headers: { 'Accept': 'application/json', ...(init?.headers || {}) },
        ...init,
    });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
}

export async function postJson<T>(path: string, params?: QueryParams, body?: any, init?: RequestInit): Promise<T> {
    const res = await fetch(buildUrl(path, params), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...(init?.headers || {}) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...init,
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
}


export async function postFormData<T>(path: string, params: QueryParams | undefined, formData: FormData, init?: RequestInit): Promise<T> {
    const res = await fetch(buildUrl(path, params), {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json', ...(init?.headers || {}) },
        ...init,
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res.json();
}

export function imageUrl(path: string, params?: QueryParams): string {
    return buildUrl(path, params);
}
