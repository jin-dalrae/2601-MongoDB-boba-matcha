import { Link, useNavigate } from 'react-router-dom';
import './Legal.css';

const LAST_UPDATED = 'May 14, 2026';

export default function Terms() {
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
                <h1 className="legal-title">Terms of Service</h1>
                <p className="legal-meta">Last updated {LAST_UPDATED}</p>
            </div>

            <p className="legal-intro">
                These Terms govern your use of Matcha, an autonomous agent platform that
                matches creators and advertisers, negotiates terms on each party's behalf,
                audits delivered content, and settles payments on the Base blockchain via
                the x402 protocol. By creating a Matcha account, you agree to these Terms.
            </p>

            <section className="legal-section">
                <h2>1. Eligibility</h2>
                <p>
                    You must be at least 18 years old, or the age of majority in your
                    jurisdiction (whichever is higher), to use Matcha. If you are using
                    Matcha on behalf of a company or other legal entity, you represent
                    that you have authority to bind that entity to these Terms.
                </p>
            </section>

            <section className="legal-section">
                <h2>2. How the agents act on your behalf</h2>
                <p>
                    Matcha deploys AI agents that take actions you have authorized,
                    including:
                </p>
                <ul>
                    <li>Bidding on campaigns within budget and tone limits you set;</li>
                    <li>Negotiating contract terms with the counterparty's agent;</li>
                    <li>Auditing submitted content against agreed-upon criteria;</li>
                    <li>Triggering on-chain payments once audit conditions are met.</li>
                </ul>
                <p>
                    Agent actions are binding on you. You are responsible for keeping
                    your agent configuration accurate. You may adjust auto-bid maximums,
                    tone, audit criteria, and other rules at any time; changes apply to
                    future negotiations only.
                </p>
            </section>

            <section className="legal-section">
                <h2>3. Creator commitments</h2>
                <ul>
                    <li>
                        You own or have full rights to any content you submit, including
                        music, footage, and likeness rights.
                    </li>
                    <li>
                        You will deliver content that materially matches the contract
                        terms negotiated by your agent (deliverable type, mentions,
                        timeline). Failure may result in reduced tier payout per the
                        contract's <em>conditional_tiers</em>.
                    </li>
                    <li>
                        You will not misrepresent metrics, audience, or platform identity.
                    </li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>4. Advertiser commitments</h2>
                <ul>
                    <li>
                        Campaign budgets must be funded. Settlement transfers are pulled
                        from your designated wallet upon audit success.
                    </li>
                    <li>
                        Audit criteria must be specified in advance and may not be changed
                        unilaterally after a contract is signed.
                    </li>
                    <li>
                        You will not use creator likeness beyond the rights granted in
                        the contract.
                    </li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>5. Payments &amp; settlement</h2>
                <p>
                    Payments settle on the Base blockchain in USDC, EURC, or cbBTC via the
                    x402 protocol. On-chain transactions are irreversible. Network gas
                    fees, where applicable, are borne by the paying party unless
                    otherwise specified in the contract.
                </p>
                <p>
                    Settled amounts include the contract's base payout plus any bonus
                    earned by reaching higher audit tiers. Tier thresholds and bonus
                    amounts are fixed at contract signing.
                </p>
            </section>

            <section className="legal-section">
                <h2>6. Cancellation</h2>
                <p>
                    A confirmed contract may be cancelled by either party within the
                    cancellation window stated on the contract (default 30 minutes from
                    confirmation). After the window closes, the contract is binding and
                    the only path to exit is failed audit or mutual termination.
                </p>
            </section>

            <section className="legal-section">
                <h2>7. Intellectual property</h2>
                <p>
                    Creators retain copyright in their content. Advertisers receive only
                    the license granted in the specific contract (typically: paid social
                    usage for the campaign duration, with optional whitelisting upgrades).
                    Matcha's software, agents, design, and trademarks remain the property
                    of Matcha or its licensors.
                </p>
            </section>

            <section className="legal-section">
                <h2>8. Disputes</h2>
                <p>
                    On-chain settlements are final, but parties may flag a contract for
                    review if they believe an audit was made in error or content was
                    misrepresented. Matcha will mediate in good faith but is not a party
                    to the contract itself.
                </p>
            </section>

            <section className="legal-section">
                <h2>9. Disclaimers</h2>
                <p>
                    Matcha is provided "as is". AI agents make judgments based on
                    available data and configured rules; their negotiations and audit
                    decisions are advisory until you authorize the resulting contract or
                    settlement. We make no guarantee about campaign performance,
                    creator-advertiser fit, or specific payout amounts.
                </p>
            </section>

            <section className="legal-section">
                <h2>10. Limitation of liability</h2>
                <p>
                    To the maximum extent permitted by law, Matcha is not liable for
                    indirect, incidental, or consequential damages. Our aggregate
                    liability for any direct damages is limited to the fees Matcha
                    received from you in the 12 months preceding the claim.
                </p>
            </section>

            <section className="legal-section">
                <h2>11. Changes</h2>
                <p>
                    We may update these Terms as the product evolves. Material changes
                    will be announced in-app at least 14 days before they take effect.
                    Continued use after the effective date constitutes acceptance.
                </p>
            </section>

            <div className="legal-contact">
                <strong>Questions?</strong> Reach us at <a href="mailto:legal@matcha.example">legal@matcha.example</a>.
            </div>

            <div className="legal-footer-nav">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/">Back to home</Link>
            </div>
        </div>
    );
}
