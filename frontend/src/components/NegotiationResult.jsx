import React from 'react';
import './NegotiationModal.css'; // Reusing styles for now

export default function NegotiationResult({ result, deal, onClose }) {
    const isSuccess = result === 'success';

    // Animation classes
    const animClass = "negotiation-slide-up";

    if (isSuccess) {
        return (
            <div className="modal-overlay">
                <div className={`modal-center ${animClass}`}>
                    <div className="result-icon-header success">
                        <div className="status-indicator status-active" style={{ width: 64, height: 64 }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>

                    <h2 className="modal-title">Deal Accepted!</h2>
                    <p className="modal-desc">
                        Your AI agent successfully negotiated better terms.
                    </p>

                    <div className="deal-summary-card">
                        <h3 className="summary-brand">{deal?.brand || 'Brand'}</h3>
                        <div className="summary-divider"></div>
                        <div className="summary-row">
                            <span className="label">Final Price</span>
                            <span className="value highlight">${deal?.finalPrice || 750}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label">Deliverable</span>
                            <span className="value">{deal?.deliverable || '1 Video'}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label">Timeline</span>
                            <span className="value">7 Days</span>
                        </div>
                    </div>

                    <p className="auto-confirm-note">
                        Deal is now active. You have 30 mins to cancel if needed.
                    </p>

                    <button
                        className="btn btn-primary btn-full interaction-press"
                        onClick={onClose}
                    >
                        Go to Active Deals
                    </button>
                </div>
            </div>
        );
    }

    // FAILURE / DECLINED STATE
    return (
        <div className="modal-overlay">
            <div className={`modal-center ${animClass}`}>
                <div className="result-icon-header failure">
                    <div className="status-indicator status-pending" style={{ width: 64, height: 64, borderColor: 'var(--color-warning)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </div>

                <h2 className="modal-title">Negotiation Ended</h2>
                <p className="modal-desc">
                    The brand could not meet your minimum terms at this time.
                </p>

                <div className="deal-summary-card warning-border">
                    <h3 className="summary-brand">{deal?.brand || 'Brand'}</h3>
                    <p className="summary-detail">
                        Brand's maximum budget was <b>${deal?.brandMax || 650}</b>, which is below your minimum threshold of <b>${deal?.minAsk || 700}</b>.
                    </p>
                </div>

                <button
                    className="btn btn-secondary btn-full interaction-press"
                    onClick={onClose}
                >
                    Back to Discovery
                </button>
            </div>
        </div>
    );
}
