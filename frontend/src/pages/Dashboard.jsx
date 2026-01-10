import { useState, useEffect } from 'react';
import MatchaLogo from '../components/MatchaLogo';
import StatusIndicator from '../components/StatusIndicator';
import TopBar from '../components/TopBar';
import SubmitContentModal from '../components/SubmitContentModal';
import './Dashboard.css';

// Earnings data
const earningsData = {
    totalEarned: 6480,
    pendingPayouts: 2100,
    bonusesEarned: 980,
    avgPayoutTime: 2.4
};

// Agent Status
const agentStatus = {
    status: 'Actively negotiating 2 deals',
    lastUpdate: '12 min ago'
};

// Notifications
const notifications = [
    { id: 1, message: 'Nike countered your bid', type: 'negotiation', time: '5m ago', unread: true },
    { id: 2, message: 'Spotify campaign approved', type: 'success', time: '2h ago', unread: true },
    { id: 3, message: 'Payment released for Adidas', type: 'payment', time: '1d ago', unread: false }
];

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

// Reputation data
const reputationData = {
    deliveryReliability: 96,
    auditPassRate: 94,
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
    const animatedTotal = useAnimatedCounter(earningsData.totalEarned, 1200);
    const [showContent, setShowContent] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

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

    return (
        <div className="page dashboard">
            {/* Header with Logo */}
            <TopBar showAvatar={true} showNotification={true} />

            {/* Agent Status Bar */}
            <div className={`agent-status-bar ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '40ms' }}>
                <StatusIndicator status="ai-working" size={16} />
                <div className="agent-status-content">
                    <span className="agent-status-text">{agentStatus.status}</span>
                    <span className="agent-status-time">Last update: {agentStatus.lastUpdate}</span>
                </div>
            </div>

            {/* Notifications */}
            <section className={`dashboard-section notifications-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '80ms' }}>
                <div className="notifications-scroll">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`notification-chip ${notif.type} ${notif.unread ? 'unread' : ''}`}>
                            <span className="notif-dot" />
                            <span className="notif-message">{notif.message}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Earnings Overview - with glow border */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                <h2 className="section-title">Earnings</h2>
                <div className="earnings-card">
                    <div className="earnings-main">
                        <span className="earnings-label">Total Earned (30 days)</span>
                        <span className="earnings-amount">{formatCurrency(animatedTotal)}</span>
                    </div>
                    <div className="earnings-grid">
                        <div className="earnings-stat">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value pending">{formatCurrency(earningsData.pendingPayouts)}</span>
                        </div>
                        <div className="earnings-stat">
                            <span className="stat-label">Bonuses</span>
                            <span className="stat-value bonus">{formatCurrency(earningsData.bonusesEarned)}</span>
                        </div>
                        <div className="earnings-stat">
                            <span className="stat-label">Avg. Payout</span>
                            <span className="stat-value">{earningsData.avgPayoutTime}d</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Pacts - with status glow */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '160ms' }}>
                <h2 className="section-title">Active Pacts</h2>
                <div className="pacts-list">
                    {activePacts.map((pact, index) => (
                        <div
                            key={pact.id}
                            className={`pact-card status-${pact.status}`}
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
                                    <span className="meta-item">{pact.platform}</span>
                                    <span className="meta-item">{pact.deliverable}</span>
                                </div>
                                <div className="pact-footer">
                                    <div className="pact-payout">
                                        <span className="payout-amount">{formatCurrency(pact.payout)}</span>
                                        {pact.bonus && <span className="payout-bonus">+ {formatCurrency(pact.bonus)}</span>}
                                    </div>
                                    <span className="pact-due">Due {pact.dueDate}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Agent Activity Feed */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '200ms' }}>
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

            {/* Reputation - with glow badge */}
            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '240ms' }}>
                <h2 className="section-title">Your Reputation</h2>
                <div className="reputation-card">
                    <div className="reputation-badge">
                        <StatusIndicator status="active" size={14} />
                        <span>{reputationData.badge}</span>
                    </div>
                    <div className="reputation-stats">
                        <div className="rep-stat">
                            <span className="rep-label">Delivery</span>
                            <div className="rep-bar-container">
                                <div className="rep-bar" style={{ '--width': `${reputationData.deliveryReliability}%` }} />
                            </div>
                            <span className="rep-value">{reputationData.deliveryReliability}%</span>
                        </div>
                        <div className="rep-stat">
                            <span className="rep-label">Audit Rate</span>
                            <div className="rep-bar-container">
                                <div className="rep-bar" style={{ '--width': `${reputationData.auditPassRate}%` }} />
                            </div>
                            <span className="rep-value">{reputationData.auditPassRate}%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Primary Action */}
            <section className={`dashboard-section action-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '280ms' }}>
                <button
                    className="btn btn-primary btn-full interaction-press"
                    onClick={() => setShowSubmitModal(true)}
                >
                    Submit Content
                </button>
            </section>

            <SubmitContentModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
            />
        </div>
    );
}
