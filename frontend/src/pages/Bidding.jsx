import { useState } from 'react';
import TopBar from '../components/TopBar';
import KeywordInput from '../components/KeywordInput';
import './Bidding.css';

export default function Bidding({ campaign, onBack, onSubmit }) {
    const [keywords, setKeywords] = useState(['fashion', 'lifestyle', 'beauty']);
    const [bidAmount, setBidAmount] = useState(500);

    // Default campaign for demo
    const currentCampaign = campaign || {
        brand: 'Glossier',
        summary: 'Looking for beauty creators to showcase our new Summer Collection.',
        budgetRange: '$500 - $1,000',
    };

    const aiSuggestion = {
        min: 450,
        max: 550,
        confidence: 4, // out of 5
    };

    const handleSubmit = () => {
        onSubmit?.({ keywords, bidAmount });
    };

    return (
        <div className="page bidding">
            <TopBar
                showAvatar={false}
                showNotification={false}
                showBack={true}
                onBack={onBack}
                title=""
            />

            {/* Campaign Summary Card */}
            <div className="campaign-summary-card">
                <h2 className="campaign-brand">{currentCampaign.brand}</h2>
                <p className="campaign-description">{currentCampaign.summary}</p>
                <div className="campaign-budget">
                    <span className="budget-label">Budget Range</span>
                    <span className="budget-value">{currentCampaign.budgetRange}</span>
                </div>
            </div>

            {/* Keywords Section */}
            <section className="bidding-section mt-xl">
                <h3 className="section-label">Your Keywords</h3>
                <KeywordInput
                    keywords={keywords}
                    onChange={setKeywords}
                    placeholder="Add relevant keywords..."
                />
            </section>

            {/* AI Suggestion Section */}
            <section className="bidding-section mt-xl">
                <div className="ai-suggestion-card">
                    <div className="ai-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span>AI Suggested Bid</span>
                    </div>
                    <div className="ai-suggestion-range">
                        ${aiSuggestion.min} - ${aiSuggestion.max}
                    </div>
                    <div className="ai-confidence">
                        <span className="confidence-label">Confidence</span>
                        <div className="confidence-dots">
                            {[1, 2, 3, 4, 5].map((dot) => (
                                <span
                                    key={dot}
                                    className={`confidence-dot ${dot <= aiSuggestion.confidence ? 'filled' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Bid Amount Input */}
            <section className="bidding-section mt-xl">
                <h3 className="section-label">Your Bid</h3>
                <div className="bid-input-container">
                    <span className="currency-symbol">$</span>
                    <input
                        type="number"
                        className="bid-input"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={0}
                    />
                </div>
            </section>

            {/* Submit Button */}
            <div className="bidding-actions">
                <button className="btn btn-primary btn-full" onClick={handleSubmit}>
                    Submit Bid
                </button>
            </div>
        </div>
    );
}
