import { useState } from 'react';
import './BottomNav.css';

const navItems = [
  {
    id: 'home',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    id: 'campaigns',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" fill={active ? "currentColor" : "none"} />
        <path d="M21 21l-4.35-4.35" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'bidding',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {active ? (
          <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z" fill="currentColor" stroke="none" />
        ) : (
          <>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </>
        )}
      </svg>
    ),
  },
  {
    id: 'profile',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" fill={active ? "currentColor" : "none"} />
        <path d="M20 21a8 8 0 1 0-16 0" fill={active ? "currentColor" : "none"} />
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTabClick = (id) => {
    setIsPressed(true);
    onTabChange(id);
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <nav className={`floating-nav ${isPressed ? 'pressed' : ''}`}>
      <div className="nav-pill">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id)}
          >
            <span className="nav-icon">
              {item.icon(activeTab === item.id)}
              {activeTab === item.id && <span className="icon-glow" />}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
