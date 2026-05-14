import { useCallback, useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import StatusIndicator from '../components/StatusIndicator';
import SubmitContentModal from '../components/SubmitContentModal';
import { contractAPI } from '../services/api';
import { ensureCreatorId } from '../lib/creator';
import './ActiveCampaigns.css';

// Map a Contract status enum to the UI bucket + label.
// Contract.status ∈ Draft | Signed | Active | Auditing | Settled | Completed | Terminated
const STATUS_BUCKETS = {
    Active:     { bucket: 'live',      label: 'Live',              icon: 'live' },
    Signed:     { bucket: 'live',      label: 'Live',              icon: 'live' },
    Auditing:   { bucket: 'pending',   label: 'Auditing',          icon: 'pending' },
    Settled:    { bucket: 'completed', label: 'Settled',           icon: 'completed' },
    Completed:  { bucket: 'completed', label: 'Completed',         icon: 'completed' },
    Terminated: { bucket: 'completed', label: 'Terminated',        icon: 'completed' },
    Draft:      { bucket: 'pending',   label: 'Draft',             icon: 'pending' },
};

const StatusIcon = ({ icon }) => {
    switch (icon) {
        case 'live':
            return (
                <div className="status-icon live">
                    <div className="live-ring" />
                    <div className="live-dot" />
                </div>
            );
        case 'pending':
            return (
                <div className="status-icon pending">
                    <svg viewBox="0 0 24 24" className="pending-arc">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-divider)" strokeWidth="2" />
                        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-pending)" strokeWidth="2" strokeDasharray="31.4 31.4" className="arc" />
                    </svg>
                </div>
            );
        case 'completed':
            return (
                <div className="status-icon completed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            );
        default:
            return null;
    }
};

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatShortDate = (date) => {
    if (!date) return null;
    try {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
        return null;
    }
};

export default function ActiveCampaigns() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [submittingContract, setSubmittingContract] = useState(null);
    const [showContent, setShowContent] = useState(false);

    const loadContracts = useCallback(async () => {
        try {
            setLoading(true);
            const creatorId = await ensureCreatorId();
            if (!creatorId) {
                setLoadError('No creator id available. Complete onboarding or set VITE_CREATOR_ID.');
                setLoading(false);
                return;
            }
            const data = await contractAPI.getContractsByCreator(creatorId);
            setContracts(Array.isArray(data) ? data : []);
            setLoadError('');
        } catch (error) {
            setLoadError(error.message || 'Failed to load contracts.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContracts();
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, [loadContracts]);

    const grouped = useMemo(() => {
        const buckets = { live: [], pending: [], completed: [] };
        for (const contract of contracts) {
            const bucket = STATUS_BUCKETS[contract.status]?.bucket || 'pending';
            buckets[bucket].push(contract);
        }
        return buckets;
    }, [contracts]);

    const handleSubmissionDone = () => {
        setSubmittingContract(null);
        loadContracts();
    };

    return (
        <div className="page active-campaigns">
            <TopBar title="Active" showBack={false} />

            {loadError && (
                <div className="campaigns-section" style={{ color: '#d93b3b', padding: '12px 16px' }}>
                    {loadError}
                </div>
            )}

            {!loading && contracts.length === 0 && !loadError && (
                <div className="campaigns-section" style={{ padding: '24px 16px', color: 'var(--color-secondary)' }}>
                    No active contracts yet. They'll appear here once a deal is signed.
                </div>
            )}

            {grouped.live.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '0ms' }}>
                    <h2 className="section-title">Live</h2>
                    <div className="campaigns-list">
                        {grouped.live.map((contract, index) => (
                            <ContractCard
                                key={contract._id}
                                contract={contract}
                                index={index}
                                onSubmit={() => setSubmittingContract(contract)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {grouped.pending.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '120ms' }}>
                    <h2 className="section-title">In Review</h2>
                    <div className="campaigns-list">
                        {grouped.pending.map((contract, index) => (
                            <ContractCard
                                key={contract._id}
                                contract={contract}
                                index={index}
                            />
                        ))}
                    </div>
                </section>
            )}

            {grouped.completed.length > 0 && (
                <section className={`campaigns-section ${showContent ? 'animate-in' : ''}`} style={{ '--delay': '180ms' }}>
                    <h2 className="section-title">Completed</h2>
                    <div className="campaigns-list">
                        {grouped.completed.map((contract, index) => (
                            <ContractCard
                                key={contract._id}
                                contract={contract}
                                index={index}
                            />
                        ))}
                    </div>
                </section>
            )}

            <SubmitContentModal
                isOpen={!!submittingContract}
                onClose={handleSubmissionDone}
                contractId={submittingContract?._id}
                contractTerms={submittingContract ? {
                    base_payout: submittingContract.base_payout,
                    conditional_tiers: submittingContract.conditional_tiers,
                    audit_criteria: submittingContract.audit_criteria,
                } : null}
            />
        </div>
    );
}

function ContractCard({ contract, index = 0, onSubmit }) {
    const meta = STATUS_BUCKETS[contract.status] || STATUS_BUCKETS.Draft;
    const advertiserName = contract.advertiserId?.name || 'Brand';
    const campaignTitle = contract.autoBidId?.campaignId?.title
        || contract.autoBidId?.campaignId
        || 'Campaign';
    const postedDate = formatShortDate(contract.createdAt);
    const canSubmit = (contract.status === 'Active' || contract.status === 'Signed') && !!onSubmit;

    return (
        <div
            className={`campaign-card status-${meta.bucket}`}
            style={{ '--stagger': `${index * 40}ms` }}
        >
            <div className="campaign-header">
                <div className="campaign-info">
                    <h3 className="campaign-brand">{advertiserName}</h3>
                    <p className="campaign-name">{typeof campaignTitle === 'string' ? campaignTitle : 'Campaign'}</p>
                </div>
                <StatusIcon icon={meta.icon} />
            </div>

            {postedDate && (
                <div className="campaign-metrics">
                    <div className="metric">
                        <span className="metric-label">Created</span>
                        <span className="metric-value">{postedDate}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Status</span>
                        <span className={`metric-value status-label ${meta.bucket}`}>{meta.label}</span>
                    </div>
                </div>
            )}

            <div className="campaign-payment">
                <div className="payment-info">
                    <span className="payment-label">Base Payout</span>
                    <span className={`payment-value ${meta.bucket === 'completed' ? 'released' : ''}`}>
                        {formatCurrency(contract.base_payout)}
                    </span>
                </div>
                <span className="payment-status">{meta.label}</span>
            </div>

            {contract.audit_criteria && (
                <div className="agent-note">
                    <StatusIndicator status={meta.bucket === 'pending' ? 'pending' : 'ai-working'} size={14} />
                    <span>{contract.audit_criteria}</span>
                </div>
            )}

            {canSubmit && (
                <button className="btn btn-primary btn-full campaign-action" onClick={onSubmit}>
                    Submit Content
                </button>
            )}
        </div>
    );
}
