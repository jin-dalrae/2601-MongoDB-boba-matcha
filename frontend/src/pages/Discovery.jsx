import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientLoader from '../components/GradientLoader';
import { campaignAPI, dealAPI, userAPI } from '../services/api';
import { ensureCreatorId } from '../lib/creator';
import './Discovery.css';
import '../components/NegotiationModal.css'; // Reuse modal styles

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

const BrandLogo = ({ name }) => (
    <div className="brand-logo-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#0E0F0F" fontWeight="600">
                {(name || '?').charAt(0).toUpperCase()}
            </text>
        </svg>
    </div>
);

// Derive a budget range string from a campaign's budget_limit.
const formatBudgetRange = (limit) => {
    if (!limit) return '—';
    const low = Math.max(200, Math.floor(limit * 0.4));
    return `$${low.toLocaleString()} – $${limit.toLocaleString()}`;
};

// Build an initial bid roughly in the lower-middle of the campaign budget.
const initialBidFor = (limit) => {
    if (!limit) return 500;
    return Math.max(200, Math.floor(limit * 0.5));
};

export default function Discovery() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [showContent, setShowContent] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);
    const [processingCampaign, setProcessingCampaign] = useState(null);
    const [creatorId, setCreatorId] = useState('');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [resolvedCreatorId, list] = await Promise.all([
                    ensureCreatorId(),
                    campaignAPI.getActiveCampaigns(),
                ]);
                if (cancelled) return;
                setCreatorId(resolvedCreatorId);
                setCampaigns(Array.isArray(list) ? list : []);
                setLoadError('');
            } catch (error) {
                if (!cancelled) setLoadError(error.message || 'Failed to load campaigns.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const handleCardClick = (campaign) => {
        setExpandedCard(expandedCard === campaign._id ? null : campaign._id);
    };

    const handleStartBidding = async (e, campaign) => {
        e.stopPropagation();
        if (!creatorId) {
            setLoadError('No creator id available. Complete onboarding first.');
            return;
        }
        setProcessingCampaign(campaign);

        const initialBid = initialBidFor(campaign.budget_limit);
        let creatorProfile = null;
        try {
            // Best-effort: fetch the full creator profile so the negotiation agent gets useful context.
            creatorProfile = await userAPI.getUserProfile(creatorId).catch(() => null);

            const deal = await dealAPI.createDeal({
                campaignId: campaign._id,
                creatorId,
                current_bid: initialBid,
                status: 'Negotiating',
            });

            const dealContext = {
                contractId: deal?._id,           // AutoBid id stands in until a Contract is signed
                creatorId,
                advertiserId: campaign.advertiserId?._id || campaign.advertiserId,
                campaignId: campaign._id,
                initialOffer: { price: initialBid, deliverable: '1 video' },
                creatorProfile: creatorProfile || { id: creatorId },
                advertiserRequirements: campaign.product_info || {},
                maxRounds: 5,
            };

            sessionStorage.setItem(
                'selectedCampaign',
                JSON.stringify({
                    id: deal?._id,
                    brand: campaign.advertiserId?.name || 'Brand',
                    campaign: campaign.title,
                    suggestedBid: `$${initialBid}`,
                    budgetRange: formatBudgetRange(campaign.budget_limit),
                    matchPercent: 80,
                    dealContext,
                }),
            );

            setTimeout(() => {
                navigate(`/creator/deals/${campaign._id}`);
            }, 800);
        } catch (error) {
            setProcessingCampaign(null);
            setLoadError(error.message || 'Failed to start bidding.');
        }
    };

    return (
        <div className="page discovery">
            <header className={`page-header ${showContent ? 'animate-in' : ''}`}>
                <h1 className="page-title">Discover</h1>
                <p className="page-subtitle">Active campaigns matched to you</p>
            </header>

            {loadError && (
                <div className="deals-list" style={{ color: '#d93b3b', padding: '12px 16px' }}>
                    {loadError}
                </div>
            )}

            {!loading && campaigns.length === 0 && !loadError && (
                <div className="deals-list" style={{ padding: '24px 16px', color: 'var(--color-secondary)' }}>
                    No active campaigns right now. Check back soon.
                </div>
            )}

            <div className="deals-list">
                {campaigns.map((campaign, index) => {
                    const advertiserName = campaign.advertiserId?.name || 'Brand';
                    const description = campaign.product_info?.description
                        || `Promote ${campaign.product_info?.name || 'this product'}.`;
                    const productName = campaign.product_info?.name;

                    return (
                        <div
                            key={campaign._id}
                            className={`deal-card ${expandedCard === campaign._id ? 'expanded' : ''}`}
                            style={{ '--stagger': `${index * 50}ms` }}
                            onClick={() => handleCardClick(campaign)}
                        >
                            <div className="deal-header">
                                <div className="deal-brand-info">
                                    <BrandLogo name={advertiserName} />
                                    <div className="brand-details">
                                        <h3 className="brand-name">{advertiserName}</h3>
                                        <div className="brand-meta">
                                            <span className="category">{productName || 'Campaign'}</span>
                                            <span className="separator">•</span>
                                            <span className="platform-badge">
                                                <PlatformIcon platform="TikTok" />
                                                TikTok
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="deal-description">{campaign.title}</p>

                            <div className={`deal-expanded ${expandedCard === campaign._id ? 'show' : ''}`}>
                                <div className="deal-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Product</span>
                                        <span className="detail-value">{productName || campaign.title}</span>
                                        <span className="detail-note">{description}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Budget</span>
                                        <span className="detail-value">{formatBudgetRange(campaign.budget_limit)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="deal-footer">
                                <div className="budget-range">
                                    <span className="budget-value">{formatBudgetRange(campaign.budget_limit)}</span>
                                </div>
                                <AIFitIndicator level={4} />
                            </div>

                            {expandedCard === campaign._id && (
                                <button
                                    className="btn btn-primary btn-full deal-action"
                                    onClick={(e) => handleStartBidding(e, campaign)}
                                    disabled={!!processingCampaign}
                                >
                                    Start Bidding
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {processingCampaign && (
                <div className="modal-overlay">
                    <div className="modal-center negotiation-slide-up">
                        <div className="modal-icon-header">
                            <GradientLoader size={120} />
                        </div>
                        <h2 className="modal-title">Processing...</h2>
                        <p className="modal-desc">
                            Your AI agent is preparing to negotiate.
                            <br />
                            Hang tight for a moment.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
