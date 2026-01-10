import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import KeywordInput from '../components/KeywordInput';
import { CheckCircle, XCircle, Upload, DollarSign, Clock } from 'lucide-react';
import './Bidding.css';

export default function Bidding({ campaign, onBack, onSubmit }) {
    const [keywords, setKeywords] = useState(['fashion', 'lifestyle', 'beauty']);
    const [bidAmount, setBidAmount] = useState(campaign?.budget_limit || 500);
    const [reasoning, setReasoning] = useState('');
    const [bids, setBids] = useState([]);
    const [contract, setContract] = useState(null);
    const [submissionUrl, setSubmissionUrl] = useState('');

    // Fetch bids and check for contract
    useEffect(() => {
        if (campaign?._id) {
            fetch(`http://localhost:3000/api/campaigns/${campaign._id}/bids`)
                .then(res => res.json())
                .then(data => setBids(data));

            // Poll for contract
            const interval = setInterval(() => {
                fetch(`http://localhost:3000/api/campaigns/${campaign._id}/contract`)
                    .then(res => {
                        if (res.ok) return res.json();
                        throw new Error('No contract');
                    })
                    .then(data => setContract(data))
                    .catch(() => { });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [campaign]);

    const winningBid = bids.find(b => b.status === 'Accepted');
    const isSettled = !!winningBid;
    // Mock user 'u3' (Tech Life Jane) as the active creator for this demo
    const isMyBidWinner = winningBid?.creatorId?._id === 'u3';

    const handleSubmitWork = async () => {
        try {
            await fetch('http://localhost:3000/api/contracts/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId: contract._id,
                    submissionUrl: submissionUrl || 'https://instagram.com/p/demo_post_123'
                })
            });
        } catch (err) {
            console.error(err);
        }
    };

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
                            <span className="font-bold text-white text-lg">{isMyBidWinner ? 'You Won!' : 'Another creator was selected'}</span>
                        </div>

                        {isMyBidWinner ? (
                            <div className="mt-4 space-y-4">
                                {/* Timeline State for Winner */}
                                <div className="space-y-3">
                                    {/* 1. Contract Created */}
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle className="text-accent" size={16} />
                                        <span>Contract Signed & Escrow Funded</span>
                                    </div>

                                    {/* 2. Upload Work */}
                                    <div className={`p-3 rounded border ${contract?.status === 'EscrowFunded' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-gray-700'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Upload size={16} className={contract?.status === 'EscrowFunded' ? 'text-yellow-500' : 'text-gray-500'} />
                                            <span className="font-bold text-sm">Submit Deliverable</span>
                                        </div>

                                        {contract?.status === 'EscrowFunded' ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Paste video URL..."
                                                    className="flex-1 bg-black/50 border border-gray-600 rounded px-2 text-xs text-white"
                                                    value={submissionUrl}
                                                    onChange={e => setSubmissionUrl(e.target.value)}
                                                />
                                                <button onClick={handleSubmitWork} className="bg-accent text-black text-xs font-bold px-3 py-1 rounded">
                                                    Submit
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400 truncate">
                                                {contract?.submissionUrl || 'Submission Received'}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Verification */}
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        {contract?.status === 'Released' ? <CheckCircle className="text-accent" size={16} /> : <Clock className="text-gray-500" size={16} />}
                                        <span className={contract?.status === 'WorkSubmitted' ? 'text-yellow-500 animate-pulse' : ''}>
                                            {contract?.status === 'WorkSubmitted' ? 'Agent Verifying content...' : 'Content Verification'}
                                        </span>
                                    </div>

                                    {/* 4. Payment */}
                                    <div className={`flex items-center gap-3 text-sm ${contract?.status === 'Released' ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                                        <DollarSign size={16} />
                                        <span>{contract?.status === 'Released' ? 'Funds Released ($4,500)' : 'Payment Pending'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-300 mb-2">Winning Bid: ${winningBid.current_bid}</p>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <span className="text-xs uppercase text-gray-500 tracking-wider">Agent Reasoning</span>
                            <p className="text-sm italic text-gray-400 mt-1 whitespace-pre-line">
                                "{contract?.reasoning?.split('\n')[1] || winningBid.negotiationLog?.round_history[0]?.reasoning}"
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
