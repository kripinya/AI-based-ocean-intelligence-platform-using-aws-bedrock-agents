// Centralized API helper for backend integration
// Uses Vite env var VITE_API_BASE; falls back to empty string (relative path) for proxy support

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE || '';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export function buildUrl(path: string, params?: QueryParams): string {
    // If path is absolute, use it directly. If relative, append to API_BASE_URL (which might be empty).
    // If API_BASE_URL is empty, we construct a URL relative to window.location.origin to use the URL object,
    // then strip the origin to return a relative path that triggers the proxy.
    const base = path.startsWith('http') ? undefined : (API_BASE_URL || window.location.origin);
    const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`, base);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    // Return full string if absolute or if we have an explicit API base.
    // Return relative path (pathname + search) if we are using the proxy (empty API base).
    if (path.startsWith('http') || API_BASE_URL) {
        return url.toString();
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
