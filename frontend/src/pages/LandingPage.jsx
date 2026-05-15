import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MatchaLogo from '../components/MatchaLogo';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.querySelectorAll('.fade-in').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80);
        });
    }, []);

    const goTo = (role) => {
        // Persist intent, don't blow away existing onboarding state.
        localStorage.setItem('matcha_user_type', role);
        navigate(role === 'creator' ? '/creator' : '/advertiser');
    };

    return (
        <div className="landing">
            {/* ----- Top nav ----- */}
            <header className="landing-nav">
                <Link to="/" className="landing-mark" aria-label="Matcha home">
                    <MatchaLogo size={22} />
                    <span>Matcha</span>
                </Link>
                <nav className="landing-nav-links">
                    <a href="#how">How it works</a>
                    <a href="#stack">Architecture</a>
                    <Link to="/terms">Legal</Link>
                </nav>
            </header>

            {/* ----- Hero ----- */}
            <section className="landing-hero">
                <div className="hero-text fade-in">
                    <p className="eyebrow">Agent-to-agent advertising</p>
                    <h1 className="hero-headline">
                        Contracts that negotiate, audit,<br />
                        and <em>pay themselves</em>.
                    </h1>
                    <p className="hero-lede">
                        Matcha is the marketplace between creators and brands where the
                        negotiations happen between their AI agents, content is audited
                        against the agreed terms, and payment settles on Base the moment
                        the audit clears.
                    </p>
                    <div className="cta-row">
                        <button className="btn-primary" onClick={() => goTo('creator')}>
                            Open creator demo
                            <ArrowIcon />
                        </button>
                        <button className="btn-ghost" onClick={() => goTo('advertiser')}>
                            Advertiser dashboard
                        </button>
                    </div>
                </div>
                <aside className="hero-preview fade-in">
                    <NegotiationPreview />
                </aside>
            </section>

            {/* ----- How it actually works ----- */}
            <section className="landing-how" id="how">
                <p className="eyebrow">How it actually works</p>
                <h2 className="section-headline">Four moments. No middlemen.</h2>

                <ol className="how-steps">
                    <li className="how-step">
                        <div className="how-step-text">
                            <span className="step-num">01</span>
                            <h3>A creator bids on a campaign.</h3>
                            <p>
                                One <code>POST&nbsp;/api/deals</code>. The bid carries the
                                creator's profile and the advertiser's requirements into the
                                negotiating agent.
                            </p>
                        </div>
                        <BidPreview />
                    </li>

                    <li className="how-step">
                        <div className="how-step-text">
                            <span className="step-num">02</span>
                            <h3>Two agents negotiate the terms.</h3>
                            <p>
                                LangGraph orchestrates a multi-round dialogue between the
                                creator's and advertiser's agents. The transcript is persisted
                                in MongoDB; the final terms become a <code>Contract</code>.
                            </p>
                        </div>
                        <NegotiationPreview compact />
                    </li>

                    <li className="how-step">
                        <div className="how-step-text">
                            <span className="step-num">03</span>
                            <h3>The creator submits content. The audit agent scores it.</h3>
                            <p>
                                The submitted URL is checked against the contract's
                                <code> audit_criteria</code>. The agent returns a
                                <code> content_score</code> and a <code>tier_achieved</code>.
                            </p>
                        </div>
                        <AuditPreview />
                    </li>

                    <li className="how-step">
                        <div className="how-step-text">
                            <span className="step-num">04</span>
                            <h3>Settlement runs on Base. The creator gets paid.</h3>
                            <p>
                                An <code>x402</code> transfer fires for the base payout plus any
                                tier bonus. The receipt hash and settlement record land in
                                MongoDB the same second.
                            </p>
                        </div>
                        <SettlePreview />
                    </li>
                </ol>
            </section>

            {/* ----- Architecture ----- */}
            <section className="landing-stack" id="stack">
                <p className="eyebrow">Architecture</p>
                <h2 className="section-headline">Three services, one ledger.</h2>

                <div className="stack-grid">
                    <article>
                        <h4>Node API</h4>
                        <p>
                            Express + Mongoose. Owns users, campaigns, AutoBids, contracts,
                            audits, settlements.
                        </p>
                        <code>http://localhost:3001/api</code>
                    </article>
                    <article>
                        <h4>Agents</h4>
                        <p>
                            FastAPI + LangGraph. Runs the negotiation and audit graphs,
                            executes the x402 transfer on Base.
                        </p>
                        <code>http://localhost:8000</code>
                    </article>
                    <article>
                        <h4>Frontend</h4>
                        <p>
                            Vite + React. Creator and advertiser apps share components and
                            call the API and agents directly.
                        </p>
                        <code>http://localhost:5173</code>
                    </article>
                </div>
            </section>

            {/* ----- Closing ----- */}
            <section className="landing-closing">
                <h2 className="closing-headline">
                    Stop chasing invoices.<br />
                    <em>Let the agents handle it.</em>
                </h2>
                <button className="btn-primary btn-large" onClick={() => goTo('creator')}>
                    Try the demo
                    <ArrowIcon />
                </button>
            </section>

            {/* ----- Footer ----- */}
            <footer className="landing-footer">
                <div className="footer-mark">
                    <MatchaLogo size={18} />
                    <span>Matcha</span>
                </div>
                <div className="footer-links">
                    <Link to="/terms">Terms</Link>
                    <Link to="/privacy">Privacy</Link>
                    <a href="https://github.com/jin-dalrae/2601-MongoDB-boba-matcha" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                </div>
                <p className="footer-meta">Built for the MongoDB Hackathon 2026.</p>
            </footer>
        </div>
    );
}

