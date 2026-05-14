import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusIndicator from '../components/StatusIndicator';
import TopBar from '../components/TopBar';
import { userAPI } from '../services/api';
import { ensureCreatorId } from '../lib/creator';
import './Dashboard.css';

function useAnimatedCounter(target, duration = 1000) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!target) {
            setCount(0);
            return;
        }
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

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount || 0);

const formatRelative = (timestamp) => {
    if (!timestamp) return '—';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMin = Math.max(Math.floor(diffMs / 60000), 0);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const formatShortDate = (date) => {
    if (!date) return null;
    try {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (_) {
        return null;
    }
};

const reliabilityBadge = (score) => {
    if (score === undefined || score === null) return 'New Creator';
    if (score >= 0.9) return 'High Reliability';
    if (score >= 0.75) return 'Trusted';
    if (score >= 0.5) return 'Building Track Record';
    return 'Getting Started';
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const creatorId = await ensureCreatorId();
                if (!creatorId) {
                    if (!cancelled) setLoadError('No creator id. Complete onboarding first.');
                    return;
                }
                const dashboard = await userAPI.getCreatorDashboard(creatorId);
                if (!cancelled) setData(dashboard);
            } catch (error) {
                if (!cancelled) setLoadError(error.message || 'Failed to load dashboard.');
            }
        };
        load();
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const totalEarned = data?.earnings?.totalEarned || 0;
    const animatedTotal = useAnimatedCounter(totalEarned, 1200);
    const pending = data?.earnings?.pendingPayouts || 0;
    const bonuses = data?.earnings?.bonusesEarned || 0;
    const activePacts = data?.activePacts || [];
    const agentActivity = data?.agentActivity || [];
    const negotiatingCount = data?.negotiatingCount || 0;
    const reliability = data?.reputation?.reliability_score;
    const reliabilityPct = reliability ? Math.round(reliability * 100) : null;

    const agentStatusText = negotiatingCount > 0
        ? `Actively negotiating ${negotiatingCount} deal${negotiatingCount === 1 ? '' : 's'}`
        : activePacts.length > 0
            ? 'Monitoring active contracts'
            : 'Idle — no open negotiations';

    return (
        <div className="page dashboard">
            <TopBar showAvatar={true} showNotification={true} />

            <div className={`agent-status-bar ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '40ms' }}>
                <StatusIndicator status={negotiatingCount > 0 ? 'ai-working' : 'active'} size={16} />
                <div className="agent-status-content">
                    <span className="agent-status-text">{agentStatusText}</span>
                    <span className="agent-status-time">
                        {agentActivity[0]?.timestamp ? `Last update: ${formatRelative(agentActivity[0].timestamp)}` : 'No recent activity'}
                    </span>
                </div>
            </div>

            {loadError && (
                <section className="dashboard-section">
                    <div className="earnings-card" style={{ color: '#d93b3b' }}>{loadError}</div>
                </section>
            )}

            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                <h2 className="section-title">Earnings</h2>
                <div className="earnings-card">
                    <div className="earnings-main">
                        <span className="earnings-label">Total Earned</span>
                        <span className="earnings-amount">{formatCurrency(animatedTotal)}</span>
                    </div>
                    <div className="earnings-grid">
                        <div className="earnings-stat">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value pending">{formatCurrency(pending)}</span>
                        </div>
                        <div className="earnings-stat">
                            <span className="stat-label">Bonuses</span>
                            <span className="stat-value bonus">{formatCurrency(bonuses)}</span>
                        </div>
                        <div className="earnings-stat">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{data?.earnings?.contractsCompleted || 0}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '160ms' }}>
                <h2 className="section-title">Active Pacts</h2>
                {activePacts.length === 0 ? (
                    <div className="pacts-list">
                        <div className="pact-card" style={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
                            No active contracts. Browse Discover to start bidding.
                        </div>
                    </div>
                ) : (
                    <div className="pacts-list">
                        {activePacts.map((pact, index) => (
                            <div
                                key={pact._id}
                                className={`pact-card status-${pact.status === 'Active' ? 'active' : 'pending'}`}
                                style={{ '--stagger': `${index * 40}ms`, cursor: 'pointer' }}
                                onClick={() => navigate('/creator/contracts')}
                            >
                                <div className="pact-header">
                                    <div className="pact-info">
                                        <h3 className="pact-brand">{pact.brand}</h3>
                                        <p className="pact-campaign">{pact.campaign}</p>
                                    </div>
                                    <StatusIndicator status={pact.status === 'Active' ? 'active' : 'pending'} size={20} />
                                </div>
                                <div className="pact-details">
                                    <div className="pact-meta">
                                        <span className="meta-item">{pact.status}</span>
                                    </div>
                                    <div className="pact-footer">
                                        <div className="pact-payout">
                                            <span className="payout-amount">{formatCurrency(pact.base_payout)}</span>
                                        </div>
                                        <span className="pact-due">{formatShortDate(pact.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '200ms' }}>
                <h2 className="section-title">Agent Activity</h2>
                {agentActivity.length === 0 ? (
                    <div className="activity-feed">
                        <div className="activity-item" style={{ color: 'var(--color-secondary)' }}>
                            <div className="activity-content">
                                <p className="activity-message">No agent activity yet.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="activity-feed">
                        {agentActivity.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="activity-item"
                                style={{ '--stagger': `${index * 30}ms` }}
                            >
                                <div className="activity-dot" />
                                <div className="activity-content">
                                    <p className="activity-message">{activity.message}</p>
                                    <span className="activity-time">{formatRelative(activity.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={`dashboard-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '240ms' }}>
                <h2 className="section-title">Your Reputation</h2>
                <div className="reputation-card">
                    <div className="reputation-badge">
                        <StatusIndicator status="active" size={14} />
                        <span>{reliabilityBadge(reliability)}</span>
                    </div>
                    <div className="reputation-stats">
                        <div className="rep-stat">
                            <span className="rep-label">Reliability</span>
                            <div className="rep-bar-container">
                                <div className="rep-bar" style={{ '--width': `${reliabilityPct ?? 0}%` }} />
                            </div>
                            <span className="rep-value">{reliabilityPct !== null ? `${reliabilityPct}%` : '—'}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`dashboard-section action-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '280ms' }}>
                <button
                    className="btn btn-primary btn-full interaction-press"
                    onClick={() => navigate('/creator/contracts')}
                >
                    Submit Content
                </button>
            </section>
        </div>
    );
}
