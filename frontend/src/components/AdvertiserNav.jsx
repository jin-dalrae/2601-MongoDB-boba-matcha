import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Link2, Layers } from 'lucide-react';
import './AdvertiserNav.css';

const navItems = [
  {
    id: 'dashboard',
    path: '/advertiser',
    label: 'Overview',
    icon: LayoutGrid,
  },
  {
    id: 'shortlist',
    path: '/advertiser/shortlist',
    label: 'Matches',
    icon: Link2,
  },
  {
    id: 'campaigns',
    path: '/advertiser/campaigns',
    label: 'Campaigns',
    icon: Layers,
  },
];

export default function AdvertiserNav() {
  const [isPressed, setIsPressed] = useState(false);
  const location = useLocation();

  const handleTabClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
  };

  const isActive = (item) => {
    const path = location.pathname;
    if (item.id === 'dashboard') {
      return path === '/advertiser' || path === '/advertiser/';
    }
    return path.startsWith(item.path);
  };

  return (
    <nav className={`advertiser-nav light-theme ${isPressed ? 'pressed' : ''}`}>
      {/* Logo for desktop sidebar */}
      <div className="nav-logo">
        <span className="nav-logo-text">Matcha</span>
      </div>

      <div className="nav-bar">
        {navItems.map((item) => {
          const active = isActive(item);
          const IconComponent = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={handleTabClick}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
