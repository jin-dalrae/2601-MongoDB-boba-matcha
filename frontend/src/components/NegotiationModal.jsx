import { useState, useEffect } from 'react';
import GradientLoader from './GradientLoader';
import { agentsAPI } from '../services/agents';
import { dealAPI, contractAPI } from '../services/api';
import './NegotiationModal.css';

// When `dealContext` is provided with real ids + profile data, this modal
// drives a real negotiation via the agents service. Without it, it falls
// back to the scripted demo chat (used by mock/demo paths).
export default function NegotiationModal({
    isOpen,
    onClose,
    campaign,
    onUpdate,
    onComplete,
    dealContext,
}) {
    const [stage, setStage] = useState('started'); // started, negotiating, completed
    const [messages, setMessages] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [chatStep, setChatStep] = useState(0);
    const [startingBidding, setStartingBidding] = useState(false);
    const [finalTerms, setFinalTerms] = useState(null);
    const [persistedContractId, setPersistedContractId] = useState(null);
    const [negotiationError, setNegotiationError] = useState('');

    // Initial Start Modal
    useEffect(() => {
        if (isOpen && campaign) {
            // Restore stage from campaign status or default to started
            // When a real dealContext is supplied, skip the demo intro and
            // go straight to the live negotiation stage.
            const initialStage = dealContext?.contractId
                ? 'negotiating'
                : campaign.negotiationStatus || 'started';
            setStage(initialStage);
            setFinalTerms(null);
            setPersistedContractId(null);
            setNegotiationError('');

            if (initialStage === 'negotiating') {
                setMessages([{ type: 'agent', text: 'Resuming negotiation with Brand Agent...' }]);
                setChatStep(1); // Skip initial delay
            } else {
                setMessages([]);
                setChatStep(0);
            }
        }
    }, [isOpen, campaign, dealContext]);

    // Real negotiation path — fires once when entering 'negotiating' with a real dealContext.
    useEffect(() => {
        if (stage !== 'negotiating' || !dealContext?.contractId) return;
        let cancelled = false;
        setIsThinking(true);
        setNegotiationError('');

        const run = async () => {
            try {
                const result = await agentsAPI.negotiate(dealContext);
                if (cancelled) return;
                const turns = (result.messages || []).map((m, i) => ({
                    type: i % 2 === 0 ? 'brand' : 'agent',
                    text: typeof m === 'string' ? m : m.content || JSON.stringify(m),
                }));
                setMessages(turns.length ? turns : [{ type: 'agent', text: result.reasoning || 'Negotiation complete.' }]);
                const terms = result.final_terms || null;
                setFinalTerms(terms);

                // If the agent accepted, persist: AutoBid → Accepted and create a Contract
                // so the creator has something to submit content against.
                if (result.status === 'accepted' || terms) {
                    try {
                        if (dealContext.contractId) {
                            await dealAPI.updateDeal(dealContext.contractId, { status: 'Accepted' });
                        }
                        const payout = terms?.payout ?? terms?.price ?? dealContext.initialOffer?.price;
                        const contract = await contractAPI.createContract({
                            autoBidId: dealContext.contractId,
                            advertiserId: dealContext.advertiserId,
                            creatorId: dealContext.creatorId,
                            base_payout: payout,
                            conditional_tiers: terms?.conditional_tiers || {
                                tier_1: { views: 1000, bonus: Math.round((payout || 500) * 0.1) },
                                tier_2: { views: 10000, bonus: Math.round((payout || 500) * 0.3) },
                            },
                            audit_criteria: terms?.audit_criteria || 'Must feature product clearly',
                            status: 'Active',
                        });
                        if (!cancelled && contract?._id) {
                            setPersistedContractId(contract._id);
                        }
                    } catch (persistErr) {
                        console.error('Failed to persist contract after negotiation:', persistErr);
                    }
                }

                if (!cancelled) {
                    setIsThinking(false);
                    setStage('completed');
                }
            } catch (err) {
                if (cancelled) return;
                setIsThinking(false);
                setNegotiationError(err.message || 'Negotiation failed.');
            }
        };
        run();

        return () => { cancelled = true; };
    }, [stage, dealContext]);

    // Scripted Chat Simulation — only when no real dealContext is wired.
    useEffect(() => {
        if (stage !== 'negotiating' || dealContext?.contractId) return;

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
    }, [stage, chatStep, dealContext]);

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
                                    <span className="value highlight">
                                        ${finalTerms?.payout ?? finalTerms?.price ?? 725}
                                    </span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Deliverable</span>
                                    <span className="value">{finalTerms?.deliverable || '1 TikTok Video'}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="label">Brand</span>
                                    <span className="value">{campaign?.brand || finalTerms?.brand || 'Nike'}</span>
                                </div>
                            </div>

                            {negotiationError && (
                                <p className="auto-confirm-note" style={{ color: '#d93b3b' }}>{negotiationError}</p>
                            )}
                            <p className="auto-confirm-note">
                                Deal auto-confirmed. You have 30 mins to cancel.
                            </p>

                            <button
                                className="btn btn-primary btn-full interaction-press"
                                onClick={() => {
                                    const finalPrice = finalTerms?.payout ?? finalTerms?.price ?? 725;
                                    onComplete({
                                        ...campaign,
                                        status: 'confirmed',
                                        finalPrice,
                                        finalTerms,
                                        contractId: persistedContractId,
                                        contractTerms: finalTerms,
                                    });
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
