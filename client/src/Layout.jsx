import React from 'react';
import { LayoutGrid, Layers, User, CreditCard } from 'lucide-react'; // Removing Link as we use navigate
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Updated active check to be robust for sub-routes if needed, or exact matching
    const isActive = (path) => {
        if (path === '/advertiser/overview' && location.pathname === '/advertiser/overview') return true;
        return location.pathname.startsWith(path) && path !== '/advertiser/overview';
    };

    return (
        <div className="app-frame">
            {/* Desktop Sidebar (Hidden on Mobile via CSS) */}
            <div className="desktop-sidebar">
                <div className="brand-logo cursor-pointer" onClick={() => navigate('/')}>Matcha</div>
                <nav className="flex-col gap-4" style={{ display: 'flex' }}>
                    <div
                        className={`desktop-nav-item ${location.pathname.includes('overview') ? 'active' : ''}`}
                        onClick={() => navigate('/advertiser/overview')}
                    >
                        <LayoutGrid size={20} />
                        <span>Overview</span>
                    </div>

                    <div
                        className={`desktop-nav-item ${location.pathname.includes('campaigns') ? 'active' : ''}`}
                        onClick={() => navigate('/advertiser/campaigns')}
                    >
                        <Layers size={20} />
                        <span>Campaigns</span>
                    </div>

                    <div
                        className={`desktop-nav-item ${location.pathname.includes('payments') ? 'active' : ''}`}
                        onClick={() => navigate('/advertiser/payments')}
                    >
                        <CreditCard size={20} />
                        <span>Payments</span>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div className="content-container"> {/* Limits max width on desktop */}
                    {children}
                </div>
            </div>

            {/* Mobile Bottom Navigation (Hidden on Desktop via CSS) */}
            <nav className="nav-bar">
                <div
                    className={`nav-item ${location.pathname.includes('overview') ? 'active' : ''}`}
                    onClick={() => navigate('/advertiser/overview')}
                >
                    <LayoutGrid size={24} />
                    <span>Overview</span>
                </div>

                <div
                    className={`nav-item ${location.pathname.includes('campaigns') ? 'active' : ''}`}
                    onClick={() => navigate('/advertiser/campaigns')}
                >
                    <Layers size={24} />
                    <span>Campaigns</span>
                </div>

                <div
                    className={`nav-item ${location.pathname.includes('payments') ? 'active' : ''}`}
                    onClick={() => navigate('/advertiser/payments')}
                >
                    <CreditCard size={24} />
                    <span>Payments</span>
                </div>
            </nav>
        </div>
    );
};

export default Layout;
