import { useState, useEffect } from 'react';
import MatchaLogo from '../../components/MatchaLogo';
import './Onboarding.css';

// Agent Feature Cards Data
const agentFeatures = [
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z" />
            </svg>
        ),
        title: 'AI Bids for You',
        description: 'Your agent finds and bids on campaigns that match your style'
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: 'Auto-Negotiation',
        description: 'Negotiations handled automatically to get you the best rates'
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
        ),
        title: 'Faster Payouts',
        description: 'Smart contracts ensure you get paid faster with less effort'
    }
];

// Step: Welcome
function Welcome({ onContinue }) {
    return (
        <div className="onboarding-screen welcome-screen">
            <div className="onboarding-content">
                <div className="logo-section floating">
                    <MatchaLogo size={64} />
                </div>

                <div className="heading-section">
                    <h1 className="onboarding-title">Meet your AI agent</h1>
                    <p className="onboarding-subtitle">
                        Matcha finds brand deals, negotiates rates, and handles everything—so you can focus on creating.
                    </p>
                </div>

                <div className="features-grid">
                    {agentFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card slide-in-bottom"
                            style={{ animationDelay: `${index * 100 + 200}ms` }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <div className="feature-content">
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="onboarding-footer">
                <button className="btn btn-primary btn-full" onClick={onContinue}>
                    Get Started
                </button>
                <button className="btn-skip" onClick={onContinue}>
                    Skip intro
                </button>
            </div>
        </div>
    );
}

// Step: Role Selection
function RoleSelection({ onSelect }) {
    const [selectedRole, setSelectedRole] = useState(null);

    const handleContinue = () => {
        if (selectedRole) {
            onSelect(selectedRole);
        }
    };

    return (
        <div className="onboarding-screen role-selection">
            <div className="onboarding-content">
                <div className="heading-section">
                    <h1 className="onboarding-title">I am a...</h1>
                    <p className="onboarding-subtitle">Choose how you'll use Matcha</p>
                </div>

                <div className="role-cards">
                    <button
                        className={`role-card rise-in ${selectedRole === 'creator' ? 'selected' : ''}`}
                        style={{ animationDelay: '100ms' }}
                        onClick={() => setSelectedRole('creator')}
                    >
                        <div className="role-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M20 21a8 8 0 1 0-16 0" />
                                <path d="M12 12v4M10 14h4" />
                            </svg>
                        </div>
                        <div className="role-text">
                            <span className="role-name">Creator</span>
                            <span className="role-desc">Get brand deals with AI assistance</span>
                        </div>
                        {selectedRole === 'creator' && (
                            <div className="role-check">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="9 12 11.5 14.5 15.5 9.5" stroke="#0E0F0F" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                        )}
                    </button>

                    <button
                        className={`role-card rise-in ${selectedRole === 'advertiser' ? 'selected' : ''}`}
                        style={{ animationDelay: '150ms' }}
                        onClick={() => setSelectedRole('advertiser')}
                    >
                        <div className="role-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                        </div>
                        <div className="role-text">
                            <span className="role-name">Advertiser</span>
                            <span className="role-desc">Find creators for your brand</span>
                        </div>
                        {selectedRole === 'advertiser' && (
                            <div className="role-check">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="9 12 11.5 14.5 15.5 9.5" stroke="#0E0F0F" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <div className="onboarding-footer">
                <button
                    className={`btn btn-primary btn-full ${selectedRole ? '' : 'disabled'}`}
                    onClick={handleContinue}
                    disabled={!selectedRole}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

// Step: Connect Account
function ConnectAccount({ onConnect }) {
    const [handle, setHandle] = useState('');

    const handleConnect = () => {
        onConnect(handle || 'meredithduxbury');
    };

    return (
        <div className="onboarding-screen connect-account">
            <div className="onboarding-content">
                <div className="logo-section">
                    <div className="platform-logo tiktok rise-in">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </div>
                </div>

                <div className="heading-section">
                    <h1 className="onboarding-title">Connect TikTok</h1>
                    <p className="onboarding-subtitle">Link your account so your agent can find the best deals for you</p>
                </div>

                <div className="input-section slide-in-bottom" style={{ animationDelay: '150ms' }}>
                    <div className="input-wrapper">
                        <span className="input-prefix">@</span>
                        <input
                            type="text"
                            className="text-input"
                            placeholder="username"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="reassurance slide-in-bottom" style={{ animationDelay: '200ms' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>We only read performance data. We never post for you.</span>
                </div>
            </div>

            <div className="onboarding-footer">
                <button className="btn btn-primary btn-full" onClick={handleConnect}>
                    Connect TikTok
                </button>
            </div>
        </div>
    );
}

// Step: Data Sync
function DataSync({ onComplete }) {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        'Analyzing your content style',
        'Understanding your audience',
        'Finding matching campaigns',
        'Setting up your agent'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prev => {
                if (prev < statuses.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 1200);

        const timeout = setTimeout(() => {
            onComplete();
        }, 4500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [onComplete, statuses.length]);

    return (
        <div className="onboarding-screen data-sync">
            <div className="sync-content">
                <div className="sync-logo floating">
                    <MatchaLogo size={72} isWorking={true} />
                </div>

                <div className="sync-dots">
                    {[1, 2, 3].map((dot) => (
                        <span key={dot} className="sync-dot" style={{ '--delay': `${dot * 0.15}s` }} />
                    ))}
                </div>

                <p className="sync-status">{statuses[statusIndex]}</p>

                <div className="sync-progress">
                    <div
                        className="sync-progress-bar"
                        style={{ width: `${((statusIndex + 1) / statuses.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// Step: Success
function Success({ onContinue }) {
    useEffect(() => {
        const timeout = setTimeout(() => {
            onContinue();
        }, 2200);
        return () => clearTimeout(timeout);
    }, [onContinue]);

    return (
        <div className="onboarding-screen success-screen">
            <div className="success-content expand-in">
                <div className="success-icon glow-success">
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="11" stroke="var(--color-primary)" strokeWidth="1.5" />
                        <polyline points="8 12 11 15 16 9" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                </div>
                <h1 className="success-title">You're all set</h1>
                <p className="success-subtitle">Your agent is ready to find deals for you</p>
            </div>
        </div>
    );
}

// Main Onboarding Flow
export function OnboardingFlow({ onComplete }) {
    const [step, setStep] = useState(0);
    const [userData, setUserData] = useState({});

    const handleGetStarted = () => setStep(1);

    const handleRoleSelect = (role) => {
        setUserData(prev => ({ ...prev, role }));
        setStep(2);
    };

    const handleConnect = (handle) => {
        setUserData(prev => ({ ...prev, handle }));
        setStep(3);
    };

    const handleSyncComplete = () => setStep(4);

    const handleSuccess = () => {
        localStorage.setItem('matcha_onboarding_complete', 'true');
        onComplete(userData);
    };

    return (
        <div className="onboarding-flow">
            <div className={`onboarding-step ${step === 0 ? 'active' : step > 0 ? 'exited' : ''}`}>
                <Welcome onContinue={handleGetStarted} />
            </div>
            <div className={`onboarding-step ${step === 1 ? 'active' : step > 1 ? 'exited' : 'waiting'}`}>
                <RoleSelection onSelect={handleRoleSelect} />
            </div>
            <div className={`onboarding-step ${step === 2 ? 'active' : step > 2 ? 'exited' : 'waiting'}`}>
                <ConnectAccount onConnect={handleConnect} />
            </div>
            <div className={`onboarding-step ${step === 3 ? 'active' : step > 3 ? 'exited' : 'waiting'}`}>
                <DataSync onComplete={handleSyncComplete} />
            </div>
            <div className={`onboarding-step ${step === 4 ? 'active' : 'waiting'}`}>
                <Success onContinue={handleSuccess} />
            </div>
        </div>
    );
}

export default OnboardingFlow;
