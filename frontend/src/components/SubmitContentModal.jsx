import { useState, useEffect } from 'react';
import GradientLoader from './GradientLoader';
import { contractAPI } from '../services/api';
import { agentsAPI } from '../services/agents';
import './SubmitContentModal.css';

// When `contractId` is provided, the modal persists the submission to the
// backend and asks the agents service to audit it. Without `contractId` it
// falls back to a scripted progress animation (used by the Dashboard's
// generic "Submit Content" button).
export default function SubmitContentModal({ isOpen, onClose, contractId, contractTerms }) {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('input'); // input, assessing, complete
    const [progress, setProgress] = useState(0);
    const [auditResult, setAuditResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setUrl('');
            setStatus('input');
            setProgress(0);
            setAuditResult(null);
            setErrorMessage('');
        }
    }, [isOpen]);

    const runScriptedProgress = () => {
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 5 + 2;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setStatus('complete');
            }
            setProgress(p);
        }, 150);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url) return;

        setStatus('assessing');
        setErrorMessage('');

        if (!contractId) {
            runScriptedProgress();
            return;
        }

        try {
            setProgress(20);
            const submission = await contractAPI.createSubmission(contractId, {
                content_url: url,
            });
            setProgress(55);

            const result = await agentsAPI.audit({
                contractId,
                contractTerms: contractTerms || {},
                contentSubmission: {
                    submission_id: submission._id,
                    content_url: url,
                },
            });
            setProgress(100);
            setAuditResult(result);
            setStatus('complete');
        } catch (error) {
            setErrorMessage(error.message || 'Submission failed.');
            setStatus('input');
            setProgress(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-fullscreen-dark">
            <button className="close-icon-btn" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div className="submit-content">
                {status === 'input' && (
                    <div className="slide-up-content">
                        <h2 className="submit-title">Upload Content</h2>
                        <p className="submit-desc">Paste the content URL below for AI verification.</p>

                        {errorMessage && (
                            <p className="submit-subtext" style={{ color: '#d93b3b' }}>{errorMessage}</p>
                        )}
                        <form onSubmit={handleSubmit} className="url-form">
                            <div className="input-group">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="link-icon">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                                <input
                                    type="url"
                                    placeholder="https://tiktok.com/..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-full btn-large interaction-press"
                                disabled={!url}
                            >
                                Submit Content
                            </button>
                        </form>
                    </div>
                )}

                {status === 'assessing' && (
                    <div className="assessing-view fade-in">
                        <GradientLoader size={140} className="mb-8" />
                        <h3 className="assessing-title">Processing...</h3>
                        <p className="assessing-desc">
                            Our AI agents are working on this.
                            <br />
                            You don’t need to take any action.
                        </p>

                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="progress-text">ai_agent_v2.process()</span>
                    </div>
                )}

                {status === 'complete' && (
                    <div className="complete-view slide-up-content">
                        <div className="success-icon-large">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 className="submit-title">Content Submitted</h2>
                        {auditResult ? (
                            <>
                                <p className="submit-desc">
                                    Audit complete · Tier {auditResult.payment_breakdown?.tier_achieved ?? '—'}
                                </p>
                                <p className="submit-subtext">
                                    Recommended payment: ${auditResult.recommended_payment ?? '—'}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="submit-desc">
                                    The brand’s AI is reviewing your content. <br />
                                    This process usually takes up to 24 hours.
                                </p>
                                <p className="submit-subtext">
                                    You’ll be notified once the audit is complete.
                                </p>
                            </>
                        )}

                        <button className="btn btn-primary btn-full btn-large interaction-press" onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
