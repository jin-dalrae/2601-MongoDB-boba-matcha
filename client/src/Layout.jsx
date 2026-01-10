import React from 'react';
import { LayoutGrid, Link, Layers, User, CreditCard } from 'lucide-react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return !!matchPath({ path, end: false }, location.pathname);
    };

    return (
        <div className="app-frame">
            {/* Desktop Sidebar (Hidden on Mobile via CSS) */}
            <div className="desktop-sidebar">
                <div className="brand-logo">Matcha</div>
                <nav className="flex-col gap-4" style={{ display: 'flex' }}>
                    <div
                        className={`desktop-nav-item ${isActive('/') ? 'active' : ''}`}
                        onClick={() => navigate('/')}
                    >
                        <LayoutGrid size={20} />
                        <span>Overview</span>
                    </div>

                    <div
                        className={`desktop-nav-item ${isActive('/campaigns') ? 'active' : ''}`}
                        onClick={() => navigate('/campaigns')}
                    >
                        <Layers size={20} />
                        <span>Campaigns</span>
                    </div>

                    <div
                        className={`desktop-nav-item ${isActive('/payments') ? 'active' : ''}`}
                        onClick={() => navigate('/payments')}
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
                    className={`nav-item ${isActive('/') ? 'active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    <LayoutGrid size={24} />
                    <span>Overview</span>
                </div>

                <div
                    className={`nav-item ${isActive('/campaigns') ? 'active' : ''}`}
                    onClick={() => navigate('/campaigns')}
                >
                    <Layers size={24} />
                    <span>Campaigns</span>
                </div>

                <div
                    className={`nav-item ${isActive('/payments') ? 'active' : ''}`}
                    onClick={() => navigate('/payments')}
                >
                    <CreditCard size={24} />
                    <span>Payments</span>
                </div>
            </nav>
        </div>
    );
};

export default Layout;
