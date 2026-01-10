import { useEffect, useState } from 'react';
import './Loading.css';

export default function Loading({ onComplete }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase((prev) => (prev + 1) % 3);
        }, 800);

        // Auto-complete loading after 2.5 seconds
        const timeout = setTimeout(() => {
            onComplete?.();
        }, 2500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className={`logo-container phase-${phase}`}>
                    <span className="logo">Matcha</span>
                </div>
                <div className="loading-shapes">
                    <div className={`shape shape-1 ${phase === 0 ? 'active' : ''}`}></div>
                    <div className={`shape shape-2 ${phase === 1 ? 'active' : ''}`}></div>
                    <div className={`shape shape-3 ${phase === 2 ? 'active' : ''}`}></div>
                </div>
            </div>
        </div>
    );
}
