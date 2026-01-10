import MatchaLogo from '../../components/MatchaLogo';
import './Onboarding.css';

export default function Completion({ onComplete }) {
    return (
        <div className="onboarding-screen completion">
            <div className="onboarding-content centered">
                {/* Success Icon with Logo */}
                <div className="success-icon">
                    <MatchaLogo size={72} />
                    <div className="success-checkmark">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E0F0F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                </div>

                {/* Completion Text */}
                <div className="completion-text">
                    <h1 className="onboarding-title">You're all set</h1>
                    <p className="onboarding-subtitle">
                        Your agent is ready. Campaigns will start appearing based on your profile.
                    </p>
                </div>

                {/* CTA */}
                <button
                    className="btn btn-primary btn-full onboarding-cta"
                    onClick={onComplete}
                >
                    Go to dashboard
                </button>
            </div>
        </div>
    );
}
