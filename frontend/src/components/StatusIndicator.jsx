import './StatusIndicator.css';

/**
 * Icon-led status indicator component
 * status: 'active' | 'pending' | 'completed' | 'ai-working'
 */
export default function StatusIndicator({ status, size = 24, showLabel = false }) {
    const renderIndicator = () => {
        switch (status) {
            case 'active':
                return (
                    <div className="indicator indicator-active">
                        <div className="pulse-ring" />
                        <div className="pulse-dot" />
                    </div>
                );

            case 'pending':
                return (
                    <div className="indicator indicator-pending">
                        <svg viewBox="0 0 24 24" className="pending-ring">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="var(--color-divider)"
                                strokeWidth="2"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="var(--color-pending)"
                                strokeWidth="2"
                                strokeDasharray="31.4 31.4"
                                strokeLinecap="round"
                                className="pending-progress"
                            />
                        </svg>
                    </div>
                );

            case 'completed':
                return (
                    <div className="indicator indicator-completed">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                );

            case 'ai-working':
                return (
                    <div className="indicator indicator-ai-working">
                        <svg viewBox="0 0 24 24" className="sparkle-ring">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="var(--color-lavender)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                className="rotating-ring"
                            />
                        </svg>
                        <div className="sparkle-center">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L13 11L22 12L13 13L12 22L11 13L2 12L11 11Z" />
                            </svg>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getLabel = () => {
        switch (status) {
            case 'active': return 'Active';
            case 'pending': return 'Pending';
            case 'completed': return 'Complete';
            case 'ai-working': return 'Processing';
            default: return '';
        }
    };

    return (
        <div
            className={`status-indicator-wrapper status-${status}`}
            style={{ '--indicator-size': `${size}px` }}
        >
            <div className="status-indicator-icon" style={{ width: size, height: size }}>
                {renderIndicator()}
            </div>
            {showLabel && (
                <span className="status-indicator-label">{getLabel()}</span>
            )}
        </div>
    );
}
