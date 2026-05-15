import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        .format(amount || 0);

const formatRelative = (timestamp) => {
    if (!timestamp) return '—';
    const diffMin = Math.max(Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000), 0);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const reliabilityBadge = (score) => {
    if (score === undefined || score === null) return 'New creator';
    if (score >= 0.9) return 'High reliability';
    if (score >= 0.75) return 'Trusted';
    if (score >= 0.5) return 'Building track record';
    return 'Getting started';
};

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

function Arrow() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const creatorId = await ensureCreatorId();
                if (!creatorId) {
                    if (!cancelled) setLoadError('No creator id. Complete onboarding first.');
                    return;
                }
                const dash = await userAPI.getCreatorDashboard(creatorId);
                if (!cancelled) setData(dash);
            } catch (error) {
                if (!cancelled) setLoadError(error.message || 'Failed to load dashboard.');
            } finally {
                if (!cancelled) setTimeout(() => setReady(true), 60);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalEarned = data?.earnings?.totalEarned || 0;
    const animatedTotal = useAnimatedCounter(totalEarned, 1100);
    const pending = data?.earnings?.pendingPayouts || 0;
    const bonuses = data?.earnings?.bonusesEarned || 0;
    const completed = data?.earnings?.contractsCompleted || 0;
    const activePacts = data?.activePacts || [];
    const agentActivity = data?.agentActivity || [];
    const negotiatingCount = data?.negotiatingCount || 0;
    const reliability = data?.reputation?.reliability_score;
    const reliabilityPct = reliability != null ? Math.round(reliability * 100) : null;

    const isFresh =
        !loadError && data && totalEarned === 0 && activePacts.length === 0 && negotiatingCount === 0;

    const primary = activePacts.length > 0
        ? { label: 'Submit content', to: '/creator/contracts' }
        : { label: 'Discover campaigns', to: '/creator/campaigns' };

    return (
        <div className={`page dash ${ready ? 'is-ready' : ''}`}>
            {/* Header */}
            <header className="dash-top">
                <div>
                    <span className="dash-eyebrow">Matcha</span>
                    <h1 className="dash-greeting">{greeting()}.</h1>
                </div>
                <span className="dash-rep" title="Reliability">
                    <span className="dash-rep-dot" />
                    {reliabilityBadge(reliability)}
                </span>
            </header>

            {loadError && <div className="dash-error">{loadError}</div>}

            {!data && !loadError && (
                <div className="dash-skeleton">
                    <div className="sk sk-hero" />
                    <div className="sk sk-row" />
                    <div className="sk sk-row" />
                </div>
            )}

            {isFresh && (
                <>
                    <section className="dash-welcome">
                        <h2 className="dash-welcome-title">Your agent is live.</h2>
                        <p className="dash-welcome-sub">
                            It will bid, negotiate, and settle on your behalf. Start by
                            picking a campaign — the rest happens automatically.
                        </p>
                    </section>

                    <ol className="dash-steps">
                        <li><span>1</span> Discover a campaign and let your agent bid.</li>
                        <li><span>2</span> Two agents negotiate the terms for you.</li>
                        <li><span>3</span> Submit content — audit and payout run themselves.</li>
                    </ol>
                </>
            )}

            {data && !isFresh && (
                <>
                    {/* Earnings hero */}
                    <section className="dash-hero">
                        <span className="dash-eyebrow">Total earned</span>
                        <div className="dash-amount">{formatCurrency(animatedTotal)}</div>
                        <div className="dash-substats">
                            <div>
                                <span className="dash-sub-val">{formatCurrency(pending)}</span>
                                <span className="dash-sub-lbl">Pending</span>
                            </div>
                            <div>
                                <span className="dash-sub-val">{formatCurrency(bonuses)}</span>
                                <span className="dash-sub-lbl">Bonuses</span>
                            </div>
                            <div>
                                <span className="dash-sub-val">{completed}</span>
                                <span className="dash-sub-lbl">Completed</span>
                            </div>
                        </div>
                    </section>

                    {/* Negotiation callout */}
                    {negotiatingCount > 0 && (
                        <button className="dash-callout" onClick={() => navigate('/creator/deals')}>
                            <span className="dash-callout-pulse" />
                            <div className="dash-callout-text">
                                <strong>
                                    {negotiatingCount} negotiation{negotiatingCount === 1 ? '' : 's'} in progress
                                </strong>
                                <span>Your agent is at the table — tap to watch</span>
                            </div>
                            <Arrow />
                        </button>
                    )}

                    {/* Active pacts */}
                    <section className="dash-block">
                        <div className="dash-block-head">
                            <span className="dash-eyebrow">Active pacts</span>
                            <button className="dash-link" onClick={() => navigate('/creator/contracts')}>
                                View all
                            </button>
                        </div>
                        {activePacts.length === 0 ? (
                            <div className="dash-empty">
                                No active contracts yet.
                                <button className="dash-link" onClick={() => navigate('/creator/campaigns')}>
                                    Discover campaigns
                                </button>
                            </div>
                        ) : (
                            <div className="dash-pacts">
                                {activePacts.map((pact) => (
                                    <button
                                        key={pact._id}
                                        className="dash-pact"
                                        onClick={() => navigate('/creator/contracts')}
                                    >
                                        <div className="dash-pact-main">
                                            <span className="dash-pact-brand">{pact.brand}</span>
                                            <span className="dash-pact-campaign">{pact.campaign}</span>
                                        </div>
                                        <div className="dash-pact-side">
                                            <span className="dash-pact-amount">{formatCurrency(pact.base_payout)}</span>
                                            <span className={`dash-pact-status ${pact.status === 'Active' ? 'is-active' : 'is-pending'}`}>
                                                {pact.status}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Agent activity */}
                    {agentActivity.length > 0 && (
                        <section className="dash-block">
                            <span className="dash-eyebrow">Agent activity</span>
                            <ul className="dash-activity">
                                {agentActivity.slice(0, 5).map((a) => (
                                    <li key={a.id}>
                                        <span className="dash-activity-dot" />
                                        <span className="dash-activity-msg">{a.message}</span>
                                        <span className="dash-activity-time">{formatRelative(a.timestamp)}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </>
            )}

            {/* Contextual primary action */}
            {data && (
                <div className="dash-cta">
                    <button className="dash-btn" onClick={() => navigate(primary.to)}>
                        {primary.label}
                        <Arrow />
                    </button>
                    {reliabilityPct !== null && (
                        <p className="dash-cta-meta">
                            Reliability {reliabilityPct}% · {completed} contract{completed === 1 ? '' : 's'} settled
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
