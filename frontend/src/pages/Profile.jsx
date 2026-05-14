import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusIndicator from '../components/StatusIndicator';
import { userAPI } from '../services/api';
import { ensureCreatorId } from '../lib/creator';
import './Profile.css';

const initialsOf = (name) =>
    (name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');

const formatBalance = (balance) =>
    balance === undefined || balance === null
        ? '—'
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(balance);

const handleSignOut = () => {
    localStorage.removeItem('matcha_onboarding_complete');
    localStorage.removeItem('matcha_user');
    localStorage.removeItem('matcha_user_id');
    localStorage.removeItem('matcha_advertiser_id');
    window.location.reload();
};

const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const GenericSocialIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
    </svg>
);

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const creatorId = await ensureCreatorId();
                if (!creatorId) {
                    if (!cancelled) setLoadError('No user id available. Complete onboarding first.');
                    return;
                }
                const data = await userAPI.getUserProfile(creatorId);
                if (!cancelled) setProfile(data);
            } catch (error) {
                if (!cancelled) setLoadError(error.message || 'Failed to load profile.');
            }
        };
        load();
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    const user = profile?.user;
    const wallet = profile?.wallet;
    const snsAccounts = profile?.snsAccounts || [];
    const agentConfig = profile?.agentConfig;
    const sharedMemory = profile?.sharedMemory;

    const primaryHandle = snsAccounts.find((a) => a.handle)?.handle;
    const reliabilityPct = sharedMemory?.reliability_score
        ? Math.round(sharedMemory.reliability_score * 100)
        : null;

    return (
        <div className="page profile-page">
            <header className={`profile-header ${showContent ? 'animate-in' : ''}`}>
                <div className="creator-avatar">{initialsOf(user?.name)}</div>
                <div className="creator-info">
                    <h1 className="creator-name">{user?.name || 'Your profile'}</h1>
                    <span className="creator-handle">{primaryHandle || user?.email || ''}</span>
                </div>
            </header>

            {loadError && (
                <section className="profile-section">
                    <div className="preferences-card" style={{ color: '#d93b3b' }}>{loadError}</div>
                </section>
            )}

            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                <div className="creator-stats">
                    <div className="stat-item">
                        <span className="stat-value">{user?.role || '—'}</span>
                        <span className="stat-label">Role</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value">{reliabilityPct !== null ? `${reliabilityPct}%` : '—'}</span>
                        <span className="stat-label">Reliability</span>
                    </div>
                </div>
            </section>

            {agentConfig?.rules && (
                <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                    <h3 className="section-title">Agent Preferences</h3>
                    <div className="preferences-card">
                        {agentConfig.rules.auto_bid_max ? (
                            <div className="pref-row">
                                <span className="pref-label">Max auto-bid</span>
                                <span className="pref-value">${agentConfig.rules.auto_bid_max.toLocaleString()}</span>
                            </div>
                        ) : null}
                        {agentConfig.rules.tone && (
                            <div className="pref-row">
                                <span className="pref-label">Tone</span>
                                <span className="pref-value">{agentConfig.rules.tone}</span>
                            </div>
                        )}
                        {agentConfig.rules.preferences?.min_price && (
                            <div className="pref-row">
                                <span className="pref-label">Min deal value</span>
                                <span className="pref-value">${agentConfig.rules.preferences.min_price.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '180ms' }}>
                <h3 className="section-title">Connected Accounts</h3>
                {snsAccounts.length === 0 ? (
                    <div className="preferences-card" style={{ color: 'var(--color-secondary)' }}>
                        No social accounts connected yet.
                    </div>
                ) : (
                    <div className="accounts-list">
                        {snsAccounts.map((account) => (
                            <div key={account._id} className="account-item">
                                <div className="account-icon">
                                    {account.platform === 'TikTok' ? <TikTokIcon /> : <GenericSocialIcon />}
                                </div>
                                <div className="account-info">
                                    <span className="account-platform">{account.platform}</span>
                                    <span className="account-handle">{account.handle || '—'}</span>
                                </div>
                                <StatusIndicator
                                    status={account.connectionStatus === 'Connected' ? 'active' : 'pending'}
                                    size={16}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '240ms' }}>
                <h3 className="section-title">Wallet</h3>
                {wallet ? (
                    <div className="payout-card">
                        <div className="payout-row">
                            <div className="payout-info">
                                <span className="payout-label">Address</span>
                                <span className="payout-value" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                                    {wallet.address ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}` : '—'}
                                </span>
                            </div>
                            <StatusIndicator status="active" size={16} />
                        </div>
                        <div className="payout-row">
                            <div className="payout-info">
                                <span className="payout-label">Network</span>
                                <span className="payout-value">{wallet.network || 'Base'}</span>
                            </div>
                            <span className="payout-amount">{formatBalance(wallet.balance)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="preferences-card" style={{ color: 'var(--color-secondary)' }}>
                        No wallet on file.
                    </div>
                )}
            </section>

            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '280ms' }}>
                <h3 className="section-title">Legal</h3>
                <div className="accounts-list">
                    <Link to="/terms" className="account-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="account-info">
                            <span className="account-platform">Terms of Service</span>
                        </div>
                        <span style={{ color: 'var(--color-secondary)' }}>→</span>
                    </Link>
                    <Link to="/privacy" className="account-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="account-info">
                            <span className="account-platform">Privacy Policy</span>
                        </div>
                        <span style={{ color: 'var(--color-secondary)' }}>→</span>
                    </Link>
                </div>
            </section>

            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '320ms' }}>
                <button
                    className="btn-secondary btn-full mb-md"
                    onClick={() => {
                        localStorage.removeItem('matcha_onboarding_complete');
                        window.location.reload();
                    }}
                >
                    Reset Onboarding (Debug)
                </button>
                <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
            </section>
        </div>
    );
}
