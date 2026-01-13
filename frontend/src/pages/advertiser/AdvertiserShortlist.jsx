import React, { useEffect, useState } from 'react';
import { Filter, Instagram, Youtube, Zap, TrendingUp, AlertCircle, Check, X, ChevronLeft, DollarSign } from 'lucide-react';
import './advertiser-theme.css';
import { fetchJson } from '../../lib/api';
import { ensureAdvertiserId } from '../../lib/advertiser';

const AdvertiserShortlist = () => {
    const [activeView, setActiveView] = useState('overview'); // overview, detail, negotiation, report
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [campaignContext, setCampaignContext] = useState(null);
    const [creators, setCreators] = useState([]);
    const [negotiationSteps, setNegotiationSteps] = useState([]);
    const [reportMetrics, setReportMetrics] = useState({
        impressions: null,
        engagementRate: null,
        costPerResult: null,
        creatorDistribution: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [advertiserId, setAdvertiserId] = useState('');

    useEffect(() => {
        const loadShortlist = async () => {
            try {
                setIsLoading(true);
                const resolvedId = await ensureAdvertiserId();
                if (!resolvedId) {
                    setLoadError('Missing advertiser id. Add ?advertiserId=... to the URL or set VITE_ADVERTISER_ID.');
                    setIsLoading(false);
                    return;
                }

                setAdvertiserId(resolvedId);
                const data = await fetchJson(`/api/advertisers/${resolvedId}/shortlist`);
                setCampaignContext(data.campaign);
                setCreators(data.creators || []);
                setReportMetrics(data.reportMetrics || {
                    impressions: null,
                    engagementRate: null,
                    costPerResult: null,
                    creatorDistribution: []
                });
                setLoadError('');
            } catch (error) {
                setLoadError('Failed to load shortlist.');
            } finally {
                setIsLoading(false);
            }
        };

        loadShortlist();
    }, []);

    useEffect(() => {
        const loadNegotiation = async () => {
            if (activeView !== 'negotiation' || !selectedCreator?.dealId) return;
            try {
                const data = await fetchJson(`/api/deals/${selectedCreator.dealId}`);
                const rounds = data?.negotiationLog?.round_history || [];
                const steps = rounds.map((round, index) => ({
                    id: `${selectedCreator.dealId}-${index}`,
                    action: `Round ${round.round}`,
                    details: `$${round.price} · ${round.concessions || 'No concessions'}`,
                    status: index === rounds.length - 1 ? 'active' : 'completed',
                    time: round.timestamp ? new Date(round.timestamp).toLocaleString() : '—'
                }));
                setNegotiationSteps(steps);
            } catch (error) {
                setNegotiationSteps([]);
            }
        };

        loadNegotiation();
    }, [activeView, selectedCreator]);

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'Instagram': return <Instagram size={14} />;
            case 'YouTube': return <Youtube size={14} />;
            case 'TikTok': return <span style={{ fontSize: '12px', fontWeight: 700 }}>TT</span>;
            default: return null;
        }
    };

    const handleCreatorClick = (creator) => {
        setSelectedCreator(creator);
        setNegotiationSteps([]);
        setActiveView('detail');
    };

    const formatMetric = (value, suffix = '') => {
        if (value === null || value === undefined || value === '') return '—';
        return `${value}${suffix}`;
    };

    const renderOverview = () => (
        <>
            {/* Campaign Context Card */}
            <div className="adv-sticky-context">
                <div className="adv-card" style={{ marginBottom: 0 }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--adv-accent-primary)' }}>
                        {campaignContext?.name || 'Campaign'}
                    </div>
                    <div className="adv-text-secondary" style={{ marginBottom: '12px', lineHeight: 1.4 }}>
                        {campaignContext?.goal || 'Campaign goal not set yet.'}
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                        <div>
                            <span className="adv-text-muted">Budget: </span>
                            <span className="adv-text-primary" style={{ fontWeight: 500 }}>{campaignContext?.budgetRange || '—'}</span>
                        </div>
                        <div>
                            <span className="adv-text-muted">Timeline: </span>
                            <span className="adv-text-primary" style={{ fontWeight: 500 }}>{campaignContext?.timeline || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Creator List */}
            {creators.map((creator, index) => (
                <div
                    key={creator.id}
                    className="adv-creator-card adv-animate-in"
                    style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
                    onClick={() => handleCreatorClick(creator)}
                >
                    <div className="adv-creator-header">
                        <div className="adv-avatar">
                            {creator.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="adv-creator-info">
                            <div className="adv-creator-name">{creator.name}</div>
                            <div className="adv-creator-platform">
                                {getPlatformIcon(creator.platform)}
                                <span>{creator.handle}</span>
                            </div>
                        </div>
                        <div className="adv-fit-score">
                            <span className="adv-fit-score-value">{formatMetric(creator.fitScore, '%')}</span>
                            <span className="adv-fit-score-label">fit</span>
                        </div>
                    </div>

                    <div className="adv-creator-tags">
                        {creator.tags.map((tag, i) => (
                            <span key={i} className="adv-tag">{tag}</span>
                        ))}
                        {creator.aiRecommended && (
                            <span className="adv-ai-badge">
                                <Zap size={10} />
                                AI Recommended
                            </span>
                        )}
                    </div>

                    <div className="adv-creator-bid">
                        <div>
                            <span className="adv-text-muted" style={{ fontSize: '12px' }}>Proposed bid</span>
                            <div className="adv-creator-bid-amount">${creator.bidAmount?.toLocaleString() || 0}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="adv-btn adv-btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Review
                            </button>
                            <button className="adv-btn adv-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                                Negotiate
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );

    const renderDetail = () => (
        <>
            {/* Back Button */}
            <button
                className="adv-btn adv-btn-ghost"
                onClick={() => { setActiveView('overview'); setSelectedCreator(null); }}
                style={{ marginBottom: '16px', marginLeft: '-8px' }}
            >
                <ChevronLeft size={20} />
                Back to Shortlist
            </button>

            {/* Creator Header */}
            <div className="adv-card" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div className="adv-avatar" style={{ width: '64px', height: '64px', fontSize: '20px', margin: '0 auto 12px' }}>
                    {selectedCreator.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{selectedCreator.name}</div>
                <div className="adv-creator-platform" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                    {getPlatformIcon(selectedCreator.platform)}
                    <span>{selectedCreator.handle}</span>
                </div>
                <div className="adv-score" style={{ fontSize: '20px', padding: '8px 20px' }}>
                    {formatMetric(selectedCreator.fitScore, '%')} Fit Score
                </div>
            </div>

            {/* Analysis Cards */}
            <div className="adv-analysis-card">
                <div className="adv-analysis-title">Why This Creator Fits</div>
                <div className="adv-analysis-content">{selectedCreator.reasoning || 'No reasoning available yet.'}</div>
            </div>

            <div className="adv-analysis-card">
                <div className="adv-analysis-title">Audience Overlap</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div className="adv-progress-bar" style={{ flex: 1 }}>
                        <div className="adv-progress-fill" style={{ width: `${selectedCreator.audienceMatch || 0}%` }}></div>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--adv-accent-primary)' }}>{formatMetric(selectedCreator.audienceMatch, '%')}</span>
                </div>
            </div>

            <div className="adv-stats-grid" style={{ marginBottom: '16px' }}>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(selectedCreator.followers)}</div>
                    <div className="adv-stat-label">Followers</div>
                </div>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(selectedCreator.engagementRate)}</div>
                    <div className="adv-stat-label">Engagement</div>
                </div>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(selectedCreator.contentQuality, '%')}</div>
                    <div className="adv-stat-label">Content Quality</div>
                </div>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(selectedCreator.reliability, '%')}</div>
                    <div className="adv-stat-label">Reliability</div>
                </div>
            </div>

            <div className="adv-analysis-card">
                <div className="adv-analysis-title">Risk / Confidence</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    {selectedCreator.risk === 'low' ? (
                        <>
                            <Check size={16} style={{ color: 'var(--adv-accent-primary)' }} />
                            <span className="adv-text-secondary">Low risk - High confidence</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={16} style={{ color: 'var(--adv-status-progress)' }} />
                            <span className="adv-text-secondary">Medium risk - Moderate confidence</span>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="adv-action-bar">
                <button className="adv-btn adv-btn-secondary" onClick={() => setActiveView('overview')}>
                    <X size={16} />
                    Remove
                </button>
                <button className="adv-btn adv-btn-secondary">
                    <DollarSign size={16} />
                    Adjust
                </button>
                <button className="adv-btn adv-btn-primary" onClick={() => setActiveView('negotiation')}>
                    <Check size={16} />
                    Approve
                </button>
            </div>
        </>
    );

    const renderNegotiation = () => (
        <>
            {/* Back Button */}
            <button
                className="adv-btn adv-btn-ghost"
                onClick={() => setActiveView('detail')}
                style={{ marginBottom: '16px', marginLeft: '-8px' }}
            >
                <ChevronLeft size={20} />
                Back to Analysis
            </button>

            {/* Summary Card */}
            <div className="adv-card adv-card-primary" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                    <div>
                        <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Current Offer</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--adv-accent-primary)' }}>
                            ${selectedCreator?.bidAmount?.toLocaleString() || 0}
                        </div>
                    </div>
                    <div>
                        <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Est. Reach</div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatMetric(reportMetrics.impressions)}</div>
                    </div>
                    <div>
                        <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Efficiency</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--adv-accent-primary)' }}>
                            {formatMetric(reportMetrics.engagementRate)}
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="adv-section-header">Negotiation Timeline</h3>

            {/* Timeline */}
            <div className="adv-timeline" style={{ marginBottom: '100px' }}>
                {negotiationSteps.map((step, index) => (
                    <div key={step.id} className="adv-timeline-item adv-animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className={`adv-timeline-dot ${step.status}`}></div>
                        <div className="adv-card" style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{step.action}</span>
                                <span className="adv-text-muted" style={{ fontSize: '11px' }}>{step.time}</span>
                            </div>
                            <div className="adv-text-secondary" style={{ fontSize: '13px' }}>{step.details}</div>
                        </div>
                    </div>
                ))}

                {!isLoading && negotiationSteps.length === 0 && (
                    <div className="adv-text-secondary">No negotiation history yet.</div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="adv-action-bar">
                <button className="adv-btn adv-btn-primary" style={{ flex: 1 }} onClick={() => setActiveView('report')}>
                    <Check size={16} />
                    Confirm Agreement
                </button>
            </div>
        </>
    );

    const renderReport = () => (
        <>
            {/* Back Button */}
            <button
                className="adv-btn adv-btn-ghost"
                onClick={() => setActiveView('negotiation')}
                style={{ marginBottom: '16px', marginLeft: '-8px' }}
            >
                <ChevronLeft size={20} />
                Back to Negotiation
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Campaign Preview</h2>
            <p className="adv-text-secondary" style={{ marginBottom: '24px' }}>Expected results based on selected creators</p>

            {/* Report Cards */}
            <div className="adv-stats-grid" style={{ marginBottom: '24px' }}>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(reportMetrics.impressions)}</div>
                    <div className="adv-stat-label">Est. Impressions</div>
                </div>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(reportMetrics.engagementRate)}</div>
                    <div className="adv-stat-label">Exp. Engagement</div>
                </div>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">{formatMetric(reportMetrics.costPerResult)}</div>
                    <div className="adv-stat-label">Cost per Result</div>
                </div>
                <div className="adv-stat-item">
                    <div className="adv-stat-value">4</div>
                    <div className="adv-stat-label">Creators</div>
                </div>
            </div>

            <div className="adv-analysis-card">
                <div className="adv-analysis-title">Creator Distribution</div>
                {reportMetrics.creatorDistribution.map((tier, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                        <span className="adv-text-secondary" style={{ width: '100px', fontSize: '13px' }}>{tier.tier}</span>
                        <div className="adv-progress-bar" style={{ flex: 1 }}>
                            <div className="adv-progress-fill" style={{ width: `${tier.percentage}%` }}></div>
                        </div>
                        <span className="adv-text-muted" style={{ width: '30px', textAlign: 'right' }}>{tier.count}</span>
                    </div>
                ))}

                {!isLoading && reportMetrics.creatorDistribution.length === 0 && (
                    <div className="adv-text-secondary" style={{ marginTop: '12px' }}>
                        No distribution data yet.
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="adv-action-bar">
                <button className="adv-btn adv-btn-primary" style={{ flex: 1 }}>
                    <TrendingUp size={16} />
                    Move to Active Campaign
                </button>
            </div>
        </>
    );

    return (
        <div className="advertiser-app">
            <div className="adv-page">
                {/* Header */}
                <div className="adv-header">
                    <h1 className="adv-page-title">Shortlist</h1>
                    <button
                        className="adv-header-action"
                        onClick={() => setShowFilter(true)}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {loadError && (
                    <div className="adv-card">
                        <div className="adv-text-secondary">{loadError}</div>
                    </div>
                )}

                {/* Content based on active view */}
                {activeView === 'overview' && renderOverview()}
                {activeView === 'detail' && selectedCreator && renderDetail()}
                {activeView === 'negotiation' && renderNegotiation()}
                {activeView === 'report' && renderReport()}
            </div>
        </div>
    );
};

export default AdvertiserShortlist;
