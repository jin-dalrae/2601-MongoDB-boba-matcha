import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import './AdvertiserResults.css';

const AdvertiserResults = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null);
    const [filter, setFilter] = useState('all'); // all, submitted, audited, settled

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        try {
            // TODO: Replace with actual logged-in advertiser ID
            const advertiserId = localStorage.getItem('userId') || '60f7b3b3b3b3b3b3b3b3b3b3';
            const response = await fetch(`http://localhost:3001/api/contracts/advertiser/${advertiserId}/submissions`);
            const data = await response.json();
            setContracts(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            setLoading(false);
        }
    };

    const getStatusInfo = (contract) => {
        if (contract.settlement) {
            return {
                label: 'Settled',
                color: 'success',
                icon: CheckCircle
            };
        }
        if (contract.auditReport) {
            return {
                label: 'Audited',
                color: 'primary',
                icon: TrendingUp
            };
        }
        if (contract.submission) {
            return {
                label: 'Submitted',
                color: 'pending',
                icon: Clock
            };
        }
        return {
            label: 'Pending',
            color: 'muted',
            icon: AlertCircle
        };
    };

    const filteredContracts = contracts.filter(contract => {
        if (filter === 'all') return true;
        if (filter === 'submitted') return contract.submission && !contract.auditReport;
        if (filter === 'audited') return contract.auditReport && !contract.settlement;
        if (filter === 'settled') return contract.settlement;
        return true;
    });

    const getTierLabel = (tier) => {
        const tiers = ['Base', 'Tier 1', 'Tier 2', 'Tier 3'];
        return tiers[tier] || 'Base';
    };

    if (loading) {
        return (
            <div className="results-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="results-page">
            {/* Header */}
            <div className="results-header">
                <h1 className="text-page-title">Contract Results</h1>
                <p className="text-secondary">Review submissions and performance</p>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({contracts.length})
                </button>
                <button
                    className={`filter-tab ${filter === 'submitted' ? 'active' : ''}`}
                    onClick={() => setFilter('submitted')}
                >
                    Submitted ({contracts.filter(c => c.submission && !c.auditReport).length})
                </button>
                <button
                    className={`filter-tab ${filter === 'audited' ? 'active' : ''}`}
                    onClick={() => setFilter('audited')}
                >
                    Audited ({contracts.filter(c => c.auditReport && !c.settlement).length})
                </button>
                <button
                    className={`filter-tab ${filter === 'settled' ? 'active' : ''}`}
                    onClick={() => setFilter('settled')}
                >
                    Settled ({contracts.filter(c => c.settlement).length})
                </button>
            </div>

            {/* Contracts Grid */}
            <div className="contracts-grid">
                {filteredContracts.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <p>No contracts found for this filter</p>
                    </div>
                ) : (
                    filteredContracts.map((contract) => {
                        const statusInfo = getStatusInfo(contract);
                        const StatusIcon = statusInfo.icon;
                        const campaign = contract.autoBidId?.campaignId;
                        const creator = contract.creatorId;

                        return (
                            <div
                                key={contract._id}
                                className="contract-card"
                                onClick={() => setSelectedContract(contract)}
                            >
                                {/* Video Preview */}
                                <div className="video-preview">
                                    {contract.submission?.content_url ? (
                                        <div className="video-thumbnail">
                                            <video
                                                src={contract.submission.content_url}
                                                className="thumbnail-video"
                                                muted
                                            />
                                            <div className="play-overlay">
                                                <Play size={32} className="play-icon" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-video-placeholder">
                                            <AlertCircle size={32} />
                                            <span>No submission yet</span>
                                        </div>
                                    )}
                                </div>

                                {/* Contract Info */}
                                <div className="contract-info">
                                    <div className="contract-header-row">
                                        <h3 className="contract-title">{campaign?.title || 'Campaign'}</h3>
                                        <div className={`status-badge ${statusInfo.color}`}>
                                            <StatusIcon size={14} />
                                            <span>{statusInfo.label}</span>
                                        </div>
                                    </div>

                                    <div className="creator-info">
                                        <span className="text-muted">Creator:</span>
                                        <span className="creator-name">{creator?.name || 'Unknown'}</span>
                                    </div>

                                    {/* Audit Score */}
                                    {contract.auditReport && (
                                        <div className="audit-info">
                                            <div className="score-row">
                                                <span className="text-muted">Content Score:</span>
                                                <span className="score-value">
                                                    {(contract.auditReport.content_score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="tier-row">
                                                <span className="text-muted">Tier Achieved:</span>
                                                <span className="tier-badge">
                                                    {getTierLabel(contract.auditReport.tier_achieved)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Settlement Info */}
                                    {contract.settlement && (
                                        <div className="settlement-info">
                                            <DollarSign size={16} className="dollar-icon" />
                                            <span className="payout-amount">
                                                ${contract.settlement.total_paid?.toLocaleString() || '0'}
                                            </span>
                                            <span className="text-muted">paid</span>
                                        </div>
                                    )}

                                    {/* Base Payout */}
                                    {!contract.settlement && (
                                        <div className="base-payout">
                                            <span className="text-muted">Base payout:</span>
                                            <span className="amount">${contract.base_payout?.toLocaleString() || '0'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Detail Modal */}
            {selectedContract && (
                <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedContract(null)}>
                            ×
                        </button>

                        <h2 className="modal-title">
                            {selectedContract.autoBidId?.campaignId?.title || 'Contract Details'}
                        </h2>

                        {/* Video Player */}
                        {selectedContract.submission?.content_url && (
                            <div className="video-player-container">
                                <video
                                    src={selectedContract.submission.content_url}
                                    controls
                                    className="video-player"
                                    autoPlay
                                />
                            </div>
                        )}

                        {/* Contract Details */}
                        <div className="detail-sections">
                            <div className="detail-section">
                                <h3>Creator Information</h3>
                                <p><strong>Name:</strong> {selectedContract.creatorId?.name}</p>
                                <p><strong>Email:</strong> {selectedContract.creatorId?.email}</p>
                            </div>

                            {selectedContract.submission && (
                                <div className="detail-section">
                                    <h3>Submission Details</h3>
                                    <p><strong>Submitted:</strong> {new Date(selectedContract.submission.submitted_at).toLocaleDateString()}</p>
                                    <p><strong>Video URL:</strong> <a href={selectedContract.submission.content_url} target="_blank" rel="noopener noreferrer">View Original</a></p>
                                </div>
                            )}

                            {selectedContract.auditReport && (
                                <div className="detail-section">
                                    <h3>Audit Report</h3>
                                    <p><strong>Content Score:</strong> {(selectedContract.auditReport.content_score * 100).toFixed(1)}%</p>
                                    <p><strong>Tier Achieved:</strong> {getTierLabel(selectedContract.auditReport.tier_achieved)}</p>
                                    {selectedContract.auditReport.reasoning_log && (
                                        <div className="reasoning-box">
                                            <strong>AI Reasoning:</strong>
                                            <p>{selectedContract.auditReport.reasoning_log}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedContract.settlement && (
                                <div className="detail-section settlement-section">
                                    <h3>Settlement</h3>
                                    <p><strong>Total Paid:</strong> ${selectedContract.settlement.total_paid?.toLocaleString()}</p>
                                    <p><strong>Status:</strong> {selectedContract.settlement.status}</p>
                                    {selectedContract.settlement.receipt_hash && (
                                        <p><strong>Receipt:</strong> <code>{selectedContract.settlement.receipt_hash.substring(0, 16)}...</code></p>
                                    )}
                                </div>
                            )}

                            <div className="detail-section">
                                <h3>Contract Terms</h3>
                                <p><strong>Base Payout:</strong> ${selectedContract.base_payout?.toLocaleString()}</p>
                                <p><strong>Status:</strong> {selectedContract.status}</p>
                                {selectedContract.audit_criteria && (
                                    <p><strong>Audit Criteria:</strong> {selectedContract.audit_criteria}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvertiserResults;
