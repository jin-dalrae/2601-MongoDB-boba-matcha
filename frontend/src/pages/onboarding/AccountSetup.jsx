import { useState } from 'react';
import './Onboarding.css';

export default function AccountSetup({ onContinue, onBack }) {
    const [username, setUsername] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onContinue(username);
        }
    };

    return (
        <div className="onboarding-screen account-setup">
            <div className="onboarding-content">
                {/* Header */}
                <div className="onboarding-header">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div className="step-indicator">
                        <span className="step-dot active"></span>
                        <span className="step-dot"></span>
                        <span className="step-dot"></span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="onboarding-title">Set up your creator account</h1>

                {/* Explanation */}
                <p className="onboarding-explanation">
                    Matcha connects to your TikTok account to understand your content style, audience, and availability. Your agent uses this data to negotiate on your behalf.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="setup-form">
                    <div className={`input-group ${isFocused ? 'focused' : ''}`}>
                        <label htmlFor="tiktok-username" className="input-label">TikTok username</label>
                        <div className="input-wrapper">
                            <span className="input-prefix">@</span>
                            <input
                                id="tiktok-username"
                                type="text"
                                className="text-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="yourhandle"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full onboarding-cta"
                        disabled={!username.trim()}
                    >
                        Connect TikTok
                    </button>
                </form>

                {/* Trust message */}
                <p className="trust-message">
                    We never post without your approval.
                </p>
            </div>
        </div>
    );
}
