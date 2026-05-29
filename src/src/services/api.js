export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const getAuthToken = () => localStorage.getItem('authToken') || '';

export const apiRequest = async (path, options = {}) => {
    const {
        method = 'GET',
        body,
        headers = {},
        auth = true
    } = options;

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || 'Permintaan API gagal.');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};
