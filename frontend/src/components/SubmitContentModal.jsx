import { useState, useEffect } from 'react';
import './SubmitContentModal.css';

export default function SubmitContentModal({ isOpen, onClose }) {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('input'); // input, assessing, complete
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setUrl('');
            setStatus('input');
            setProgress(0);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!url) return;

        setStatus('assessing');

        // Simulate AI checking the video
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
                        <div className="radar-spinner">
                            <div className="radar-sweep"></div>
                        </div>
                        <h3 className="assessing-title">AI Assessing...</h3>
                        <p className="assessing-desc">Verifying content format and brand safety.</p>

                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
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
                        <p className="submit-desc">
                            The brand’s AI is reviewing your content. <br />
                            This process usually takes up to 24 hours.
                        </p>
                        <p className="submit-subtext">
                            You’ll be notified once the audit is complete.
                        </p>

                        <button className="btn btn-primary btn-full btn-large interaction-press" onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
