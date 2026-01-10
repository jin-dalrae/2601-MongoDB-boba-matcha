import { useState, useEffect } from 'react';
import './Discovery.css';

// Platform icons
const PlatformIcon = ({ platform }) => {
    if (platform === 'TikTok') {
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
        );
    }
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
};

// AI Fit indicator
const AIFitIndicator = ({ level }) => {
    const dots = [1, 2, 3, 4, 5];
    return (
        <div className="ai-fit">
            <span className="ai-fit-label">AI Fit</span>
            <div className="ai-fit-dots">
                {dots.map((dot) => (
                    <span
                        key={dot}
                        className={`ai-fit-dot ${dot <= level ? 'filled' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

// Brand logos as SVG icons
const BrandLogo = ({ brand }) => {
    const logos = {
        'Glossier': (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#0E0F0F" fontWeight="600">G</text>
            </svg>
        ),
        'Notion': (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#0E0F0F" fontWeight="600">N</text>
            </svg>
        ),
        'Lululemon': (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 10 L12 16 L16 10" stroke="#0E0F0F" strokeWidth="2" fill="none" />
            </svg>
        ),
        'Canva': (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#0E0F0F" fontWeight="600">C</text>
            </svg>
        ),
        'Spotify': (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M7 10 Q12 8 17 10" stroke="#0E0F0F" strokeWidth="1.5" fill="none" />
                <path d="M8 13 Q12 11 16 13" stroke="#0E0F0F" strokeWidth="1.5" fill="none" />
                <path d="M9 16 Q12 14 15 16" stroke="#0E0F0F" strokeWidth="1.5" fill="none" />
            </svg>
        )
    };
    return <div className="brand-logo-icon">{logos[brand] || logos['Glossier']}</div>;
};

// Category filters
const categories = ['All', 'Beauty', 'Fashion', 'Lifestyle', 'Fitness', 'Productivity', 'Design'];

// Open Deals data
const openDeals = [
    {
        id: 1,
        brand: 'Glossier',
        category: 'Beauty',
        platform: 'TikTok',
        format: '1 video',
        description: 'Looking for creators to feature our Summer Skin Tint. Focus on natural lighting and GRWM-style content.',
        deliverable: '1 TikTok (15–30s)',
        deliverableNote: 'Usage + mention in first 5 seconds',
        timeline: 'Post within 7 days',
        budgetRange: '$500 – $1,000',
        aiFit: 4,
        isNew: true
    },
    {
        id: 2,
        brand: 'Notion',
        category: 'Productivity',
        platform: 'TikTok',
        format: '1 video',
        description: 'Show how you organize content creation or daily workflow using Notion.',
        deliverable: '1 short-form video',
        deliverableNote: 'Screen capture allowed',
        timeline: 'Flexible',
        budgetRange: '$200 – $500',
        aiFit: 3,
        isNew: false
    },
    {
        id: 3,
        brand: 'Lululemon',
        category: 'Fitness',
        platform: 'TikTok',
        format: '1 clip',
        description: 'Workout or lifestyle content featuring our new Align collection.',
        deliverable: '1 workout clip + lifestyle B-roll',
        deliverableNote: 'No discount codes required',
        timeline: 'Within 2 weeks',
        budgetRange: '$800 – $1,500',
        aiFit: 5,
        isNew: true
    },
    {
        id: 4,
        brand: 'Canva',
        category: 'Design',
        platform: 'TikTok',
        format: '1 video',
        description: 'Share how you design thumbnails, pitch decks, or content ideas.',
        deliverable: '1 tutorial-style video',
        deliverableNote: 'Educational tone preferred',
        timeline: 'Flexible',
        budgetRange: '$300 – $600',
        aiFit: 3,
        isNew: false
    },
    {
        id: 5,
        brand: 'Spotify',
        category: 'Lifestyle',
        platform: 'Instagram',
        format: '1 Reel',
        description: 'Create a "day in my life" Reel featuring Spotify playlists and listening moments.',
        deliverable: '1 Instagram Reel (30–60s)',
        deliverableNote: 'Must tag @Spotify',
        timeline: 'Within 10 days',
        budgetRange: '$400 – $800',
        aiFit: 4,
        isNew: false
    }
];

export default function Discovery({ onSelectCampaign }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [showContent, setShowContent] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const filteredDeals = openDeals.filter(deal => {
        if (activeCategory === 'All') return true;
        return deal.category === activeCategory;
    });

    const handleCardClick = (deal) => {
        setExpandedCard(expandedCard === deal.id ? null : deal.id);
    };

    return (
        <div className="page discovery">
            {/* Left-aligned page header */}
            <header className={`page-header ${showContent ? 'animate-in' : ''}`}>
                <h1 className="page-title">Discover</h1>
                <p className="page-subtitle">Campaigns matched to you</p>
            </header>

            {/* Category filter capsules */}
            <div className={`category-filters ${showContent ? 'animate-in' : ''}`}>
                <div className="category-scroll">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`category-capsule ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Deal Cards */}
            <div className="deals-list">
                {filteredDeals.map((deal, index) => (
                    <div
                        key={deal.id}
                        className={`deal-card ${expandedCard === deal.id ? 'expanded' : ''}`}
                        style={{ '--stagger': `${index * 50}ms` }}
                        onClick={() => handleCardClick(deal)}
                    >
                        {/* Card Header */}
                        <div className="deal-header">
                            <div className="deal-brand-info">
                                <BrandLogo brand={deal.brand} />
                                <div className="brand-details">
                                    <h3 className="brand-name">{deal.brand}</h3>
                                    <div className="brand-meta">
                                        <span className="category">{deal.category}</span>
                                        <span className="separator">•</span>
                                        <span className="platform-badge">
                                            <PlatformIcon platform={deal.platform} />
                                            {deal.platform}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {deal.isNew && <span className="new-badge">New</span>}
                        </div>

                        {/* Description */}
                        <p className="deal-description">{deal.description}</p>

                        {/* Expanded Content */}
                        <div className={`deal-expanded ${expandedCard === deal.id ? 'show' : ''}`}>
                            <div className="deal-details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Deliverable</span>
                                    <span className="detail-value">{deal.deliverable}</span>
                                    <span className="detail-note">{deal.deliverableNote}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Timeline</span>
                                    <span className="detail-value">{deal.timeline}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="deal-footer">
                            <div className="budget-range">
                                <span className="budget-value">{deal.budgetRange}</span>
                            </div>
                            <AIFitIndicator level={deal.aiFit} />
                        </div>

                        {/* Action Button (when expanded) */}
                        {expandedCard === deal.id && (
                            <button
                                className="btn btn-primary btn-full deal-action"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectCampaign?.(deal);
                                }}
                            >
                                Start Bidding
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
