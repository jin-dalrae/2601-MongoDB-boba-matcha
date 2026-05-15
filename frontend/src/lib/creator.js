import { userAPI } from '../services/api';

// Resolve a creator id, in priority order:
//   1. ?creatorId=... in the URL (also persisted to localStorage)
//   2. localStorage `matcha_user_id` (written by onboarding)
//   3. VITE_CREATOR_ID env var
// Returns '' when none is available.
export const resolveCreatorId = () => {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('creatorId');
    if (queryId) {
        localStorage.setItem('matcha_user_id', queryId);
        return queryId;
    }

    return localStorage.getItem('matcha_user_id') || import.meta.env.VITE_CREATOR_ID || '';
};

// Async resolver — falls back to picking the first Creator from the API
// when no id is locally available. Useful for dev/demo flows where
// onboarding hasn't been run.
export const ensureCreatorId = async () => {
    const existing = resolveCreatorId();
    if (existing) return existing;

    try {
        const creators = await userAPI.getUsersByRole('Creator');
        const first = Array.isArray(creators) ? creators[0] : null;
        if (first?._id) {
            localStorage.setItem('matcha_user_id', first._id);
            return first._id;
        }
    } catch (error) {
        console.error('Failed to fetch sample creator:', error);
    }

    return '';
};
