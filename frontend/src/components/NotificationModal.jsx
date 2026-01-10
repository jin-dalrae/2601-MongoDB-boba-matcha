import { useState } from 'react';
import './NotificationModal.css';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        brand: 'Sephora',
        action: 'Action required',
        message: 'requested clarification on posting date',
        time: '2m',
        type: 'action',
        detail: 'The brand has questions about your proposed timeline. Please clarify when you intend to post the first video.',
        cta: 'Respond via agent'
    },
    {
        id: 2,
        brand: 'Nike',
        action: 'Counter received',
        message: 'countered your bid at $450',
        time: '12m',
        type: 'warning',
        detail: 'Nike has countered your initial bid of $500. Their new offer is $450 with the same deliverables.',
        cta: 'Review counter'
    },
    {
        id: 3,
        brand: 'Spotify',
        action: 'Campaign approved',
        message: 'approved your proposal',
        time: '1h',
        type: 'success',
        detail: 'Great news! Spotify has approved your campaign proposal. You can now proceed to the next steps.',
        cta: 'View details'
    }
];

export default function NotificationModal({ isOpen, onClose }) {
    const [expandedId, setExpandedId] = useState(null);

    return (
        <div className={`notification-modal-wrapper ${isOpen ? 'open' : ''}`}>
            <div className="slider-overlay" onClick={onClose} />
            <div className="slider-content">
                <div className="slider-handle" />
                <div className="notification-header">
                    <h2 className="text-section-header">Notifications</h2>
                    <button className="close-btn" onClick={onClose}>Done</button>
                </div>

                <div className="notification-list">
                    {MOCK_NOTIFICATIONS.map(notif => (
                        <div
                            key={notif.id}
                            className={`notification-item ${expandedId === notif.id ? 'expanded' : ''} interaction-press`}
                            onClick={() => toggleExpand(notif.id)}
                        >
                            <div className="notification-main">
                                <div className={`status-dot-indicator ${notif.type}`}></div>
                                <div className="notification-content">
                                    <div className="notification-top">
                                        <span className="brand-name">{notif.brand}</span>
                                        <span className="time-ago">{notif.time}</span>
                                    </div>
                                    <p className="notification-message">
                                        <span className="action-text">{notif.action}</span> - {notif.message}
                                    </p>
                                </div>
                            </div>

                            {expandedId === notif.id && (
                                <div className="notification-detail expand-in">
                                    <div className="detail-context">
                                        <div className="ai-badge">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                                            </svg>
                                            Analysis
                                        </div>
                                        <p>{notif.detail}</p>
                                    </div>
                                    <button className="btn btn-primary btn-full btn-sm">
                                        {notif.cta}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
