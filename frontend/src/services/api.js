// API Service - Base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// User API
export const userAPI = {
  getUser: (id) => apiCall(`/users/${id}`),
  getUsersByRole: (role) => apiCall(`/users/role/${role}`),
  getUserProfile: (id) => apiCall(`/users/${id}/profile`),
  createUser: (data) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Campaign API
export const campaignAPI = {
  getCampaignsByAdvertiser: (advertiserId) => apiCall(`/campaigns/advertiser/${advertiserId}`),
  getActiveCampaigns: () => apiCall('/campaigns/active'),
  getCampaign: (id) => apiCall(`/campaigns/${id}`),
  getCampaignStats: (id) => apiCall(`/campaigns/${id}/stats`),
  createCampaign: (data) => apiCall('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id, data) => apiCall(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Deal API (AutoBid)
export const dealAPI = {
  getDealsByCreator: (creatorId) => apiCall(`/deals/creator/${creatorId}`),
  getDealsByCreatorAndStatus: (creatorId, status) => apiCall(`/deals/creator/${creatorId}/status/${status}`),
  getDealsByCampaign: (campaignId) => apiCall(`/deals/campaign/${campaignId}`),
  getDeal: (id) => apiCall(`/deals/${id}`),
  createDeal: (data) => apiCall('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id, data) => apiCall(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Contract API
export const contractAPI = {
  getContractsByCreator: (creatorId) => apiCall(`/contracts/creator/${creatorId}`),
  getContractsByAdvertiser: (advertiserId) => apiCall(`/contracts/advertiser/${advertiserId}`),
  getActiveContracts: (creatorId) => {
    const params = creatorId ? `?creatorId=${creatorId}` : '';
    return apiCall(`/contracts/active${params}`);
  },
  getContract: (id) => apiCall(`/contracts/${id}`),
  createContract: (data) => apiCall('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  updateContract: (id, data) => apiCall(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Health check
export const healthCheck = () => apiCall('/health');



