import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Zap } from 'lucide-react';
import './advertiser-theme.css';
import { fetchJson } from '../../lib/api';
import { resolveAdvertiserId } from '../../lib/advertiser';

const AdvertiserDashboard = () => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [budgetData, setBudgetData] = useState({ total: 0, spent: 0, remaining: 0 });
    const [campaigns, setCampaigns] = useState([]);
    const [agentActivity, setAgentActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const advertiserId = useMemo(() => resolveAdvertiserId(), []);

    useEffect(() => {
        const loadDashboard = async () => {
            if (!advertiserId) {
                setLoadError('Missing advertiser id. Add ?advertiserId=... to the URL or set VITE_ADVERTISER_ID.');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const [overview, campaignSummary] = await Promise.all([
                    fetchJson(`/api/advertisers/${advertiserId}/overview`),
                    fetchJson(`/api/advertisers/${advertiserId}/campaigns/summary?limit=4`)
                ]);

                setBudgetData(overview.budget || { total: 0, spent: 0, remaining: 0 });
                setAgentActivity(overview.agentActivity || []);
                setCampaigns(campaignSummary || []);
                setLoadError('');
            } catch (error) {
                setLoadError('Failed to load advertiser dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [advertiserId]);

    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return '—';
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const diffMin = Math.max(Math.floor(diffMs / 60000), 0);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    };

    const getStatusPill = (status) => {
        const statusMap = {
            'Live': 'adv-pill-live',
            'Active': 'adv-pill-live',
            'Matching': 'adv-pill-matching',
            'Review': 'adv-pill-review',
            'Completed': 'adv-pill-draft',
            'Paused': 'adv-pill-draft',
            'Draft': 'adv-pill-draft'
        };
        return statusMap[status] || 'adv-pill-draft';
    };

    const spentPercentage = (budgetData.spent / budgetData.total) * 100;

    return (
        <div className="advertiser-app">
            <div className="adv-page">
                {/* Header */}
                <div className="adv-header">
                    <h1 className="adv-page-title">Dashboard</h1>
                    <button
                        className="adv-header-action"
                        onClick={() => setShowSettings(true)}
                    >
                        <User size={20} />
                    </button>
                </div>

                {loadError && (
                    <div className="adv-card">
                        <div className="adv-text-secondary">{loadError}</div>
                    </div>
                )}

                {/* Budget Overview Card */}
                <div className="adv-card adv-card-primary adv-animate-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span className="adv-text-secondary" style={{ fontWeight: 600 }}>Total Budget</span>
                        <span className="adv-text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>
                            ${budgetData.total.toLocaleString()}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <div>
                            <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Spent</div>
                            <div className="adv-metric">${budgetData.spent.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="adv-text-muted" style={{ marginBottom: '4px' }}>Remaining</div>
                            <div className="adv-metric adv-metric-accent">${budgetData.remaining.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="adv-progress-bar">
                        <div className="adv-progress-fill" style={{ width: `${spentPercentage}%` }}></div>
                    </div>
                </div>

                {/* Campaign Status Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h2 className="adv-section-header">Campaign Status</h2>

                    {campaigns.map((campaign, index) => (
                        <div
                            key={campaign.id}
                            className="adv-campaign-card adv-animate-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                            onClick={() => navigate('/advertiser/campaigns')}
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
                            </div>
                        </div>
                    ))}

                    {!isLoading && campaigns.length === 0 && (
                        <div className="adv-card">
                            <div className="adv-text-secondary">No campaigns found yet.</div>
                        </div>
                    )}
                </div>

                {/* Agent Activity Section */}
                <div>
                    <h2 className="adv-section-header">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={18} style={{ color: 'var(--adv-accent-primary)' }} />
                            Agent Activity
                        </span>
                    </h2>

                    <div className="adv-card">
                        {agentActivity.map((log, index) => (
                            <div
                                key={log.id}
                                className="adv-log-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <span className="adv-log-text">{log.text}</span>
                                <span className="adv-log-time">{formatRelativeTime(log.timestamp)}</span>
                            </div>
                        ))}

                        {!isLoading && agentActivity.length === 0 && (
                            <div className="adv-text-secondary">No agent activity yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="adv-modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="adv-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="adv-modal-header">
                            <span className="adv-modal-title">Settings</span>
                            <button
                                className="adv-btn-ghost"
                                onClick={() => setShowSettings(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="adv-modal-body">
                            <div className="adv-list-item">
                                <span className="adv-text-secondary">Advertiser Profile</span>
                                <span className="adv-text-muted">→</span>
                            </div>
                            <div className="adv-list-item">
                                <span className="adv-text-secondary">Brand Info</span>
                                <span className="adv-text-muted">→</span>
                            </div>
                            <div className="adv-list-item">
                                <span className="adv-text-secondary">Budget Limits</span>
                                <span className="adv-text-muted">→</span>
                            </div>
                            <div className="adv-list-item">
                                <span className="adv-text-secondary">Risk Tolerance</span>
                                <span className="adv-text-muted">→</span>
                            </div>
                            <div className="adv-list-item">
                                <span className="adv-text-secondary">Approval Thresholds</span>
                                <span className="adv-text-muted">→</span>
                            </div>
                            <div className="adv-list-item">
                                <span className="adv-text-secondary">Payment Method</span>
                                <span className="adv-text-muted">→</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertiserDashboard;
