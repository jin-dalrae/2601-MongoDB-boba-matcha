import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MessageCircle, BarChart2, CheckCircle } from 'lucide-react';

const CampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);
    const [agentReasoning, setAgentReasoning] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');

    useEffect(() => {
        fetchBids();
    }, [id]);

    const fetchBids = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/campaigns/${id}/bids`);
            const data = await res.json();
            setBids(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRunAgent = async () => {
        setLoading(true);
        try {
            // Pick the first bid for demo purposes if none selected explicitly (or logic in backend)
            // But API expects user selection OR agent selection. Here we trigger Agent.
            const targetBid = bids[0]; // Simplification for demo

            const res = await fetch('http://localhost:3000/api/agent/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: id, bidId: targetBid._id })
            });
            const data = await res.json();

            setAgentReasoning(data.reasoning);
            setSelectedBid(targetBid);

            // Auto trigger payment
            handlePayment(data.contractId, targetBid.current_bid);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (contractId, amount) => {
        setPaymentStatus('Processing Payment...');
        try {
            const res = await fetch('http://localhost:3000/api/payment/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractId, amount, recipient: 'CreatorWallet' })
            });
            const data = await res.json();
            setPaymentStatus(`Payment Sent! TX: ${data.transactionHash.substr(0, 10)}...`);
        } catch (err) {
            setPaymentStatus('Payment Failed');
        }
    };

    return (
        <div className="p-4 page-container h-full flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 text-muted">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-page-title text-accent">Campaign Negotiation</h1>
            </div>

            <div className="flex-1 overflow-hidden flex gap-4">
                {/* Left: Top Profiles & Agent View */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="card bg-[#1E1E1E]">
                        <h2 className="text-section-header mb-4">Top Candidates</h2>
                        <div className="space-y-3">
                            {bids.slice(0, 5).map((bid, idx) => (
                                <div key={bid._id}
                                    className={`p-3 rounded cursor-pointer border transition-colors ${selectedBid?._id === bid._id ? 'border-accent bg-[#2A302C]' : 'border-transparent bg-[#121212] hover:bg-[#1A1D1E]'}`}
                                    onClick={() => setSelectedBid(bid)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">{bid.creatorId?.name || 'Creator'}</span>
                                        <span className="text-accent font-mono">${bid.current_bid}</span>
                                    </div>
                                    <div className="text-sm text-gray-400 italic mb-2 line-clamp-2">"{bid.pitch || 'No pitch provided'}"</div>

                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted">
                                        <div className="flex justify-between">
                                            <span>Followers:</span>
                                            <span className="text-white">{bid.profileStats?.followers.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Engagement:</span>
                                            <span className="text-white">{bid.profileStats?.engagement}</span>
                                        </div>
                                        <div className="flex justify-between col-span-2 border-t border-gray-800 pt-1 mt-1">
                                            <span>Category:</span>
                                            <span className="text-accent">{bid.profileStats?.product_category}</span>
                                        </div>
                                        <div className="col-span-2 text-[10px] text-gray-500 truncate">
                                            Audience: {bid.profileStats?.target_audience}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {bids.length === 0 && <div className="text-muted text-center py-4">No bids yet</div>}
                        </div>
                    </div>

                    {/* Agent Action Area */}
                    <div className="card bg-[#1E1E1E] flex-1 flex flex-col">
                        <h2 className="text-section-header mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            Agent AI
                        </h2>

                        {agentReasoning ? (
                            <div className="space-y-4">
                                <div className="bg-[#2A302C] p-3 rounded text-sm text-[#AEB5B2] whitespace-pre-line border-l-2 border-accent">
                                    {agentReasoning}
                                </div>
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle size={16} />
                                    <span>{paymentStatus}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted text-sm mb-4">Ready to analyze negotiation logs and select best match.</p>
                                <button
                                    onClick={handleRunAgent}
                                    disabled={loading || bids.length === 0}
                                    className="w-full bg-accent text-black font-bold py-3 rounded hover:opacity-90 disabled:opacity-50"
                                >
                                    {loading ? 'Analyzing...' : 'Run Auto-Selection'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Negotiation Detail / Graph */}
                <div className="w-2/3 card bg-[#1E1E1E] flex flex-col">
                    <h2 className="text-section-header mb-4">Negotiation History</h2>

                    {/* Placeholder Graph Area */}
                    <div className="h-48 border border-[#232626] rounded mb-4 flex items-center justify-center bg-[#121212] relative overflow-hidden">
                        <div className="absolute inset-0 flex items-end justify-between px-8 pb-4 opacity-50">
                            {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                                <div key={i} className="w-8 bg-accent/20 rounded-t" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="z-10 text-muted flex items-center gap-2">
                            <BarChart2 />
                            <span>Sentiment Analysis Graph (Placeholder)</span>
                        </div>
                    </div>

                    {/* Scrollable Logs */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {selectedBid?.negotiationLog?.round_history.map((round, i) => (
                            <div key={i} className="bg-[#121212] p-4 rounded border border-[#232626]">
                                <div className="flex justify-between mb-2">
                                    <span className="text-accent font-mono text-sm">Round {round.round}</span>
                                    <span className="text-muted text-xs">{new Date(round.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-label block">Price</span>
                                        <span className="text-white">${round.price}</span>
                                    </div>
                                    <div>
                                        <span className="text-label block">Concessions</span>
                                        <span className="text-white">{round.concessions}</span>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-[#232626]">
                                    <span className="text-label block text-xs mb-1">Reasoning</span>
                                    <p className="text-[#AEB5B2] text-xs italic">"{round.reasoning}"</p>
                                </div>
                            </div>
                        ))}

                        {!selectedBid && (
                            <div className="text-center text-muted py-20 flex flex-col items-center">
                                <MessageCircle size={48} className="mb-4 opacity-20" />
                                <p>Select a candidate to view negotiation details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetails;
