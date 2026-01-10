import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import StatusIndicator from '../components/StatusIndicator';
import './Profile.css';

// Creator data
const creatorData = {
    name: 'Alex Chen',
    handle: '@alexcreates',
    followers: '45.2K',
    avgViews: '12.8K',
    categories: ['Lifestyle', 'Beauty', 'Fashion']
};

// Agent preferences
const agentPreferences = {
    minDealValue: '$200',
    preferredBrands: ['Beauty', 'Fashion', 'Tech'],
    contentFrequency: '3 per week max'
};

// Connected accounts
const connectedAccounts = [
    { platform: 'TikTok', handle: '@alexcreates', connected: true },
    { platform: 'Instagram', handle: null, connected: false }
];

// Payout info
const payoutInfo = {
    bankConnected: true,
    bankName: '••••4521',
    nextPayout: 'Mar 25',
    pendingAmount: '$2,100'
};

export default function Profile() {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="page profile-page">
            <TopBar title="Profile" showBack={false} />

            {/* Creator Snapshot */}
            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '0ms' }}>
                <div className="creator-header">
                    <div className="creator-avatar">
                        {creatorData.name.charAt(0)}
                    </div>
                    <div className="creator-info">
                        <h2 className="creator-name">{creatorData.name}</h2>
                        <span className="creator-handle">{creatorData.handle}</span>
                    </div>
                </div>

                <div className="creator-stats">
                    <div className="stat-item">
                        <span className="stat-value">{creatorData.followers}</span>
                        <span className="stat-label">Followers</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value">{creatorData.avgViews}</span>
                        <span className="stat-label">Avg Views</span>
                    </div>
                </div>

                <div className="creator-categories">
                    {creatorData.categories.map((cat) => (
                        <span key={cat} className="category-chip">{cat}</span>
                    ))}
                </div>
            </section>

            {/* Agent Preferences */}
            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '60ms' }}>
                <h3 className="section-title">Agent Preferences</h3>
                <div className="preferences-card">
                    <div className="pref-row">
                        <span className="pref-label">Minimum deal value</span>
                        <span className="pref-value">{agentPreferences.minDealValue}</span>
                    </div>
                    <div className="pref-row">
                        <span className="pref-label">Preferred categories</span>
                        <div className="pref-tags">
                            {agentPreferences.preferredBrands.map((brand) => (
                                <span key={brand} className="pref-tag">{brand}</span>
                            ))}
                        </div>
                    </div>
                    <div className="pref-row">
                        <span className="pref-label">Content frequency</span>
                        <span className="pref-value">{agentPreferences.contentFrequency}</span>
                    </div>
                </div>
                <button className="btn btn-secondary btn-full">Edit Preferences</button>
            </section>

            {/* Connected Accounts */}
            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                <h3 className="section-title">Connected Accounts</h3>
                <div className="accounts-list">
                    {connectedAccounts.map((account) => (
                        <div key={account.platform} className="account-item">
                            <div className="account-icon">
                                {account.platform === 'TikTok' ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="2" width="20" height="20" rx="5" />
                                        <circle cx="12" cy="12" r="4" />
                                    </svg>
                                )}
                            </div>
                            <div className="account-info">
                                <span className="account-platform">{account.platform}</span>
                                {account.connected ? (
                                    <span className="account-handle">{account.handle}</span>
                                ) : (
                                    <span className="account-status">Not connected</span>
                                )}
                            </div>
                            {account.connected ? (
                                <StatusIndicator status="active" size={16} />
                            ) : (
                                <button className="btn-connect">Connect</button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Payout */}
            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '180ms' }}>
                <h3 className="section-title">Payout</h3>
                <div className="payout-card">
                    <div className="payout-row">
                        <div className="payout-info">
                            <span className="payout-label">Bank account</span>
                            <span className="payout-value">{payoutInfo.bankName}</span>
                        </div>
                        <StatusIndicator status="active" size={16} />
                    </div>
                    <div className="payout-row">
                        <div className="payout-info">
                            <span className="payout-label">Next payout</span>
                            <span className="payout-value">{payoutInfo.nextPayout}</span>
                        </div>
                        <span className="payout-amount">{payoutInfo.pendingAmount}</span>
                    </div>
                </div>
            </section>

            {/* Sign Out */}
            <section className={`profile-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '240ms' }}>
                <button className="btn-signout">Sign Out</button>
            </section>
        </div>
    );
}
