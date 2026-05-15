// Agents API — calls the Python FastAPI service (negotiate / audit / settle).
const AGENTS_BASE_URL = import.meta.env.VITE_AGENTS_BASE_URL || 'http://localhost:8000';

async function agentCall(endpoint, options = {}) {
  const url = `${AGENTS_BASE_URL}${endpoint}`;
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
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Agents API Error (${endpoint}):`, error);
    throw error;
  }
}

export const agentsAPI = {
  // Run the negotiation graph. Returns final terms + per-round reasoning.
  negotiate: ({
    contractId,
    creatorId,
    advertiserId,
    campaignId,
    initialOffer,
    creatorProfile,
    advertiserRequirements,
    maxRounds = 5,
  }) =>
    agentCall('/negotiate', {
      method: 'POST',
      body: JSON.stringify({
        contract_id: contractId,
        creator_id: creatorId,
        advertiser_id: advertiserId,
        campaign_id: campaignId,
        initial_offer: initialOffer,
        creator_profile: creatorProfile,
        advertiser_requirements: advertiserRequirements,
        max_rounds: maxRounds,
      }),
    }),

  // Audit submitted content (no payment).
  audit: ({ contractId, contractTerms, contentSubmission }) =>
    agentCall('/audit', {
      method: 'POST',
      body: JSON.stringify({
        contract_id: contractId,
        contract_terms: contractTerms,
        content_submission: contentSubmission,
      }),
    }),

  // Audit + execute x402 settlement.
  settle: ({ contractId, contractTerms, contentSubmission }) =>
    agentCall('/settle', {
      method: 'POST',
      body: JSON.stringify({
        contract_id: contractId,
        contract_terms: contractTerms,
        content_submission: contentSubmission,
      }),
    }),

  getNegotiation: (contractId) => agentCall(`/negotiations/${contractId}`),
  getSettlement: (contractId) => agentCall(`/settlement/${contractId}`),
  getAgentLogs: (entityId, limit = 20) => agentCall(`/agent-logs/${entityId}?limit=${limit}`),
};
