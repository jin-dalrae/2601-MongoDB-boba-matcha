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

    // Track confirmed deals that are in the 30-min cancel window
    // Format: { ...deal, confirmedAt: Date.now(), timeLeft: 1800 }
    const [confirmedDeals, setConfirmedDeals] = useState([]);
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

    // Timer logic for confirmed deals
    useEffect(() => {
        if (confirmedDeals.length === 0) return;

        const timer = setInterval(() => {
            setConfirmedDeals(prevDeals =>
                prevDeals.map(deal => {
                    const elapsed = Math.floor((Date.now() - deal.confirmedAt) / 1000);
                    const remaining = 30 * 60 - elapsed; // 30 mins in seconds
                    return { ...deal, timeLeft: remaining > 0 ? remaining : 0 };
                })
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [confirmedDeals.length]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const [dealUpdates] = useState(new Map());

    // Helper to get current status
    const getDealStatus = (deal) => dealUpdates.get(deal.id) || deal.negotiationStatus;

    const handleStartNegotiation = (deal) => {
        // If deal doesn't have a status yet, init as 'started'
        // If it was already negotiating, keep it
        const currentStatus = deal.negotiationStatus || 'started';
        setNegotiatingDeal({ ...deal, negotiationStatus: currentStatus });
    };

    const handleNegotiationUpdate = (updatedDeal) => {
        // Called when we close the "Bidding Started" modal or update progress
        // Find the deal in our lists (aiSuggested or inNegotiation) and update it
        // For prototype, we'll just update local lists (though props are read-only if passed down, 
        // we're using MOCK_DEALS imported or props... wait, aiSuggested is valid constant in this file scope?
        // Ah, aiSuggested in this file is actually a prop or local const? 
        // Let's assume we need to update a local state version of deals if we want persistence.
        // For this task, updating `negotiatingDeal` isn't enough if we close it.
        // We need to persist that "Adidas" is now "negotiating".

        // Since we don't have a global store, we'll just hack it for the active session 
        // by mutating the source array for the prototype demo or setting local state overrides.
        if (updatedDeal.id) {
            dealUpdates.set(updatedDeal.id, updatedDeal.negotiationStatus);
        }
    };

    const handleNegotiationComplete = (completedDeal) => {
        // Remove from AI Suggested or In Negotiation
        // Add to "Active Pacts" (or a special "Pending Confirmation" section if we want)
        // For this prototype, let's treat "In Negotiation" as the place they stay but with updated status,
        // OR move them to a new "Confirmed" section. 
        // Let's create a local "Confirmed" list for the demo to show the timer clearly.

        const newConfirmed = {
            ...completedDeal,
            confirmedAt: Date.now(),
            timeLeft: 30 * 60, // 30 mins
            status: 'confirmed_pending'
        };

        setConfirmedDeals(prev => [...prev, newConfirmed]);
        // Ideally remove from other lists, but for prototype ID matching is enough or just separate display
    };

    const handleCancelDeal = (dealId) => {
        setConfirmedDeals(prev => prev.filter(d => d.id !== dealId));
        // Logic to revert or delete
    };

    const handleDecline = (dealId) => {
        console.log("Declined deal:", dealId);
        const card = document.getElementById(`deal-${dealId}`);
        if (card) {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
        }
    };

    const handleAccept = (dealId) => {
        console.log("Accepted deal:", dealId);
        // Placeholder for accept logic
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
