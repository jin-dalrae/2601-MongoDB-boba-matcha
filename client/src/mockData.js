
// Mock Data for the UI
export const mockData = {
    advertiser: {
        budget: 4000,
        spent: 1420,
        remaining: 2580,
    },
    campaigns: [
        { id: 1, name: 'Summer Launch', status: 'Live', creators: 5, spent: 850 },
        { id: 2, name: 'Product Reveal', status: 'Matching', creators: 12, spent: 0 },
        { id: 3, name: 'Brand Awesomeness', status: 'Review', creators: 3, spent: 570 },
    ],
    agentActivity: [
        { id: 1, text: 'Shortlisted 5 creators', time: '2h ago' },
        { id: 2, text: 'Auto-adjusted 2 bids', time: '5h ago' },
        { id: 3, text: 'Negotiation completed with @sarah', time: '1d ago' },
    ],
    creators: [
        {
            id: 101,
            name: 'Sarah Jenkins',
            handle: '@sarahj',
            platform: 'TikTok',
            fitScore: 94,
            bid: 450,
            tags: ['Lifestyle', 'Beauty', 'Fast Turnaround'],
            aiReasoning: 'Strong overlap with target audience (Females 18-24). Consistent high engagement on similar product reviews.',
            negotiation: {
                currentOffer: 450,
                history: [
                    { step: 'AI Proposal', val: 400, status: 'done' },
                    { step: 'Counter', val: 550, status: 'done' },
                    { step: 'Agent Adjusted', val: 450, status: 'pending' }
                ]
            }
        },
        {
            id: 102,
            name: 'TechWithTom',
            handle: '@tech_tom',
            platform: 'YouTube',
            fitScore: 88,
            bid: 1200,
            tags: ['Tech', 'Reviews', 'Deep Dive'],
            aiReasoning: 'Authority in tech space. Higher cost but higher conversion potential.',
            negotiation: {
                currentOffer: 1200,
                history: [
                    { step: 'AI Proposal', val: 1200, status: 'done' }
                ]
            }
        },
        {
            id: 103,
            name: 'YogaDaily',
            handle: '@yogadaily',
            platform: 'Instagram',
            fitScore: 72,
            bid: 300,
            tags: ['Wellness', 'Fitness'],
            aiReasoning: 'Good engagement but audience location skew slightly misaligned.',
            negotiation: {
                currentOffer: 300,
                history: []
            }
        }
    ]
};
