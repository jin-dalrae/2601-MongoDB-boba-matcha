import './CampaignCard.css';

export default function CampaignCard({
    brand,
    summary,
    status,
    amount,
    budgetRange,
    metrics,
    deadline,
    expanded = false,
    onClick
}) {
    const formatCurrency = (value) => {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
            }).format(value);
        }
        return value;
    };

    const getStatusClass = () => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'status-active';
            case 'pending':
                return 'status-pending';
            case 'completed':
                return 'status-completed';
            default:
                return '';
        }
    };

    return (
        <div
            className={`campaign-card ${expanded ? 'expanded' : ''} ${getStatusClass()}`}
            onClick={onClick}
        >
            <div className="campaign-header">
                <div className="campaign-info">
                    <h3 className="campaign-brand">{brand}</h3>
                    {summary && <p className="campaign-summary">{summary}</p>}
                </div>
                {status && (
                    <div className={`status ${getStatusClass()}`}>
                        <span className="status-dot"></span>
                        <span>{status}</span>
                    </div>
                )}
            </div>

            {(amount || budgetRange) && (
                <div className="campaign-footer">
                    {metrics && (
                        <div className="campaign-metrics">
                            <span className="metric">{metrics}</span>
                            {deadline && <span className="deadline">• {deadline}</span>}
                        </div>
                    )}
                    <div className="campaign-amount">
                        {amount ? formatCurrency(amount) : budgetRange}
                    </div>
                </div>
            )}
        </div>
    );
}
