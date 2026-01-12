const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const fetchJson = async (path, options) => {
    const response = await fetch(`${API_BASE}${path}`, options);
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }
    return response.json();
};
