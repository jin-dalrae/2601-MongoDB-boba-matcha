
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
        { id: 4, name: 'Winter Collection', status: 'Audit Complete', creators: 1, spent: 1200 }, // Ready for payment
    ],
    agentActivity: [
        { id: 1, text: 'Shortlisted 5 creators', time: '2h ago' },
        { id: 2, text: 'Auto-adjusted 2 bids', time: '5h ago' },
        { id: 3, text: 'Negotiation completed with @sarah', time: '1d ago' },
    ],
    creators: [
        {
            id: 101,
            campaignId: 2, // Linked to Product Reveal
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
            campaignId: 2,
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
            campaignId: 2,
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
    ],
    payments: [
        {
            id: 201,
            campaignId: 4, // Winter Collection
            campaignName: 'Winter Collection',
            creatorName: 'FashionIcon',
            amount: 1200,
            status: 'Pending', // Corresponds to Audit Complete
            auditScore: 0.92
        },
        {
            id: 202,
            campaignId: 1, // Summer Launch
            campaignName: 'Summer Launch',
            creatorName: 'BeachVibes',
            amount: 850,
            status: 'Paid',
            date: '2025-06-15'
        }
    ],
    contracts: [
        {
            id: 301,
            campaignId: 2, // Product Reveal
            title: 'Influencer Marketing Agreement',
            type: 'Master Service Agreement',
            status: 'Active',
            version: '1.2',
            lastUpdated: '2 days ago',
            parties: ['Matcha Platform (Advertiser)', 'Sarah Jenkins (Creator)'],
            clauses: [
                { title: '1. Scope of Work', text: 'Creator agrees to produce two (2) TikTok videos featuring the "Matcha Glow" serum. Videos must be at least 45 seconds in length and include the hashtag #MatchaGlow.' },
                { title: '2. Deliverables & Timeline', text: 'Drafts must be submitted by June 15th, 2025. Final posting must occur within 48 hours of approval.' },
                { title: '3. Compensation', text: 'Total compensation shall be $450.00 USD, payable upon successful publication and audit verification.' },
                { title: '4. Exclusivity', text: 'Creator agrees not to promote skincare products from direct competitors for a period of 30 days following publication.' },
                { title: '5. Usage Rights', text: 'Advertiser grants Creator a non-exclusive, non-transferable license to use the "Matcha Glow" trademark solely for the purpose of this campaign.' }
            ]
        },
        {
            id: 302,
            campaignId: 2, // Product Reveal
            title: 'Usage Rights Addendum',
            type: 'Addendum',
            status: 'Draft',
            version: '0.9',
            lastUpdated: '5 hours ago',
            parties: ['Matcha Platform', 'TechWithTom'],
            clauses: [
                { title: '1. Digital Rights', text: 'Advertiser retains the right to boost content on paid social channels for 90 days.' }
            ]
        }
    ]
};
