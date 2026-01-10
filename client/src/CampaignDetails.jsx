import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MessageCircle, BarChart2, CheckCircle } from 'lucide-react';
import { apiFetch } from './apiClient';

const CampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bids, setBids] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBids();
        const interval = setInterval(() => {
            if (contract?._id) fetchContract(contract._id);
        }, 2000);
        return () => clearInterval(interval);
    }, [id, contract?._id]);

    const fetchBids = async () => {
        try {
            const res = await apiFetch(`/api/campaigns/${id}/bids`);
            const data = await res.json();
            setBids(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchContract = async (contractId) => {
        try {
            const res = await apiFetch(`/api/contracts/${contractId}`);
            if (res.ok) {
                const data = await res.json();
                setContract(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRunAgent = async () => {
        setLoading(true);
        try {
            const targetBid = selectedBid || bids[0];

            const res = await apiFetch('/api/agent/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: id, bidId: targetBid._id })
            });
            const data = await res.json();

            setContract({
                _id: data.contractId,
                status: 'EscrowFunded',
                escrowTx: data.escrowTx,
                reasoning: data.reasoning
            });

            setSelectedBid(targetBid);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyWork = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/contracts/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractId: contract._id })
            });
            const data = await res.json();

            setContract(prev => ({
                ...prev,
                status: 'Released',
                releaseTx: data.releaseTx,
                verificationReasoning: data.reasoning
            }));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
                    <div className="card bg-[#1E1E1E] flex-1 flex flex-col p-4 relative overflow-hidden">
                        <h2 className="text-section-header mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            Agent Workflow
                        </h2>

                        {!contract ? (
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
                        ) : (
                            <div className="space-y-6 relative h-full overflow-y-auto pr-2 custom-scrollbar">
                                {/* Timeline Line */}
                                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-700"></div>

                                {/* Step 1: Selection & Escrow */}
                                <div className="relative pl-8">
                                    <div className="absolute left-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-black text-xs font-bold">1</div>
                                    <h3 className="text-white font-bold text-sm">Escrow Funded</h3>
                                    <p className="text-xs text-gray-400 font-mono mb-2">{contract.escrowTx?.substr(0, 18)}...</p>
                                    <div className="bg-[#2A302C] p-2 rounded text-xs text-gray-300 italic border-l-2 border-accent mb-2">
                                        "{contract.reasoning?.split('\n')[1] || 'Selected best match based on criteria.'}"
                                    </div>
                                    <div className="flex items-center gap-1 text-green-400 text-xs">
                                        <CheckCircle size={12} /> <span>Funds Locked</span>
                                    </div>
                                </div>

                                {/* Step 2: Creator Upload */}
                                <div className="relative pl-8">
                                    <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center text-black text-xs font-bold ${contract.status === 'WorkSubmitted' || contract.status === 'Released' ? 'bg-accent' : 'bg-gray-600'}`}>2</div>
                                    <h3 className={`font-bold text-sm ${contract.status === 'WorkSubmitted' || contract.status === 'Released' ? 'text-white' : 'text-gray-500'}`}>Creator Work</h3>
                                    {contract.status === 'EscrowFunded' && <p className="text-xs text-yellow-500 animate-pulse">Waiting for upload...</p>}
                                    {(contract.status === 'WorkSubmitted' || contract.status === 'Released') && (
                                        <div className="mt-1">
                                            <a href="#" className="text-accent text-xs underline truncate block max-w-[200px]">{contract.submissionUrl || 'video_link.mp4'}</a>
                                        </div>
                                    )}
                                </div>

                                {/* Step 3: Verification */}
                                <div className="relative pl-8">
                                    <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center text-black text-xs font-bold ${contract.status === 'Released' ? 'bg-accent' : 'bg-gray-600'}`}>3</div>
                                    <h3 className={`font-bold text-sm ${contract.status === 'Released' ? 'text-white' : 'text-gray-500'}`}>Video Verification</h3>

                                    {contract.status === 'WorkSubmitted' && (
                                        <div className="mt-2">
                                            <button
                                                onClick={handleVerifyWork}
                                                disabled={loading}
                                                className="bg-white text-black text-xs px-3 py-1 rounded font-bold hover:bg-gray-200 w-full"
                                            >
                                                {loading ? 'AI Analyzing...' : 'Verify Content'}
                                            </button>
                                        </div>
                                    )}

                                    {contract.status === 'Released' && (
                                        <div className="bg-[#2A302C] p-2 rounded text-xs text-gray-300 border-l-2 border-accent mt-2">
                                            {contract.verificationReasoning}
                                        </div>
                                    )}
                                </div>

                                {/* Step 4: Release */}
                                <div className="relative pl-8">
                                    <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center text-black text-xs font-bold ${contract.status === 'Released' ? 'bg-accent' : 'bg-gray-600'}`}>4</div>
                                    <h3 className={`font-bold text-sm ${contract.status === 'Released' ? 'text-white' : 'text-gray-500'}`}>Payment Released</h3>
                                    {contract.status === 'Released' && (
                                        <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                                            <CheckCircle size={12} /> <span>TX: {contract.releaseTx?.substr(0, 10)}...</span>
                                        </div>
                                    )}
                                </div>
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
