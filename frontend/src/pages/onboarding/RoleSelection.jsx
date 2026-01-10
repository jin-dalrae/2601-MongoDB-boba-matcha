import { useState } from 'react';
import MatchaLogo from '../../components/MatchaLogo';
import './Onboarding.css';

export default function RoleSelection({ onContinue }) {
    const [selectedRole, setSelectedRole] = useState('creator');

    return (
        <div className="onboarding-screen role-selection">
            <div className="onboarding-content centered">
                {/* Logo */}
                <div className="logo-section">
                    <MatchaLogo size={56} showWordmark={true} wordmarkSize={32} />
                </div>

                {/* Welcome Text */}
                <div className="welcome-text">
                    <h1 className="onboarding-title">Welcome to Matcha</h1>
                    <p className="onboarding-subtitle">How do you want to use Matcha?</p>
                </div>

                {/* Role Cards */}
                <div className="role-cards">
                    <button
                        className={`role-card ${selectedRole === 'creator' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('creator')}
                    >
                        <div className="role-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <span className="role-label">Creator</span>
                        <span className="role-description">Get brand deals with AI assistance</span>
                    </button>

                    <button
                        className={`role-card ${selectedRole === 'advertiser' ? 'selected' : ''}`}
                        onClick={() => setSelectedRole('advertiser')}
                    >
                        <div className="role-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </div>
                        <span className="role-label">Advertiser</span>
                        <span className="role-description">Find creators for your brand</span>
                    </button>
                </div>

                {/* CTA */}
                <button
                    className="btn btn-primary btn-full onboarding-cta"
                    onClick={() => onContinue(selectedRole)}
                    disabled={selectedRole !== 'creator'}
                >
                    Continue as Creator
                </button>
            </div>
        </div>
    );
}
