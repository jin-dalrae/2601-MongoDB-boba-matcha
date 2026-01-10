import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import KeywordInput from '../components/KeywordInput';
import { CheckCircle, XCircle } from 'lucide-react';
import './Bidding.css';

export default function Bidding({ campaign, onBack, onSubmit }) {
    const [keywords, setKeywords] = useState(['fashion', 'lifestyle', 'beauty']);
    const [bidAmount, setBidAmount] = useState(campaign?.budget_limit || 500);
    const [reasoning, setReasoning] = useState('');
    const [bids, setBids] = useState([]);

    // Fetch bids to check if agent selected anyone
    useEffect(() => {
        if (campaign?._id) {
            fetch(`http://localhost:3000/api/campaigns/${campaign._id}/bids`)
                .then(res => res.json())
                .then(data => setBids(data));
        }
    }, [campaign]);

    const winningBid = bids.find(b => b.status === 'Accepted');
    const isSettled = !!winningBid;
    const isMyBidWinner = winningBid?.creatorId?._id === 'creator_3'; // Mock current user

    const handleSubmit = async () => {
        try {
            await fetch('http://localhost:3000/api/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaign._id,
                    bidAmount: Number(bidAmount),
                    reasoning: reasoning || "I am the best fit!"
                })
            });
            alert("Bid Submitted!");
            onBack();
        } catch (err) {
            alert("Error submitting bid");
        }
    };

    if (!campaign) return null;

    // View: Agent Selection Result (Shared View)
    if (isSettled) {
        return (
            <div className="page bidding">
                <TopBar showBack={true} onBack={onBack} title="Campaign Result" />
                <div className="campaign-summary-card">
                    <h2 className="campaign-brand">{campaign.title}</h2>
                    <div className={`p-4 rounded-lg mt-4 border ${isMyBidWinner ? 'border-accent bg-accent/10' : 'border-red-500/50 bg-red-900/10'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {isMyBidWinner ? <CheckCircle className="text-accent" /> : <XCircle className="text-red-500" />}
                            <span className="font-bold text-white">{isMyBidWinner ? 'You were selected!' : 'Another creator was selected.'}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">Winning Bid: ${winningBid.current_bid}</p>

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <span className="text-xs uppercase text-gray-500 tracking-wider">Agent Reasoning</span>
                            {/* Mock reasoning lookup or from winning bid log */}
                            <p className="text-sm italic text-gray-400 mt-1">
                                "{winningBid.negotiationLog?.round_history[0]?.reasoning || 'Selected based on optimal engagement and overlap.'}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page bidding">
            <TopBar
                showAvatar={false}
                showNotification={false}
                showBack={true}
                onBack={onBack}
                title="Submit Proposal"
            />

            {/* Campaign Summary Card */}
            <div className="campaign-summary-card">
                <h2 className="campaign-brand">{campaign.title}</h2>
                <p className="campaign-description">{campaign.product_info?.description}</p>
                <div className="campaign-budget">
                    <span className="budget-label">Budget Limit</span>
                    <span className="budget-value">${campaign.budget_limit}</span>
                </div>
            </div>

            {/* AI Suggestion Section */}
            <section className="bidding-section mt-xl">
                <div className="ai-suggestion-card">
                    <div className="ai-header">
                        <span>AI Suggested Bid</span>
                    </div>
                    <div className="ai-suggestion-range">
                        ${(campaign.budget_limit * 0.8).toFixed(0)} - ${(campaign.budget_limit * 0.95).toFixed(0)}
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

            {/* Pitch */}
            <section className="bidding-section mt-xl">
                <h3 className="section-label">Why you?</h3>
                <textarea
                    className="w-full bg-[#1A1D1E] text-white p-3 rounded border border-gray-700"
                    placeholder="Briefly explain why you are a good fit..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                />
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
