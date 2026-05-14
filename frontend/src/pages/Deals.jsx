import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import StatusIndicator from '../components/StatusIndicator';
import NegotiationModal from '../components/NegotiationModal';
import NegotiationResult from '../components/NegotiationResult';
import ContractModal from '../components/ContractModal';
import SubmitContentModal from '../components/SubmitContentModal';
import { dealAPI, contractAPI } from '../services/api';
import { ensureCreatorId } from '../lib/creator';
import './Deals.css';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

const formatRelative = (date) => {
    if (!date) return '—';
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMin = Math.max(Math.floor(diffMs / 60000), 0);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

// Turn a raw AutoBid (with populated campaign + advertiser) into the UI shape.
const toViewDeal = (deal, contractByDeal) => {
    const campaign = deal.campaignId || {};
    const advertiser = campaign.advertiserId || {};
    const productName = campaign.product_info?.name;
    const linkedContract = contractByDeal[deal._id];
    return {
        id: deal._id,
        dealId: deal._id,
        brand: advertiser.name || productName || 'Brand',
        campaign: campaign.title || productName || 'Campaign',
        yourBid: deal.current_bid || 0,
        backendStatus: deal.status,
        agentInsight:
            deal.status === 'Negotiating' ? 'AI agents are exchanging terms.'
                : deal.status === 'Proposed' ? 'Awaiting brand response.'
                    : deal.status === 'Accepted' ? 'Negotiation accepted.'
                        : 'Status update pending.',
        lastUpdate: formatRelative(deal.createdAt),
        contractId: linkedContract?._id || null,
        contractTerms: linkedContract
            ? {
                base_payout: linkedContract.base_payout,
                conditional_tiers: linkedContract.conditional_tiers,
                audit_criteria: linkedContract.audit_criteria,
            }
            : null,
        raw: deal,
    };
};

export default function Deals() {
    const { campaignId } = useParams();
    const processedCampaignRef = useRef(new Set());
    const [showContent, setShowContent] = useState(false);

    const [deals, setDeals] = useState([]);
    const [contractByDeal, setContractByDeal] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [negotiatingDeal, setNegotiatingDeal] = useState(null);
    const [viewingContract, setViewingContract] = useState(null);
    const [submittingDeal, setSubmittingDeal] = useState(null);
    const [resultData, setResultData] = useState(null);

    const loadDeals = useCallback(async () => {
        try {
            setLoading(true);
            const creatorId = await ensureCreatorId();
            if (!creatorId) {
                setLoadError('No creator id available. Complete onboarding first.');
                setLoading(false);
                return;
            }
            const [dealsList, contractsList] = await Promise.all([
                dealAPI.getDealsByCreator(creatorId),
                contractAPI.getContractsByCreator(creatorId),
            ]);
            const byDeal = {};
            for (const c of contractsList || []) {
                const autoBidId = c.autoBidId && (c.autoBidId._id || c.autoBidId);
                if (autoBidId) byDeal[autoBidId] = c;
            }
            setContractByDeal(byDeal);
            setDeals(Array.isArray(dealsList) ? dealsList : []);
            setLoadError('');
        } catch (error) {
            setLoadError(error.message || 'Failed to load deals.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDeals();
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, [loadDeals]);

    // Hand-off from Discovery: a freshly created deal arrives via sessionStorage.
    // Auto-open the negotiation modal so the agents call fires immediately.
    useEffect(() => {
        if (!campaignId || processedCampaignRef.current.has(campaignId)) return;
        const raw = sessionStorage.getItem('selectedCampaign');
        if (!raw) return;
        try {
            const incoming = JSON.parse(raw);
            processedCampaignRef.current.add(campaignId);
            sessionStorage.removeItem('selectedCampaign');
            if (incoming.dealContext?.contractId) {
                setNegotiatingDeal({
                    id: incoming.id,
                    brand: incoming.brand,
                    campaign: incoming.campaign,
                    yourBid: parseInt((incoming.suggestedBid || '0').replace(/\D/g, ''), 10) || 0,
                    dealContext: incoming.dealContext,
                });
            }
        } catch (e) {
            console.error('Failed to parse selectedCampaign:', e);
        }
    }, [campaignId]);

    const viewDeals = useMemo(
        () => deals.map((d) => toViewDeal(d, contractByDeal)),
        [deals, contractByDeal],
    );

    const negotiatingDeals = viewDeals.filter((d) => d.backendStatus === 'Negotiating' || d.backendStatus === 'Proposed');
    const confirmedDeals = viewDeals.filter((d) => d.backendStatus === 'Accepted');

    const handleNegotiationComplete = (completed) => {
        setResultData({ status: 'success', deal: completed });
    };

    const handleResultClose = async () => {
        setResultData(null);
        await loadDeals();
    };

    const handleAccept = async (deal) => {
        try {
            await dealAPI.updateDeal(deal.dealId, { status: 'Accepted' });
            await loadDeals();
        } catch (error) {
            setLoadError(error.message || 'Failed to accept deal.');
        }
    };

    const handleDecline = async (deal) => {
        try {
            await dealAPI.updateDeal(deal.dealId, { status: 'Cancelled' });
            await loadDeals();
        } catch (error) {
            setLoadError(error.message || 'Failed to decline deal.');
        }
    };

    return (
        <div className="page deals-page">
            <header className={`page-header ${showContent ? 'animate-in' : ''}`}>
                <h1 className="page-title">Deals</h1>
                <p className="page-subtitle">Active negotiations and confirmed pacts</p>
            </header>

            {loadError && (
                <section className="deals-section" style={{ padding: '0 16px' }}>
                    <div className="deal-card" style={{ color: '#d93b3b' }}>{loadError}</div>
                </section>
            )}

            {!loading && viewDeals.length === 0 && !loadError && (
                <section className="deals-section animate-in">
                    <div className="deal-card" style={{ textAlign: 'center' }}>
                        <p className="action-issue" style={{ marginBottom: 12 }}>
                            No deals yet. Head to Discover to start bidding on campaigns.
                        </p>
                    </div>
                </section>
            )}

            {confirmedDeals.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`}>
                    <div className="section-header">
                        <h2 className="section-title">Confirmed Pacts</h2>
                        <span className="action-count">{confirmedDeals.length}</span>
                    </div>
                    <div className="deals-list">
                        {confirmedDeals.map((deal) => (
                            <div key={deal.id} className="deal-card confirmed">
                                <div className="deal-header">
                                    <div className="deal-info">
                                        <h3 className="deal-brand">{deal.brand}</h3>
                                        <p className="deal-campaign">{deal.campaign}</p>
                                    </div>
                                    <div className="status-badge success">Confirmed</div>
                                </div>

                                <div className="confirmation-info">
                                    <p className="info-text">
                                        Agreed Bid: <span className="highlight">{formatCurrency(deal.yourBid)}</span>
                                    </p>
                                    {deal.contractTerms?.base_payout && (
                                        <p className="info-text">
                                            Contract Base: <span className="highlight">{formatCurrency(deal.contractTerms.base_payout)}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="deal-actions mt-3 pt-3 border-t border-white-10 flex gap-2">
                                    <button
                                        className="btn btn-secondary flex-1"
                                        onClick={() => setViewingContract(deal)}
                                        disabled={!deal.contractId}
                                    >
                                        View Contract
                                    </button>
                                    <button
                                        className="btn btn-primary flex-1"
                                        onClick={() => setSubmittingDeal(deal)}
                                        disabled={!deal.contractId}
                                        title={deal.contractId ? '' : 'Contract not created yet'}
                                    >
                                        Submit Content
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {negotiatingDeals.length > 0 && (
                <section className={`deals-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                    <h2 className="section-title">In Negotiation</h2>
                    <div className="deals-list">
                        {negotiatingDeals.map((deal, index) => (
                            <div
                                key={deal.id}
                                className={`deal-card negotiation ${deal.backendStatus.toLowerCase()}`}
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
                                        <span className="bid-label">Current bid</span>
                                        <span className="bid-value yours">{formatCurrency(deal.yourBid)}</span>
                                    </div>
                                </div>

                                <div className="agent-insight">
                                    <StatusIndicator status="ai-working" size={14} />
                                    <span>{deal.agentInsight}</span>
                                </div>

                                <div className="deal-actions">
                                    <button
                                        className="btn btn-primary interaction-press"
                                        onClick={() => handleAccept(deal)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-secondary interaction-press"
                                        onClick={() => setNegotiatingDeal({
                                            ...deal,
                                            dealContext: null, // existing deals from DB don't carry a live dealContext
                                        })}
                                    >
                                        Open
                                    </button>
                                    <div style={{ flex: 1 }}></div>
                                    <button
                                        className="btn-text"
                                        onClick={() => handleDecline(deal)}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <NegotiationModal
                isOpen={!!negotiatingDeal}
                campaign={negotiatingDeal}
                onClose={() => setNegotiatingDeal(null)}
                onComplete={handleNegotiationComplete}
                dealContext={negotiatingDeal?.dealContext}
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
                onCancel={() => setViewingContract(null)}
            />

            <SubmitContentModal
                isOpen={!!submittingDeal}
                onClose={() => {
                    setSubmittingDeal(null);
                    loadDeals();
                }}
                contractId={submittingDeal?.contractId}
                contractTerms={submittingDeal?.contractTerms}
            />
        </div>
    );
}
