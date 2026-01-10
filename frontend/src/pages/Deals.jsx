import { useState, useEffect } from 'react';
import StatusIndicator from '../components/StatusIndicator';
import NegotiationModal from '../components/NegotiationModal';
import './Deals.css';

// Deal states
const aiSuggested = [
    {
        id: 1,
        brand: 'Glossier',
        campaign: 'Summer Skin Tint',
        suggestedBid: '$650',
        budgetRange: '$500 – $1,000',
        matchPercent: 85
    }
];

const inNegotiation = [
    {
        id: 2,
        brand: 'Nike',
        campaign: 'Athletic wear promotion',
        yourBid: 500,
        brandCounter: 450,
        status: 'counter',
        agentInsight: '82% likelihood of acceptance if countered at $475',
        lastUpdate: '2h ago'
    },
    {
        id: 3,
        brand: 'Adidas',
        campaign: 'Summer Running Collection',
        yourBid: 600,
        brandCounter: null,
        status: 'pending',
        agentInsight: 'Awaiting brand response',
        lastUpdate: '6h ago'
    }
];

const actionRequired = [
    {
        id: 4,
        brand: 'Sephora',
        campaign: 'Skincare routine feature',
        issue: 'Brand requested clarification on posting date.',
        actionType: 'respond',
        lastUpdate: '1h ago'
    }
];

export default function Deals({ onBack }) {
    const [showContent, setShowContent] = useState(false);
    const [negotiatingDeal, setNegotiatingDeal] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (amount) => {
        if (typeof amount === 'number') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
            }).format(amount);
        }
        return amount;
    };

    const handleStartNegotiation = (deal) => {
        setNegotiatingDeal(deal);
    };

    return (
        <div className="page deals-page">
            {/* Left-aligned page header */}
            <header className={`page-header ${showContent ? 'animate-in' : ''}`}>
                <h1 className="page-title">Deals</h1>
                <p className="page-subtitle">Active negotiations & opportunities</p>
            </header>

            {/* AI Suggested - with glow */}
            {aiSuggested.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                    <div className="section-header">
                        <h2 className="section-title">AI Suggested</h2>
                        <StatusIndicator status="ai-working" size={16} />
                    </div>
                    <div className="deals-list">
                        {aiSuggested.map((deal) => (
                            <div key={deal.id} className="deal-card ai-suggested">
                                <div className="deal-header">
                                    <div className="deal-info">
                                        <h3 className="deal-brand">{deal.brand}</h3>
                                        <p className="deal-campaign">{deal.campaign}</p>
                                    </div>
                                    <div className="ai-match">
                                        <span className="match-value">{deal.matchPercent}%</span>
                                        <span className="match-label">match</span>
                                    </div>
                                </div>
                                <div className="deal-suggestion">
                                    <div className="suggestion-row">
                                        <span className="suggestion-label">Suggested Bid</span>
                                        <span className="suggestion-value">{deal.suggestedBid}</span>
                                    </div>
                                    <div className="suggestion-row muted">
                                        <span className="suggestion-label">Budget Range</span>
                                        <span className="suggestion-value">{deal.budgetRange}</span>
                                    </div>
                                </div>
                                <div className="deal-actions">
                                    <button
                                        className="btn btn-primary interaction-press"
                                        onClick={() => handleStartNegotiation(deal)}
                                    >
                                        Start Bidding
                                    </button>
                                    <button className="btn btn-secondary interaction-press">Adjust</button>
                                    <div style={{ flex: 1 }}></div>
                                    <button className="btn-text">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* In Negotiation */}
            {inNegotiation.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                    <h2 className="section-title">In Negotiation</h2>
                    <div className="deals-list">
                        {inNegotiation.map((deal, index) => (
                            <div
                                key={deal.id}
                                className={`deal-card negotiation ${deal.status}`}
                                style={{ '--stagger': `${index * 40}ms` }}
                            >
                                <div className="deal-header">
                                    <div className="deal-info">
                                        <h3 className="deal-brand">{deal.brand}</h3>
                                        <p className="deal-campaign">{deal.campaign}</p>
                                    </div>
                                    <span className="deal-time">{deal.lastUpdate}</span>
                                </div>

                                <div className="negotiation-status">
                                    <div className="bid-row">
                                        <span className="bid-label">Your bid</span>
                                        <span className="bid-value yours">{formatCurrency(deal.yourBid)}</span>
                                    </div>
                                    {deal.brandCounter && (
                                        <div className="bid-row">
                                            <span className="bid-label">Brand counter</span>
                                            <span className="bid-value counter">{formatCurrency(deal.brandCounter)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="agent-insight">
                                    <StatusIndicator status="ai-working" size={14} />
                                    <span>{deal.agentInsight}</span>
                                </div>

                                {deal.status === 'counter' && (
                                    <div className="deal-actions">
                                        <button className="btn btn-primary interaction-press">Accept</button>
                                        <button className="btn btn-secondary interaction-press">Counter</button>
                                        <div style={{ flex: 1 }}></div>
                                        <button className="btn-text">Decline</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Action Required */}
            {actionRequired.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '180ms' }}>
                    <div className="section-header">
                        <h2 className="section-title">Action Required</h2>
                        <span className="action-count">{actionRequired.length}</span>
                    </div>
                    <div className="deals-list">
                        {actionRequired.map((deal) => (
                            <div key={deal.id} className="deal-card action-required">
                                <div className="deal-header">
                                    <div className="deal-info">
                                        <h3 className="deal-brand">{deal.brand}</h3>
                                        <p className="deal-campaign">{deal.campaign}</p>
                                    </div>
                                </div>
                                <p className="action-issue">{deal.issue}</p>
                                <button className="btn btn-primary btn-full interaction-press">
                                    Respond via agent
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Negotiation Flow */}
            <NegotiationModal
                isOpen={!!negotiatingDeal}
                campaign={negotiatingDeal}
                onClose={() => setNegotiatingDeal(null)}
            />
        </div>
    );
}
