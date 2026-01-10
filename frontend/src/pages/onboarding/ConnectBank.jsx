import './Onboarding.css';

export default function ConnectBank({ onConnect, onSkip, onBack }) {
    return (
        <div className="onboarding-screen connect-bank">
            <div className="onboarding-content">
                {/* Header */}
                <div className="onboarding-header">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <div className="step-indicator">
                        <span className="step-dot completed"></span>
                        <span className="step-dot active"></span>
                        <span className="step-dot"></span>
                    </div>
                </div>

                {/* Bank Icon */}
                <div className="feature-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9FE870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="onboarding-title">Get paid automatically</h1>

                {/* Explanation */}
                <p className="onboarding-explanation">
                    Matcha releases payments automatically once a campaign is completed and approved.
                </p>

                {/* Actions */}
                <div className="bank-actions">
                    <button
                        className="btn btn-primary btn-full onboarding-cta"
                        onClick={onConnect}
                    >
                        Connect bank
                    </button>

                    <button
                        className="btn-text skip-btn"
                        onClick={onSkip}
                    >
                        Skip for now
                    </button>
                </div>

                {/* Security Note */}
                <div className="security-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Your information is encrypted and secure</span>
                </div>
            </div>
        </div>
    );
}
