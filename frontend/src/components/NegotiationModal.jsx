import { useState, useEffect, useRef } from 'react';
import MatchaLoader from './MatchaLoader';
import './NegotiationModal.css';

const CHAT_SEQUENCE = [
    {
        sender: 'creator',
        text: 'Based on past performance and audience fit, we recommend increasing the bid.'
    },
    {
        sender: 'brand',
        text: 'Budget flexibility available. Can adjust by $200.'
    },
    {
        sender: 'creator',
        text: 'Countering at $475 for higher engagement guarantee.'
    },
    {
        sender: 'system',
        text: 'Analyzing acceptance likelihood...'
    },
    {
        sender: 'system',
        text: '82% chance of acceptance at $475.'
    }
];

export default function NegotiationModal({ isOpen, onClose, campaign, onUpdate, onComplete }) {
    const [stage, setStage] = useState('started'); // started, negotiating, completed
    const [messages, setMessages] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [chatStep, setChatStep] = useState(0);
    const [startingBidding, setStartingBidding] = useState(false);

    // Initial Start Modal
    useEffect(() => {
        if (isOpen && campaign) {
            // Restore stage from campaign status or default to started
            const initialStage = campaign.negotiationStatus || 'started';
            setStage(initialStage);

            // If returning to negotiation, restore chat history? 
            // For now, if 'negotiating', we restart the chat sim or jump to a later state.
            // Let's simpler: if 'negotiating', start chat.
            if (initialStage === 'negotiating') {
                setMessages([{ type: 'agent', text: 'Resuming negotiation with Brand Agent...' }]);
                setChatStep(1); // Skip initial delay
            } else {
                setMessages([]);
                setChatStep(0);
            }
        }
    }, [isOpen, campaign]);

    // Chat Simulation Logic
    useEffect(() => {
        if (stage !== 'negotiating') return;
        // ... existing logic ...

        let timeoutId;
        const processNextStep = () => {
            if (chatStep === 0) {
                // Initial state
                setIsThinking(true);
                timeoutId = setTimeout(() => {
                    setIsThinking(false);
                    setMessages([{ type: 'agent', text: 'Initiating contact with Brand Agent...' }]);
                    setChatStep(1);
                }, 1000);
            } else if (chatStep === 1) {
                // Brand proposes
                setIsThinking(true);
                timeoutId = setTimeout(() => {
                    setIsThinking(false);
                    setMessages(prev => [...prev, { type: 'brand', text: 'Brand agent offers $600 for 1 video.' }]);
                    setChatStep(2);
                }, 2000);
            } else if (chatStep === 2) {
                // You counter
                setIsThinking(true);
                timeoutId = setTimeout(() => {
                    setIsThinking(false);
                    setMessages(prev => [...prev, { type: 'agent', text: 'Countering offer at $750 based on engagement metrics.' }]);
                    setChatStep(3);
                }, 2500);
            } else if (chatStep === 3) {
                // Brand adjustment
                setIsThinking(true);
                timeoutId = setTimeout(() => {
                    setIsThinking(false);
                    setMessages(prev => [...prev, { type: 'brand', text: 'Brand agent increases budget by $100. New offer: $700.' }]);
                    setChatStep(4);
                }, 2500);
            } else if (chatStep === 4) {
                // Finalizing
                setIsThinking(true);
                timeoutId = setTimeout(() => {
                    setIsThinking(false);
                    setMessages(prev => [...prev, { type: 'agent', text: 'Finalizing deal parameters...' }]);
                    setChatStep(5);
                }, 2000);
            } else if (chatStep === 5) {
                // Complete
                timeoutId = setTimeout(() => {
                    setStage('completed');
                }, 1000);
            }
        };

        processNextStep();
        return () => clearTimeout(timeoutId);
    }, [stage, chatStep]);

    if (!isOpen) return null;

    // --- STAGE 1: BIDDING STARTED (Static Modal) ---
    if (stage === 'started') {
        return (
            <div className="modal-overlay">
                <div className="modal-center negotiation-slide-up">
                    <div className="modal-icon-header">
                        <GradientLoader size={120} />
                    </div>
                    <h2 className="modal-title">Processing...</h2>
                    <p className="modal-desc">
                        Our AI agents are working on this.
                        <br />
                        You don’t need to take any action.
                        <span className="text-meta block mt-md">This may take up to 24 hours.</span>
                    </p>
                    <div className="modal-actions-col">
                        <button
                            className="btn btn-primary btn-full interaction-press"
                            onClick={() => {
                                setStartingBidding(true);
                                // Transition to 'negotiating' status in background
                                if (onUpdate) onUpdate('negotiating');

                                // Small delay for visual feedback
                                setTimeout(() => {
                                    setStartingBidding(false);
                                    onClose();
                                }, 800);
                            }}
                            disabled={startingBidding}
                        >
                            {startingBidding ? (
                                <span className="flex-center gap-2">
                                    Starting...
                                </span>
                            ) : (
                                "Got it"
                            )}
                        </button>
                        <button
                            className="btn-text interaction-press"
                            onClick={() => {
                                if (onUpdate) onUpdate('negotiating');
                                setStage('negotiating');
                            }}
                        >
                            View deal details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- STAGE 2: NEGOTIATING (Chat UI) ---
    // --- STAGE 3: COMPLETED (Auto-Confirm Card) ---
    return (
        <div className="modal-fullscreen">
            {/* Header */}
            <div className="negotiation-header">
                <button className="back-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div className="header-title">
                    <h3>AI Negotiation</h3>
                    <span className="live-badge">
                        <span className="pulse-dot"></span>
                        {stage === 'negotiating' ? 'Live' : 'Completed'}
                    </span>
                </div>
                <div style={{ width: 24 }}></div>
            </div>

            <div className="negotiation-content">
                {/* Chat Area */}
                <div className={`chat-area ${stage === 'completed' ? 'faded' : ''}`}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.type} slide-in`}>
                            <div className="avatar">
                                {msg.type === 'agent' ? 'You' : 'Brand'}
                            </div>
                            <div className="bubble">
                                {msg.text}
                                <span className="timestamp">Just now</span>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="typing-indicator slide-in">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                </div>

                {/* Success Card Overlay (Auto-Confirm) */}
                {stage === 'completed' && (
                    <div className="result-overlay rise-in">
                        <div className="result-card">
                            <div className="success-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h2 className="result-title">Negotiation Completed</h2>
                            <p className="result-desc">Your AI agent successfully finalized this deal on your behalf.</p>

                            <div className="deal-summary">
                                <div className="summary-row">
                                    <span className="label">Final Payout</span>
                                    <span className="value highlight">$725</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Deliverable</span>
                                    <span className="value">1 TikTok Video</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Brand</span>
                                    <span className="value">Nike</span>
                                </div>
                            </div>

                            <p className="auto-confirm-note">
                                Deal auto-confirmed. You have 30 mins to cancel.
                            </p>

                            <button
                                className="btn btn-primary btn-full interaction-press"
                                onClick={() => {
                                    onComplete({ ...campaign, status: 'confirmed', finalPrice: 725 });
                                    onClose();
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
