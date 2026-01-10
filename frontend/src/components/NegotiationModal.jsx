import { useState, useEffect, useRef } from 'react';
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

export default function NegotiationModal({ isOpen, onClose, campaign, onComplete }) {
    const [messages, setMessages] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [status, setStatus] = useState('negotiating'); // negotiating, success
    const [step, setStep] = useState(0);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    useEffect(() => {
        if (!isOpen) {
            setMessages([]);
            setStep(0);
            setStatus('negotiating');
            return;
        }

        // Start the negotiation sequence
        let timeoutId;

        const processNextStep = () => {
            if (step >= CHAT_SEQUENCE.length) {
                // Done
                setTimeout(() => setStatus('success'), 1000);
                return;
            }

            const currentMsg = CHAT_SEQUENCE[step];

            // Artificial delay before typing starts
            setIsThinking(true);

            const thinkingTime = currentMsg.sender === 'system' ? 1500 : 2000;

            timeoutId = setTimeout(() => {
                setIsThinking(false);
                setMessages(prev => [...prev, currentMsg]);
                setStep(prev => prev + 1);
            }, thinkingTime);
        };

        processNextStep();

        return () => clearTimeout(timeoutId);
    }, [isOpen, step]);

    if (!isOpen) return null;

    return (
        <div className="modal-fullscreen">
            {/* Header */}
            <div className="negotiation-header">
                <button className="close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div className="negotiation-title-container">
                    <h2 className="text-section-header">AI Negotiation</h2>
                    <span className="negotiation-subtitle">
                        {campaign ? campaign.brand : 'Campaign'} Agent Active
                    </span>
                </div>
                <div style={{ width: 24 }}></div> {/* Spacer for alignment */}
            </div>

            <div className="negotiation-content">
                {/* Chat Area */}
                <div className={`chat-area ${status === 'success' ? 'faded' : ''}`}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender} slide-in-bottom`}>
                            {msg.sender !== 'system' && (
                                <div className="avatar">
                                    {msg.sender === 'creator' ? (
                                        <div className="avatar-icon creator">You</div>
                                    ) : (
                                        <div className="avatar-icon brand">Brand</div>
                                    )}
                                </div>
                            )}
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isThinking && (
                        <div className="chat-message system slide-in-bottom">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Success Card Overlay */}
                {status === 'success' && (
                    <div className="result-overlay rise-in">
                        <div className="result-card glow-lavender">
                            <div className="result-icon-wrapper">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="result-icon">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h3 className="result-title">Deal Negotiated</h3>
                            <div className="result-amount">$475</div>
                            <p className="result-desc">
                                82% chance of acceptance. Increased from initial $200 offer.
                            </p>

                            <div className="result-actions">
                                <button className="btn btn-primary btn-full success interaction-press" onClick={onClose}>
                                    Accept Proposal
                                </button>
                                <button className="btn btn-secondary btn-full interaction-press" onClick={onClose}>
                                    Counter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
