import React from 'react';
import './GradientLoader.css';

export default function GradientLoader({ size = 120, className = '' }) {
    return (
        <div
            className={`gradient-loader-container ${className}`}
            style={{ width: size, height: size }}
        >
            <div className="gradient-orb"></div>
            <div className="gradient-glow"></div>
        </div>
    );
}
