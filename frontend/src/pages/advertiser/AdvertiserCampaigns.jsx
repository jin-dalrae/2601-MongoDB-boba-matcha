import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Check, Clock, DollarSign, Play, Eye } from 'lucide-react';
import './advertiser-theme.css';
import { fetchJson } from '../../lib/api';
import { resolveAdvertiserId } from '../../lib/advertiser';

const AdvertiserCampaigns = () => {
    const [activeView, setActiveView] = useState('list'); // list, detail
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);
    const advertiserId = useMemo(() => resolveAdvertiserId(), []);

    useEffect(() => {
        const loadCampaigns = async () => {
            if (!advertiserId) {
                setLoadError('Missing advertiser id. Add ?advertiserId=... to the URL or set VITE_ADVERTISER_ID.');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchJson(`/api/advertisers/${advertiserId}/campaigns/summary`);
                setCampaigns(data || []);
                setLoadError('');
            } catch (error) {
                setLoadError('Failed to load campaigns.');
            } finally {
                setIsLoading(false);
            }
        };

        loadCampaigns();
    }, [advertiserId]);

    const getStatusPill = (status) => {
        const statusMap = {
            'Active': 'adv-pill-live',
            'Matching': 'adv-pill-matching',
            'Review': 'adv-pill-review',
            'Completed': 'adv-pill-draft',
            'Paused': 'adv-pill-draft'
        };
        return statusMap[status] || 'adv-pill-draft';
    };

    const getCreatorStatusIcon = (status) => {
        switch (status) {
            case 'Payment Released': return <DollarSign size={14} style={{ color: 'var(--adv-accent-primary)' }} />;
            case 'Audited':
            case 'Audit Complete': return <Check size={14} style={{ color: 'var(--adv-accent-primary)' }} />;
            case 'Content Submitted':
            case 'Audit Review': return <Eye size={14} style={{ color: 'var(--adv-status-progress)' }} />;
            case 'Content Creation': return <Play size={14} style={{ color: 'var(--adv-status-progress)' }} />;
            default: return <Clock size={14} style={{ color: 'var(--adv-text-muted)' }} />;
        }
    };

    const handleCampaignClick = async (campaign) => {
        if (!advertiserId) return;
        try {
            setDetailLoading(true);
            const detail = await fetchJson(`/api/advertisers/${advertiserId}/campaigns/${campaign.id}/detail`);
            setSelectedCampaign({
                id: detail.campaign.id,
                name: detail.campaign.name,
                status: detail.campaign.status,
                totalSpend: detail.summary.totalSpend || 0,
                budget: detail.summary.budget || 0,
                creatorsActive: detail.summary.creatorsActive || 0,
                timeline: detail.timeline || [],
                creators: detail.creators || []
            });
            setActiveView('detail');
        } catch (error) {
            setLoadError('Failed to load campaign details.');
        } finally {
            setDetailLoading(false);
        }
    };

    const renderList = () => (
        <>
            {campaigns.map((campaign, index) => (
                <div
                    key={campaign.id}
                    className="adv-campaign-card adv-animate-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleCampaignClick(campaign)}
                >
                    <div className="adv-campaign-header">
                        <span className="adv-campaign-name">{campaign.name}</span>
                        <span className={`adv-pill ${getStatusPill(campaign.status)}`}>
                            {campaign.status === 'Active' ? 'Live' : campaign.status}
                        </span>
                    </div>

                    <div className="adv-campaign-meta">
                        <div className="adv-campaign-meta-item">
                            <span className="adv-campaign-meta-label">Creators</span>
                            <span className="adv-campaign-meta-value">{campaign.creatorsActive}</span>
                        </div>
                        <div className="adv-campaign-meta-item">
                            <span className="adv-campaign-meta-label">Spent</span>
                            <span className="adv-campaign-meta-value">${campaign.totalSpend?.toLocaleString() || 0}</span>
                        </div>
                        <div className="adv-campaign-meta-item">
                            <span className="adv-campaign-meta-label">Budget</span>
                            <span className="adv-campaign-meta-value">${campaign.budget?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="adv-progress-bar" style={{ marginTop: '12px' }}>
                        <div
                            className="adv-progress-fill"
                            style={{ width: `${campaign.budget ? Math.min((campaign.totalSpend / campaign.budget) * 100, 100) : 0}%` }}
                        ></div>
                    </div>
                </div>
            ))}

            {!isLoading && campaigns.length === 0 && (
                <div className="adv-card">
                    <div className="adv-text-secondary">No campaigns found yet.</div>
                </div>
            )}
        </>
    );

    const renderDetail = () => (
        <>
            {/* Back Button */}
            <button
                className="adv-btn adv-btn-ghost"
                onClick={() => { setActiveView('list'); setSelectedCampaign(null); }}
                style={{ marginBottom: '16px', marginLeft: '-8px' }}
            >
                <ChevronLeft size={20} />
                Back to Campaigns
            </button>

            {/* Campaign Header */}
            <div className="adv-card adv-card-primary" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{selectedCampaign.name}</h2>
                        <span className={`adv-pill ${getStatusPill(selectedCampaign.status)}`}>
                            {selectedCampaign.status}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                    <div>
                        <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Total Spend</div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--adv-accent-primary)' }}>
                            ${selectedCampaign.totalSpend.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Budget</div>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>
                            ${selectedCampaign.budget.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Creators</div>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>
                            {selectedCampaign.creatorsActive}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <h3 className="adv-section-header">Campaign Timeline</h3>
            <div className="adv-timeline" style={{ marginBottom: '32px' }}>
                {selectedCampaign.timeline.map((step, index) => (
                    <div key={index} className="adv-timeline-item">
                        <div className={`adv-timeline-dot ${step.status}`}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                fontWeight: step.status === 'active' ? 600 : 400,
                                color: step.status === 'pending' ? 'var(--adv-text-muted)' : 'var(--adv-text-primary)'
                            }}>
                                {step.step}
                            </span>
                            <span className="adv-text-muted" style={{ fontSize: '12px' }}>{step.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creator Performance List */}
            {selectedCampaign.creators.length > 0 && (
                <>
                    <h3 className="adv-section-header">Creator Performance</h3>
                    <div className="adv-card" style={{ padding: '0' }}>
                        {selectedCampaign.creators.map((creator, index) => (
                            <div
                                key={creator.id}
                                className="adv-list-item"
                                style={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                    <div className="adv-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                                        {creator.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, marginBottom: '2px' }}>{creator.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--adv-text-muted)' }}>
                                            {getCreatorStatusIcon(creator.status)}
                                            <span>{creator.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {creator.auditResult && (
                                        <div style={{ fontSize: '12px', color: 'var(--adv-text-secondary)', marginBottom: '2px' }}>
                                            {creator.auditResult}
                                        </div>
                                    )}
                                    {creator.payout && (
                                        <div style={{ fontWeight: 600, color: 'var(--adv-accent-primary)' }}>
                                            ${creator.payout}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );

    return (
        <div className="advertiser-app">
            <div className="adv-page">
                {/* Header */}
                <div className="adv-header">
                    <h1 className="adv-page-title">Campaigns</h1>
                </div>

                {loadError && (
                    <div className="adv-card">
                        <div className="adv-text-secondary">{loadError}</div>
                    </div>
                )}

                {detailLoading && (
                    <div className="adv-card">
                        <div className="adv-text-secondary">Loading campaign details…</div>
                    </div>
                )}

                {/* Content based on active view */}
                {activeView === 'list' && renderList()}
                {activeView === 'detail' && selectedCampaign && renderDetail()}
            </div>
        </div>
    );
};

export default AdvertiserCampaigns;
