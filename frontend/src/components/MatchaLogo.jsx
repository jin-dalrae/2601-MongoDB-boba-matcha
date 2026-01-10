import './MatchaLogo.css';

export default function MatchaLogo({
    size = 48,
    isWorking = false,
    showWordmark = false,
    wordmarkSize = 24
}) {
    return (
        <div className={`matcha-logo ${isWorking ? 'ai-working' : 'idle'}`}>
            <div className="logo-container" style={{ width: size, height: size }}>
                {/* Glow layer */}
                <div className="logo-glow" />

                {/* Circle outline */}
                <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    className="logo-svg"
                    style={{ width: size, height: size }}
                >
                    {/* Outer circle */}
                    <circle
                        cx="24"
                        cy="24"
                        r="21"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="logo-circle"
                    />

                    {/* Inner sparkle shape */}
                    <g className="logo-sparkle">
                        {/* Main sparkle - 4-pointed star */}
                        <path
                            d="M24 10 L26 22 L38 24 L26 26 L24 38 L22 26 L10 24 L22 22 Z"
                            fill="currentColor"
                            className="sparkle-main"
                        />
                        {/* Small accent dots */}
                        <circle cx="16" cy="16" r="1.5" fill="currentColor" className="sparkle-dot" />
                        <circle cx="32" cy="16" r="1.5" fill="currentColor" className="sparkle-dot" />
                        <circle cx="16" cy="32" r="1.5" fill="currentColor" className="sparkle-dot" />
                        <circle cx="32" cy="32" r="1.5" fill="currentColor" className="sparkle-dot" />
                    </g>
                </svg>
            </div>

            {showWordmark && (
                <span
                    className="logo-wordmark"
                    style={{ fontSize: wordmarkSize }}
                >
                    Matcha
                </span>
            )}
        </div>
    );
}
