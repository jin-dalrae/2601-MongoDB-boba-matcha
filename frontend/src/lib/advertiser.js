export const resolveAdvertiserId = () => {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('advertiserId');
    if (queryId) {
        localStorage.setItem('matcha_advertiser_id', queryId);
        return queryId;
    }

    return localStorage.getItem('matcha_advertiser_id') || import.meta.env.VITE_ADVERTISER_ID || '';
};
