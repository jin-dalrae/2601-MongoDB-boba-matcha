import { useState, useEffect } from 'react';
import StatusIndicator from '../components/StatusIndicator';
import NegotiationModal from '../components/NegotiationModal';
import NegotiationResult from '../components/NegotiationResult';
import ContractModal from '../components/ContractModal';
import SubmitContentModal from '../components/SubmitContentModal';
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

    // Track confirmed deals - Initialize with Mock Data for Demo
    const [confirmedDeals, setConfirmedDeals] = useState([
        {
            id: 101,
            brand: 'Glossier',
            campaign: 'Summer Skin Tint',
            finalPrice: 850,
            timeLeft: 28 * 60 + 15, // ~28 mins left
            status: 'confirmed_pending',
            deliverable: '1 TikTok Video',
            confirmedAt: Date.now()
        }
    ]);

    // Lists state
    const [suggestedDeals, setSuggestedDeals] = useState(aiSuggested);
    const [negotiatingDeals, setNegotiatingDeals] = useState(inNegotiation);
    const [negotiatingDeal, setNegotiatingDeal] = useState(null);
    const [viewingContract, setViewingContract] = useState(null);
    const [submittingDeal, setSubmittingDeal] = useState(null);
    const [resultData, setResultData] = useState(null); // { status: 'success'|'failure', deal: ... }

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
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Timer for active deals
    useEffect(() => {
        const interval = setInterval(() => {
            setConfirmedDeals(prev => prev.map(deal => ({
                ...deal,
                timeLeft: deal.timeLeft > 0 ? deal.timeLeft - 1 : 0
            })));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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
        // Show success result
        setResultData({ status: 'success', deal: { ...completedDeal, finalPrice: completedDeal.finalPrice || 725 } });
        // We defer the move to confirmed until they close the result modal
    };

    const handleResultClose = () => {
        if (!resultData) return;

        if (resultData.status === 'success') {
            // Move to confirmed
            const newConfirmed = {
                ...resultData.deal,
                confirmedAt: Date.now(),
                timeLeft: 30 * 60,
                status: 'confirmed_pending'
            };
            setConfirmedDeals(prev => [...prev, newConfirmed]);
            setNegotiatingDeals(prev => prev.filter(d => d.id !== resultData.deal.id));
        } else {
            // For failure, maybe just remove it or keep it as "rejected"?
            // User just said "one being not accepted". Let's remove it from negotiation list for now.
            setNegotiatingDeals(prev => prev.filter(d => d.id !== resultData.deal.id));
        }

        setResultData(null);
    };

    const handleCancelDeal = (dealId) => {
        setConfirmedDeals(prev => prev.filter(d => d.id !== dealId));
    };

    const handleAccept = (dealId) => {
        const deal = negotiatingDeals.find(d => d.id === dealId);
        if (deal) {
            handleNegotiationComplete(deal);
        }
    };

    const handleDecline = (dealId) => {
        // Trigger failure/declined view
        const deal = negotiatingDeals.find(d => d.id === dealId) || suggestedDeals.find(d => d.id === dealId);
        if (deal) {
            setResultData({ status: 'failure', deal: { ...deal, brandMax: 500, minAsk: 600 } });
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
                                <div className="deal-actions mt-3 pt-3 border-t border-white-10 flex gap-2">
                                    <button
                                        className="btn btn-secondary flex-1"
                                        onClick={() => setViewingContract(deal)}
                                    >
                                        View Contract
                                    </button>
                                    <button
                                        className="btn btn-primary flex-1"
                                        onClick={() => setSubmittingDeal(deal)}
                                    >
                                        Submit Content
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* AI Suggested - with glow */}
            {suggestedDeals.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                    <div className="section-header">
                        <h2 className="section-title">AI Suggested</h2>
                        <StatusIndicator status="ai-working" size={16} />
                    </div>
                    <div className="deals-list">
                        {suggestedDeals.map((deal) => {
                            // Logic: In "Suggested" list, they are just candidates.
                            // Button is "Start Bidding" which opens local modal if configured OR triggers callback.
                            // But here we want the local "Start Bidding" to actually behave like the Discovery one if clicked here too?
                            // User said "Start Bidding appears only on Discovery cards" - Wait.
                            // "Discovery -> Start Bidding -> Deals".
                            // "Deals Page Behavior... If a campaign was already initiated from Discover: DO NOT show 'Start Bidding' again".
                            // This implies items in "AI Suggested" on Deals page are *not* initiated yet.
                            // If they are not initiated, they should have "Start Bidding"?
                            // User Prompt: "What the Button Should Become ... REMOVE in Deals page: 'Start Bidding' ... REPLACE with status-based UI".
                            // This implies even for suggested deals on this page?
                            // "Once bidding is initiated ... system owns process".
                            // If I click start here, it initiates.
                            // Let's assume on Deals page, we can also start bidding.

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
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* In Negotiation */}
            {negotiatingDeals.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                    <h2 className="section-title">In Negotiation</h2>
                    <div className="deals-list">
                        {negotiatingDeals.map((deal, index) => (
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

                                <div className="deal-actions">
                                    {/* Processing / Negotiating State */}
                                    {deal.status === 'processing' || deal.status === 'pending' || deal.status === 'negotiating' ? (
                                        <button className="btn btn-secondary btn-full disabled" disabled>
                                            <span className="pulse-dot-sm"></span>
                                            Negotiating...
                                        </button>
                                    ) : deal.status === 'counter' ? (
                                        <>
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
                                        </>
                                    ) : null}
                                </div>
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

            {resultData && (
                <NegotiationResult
                    result={resultData.status}
                    deal={resultData.deal}
                    onClose={handleResultClose}
                />
            )}

            <ContractModal
                isOpen={!!viewingContract}
                deal={viewingContract}
                onClose={() => setViewingContract(null)}
                onCancel={(id) => {
                    handleCancelDeal(id);
                    setViewingContract(null);
                }}
            />

            <SubmitContentModal
                isOpen={!!submittingDeal}
                onClose={() => setSubmittingDeal(null)}
            />
        </div>
    );
}
