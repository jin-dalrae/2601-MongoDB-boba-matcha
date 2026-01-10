import { useState, useEffect } from 'react';
import MatchaLogo from '../../components/MatchaLogo';
import './Onboarding.css';

// Step components
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
                <div className="logo-section">
                    <MatchaLogo size={48} />
                </div>

                <div className="heading-section">
                    <h1 className="onboarding-title">Welcome to Matcha</h1>
                    <p className="onboarding-subtitle">How would you like to use Matcha?</p>
                </div>

                <div className="role-cards">
                    <button
                        className={`role-card ${selectedRole === 'creator' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('creator')}
                    >
                        <div className="role-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M20 21a8 8 0 1 0-16 0" />
                                <path d="M12 12v4M10 14h4" />
                            </svg>
                        </div>
                        <span className="role-name">Creator</span>
                        <span className="role-desc">I create content and want brand deals</span>
                    </button>

                    <button
                        className={`role-card ${selectedRole === 'advertiser' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('advertiser')}
                    >
                        <div className="role-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18M9 21V9" />
                            </svg>
                        </div>
                        <span className="role-name">Advertiser</span>
                        <span className="role-desc">I represent a brand seeking creators</span>
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

function ConnectAccount({ onConnect }) {
    const [handle, setHandle] = useState('');

    const handleConnect = () => {
        onConnect(handle || 'meredithduxbury');
    };

    return (
        <div className="onboarding-screen connect-account">
            <div className="onboarding-content">
                <div className="logo-section">
                    <div className="platform-logo tiktok">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </div>
                </div>

                <div className="heading-section">
                    <h1 className="onboarding-title">Connect TikTok</h1>
                    <p className="onboarding-subtitle">Link your account so your agent can match you with the right deals</p>
                </div>

                <div className="input-section">
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

                <div className="reassurance">
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

function DataSync({ onComplete }) {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        'Analyzing your content',
        'Understanding your audience',
        'Setting up your negotiation agent',
        'Almost ready...'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prev => {
                if (prev < statuses.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 1500);

        const timeout = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [onComplete, statuses.length]);

    return (
        <div className="onboarding-screen data-sync">
            <div className="sync-content">
                <div className="sync-logo">
                    <MatchaLogo size={64} isWorking={true} />
                </div>

                <div className="sync-dots">
                    {[1, 2, 3].map((dot) => (
                        <span key={dot} className="sync-dot" style={{ '--delay': `${dot * 0.15}s` }} />
                    ))}
                </div>

                <p className="sync-status">{statuses[statusIndex]}</p>
            </div>
        </div>
    );
}

function Success({ onContinue }) {
    useEffect(() => {
        const timeout = setTimeout(() => {
            onContinue();
        }, 2000);
        return () => clearTimeout(timeout);
    }, [onContinue]);

    return (
        <div className="onboarding-screen success-screen">
            <div className="success-content">
                <div className="success-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="1.5" />
                        <polyline points="9 12 11.5 14.5 15.5 9.5" stroke="var(--color-primary)" strokeWidth="2" />
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

    const handleRoleSelect = (role) => {
        setUserData(prev => ({ ...prev, role }));
        setStep(1);
    };

    const handleConnect = (handle) => {
        setUserData(prev => ({ ...prev, handle }));
        setStep(2);
    };

    const handleSyncComplete = () => {
        setStep(3);
    };

    const handleSuccess = () => {
        localStorage.setItem('matcha_onboarding_complete', 'true');
        onComplete(userData);
    };

    return (
        <div className="onboarding-flow">
            <div className={`onboarding-step ${step === 0 ? 'active' : step > 0 ? 'exited' : ''}`}>
                <RoleSelection onSelect={handleRoleSelect} />
            </div>
            <div className={`onboarding-step ${step === 1 ? 'active' : step > 1 ? 'exited' : 'waiting'}`}>
                <ConnectAccount onConnect={handleConnect} />
            </div>
            <div className={`onboarding-step ${step === 2 ? 'active' : step > 2 ? 'exited' : 'waiting'}`}>
                <DataSync onComplete={handleSyncComplete} />
            </div>
            <div className={`onboarding-step ${step === 3 ? 'active' : 'waiting'}`}>
                <Success onContinue={handleSuccess} />
            </div>
        </div>
    );
}

export default OnboardingFlow;
