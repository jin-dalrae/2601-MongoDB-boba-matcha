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

export default function Deals({ onBack, activeDeal }) {
    const [showContent, setShowContent] = useState(false);

    // Track confirmed deals
    const [confirmedDeals, setConfirmedDeals] = useState([]);

    // Lists state
    const [suggestedDeals, setSuggestedDeals] = useState(aiSuggested);
    const [negotiatingDeals, setNegotiatingDeals] = useState(inNegotiation);

    const [negotiatingDeal, setNegotiatingDeal] = useState(null);

    // Initial load animation
    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle incoming deal from Discover (Bidding Started flow)
    useEffect(() => {
        if (activeDeal) {
            // Check if it's already in negotiation to avoid dupes
            const alreadyExists = negotiatingDeals.find(d => d.id === activeDeal.id);
            const isConfirmed = confirmedDeals.find(d => d.id === activeDeal.id);

            if (!alreadyExists && !isConfirmed) {
                // Add to negotiation list
                const newNegotiation = {
                    ...activeDeal,
                    yourBid: activeDeal.suggestedBid ? parseInt(activeDeal.suggestedBid.replace(/\D/g, '')) : 600,
                    brandCounter: null,
                    status: 'processing', // Initial state
                    agentInsight: 'AI agents are exchanging terms',
                    lastUpdate: 'Just now'
                };

                setNegotiatingDeals(prev => [newNegotiation, ...prev]);

                // Remove from suggested if it was there (matching by ID)
                setSuggestedDeals(prev => prev.filter(d => d.id !== activeDeal.id));
            }
        }
    }, [activeDeal]); // Run when activeDeal changes

    const formatCurrency = (amount) => {
        // ... (rest is same helper)
    };

    // ... (timer logic) ...

    // ... (remove dealUpdates Map, use state directly)

    const handleStartNegotiation = (deal) => {
        setNegotiatingDeal(deal);
    };

    const handleNegotiationUpdate = (updatedDeal) => {
        // Update local state for negotiations
        setNegotiatingDeals(prev => prev.map(d =>
            d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d
        ));
    };

    const handleNegotiationComplete = (completedDeal) => {
        // Move to confirmed
        const newConfirmed = {
            ...completedDeal,
            confirmedAt: Date.now(),
            timeLeft: 30 * 60,
            status: 'confirmed_pending'
        };

        setConfirmedDeals(prev => [...prev, newConfirmed]);

        // Remove from negotiation list
        setNegotiatingDeals(prev => prev.filter(d => d.id !== completedDeal.id));
    };

    const handleCancelDeal = (dealId) => {
        setConfirmedDeals(prev => prev.filter(d => d.id !== dealId));
    };

    const handleAccept = (dealId) => {
        console.log("Accepted deal:", dealId);
        // Placeholder for accept logic
    };

    const handleDecline = (dealId) => {
        console.log("Declined deal:", dealId);
        const card = document.getElementById(`deal-${dealId}`);
        if (card) {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
        }
    };



    return (
        <div className="page deals-page">
            <header className={`page-header ${showContent ? 'animate-in' : ''}`}>
                <h1 className="page-title">Deals</h1>
                <p className="page-subtitle">Active negotiations & opportunities</p>
            </header>

            {/* CONFIRMED DEALS (CANCEL WINDOW) */}
            {confirmedDeals.length > 0 && (
                <section className="deals-section animate-in">
                    <div className="section-header">
                        <h2 className="section-title">New Active Pacts</h2>
                        <span className="action-count">{confirmedDeals.length}</span>
                    </div>
                    <div className="deals-list">
                        {confirmedDeals.map(deal => (
                            <div key={deal.id} className="deal-card confirmed">
                                <div className="deal-header">
                                    <div className="deal-info">
                                        <h3 className="deal-brand">{deal.brand}</h3>
                                        <p className="deal-campaign">{deal.campaign}</p>
                                    </div>
                                    <div className="status-badge success">
                                        Confirmed
                                    </div>
                                </div>

                                <div className="confirmation-info">
                                    <p className="info-text">
                                        Final Payout: <span className="highlight">${deal.finalPrice}</span>
                                    </p>
                                    <p className="info-text">
                                        Deliverable: 1 TikTok Video
                                    </p>
                                </div>

                                <div className="cancel-window-container">
                                    <div className="cancel-text">
                                        Auto-confirmed. Cancel available for <span className="timer">{formatTime(deal.timeLeft)}</span>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-sm interaction-press"
                                        onClick={() => handleCancelDeal(deal.id)}
                                        disabled={deal.timeLeft === 0}
                                    >
                                        Cancel Deal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* AI Suggested - with glow */}
            {aiSuggested.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                    <div className="section-header">
                        <h2 className="section-title">AI Suggested</h2>
                        <StatusIndicator status="ai-working" size={16} />
                    </div>
                    <div className="deals-list">
                        {aiSuggested.map((deal) => {
                            const status = getDealStatus(deal);
                            const isNegotiating = status === 'negotiating';

                            if (confirmedDeals.find(d => d.id === deal.id)) return null; // Hide if confirmed

                            return (
                                <div key={deal.id} id={`deal-${deal.id}`} className="deal-card ai-suggested">
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
                                        {isNegotiating ? (
                                            <button
                                                className="btn btn-secondary btn-full interaction-press"
                                                onClick={() => handleStartNegotiation({ ...deal, negotiationStatus: 'negotiating' })}
                                            >
                                                <span className="pulse-dot-sm"></span>
                                                View Negotiation
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-primary interaction-press"
                                                    onClick={() => handleStartNegotiation({ ...deal, negotiationStatus: 'started' })}
                                                >
                                                    Start Bidding
                                                </button>
                                                <div style={{ flex: 1 }}></div>
                                                <button
                                                    className="btn-text"
                                                    onClick={() => handleDecline(deal.id)}
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
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
                                id={`deal-${deal.id}`}
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
                                        <button
                                            className="btn btn-primary interaction-press"
                                            onClick={() => handleAccept(deal.id)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-secondary interaction-press"
                                            onClick={() => handleStartNegotiation(deal)}
                                        >
                                            Counter
                                        </button>
                                        <div style={{ flex: 1 }}></div>
                                        <button
                                            className="btn-text"
                                            onClick={() => handleDecline(deal.id)}
                                        >
                                            Decline
                                        </button>
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
                onComplete={handleNegotiationComplete}
            />
        </div>
    );
}
