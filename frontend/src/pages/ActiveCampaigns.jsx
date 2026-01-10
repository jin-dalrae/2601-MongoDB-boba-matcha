import TopBar from '../components/TopBar';
import CampaignCard from '../components/CampaignCard';
import './ActiveCampaigns.css';

const activeCampaigns = [
    {
        id: 1,
        brand: 'Nike',
        status: 'Active',
        metrics: '12.5K views',
        deadline: 'Mar 15',
        amount: 400,
    },
    {
        id: 2,
        brand: 'Sephora',
        status: 'Pending',
        metrics: 'Awaiting approval',
        deadline: null,
        amount: 320,
    },
    {
        id: 3,
        brand: 'Adidas',
        status: 'Completed',
        metrics: '8.2K views',
        deadline: null,
        amount: 280,
    },
    {
        id: 4,
        brand: 'Spotify',
        status: 'Active',
        metrics: '5.8K views',
        deadline: 'Mar 20',
        amount: 250,
    },
];

export default function ActiveCampaigns() {
    return (
        <div className="page active-campaigns">
            <TopBar
                showAvatar={false}
                showNotification={false}
                title="Active Campaigns"
            />

            <div className="campaigns-list">
                {activeCampaigns.map((campaign) => (
                    <CampaignCard
                        key={campaign.id}
                        brand={campaign.brand}
                        status={campaign.status}
                        metrics={campaign.metrics}
                        deadline={campaign.deadline}
                        amount={campaign.amount}
                        expanded={campaign.status === 'Active'}
                    />
                ))}
            </div>
        </div>
    );
}
