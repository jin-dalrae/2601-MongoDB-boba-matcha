import { useState, useEffect } from 'react';
import MatchaLogo from '../../components/MatchaLogo';
import './Onboarding.css';

const loadingMessages = [
    "Analyzing content style",
    "Understanding audience",
    "Reviewing past brand collaborations",
    "Preparing your negotiation profile"
];

export default function DataLoading({ onComplete }) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Cycle through messages every 2 seconds
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);

        // Progress bar animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 100;
                }
                return prev + 1;
            });
        }, 80);

        // Complete after ~8 seconds
        const completeTimeout = setTimeout(() => {
            onComplete?.();
        }, 8000);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    return (
        <div className="onboarding-screen data-loading">
            <div className="onboarding-content centered">
                {/* Animated Logo - AI Working state */}
                <div className="loading-logo">
                    <MatchaLogo size={72} isWorking={true} />
                </div>

                {/* Loading Text */}
                <div className="loading-text">
                    <h2 className="loading-title">Setting up your agent</h2>
                    <p className="loading-message" key={messageIndex}>
                        {loadingMessages[messageIndex]}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
