import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import StatusIndicator from '../components/StatusIndicator';
import './Dashboard.css';

// Earnings data
const earningsData = {
    totalEarned: 6480,
    pendingPayouts: 2100,
    bonusesEarned: 980,
    avgPayoutTime: 2.4
};

// Active Pacts data
const activePacts = [
    {
        id: 1,
        brand: 'Sephora',
        campaign: 'Glow Serum Launch',
        platform: 'TikTok',
        deliverable: '1 tutorial video',
        payout: 2500,
        bonus: 400,
        status: 'active',
        statusLabel: 'Audit Passed',
        dueDate: 'Mar 18'
    },
    {
        id: 2,
        brand: 'Gymshark',
        campaign: 'Spring Training Drop',
        platform: 'Instagram Reel',
        deliverable: '1 workout reel',
        payout: 1800,
        bonus: null,
        status: 'pending',
        statusLabel: 'In Review',
        dueDate: 'Mar 22'
    }
];

// Agent Activity feed
const agentActivity = [
    { id: 1, message: 'Your agent bid on 3 campaigns today', time: '2h ago', type: 'bid' },
    { id: 2, message: 'You were selected by Sephora', time: '5h ago', type: 'selected' },
    { id: 3, message: 'Audit passed · bonus unlocked', time: '1d ago', type: 'success' },
    { id: 4, message: 'Payment of $2,900 confirmed', time: '2d ago', type: 'payment' }
];

// Recommended Opportunities
const opportunities = [
    {
        id: 1,
        brand: 'Lululemon',
        payRange: '$1,500–$3,000',
        platform: 'TikTok',
        status: 'Agent reviewing fit',
        statusType: 'ai-working'
    },
    {
        id: 2,
        brand: 'Rare Beauty',
        payRange: '$2,000–$4,000',
        platform: 'Instagram',
        status: 'Eligible',
        statusType: 'active'
    }
];

// Reputation data
const reputationData = {
    deliveryReliability: 96,
    auditPassRate: 94,
    avgRevisionRequests: 0.6,
    badge: 'High Reliability'
};

// Animated counter hook
function useAnimatedCounter(target, duration = 1000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);

    return count;
}

export default function Dashboard() {
    const [activeFilter, setActiveFilter] = useState('30days');
    const animatedTotal = useAnimatedCounter(earningsData.totalEarned, 1200);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Staggered entrance animation
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

    const timeFilters = [
        { value: '7days', label: '7 days' },
        { value: '30days', label: '30 days' },
        { value: 'all', label: 'All time' }
    ];

    return (
        <div className="page dashboard">
            <TopBar showAvatar={true} showNotification={true} />

            {/* 1️⃣ Earnings Overview */}
            <section className={`dashboard-section earnings-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '0ms' }}>
                <h2 className="section-title">Earnings</h2>
                <div className="earnings-card">
                    <div className="earnings-main">
                        <span className="earnings-label">Total Earned (30 days)</span>
                        <span className="earnings-amount">{formatCurrency(animatedTotal)}</span>
                    </div>
                    <div className="earnings-grid">
                        <div className="earnings-stat">
                            <span className="stat-label">Pending Payouts</span>
                            <span className="stat-value pending">{formatCurrency(earningsData.pendingPayouts)}</span>
                        </div>
                        <div className="earnings-stat">
                            <span className="stat-label">Bonuses Earned</span>
                            <span className="stat-value bonus">{formatCurrency(earningsData.bonusesEarned)}</span>
                        </div>
                        <div className="earnings-stat">
                            <span className="stat-label">Avg. Payout Time</span>
                            <span className="stat-value">{earningsData.avgPayoutTime} days</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2️⃣ Active Pacts */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                <h2 className="section-title">Active Pacts</h2>
                <div className="pacts-list">
                    {activePacts.map((pact, index) => (
                        <div
                            key={pact.id}
                            className="pact-card"
                            style={{ '--stagger': `${index * 40}ms` }}
                        >
                            <div className="pact-header">
                                <div className="pact-info">
                                    <h3 className="pact-brand">{pact.brand}</h3>
                                    <p className="pact-campaign">{pact.campaign}</p>
                                </div>
                                <StatusIndicator status={pact.status} size={20} />
                            </div>
                            <div className="pact-details">
                                <div className="pact-meta">
                                    <span className="meta-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                            <line x1="8" y1="21" x2="16" y2="21" />
                                            <line x1="12" y1="17" x2="12" y2="21" />
                                        </svg>
                                        {pact.platform}
                                    </span>
                                    <span className="meta-item">{pact.deliverable}</span>
                                </div>
                                <div className="pact-footer">
                                    <div className="pact-payout">
                                        <span className="payout-amount">{formatCurrency(pact.payout)}</span>
                                        {pact.bonus && <span className="payout-bonus">+ {formatCurrency(pact.bonus)} bonus</span>}
                                    </div>
                                    <span className="pact-due">Due {pact.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3️⃣ Agent Activity Feed */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                <h2 className="section-title">Agent Activity</h2>
                <div className="activity-feed">
                    {agentActivity.map((activity, index) => (
                        <div
                            key={activity.id}
                            className={`activity-item activity-${activity.type}`}
                            style={{ '--stagger': `${index * 30}ms` }}
                        >
                            <div className="activity-dot" />
                            <div className="activity-content">
                                <p className="activity-message">{activity.message}</p>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4️⃣ Recommended Opportunities */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '180ms' }}>
                <h2 className="section-title">Recommended Opportunities</h2>
                <div className="opportunities-list">
                    {opportunities.map((opp, index) => (
                        <div
                            key={opp.id}
                            className="opportunity-card"
                            style={{ '--stagger': `${index * 40}ms` }}
                        >
                            <div className="opp-header">
                                <h3 className="opp-brand">{opp.brand}</h3>
                                <StatusIndicator status={opp.statusType} size={18} />
                            </div>
                            <div className="opp-details">
                                <span className="opp-pay">{opp.payRange}</span>
                                <span className="opp-platform">{opp.platform}</span>
                            </div>
                            <div className="opp-status">{opp.status}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5️⃣ Trust & Reliability Snapshot */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '240ms' }}>
                <h2 className="section-title">Your Reputation</h2>
                <div className="reputation-card">
                    <div className="reputation-badge">
                        <StatusIndicator status="active" size={16} />
                        <span>{reputationData.badge}</span>
                    </div>
                    <div className="reputation-stats">
                        <div className="rep-stat">
                            <span className="rep-label">Delivery Reliability</span>
                            <div className="rep-bar-container">
                                <div className="rep-bar" style={{ '--width': `${reputationData.deliveryReliability}%` }} />
                            </div>
                            <span className="rep-value">{reputationData.deliveryReliability}%</span>
                        </div>
                        <div className="rep-stat">
                            <span className="rep-label">Audit Pass Rate</span>
                            <div className="rep-bar-container">
                                <div className="rep-bar" style={{ '--width': `${reputationData.auditPassRate}%` }} />
                            </div>
                            <span className="rep-value">{reputationData.auditPassRate}%</span>
                        </div>
                        <div className="rep-stat">
                            <span className="rep-label">Avg. Revision Requests</span>
                            <span className="rep-value small">{reputationData.avgRevisionRequests}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6️⃣ Primary Action */}
            <section className={`dashboard-section action-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '300ms' }}>
                <button className="btn btn-primary btn-full">
                    Submit Content
                </button>
            </section>
        </div>
    );
}