// ----- inline preview components --------------------------------------------

function ArrowIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function NegotiationPreview({ compact = false }) {
    return (
        <div className={`preview-card preview-negotiation ${compact ? 'is-compact' : ''}`}>
            <div className="preview-header">
                <span className="preview-eyebrow">Negotiation transcript</span>
                <span className="preview-pill">Round 3 of 5</span>
            </div>
            <div className="preview-chat">
                <ChatLine role="brand" name="Brand agent">
                    We can start at <strong>$750</strong> for 1 TikTok video.
                </ChatLine>
                <ChatLine role="creator" name="Creator agent">
                    Counter at <strong>$1,000</strong> — engagement data supports it.
                </ChatLine>
                <ChatLine role="brand" name="Brand agent">
                    Compromise at <strong>$920</strong>, with a tier-1 bonus on views.
                </ChatLine>
                <ChatLine role="creator" name="Creator agent">
                    Accepted — drafting contract.
                </ChatLine>
            </div>
            <div className="preview-result">
                <div className="result-row">
                    <span>Final payout</span>
                    <strong>$920</strong>
                </div>
                <div className="result-row">
                    <span>Tier-1 bonus (1k views)</span>
                    <strong>+$92</strong>
                </div>
            </div>
        </div>
    );
}

function ChatLine({ role, name, children }) {
    return (
        <div className={`chat-line chat-line--${role}`}>
            <span className="chat-name">{name}</span>
            <p className="chat-bubble">{children}</p>
        </div>
    );
}

function BidPreview() {
    return (
        <div className="preview-card preview-bid">
            <div className="preview-header">
                <span className="preview-eyebrow">AutoBid created</span>
                <span className="preview-pill preview-pill-mono">deals/672a3…</span>
            </div>
            <div className="bid-row">
                <span>Campaign</span>
                <strong>Glow Serum Launch</strong>
            </div>
            <div className="bid-row">
                <span>Creator</span>
                <strong>@avery.k</strong>
            </div>
            <div className="bid-row">
                <span>Current bid</span>
                <strong>$1,000</strong>
            </div>
            <div className="bid-row">
                <span>Status</span>
                <span className="bid-status">Negotiating</span>
            </div>
        </div>
    );
}

function AuditPreview() {
    return (
        <div className="preview-card preview-audit">
            <div className="preview-header">
                <span className="preview-eyebrow">AuditReport</span>
                <span className="preview-pill preview-pill-mono">audit/8f21c…</span>
            </div>
            <div className="audit-score">
                <div className="score-circle">
                    <span className="score-value">87</span>
                    <span className="score-unit">%</span>
                </div>
                <div className="audit-meta">
                    <span className="audit-tier">Tier 1 reached</span>
                    <p className="audit-reason">
                        Product featured clearly in first 8 seconds; brand mentioned twice.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SettlePreview() {
    return (
        <div className="preview-card preview-settle">
            <div className="preview-header">
                <span className="preview-eyebrow">X402 settlement</span>
                <span className="preview-pill preview-pill-success">Settled</span>
            </div>
            <div className="settle-amount">
                $1,012<span className="settle-unit">USDC</span>
            </div>
            <div className="settle-row">
                <span>Network</span>
                <strong>Base</strong>
            </div>
            <div className="settle-row">
                <span>Receipt</span>
                <code>0x9a4f…c21d</code>
            </div>
        </div>
    );
}
