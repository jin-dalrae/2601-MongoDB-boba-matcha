import React, { useEffect, useState } from 'react';
import './NegotiationModal.css'; // Reusing styles for consistent theme

export default function ContractModal({ isOpen, onClose, deal, onCancel }) {
    const [timeLeft, setTimeLeft] = useState(deal?.timeLeft || 1800); // Default 30 mins

    useEffect(() => {
        if (!isOpen) return;

        // Sync with deal time if provided
        if (deal?.timeLeft) setTimeLeft(deal.timeLeft);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, deal]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!isOpen || !deal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-center negotiation-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Contract Header */}
                <div className="contract-header" style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex-between mb-2">
                        <div className="flex-center gap-2">
                            <span className="status-badge success">Auto-Confirmed</span>
                            <span className="text-sm text-dimmed">ID: #{deal.id}9928</span>
                        </div>
                        <button className="close-icon-btn" onClick={onClose} style={{ margin: '-8px -8px 0 0' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <h2 className="modal-title" style={{ marginBottom: 4 }}>Contract: {deal.campaign}</h2>
                    <p className="text-dimmed text-sm">Between Creator and {deal.brand}</p>
                </div>

                {/* Contract Body */}
                <div className="contract-body" style={{ padding: '24px', maxHeight: '50vh', overflowY: 'auto' }}>
                    <div className="contract-section mb-6">
                        <h4 className="text-secondary text-xs uppercase tracking-wider mb-3">Deliverables</h4>
                        <div className="p-3 bg-surface-mid rounded-lg border border-white-10">
                            <div className="flex-between">
                                <span>1x TikTok Video</span>
                                <span>$725.00</span>
                            </div>
                            <p className="text-xs text-dimmed mt-2">
                                Requirements: Mention "Summer Sale", use #BobaMatcha, post between 4PM-8PM EST.
                            </p>
                        </div>
                    </div>

                    <div className="contract-section mb-6">
                        <h4 className="text-secondary text-xs uppercase tracking-wider mb-3">Payment Terms</h4>
                        <div className="flex-between text-sm mb-1">
                            <span>Base Fee</span>
                            <span>$725.00</span>
                        </div>
                        <div className="flex-between text-sm mb-1">
                            <span>Platform Fee (Matcha)</span>
                            <span>-$0.00 (Beta)</span>
                        </div>
                        <div className="flex-between text-sm font-medium mt-2 pt-2 border-t border-white-10">
                            <span>Net Payout</span>
                            <span className="text-primary">$725.00</span>
                        </div>
                    </div>

                    <div className="contract-section">
                        <h4 className="text-secondary text-xs uppercase tracking-wider mb-3">Timeline</h4>
                        <div className="timeline-item flex gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                            <div>
                                <p className="text-sm font-medium">Contract Active</p>
                                <p className="text-xs text-dimmed">Today, {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="timeline-item flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-white-20 mt-1.5"></div>
                            <div>
                                <p className="text-sm text-dimmed">Content Due</p>
                                <p className="text-xs text-dimmed">In 7 Days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Footer */}
                <div className="contract-footer" style={{ padding: '16px 24px', background: 'rgba(255,59,48,0.05)', borderTop: '1px solid rgba(255,59,48,0.1)' }}>
                    <div className="flex-between mb-3">
                        <span className="text-sm text-warning flex-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            Cancel Window
                        </span>
                        <span className="text-mono font-bold text-warning">{formatTime(timeLeft)}</span>
                    </div>
                    <button
                        className="btn btn-secondary btn-full interaction-press"
                        style={{ color: 'var(--color-warning)', borderColor: 'rgba(255,59,48,0.3)' }}
                        onClick={() => onCancel(deal.id)}
                        disabled={timeLeft === 0}
                    >
                        Cancel Contract
                    </button>
                    <p className="text-center text-xs text-dimmed mt-3">
                        After this timer expires, the contract is legally binding.
                    </p>
                </div>
            </div>
        </div>
    );
}
