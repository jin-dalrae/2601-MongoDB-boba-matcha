import './EarningsCard.css';

export default function EarningsCard({ total, available, pending }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className="earnings-card">
            <div className="earnings-header">
                <span className="earnings-label">Total Earnings</span>
            </div>
            <div className="earnings-amount">
                {formatCurrency(total)}
            </div>
            <div className="earnings-breakdown">
                <div className="earnings-item">
                    <span className="earnings-item-label">Available</span>
                    <span className="earnings-item-value">{formatCurrency(available)}</span>
                </div>
                <div className="earnings-divider"></div>
                <div className="earnings-item">
                    <span className="earnings-item-label">Pending</span>
                    <span className="earnings-item-value pending">{formatCurrency(pending)}</span>
                </div>
            </div>
        </div>
    );
}
