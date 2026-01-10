import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import StatusIndicator from '../components/StatusIndicator';
import './ActiveCampaigns.css';

// Status icon component
const StatusIcon = ({ status }) => {
    switch (status) {
        case 'live':
            return (
                <div className="status-icon live">
                    <div className="live-ring" />
                    <div className="live-dot" />
                </div>
            );
        case 'pending':
            return (
                <div className="status-icon pending">
                    <svg viewBox="0 0 24 24" className="pending-arc">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-divider)" strokeWidth="2" />
                        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-pending)" strokeWidth="2" strokeDasharray="31.4 31.4" className="arc" />
                    </svg>
                </div>
            );
        case 'completed':
            return (
                <div className="status-icon completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            );
        case 'action':
            return (
                <div className="status-icon action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
            );
        default:
            return null;
    }
};

// Active campaigns data
const activeCampaigns = [
    {
        id: 1,
        brand: 'Spotify',
        campaign: 'Music streaming campaign',
        status: 'live',
        statusLabel: 'Live',
        views: '5.8K',
        postedDate: 'Mar 20',
        payment: 250,
        paymentStatus: 'Releases after approval',
        agentNote: 'Monitoring engagement. No action needed.'
    },
    {
        id: 2,
        brand: 'Nike',
        campaign: 'Spring Collection Promo',
        status: 'pending',
        statusLabel: 'Pending Approval',
        views: null,
        postedDate: 'Mar 22',
        payment: 500,
        paymentStatus: 'Pending approval',
        agentNote: 'Awaiting brand review of content.'
    },
    {
        id: 3,
        brand: 'Adidas',
        campaign: 'Summer Running Collection',
        status: 'completed',
        statusLabel: 'Completed',
        views: '8.2K',
        postedDate: 'Mar 15',
        payment: 600,
        paymentStatus: 'Payment released',
        performance: 'Above average',
        agentNote: null
    },
    {
        id: 4,
        brand: 'Sephora',
        campaign: 'Glow Serum Launch',
        status: 'action',
        statusLabel: 'Action Needed',
        views: null,
        postedDate: null,
        payment: 2500,
        paymentStatus: 'on completion',
        agentNote: 'Content revision requested by brand.',
        actionRequired: true
    }
];

export default function ActiveCampaigns() {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Group by status
    const liveCampaigns = activeCampaigns.filter(c => c.status === 'live');
    const pendingCampaigns = activeCampaigns.filter(c => c.status === 'pending');
    const actionCampaigns = activeCampaigns.filter(c => c.status === 'action');
    const completedCampaigns = activeCampaigns.filter(c => c.status === 'completed');

    return (
        <div className="page active-campaigns">
            <TopBar title="Active" showBack={false} />

            {/* Action Required */}
            {actionCampaigns.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '0ms' }}>
                    <div className="section-header">
                        <h2 className="section-title">Action Required</h2>
                        <span className="action-badge">{actionCampaigns.length}</span>
                    </div>
                    <div className="campaigns-list">
                        {actionCampaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} formatCurrency={formatCurrency} />
                        ))}
                    </div>
                </section>
            )}

            {/* Live */}
            {liveCampaigns.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                    <h2 className="section-title">Live</h2>
                    <div className="campaigns-list">
                        {liveCampaigns.map((campaign, index) => (
                            <CampaignCard key={campaign.id} campaign={campaign} formatCurrency={formatCurrency} index={index} />
                        ))}
                    </div>
                </section>
            )}

            {/* Pending */}
            {pendingCampaigns.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                    <h2 className="section-title">Pending Approval</h2>
                    <div className="campaigns-list">
                        {pendingCampaigns.map((campaign, index) => (
                            <CampaignCard key={campaign.id} campaign={campaign} formatCurrency={formatCurrency} index={index} />
                        ))}
                    </div>
                </section>
            )}

            {/* Completed */}
            {completedCampaigns.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '180ms' }}>
                    <h2 className="section-title">Completed</h2>
                    <div className="campaigns-list">
                        {completedCampaigns.map((campaign, index) => (
                            <CampaignCard key={campaign.id} campaign={campaign} formatCurrency={formatCurrency} index={index} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function CampaignCard({ campaign, formatCurrency, index = 0 }) {
    return (
        <div
            className={`campaign-card status-${campaign.status}`}
            style={{ '--stagger': `${index * 40}ms` }}
        >
            <div className="campaign-header">
                <div className="campaign-info">
                    <h3 className="campaign-brand">{campaign.brand}</h3>
                    <p className="campaign-name">{campaign.campaign}</p>
                </div>
                <StatusIcon status={campaign.status} />
            </div>

            {/* Metrics row */}
            {(campaign.views || campaign.postedDate) && (
                <div className="campaign-metrics">
                    {campaign.views && (
                        <div className="metric">
                            <span className="metric-label">Views</span>
                            <span className="metric-value">{campaign.views}</span>
                        </div>
                    )}
                    {campaign.postedDate && (
                        <div className="metric">
                            <span className="metric-label">Posted</span>
                            <span className="metric-value">{campaign.postedDate}</span>
                        </div>
                    )}
                    <div className="metric">
                        <span className="metric-label">Status</span>
                        <span className={`metric-value status-label ${campaign.status}`}>{campaign.statusLabel}</span>
                    </div>
                </div>
            )}

            {/* Payment */}
            <div className="campaign-payment">
                <div className="payment-info">
                    <span className="payment-label">Payment</span>
                    <span className={`payment-value ${campaign.status === 'completed' ? 'released' : ''}`}>
                        {formatCurrency(campaign.payment)}
                    </span>
                </div>
                <span className="payment-status">{campaign.paymentStatus}</span>
            </div>

            {/* Agent Note */}
            {campaign.agentNote && (
                <div className="agent-note">
                    <StatusIndicator status={campaign.status === 'action' ? 'pending' : 'ai-working'} size={14} />
                    <span>{campaign.agentNote}</span>
                </div>
            )}

            {/* Performance badge for completed */}
            {campaign.performance && (
                <div className="performance-badge">
                    <span>Performance: {campaign.performance}</span>
                </div>
            )}

            {/* Action button */}
            {campaign.actionRequired && (
                <button className="btn btn-primary btn-full campaign-action">
                    Review Content
                </button>
            )}
        </div>
    );
}
