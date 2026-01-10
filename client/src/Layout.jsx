import React from 'react';
import { LayoutGrid, Link, Layers, User } from 'lucide-react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return !!matchPath({ path, end: false }, location.pathname);
    };

    return (
        <div className="app-frame">
            {/* Scrollable Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {children}
            </div>

            {/* Bottom Navigation */}
            <nav className="nav-bar">
                <div
                    className={`nav-item ${isActive('/') && !isActive('/shortlist') && !isActive('/campaigns') ? 'active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    <LayoutGrid size={24} />
                    <span>Overview</span>
                </div>

                <div
                    className={`nav-item ${isActive('/shortlist') ? 'active' : ''}`}
                    onClick={() => navigate('/shortlist')}
                >
                    <Link size={24} />
                    <span>Matches</span>
                </div>

                <div
                    className={`nav-item ${isActive('/campaigns') ? 'active' : ''}`}
                    onClick={() => navigate('/campaigns')}
                >
                    <Layers size={24} />
                    <span>Campaigns</span>
                </div>
            </nav>
        </div>
    );
};

export default Layout;
