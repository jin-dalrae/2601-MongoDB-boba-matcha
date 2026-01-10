import './TopBar.css';

export default function TopBar({ showAvatar = true, showNotification = true, title, showBack = false, onBack }) {
    return (
        <div className="top-bar">
            <div className="top-bar-left">
                {showBack && (
                    <button className="back-button" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                )}
                {showAvatar && (
                    <div className="avatar">
                        <span className="avatar-initials">JL</span>
                    </div>
                )}
                {title && <h1 className="top-bar-title">{title}</h1>}
            </div>
            <div className="top-bar-right">
                {showNotification && (
                    <button className="notification-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notification-badge"></span>
                    </button>
                )}
            </div>
        </div>
    );
}
