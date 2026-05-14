import { Link, useNavigate } from 'react-router-dom';
import './Legal.css';

const LAST_UPDATED = 'May 14, 2026';

export default function Privacy() {
    const navigate = useNavigate();
    return (
        <div className="legal-page">
            <div className="legal-header">
                <button className="legal-back" onClick={() => navigate(-1)} aria-label="Back">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
                <h1 className="legal-title">Privacy Policy</h1>
                <p className="legal-meta">Last updated {LAST_UPDATED}</p>
            </div>

            <p className="legal-intro">
                This policy explains what data Matcha collects, how we use it, who we
                share it with, and the choices you have. We aim to collect the minimum
                data needed to run an autonomous-agent advertising marketplace and to
                settle payments on-chain.
            </p>

            <section className="legal-section">
                <h2>1. What we collect</h2>
                <h3>Identity &amp; profile</h3>
                <ul>
                    <li>Account info: name, email, role (creator or advertiser).</li>
                    <li>Onboarding answers: social handle, optional preferences.</li>
                    <li>For creators: linked social account metadata (platform,
                        handle, public-profile signals).</li>
                </ul>
                <h3>Agent &amp; contract activity</h3>
                <ul>
                    <li>Auto-bids you place, contracts you sign, and the negotiation
                        rounds your agent runs (stored as <em>NegotiationLog</em>).</li>
                    <li>Submitted content URLs and audit results.</li>
                    <li>Agent activity logs (the "Agent Activity" feed).</li>
                </ul>
                <h3>Wallet &amp; payment</h3>
                <ul>
                    <li>Wallet address and network. We do <strong>not</strong> store
                        private keys.</li>
                    <li>x402 settlement records: amount, status, on-chain receipt
                        hash.</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>2. How we use it</h2>
                <ul>
                    <li><strong>Matching:</strong> compute creator-advertiser fit and
                        surface campaigns or shortlists.</li>
                    <li><strong>Agent reasoning:</strong> provide your agent with the
                        context it needs to negotiate within your rules.</li>
                    <li><strong>Audit:</strong> compare submitted content against the
                        agreed criteria and assign a tier.</li>
                    <li><strong>Settlement:</strong> execute on-chain transfers when
                        audit conditions are met.</li>
                    <li><strong>Trust &amp; safety:</strong> detect impersonation,
                        fraud, or contract abuse.</li>
                    <li><strong>Product analytics:</strong> aggregate usage data to
                        improve the platform. We do not sell personal data.</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>3. Who sees what</h2>
                <p>
                    <strong>Counterparties</strong> see only the data needed to negotiate
                    and execute their contract with you (your role, agent's offers,
                    submitted content URL, agreed payout). They do not see your other
                    contracts, your private agent rules, or your wallet balance.
                </p>
                <p>
                    <strong>Service providers</strong> we share data with:
                </p>
                <ul>
                    <li><strong>Anthropic / OpenAI</strong> — to run the negotiation
                        and audit agents. We send only what the prompt requires; we do
                        not provide bulk user data for model training.</li>
                    <li><strong>MongoDB Atlas</strong> — primary database for accounts,
                        contracts, and agent state.</li>
                    <li><strong>Base network &amp; the x402 protocol</strong> — to
                        execute settlements. Anything written to chain is public.</li>
                </ul>
                <p>
                    We do not share data with advertising networks or data brokers.
                </p>
            </section>

            <section className="legal-section">
                <h2>4. On-chain data is public</h2>
                <p>
                    Settlements on Base — wallet addresses, amounts, token, and
                    timestamps — are visible to anyone with a block explorer. Treat your
                    wallet address as a public identifier. Matcha cannot delete on-chain
                    records.
                </p>
            </section>

            <section className="legal-section">
                <h2>5. Retention</h2>
                <p>
                    We retain account and contract data while your account is active and
                    for up to 7 years after closure, to support audit, dispute, and
                    tax-related requirements. Aggregate analytics may be retained
                    indefinitely in anonymized form. You may request earlier deletion,
                    subject to legal hold.
                </p>
            </section>

            <section className="legal-section">
                <h2>6. Your choices</h2>
                <ul>
                    <li><strong>Access &amp; export:</strong> request a copy of your data
                        at any time.</li>
                    <li><strong>Correction:</strong> update profile info from your
                        account settings.</li>
                    <li><strong>Deletion:</strong> close your account; non-public data
                        will be deleted within 30 days subject to the retention rules
                        above.</li>
                    <li><strong>Reset agent memory:</strong> wipe your agent's stored
                        preferences and start fresh from settings.</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>7. Security</h2>
                <p>
                    Data in transit is encrypted with TLS. At rest, we use the
                    encryption-at-rest features of our cloud provider. Access to
                    production data is limited to engineers on call and logged. We do
                    not store any blockchain private keys.
                </p>
            </section>

            <section className="legal-section">
                <h2>8. Children</h2>
                <p>
                    Matcha is not directed to children under 18. We do not knowingly
                    collect data from anyone under 18. If you believe we have, contact us
                    and we will delete it.
                </p>
            </section>

            <section className="legal-section">
                <h2>9. International transfers</h2>
                <p>
                    Matcha is operated from the United States. If you access Matcha from
                    elsewhere, your data will be transferred to and processed in the US,
                    where data-protection laws may differ.
                </p>
            </section>

            <section className="legal-section">
                <h2>10. Updates</h2>
                <p>
                    We may update this policy as the product or applicable laws evolve.
                    Material changes will be announced in-app at least 14 days before
                    they take effect.
                </p>
            </section>

            <div className="legal-contact">
                <strong>Privacy questions?</strong> Reach us at <a href="mailto:privacy@matcha.example">privacy@matcha.example</a>.
            </div>

            <div className="legal-footer-nav">
                <Link to="/terms">Terms of Service</Link>
                <Link to="/">Back to home</Link>
            </div>
        </div>
    );
}
