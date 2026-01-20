const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (!envUrl) return 'http://localhost:5000'; // Fallback for local dev if not set

    // Check if it starts with http:// or https://
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
        return envUrl;
    }

    // If not, assume it's just the hostname (from Render Blueprint)
    return `https://${envUrl}`;
};

export const API_BASE_URL = getApiBaseUrl();
