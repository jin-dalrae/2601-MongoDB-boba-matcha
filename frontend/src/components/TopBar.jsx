import MatchaLogo from './MatchaLogo';
import './TopBar.css';

export default function TopBar({
    title,
    showBack = false,
    showAvatar = false,
    showNotification = false,
    onBack
}) {
    return (
        <header className="top-bar">
            <div className="top-bar-left">
                {showBack ? (
                    <button className="back-btn" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                ) : showAvatar ? (
                    <div className="top-bar-logo">
                        <MatchaLogo size={32} />
                    </div>
                ) : null}
            </div>

            {title && (
                <h1 className="top-bar-title">{title}</h1>
            )}

            <div className="top-bar-right">
                {showNotification && (
                    <button className="notification-btn">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notification-badge">3</span>
                    </button>
                )}
            </div>
        </header>
    );
}
