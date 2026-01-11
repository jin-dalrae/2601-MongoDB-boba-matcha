import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();
    const [activeFlow, setActiveFlow] = useState(null);

    useEffect(() => {
        // Fade in hero elements
        const elements = document.querySelectorAll('.fade-in-element');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100);
        });
    }, []);

    const handleGetStarted = (userType) => {
        setActiveFlow(userType);
        // Navigate to onboarding with user type
        localStorage.setItem('matcha_user_type', userType);
        localStorage.removeItem('matcha_onboarding_complete'); // Reset onboarding
        window.location.href = userType === 'creator' ? '/creator' : '/advertiser';
    };

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="landing-hero">
                <div className="brand-header fade-in-element">
                    <div className="brand-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="#9FE870" strokeWidth="2" />
                            <circle cx="16" cy="16" r="8" fill="#9FE870" />
                            <circle cx="16" cy="10" r="2" fill="#0E0F0F" />
                            <circle cx="11" cy="20" r="2" fill="#0E0F0F" />
                            <circle cx="21" cy="20" r="2" fill="#0E0F0F" />
                        </svg>
                    </div>
                    <h1 className="brand-name">Matcha</h1>
                </div>

                <div className="hero-content">
                    <h2 className="hero-headline fade-in-element">
                        Ads don't fail because of creators.<br />
                        <span className="highlight">They fail because contracts don't execute.</span>
                    </h2>

                    <p className="hero-subheadline fade-in-element">
                        An agent-to-agent marketplace where advertisers and creators negotiate, verify, and settle campaigns automatically.
                    </p>

                    {/* Animated Flow Diagram */}
                    <div className="flow-diagram fade-in-element">
                        <div className="flow-node advertiser">
                            <div className="node-icon">💼</div>
                            <div className="node-label">Advertiser Agent</div>
                        </div>
                        <div className="flow-arrow">
                            <div className="arrow-line pulsing"></div>
                        </div>
                        <div className="flow-node campaign">
                            <div className="node-icon">📋</div>
                            <div className="node-label">Campaign</div>
                        </div>
                        <div className="flow-arrow">
                            <div className="arrow-line pulsing delay-1"></div>
                        </div>
                        <div className="flow-node creators">
                            <div className="node-icon">👥</div>
                            <div className="node-label">Creator Bids</div>
                        </div>
                        <div className="flow-arrow">
                            <div className="arrow-line pulsing delay-2"></div>
                        </div>
                        <div className="flow-node audit">
                            <div className="node-icon">✓</div>
                            <div className="node-label">Verification</div>
                        </div>
                        <div className="flow-arrow">
                            <div className="arrow-line pulsing delay-3"></div>
                        </div>
                        <div className="flow-node escrow">
                            <div className="node-icon">💰</div>
                            <div className="node-label">Payout</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hero-cta fade-in-element">
                        <button className="btn btn-primary btn-large" onClick={() => handleGetStarted('creator')}>
                            I'm a Creator
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="btn btn-primary btn-large" onClick={() => handleGetStarted('advertiser')}>
                            I'm an Advertiser
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="hero-secondary-cta fade-in-element">
                        <a href="#how-it-works" className="link-secondary">See how it works</a>
                        <span className="separator">·</span>
                        <a href="#architecture" className="link-secondary">View system architecture</a>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="landing-section problem-section" id="problem">
                <h3 className="section-title">Why Influencer Ads Are Broken</h3>

                <div className="problem-grid">
                    <div className="problem-card">
                        <div className="problem-icon">💬</div>
                        <h4>Negotiation happens in DMs</h4>
                        <p>Scattered across platforms, no single source of truth, endless back-and-forth.</p>
                    </div>

                    <div className="problem-card">
                        <div className="problem-icon">📊</div>
                        <h4>Trust lives in spreadsheets</h4>
                        <p>Manual tracking, version conflicts, no enforcement mechanism.</p>
                    </div>

                    <div className="problem-card">
                        <div className="problem-icon">📝</div>
                        <h4>Compliance is manual</h4>
                        <p>Human review, subjective judgment, delayed verification.</p>
                    </div>

                    <div className="problem-card">
                        <div className="problem-icon">⏳</div>
                        <h4>Payment is delayed or disputed</h4>
                        <p>Net-60 terms, unclear deliverables, trust-based releases.</p>
                    </div>
                </div>

                <p className="problem-conclusion">
                    Negotiation, trust, compliance, and payment live in different places. <span className="highlight">That's the bug.</span>
                </p>
            </section>

            {/* Solution Section */}
            <section className="landing-section solution-section">
                <h3 className="section-title">Agentic Contracts</h3>
                <p className="section-subtitle">Contracts that execute themselves.</p>

                <p className="solution-description">
                    We built an agent-to-agent marketplace where creators and advertisers negotiate terms,
                    an audit agent verifies delivery against contract clauses, and payouts happen conditionally — not manually.
                </p>
            </section>

            {/* How It Works */}
            <section className="landing-section how-it-works-section" id="how-it-works">
                <h3 className="section-title">How It Works</h3>

                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h4>Advertiser Agent Starts a Campaign</h4>
                            <ul>
                                <li>Budget range</li>
                                <li>Platform (IG / Xiaohongshu / TikTok)</li>
                                <li>Deliverables, deadlines, usage rights</li>
                            </ul>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h4>Creator Agents Auto-Bid</h4>
                            <ul>
                                <li>Price</li>
                                <li>Availability</li>
                                <li>Style fit</li>
                                <li>Past performance (from shared memory)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h4>Shared Memory (MongoDB)</h4>
                            <ul>
                                <li>Contract history</li>
                                <li>Payment records</li>
                                <li>Privacy-aware access control</li>
                            </ul>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h4>Auto-Contracting</h4>
                            <ul>
                                <li>Advertiser agent shortlists and executes contracts</li>
                                <li>No back-and-forth DMs</li>
                            </ul>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">5</div>
                        <div className="step-content">
                            <h4>Audit Agent</h4>
                            <ul>
                                <li>Verifies content vs contract clauses</li>
                                <li>Calculates tiered rewards or penalties</li>
                            </ul>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">6</div>
                        <div className="step-content">
                            <h4>Conditional Payout</h4>
                            <ul>
                                <li>Escrow enforced</li>
                                <li>Payment released automatically based on audit result</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Makes This Different */}
            <section className="landing-section different-section">
                <h3 className="section-title">What Makes This Different</h3>
                <p className="section-subtitle">No existing platform offers all four:</p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-check">✓</div>
                        <h4>Open bidding</h4>
                        <p>Transparent marketplace for all participants</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-check">✓</div>
                        <h4>Enforced price floors</h4>
                        <p>Protecting creator value at every tier</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-check">✓</div>
                        <h4>Escrow + contract execution</h4>
                        <p>Automated, trustless payment release</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-check">✓</div>
                        <h4>Cross-border workflows</h4>
                        <p>KR–CN–US seamless collaboration</p>
                    </div>
                </div>

                <div className="result-callout">
                    <div className="result-items">
                        <div className="result-item">No secret rates</div>
                        <div className="result-item">No 30–40% agency skim</div>
                        <div className="result-item">No blind pricing by creators</div>
                    </div>
                </div>
            </section>

            {/* Anti-Race-to-Bottom */}
            <section className="landing-section anti-race-section">
                <h3 className="section-title">This is not free-for-all bidding.</h3>

                <div className="enforcement-grid">
                    <div className="enforcement-column">
                        <h4 className="column-header advertiser-color">Advertiser Defines</h4>
                        <ul>
                            <li>Budget range</li>
                            <li>Deliverables</li>
                            <li>Deadline</li>
                            <li>Usage rights</li>
                        </ul>
                    </div>

                    <div className="enforcement-column">
                        <h4 className="column-header creator-color">Creator Submits</h4>
                        <ul>
                            <li>Bid price</li>
                            <li>Delivery promise</li>
                            <li>Optional upsells</li>
                        </ul>
                    </div>

                    <div className="enforcement-column">
                        <h4 className="column-header platform-color">Platform Enforces</h4>
                        <ul>
                            <li>Minimum floor prices by tier</li>
                            <li>Clear scope definitions</li>
                            <li>Automatic escrow</li>
                        </ul>
                    </div>
                </div>

                <p className="enforcement-conclusion">
                    Markets only work when incentives are enforced.
                </p>
            </section>

            {/* Trust & Infrastructure */}
            <section className="landing-section trust-section">
                <h3 className="section-title">Accountability is built-in.</h3>

                <div className="trust-grid">
                    <div className="trust-item">
                        <div className="trust-icon">🗄️</div>
                        <p>Shared memory as a single source of truth</p>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon">📋</div>
                        <p>Audit trails for every contract</p>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon">🔒</div>
                        <p>Privacy-aware data visibility</p>
                    </div>

                    <div className="trust-item">
                        <div className="trust-icon">🌍</div>
                        <p>Scales from solo creators to global campaigns</p>
                    </div>
                </div>

                <div className="infrastructure-callout">
                    <p>Powered by a shared database and agent orchestration layer designed for adversarial incentives.</p>
                </div>
            </section>

            {/* Closing Section */}
            <section className="landing-section closing-section" id="architecture">
                <h2 className="closing-statement">
                    This isn't a marketplace for posts.<br />
                    <span className="highlight">It's infrastructure for executing advertising contracts.</span>
                </h2>

                <div className="closing-cta">
                    <button className="btn btn-primary btn-large" onClick={() => handleGetStarted('creator')}>
                        Join as Creator
                    </button>
                    <button className="btn btn-primary btn-large" onClick={() => handleGetStarted('advertiser')}>
                        Join as Advertiser
                    </button>
                </div>

                <div className="closing-links">
                    <a href="#docs" className="link-secondary">Documentation</a>
                    <span className="separator">·</span>
                    <a href="#architecture" className="link-secondary">Architecture</a>
                    <span className="separator">·</span>
                    <a href="#demo" className="link-secondary">Request Demo</a>
                    <span className="separator">·</span>
                    <a href="#contact" className="link-secondary">Contact</a>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Built for a future where agents negotiate on our behalf.</p>
            </footer>
        </div>
    );
}
