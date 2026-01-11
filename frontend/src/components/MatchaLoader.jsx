import React from 'react';
import './MatchaLoader.css';

export default function MatchaLoader({ size = 48, className = '' }) {
    return (
        <div
            className={`matcha-loader-container ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src="/matcha-logo.png"
                alt="Matcha AI"
                className="matcha-loader-img"
            />
            {/* Optional glow ring behind */}
            <div className="matcha-loader-glow"></div>
        </div>
    );
}
