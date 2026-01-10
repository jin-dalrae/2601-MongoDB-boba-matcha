import mongoose from 'mongoose';

let cachedDb = null;

export async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable not set');
    }

    const client = await mongoose.connect(uri);
    cachedDb = client;
    return cachedDb;
}

// --- Schemas ---
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: { type: String, enum: ['Advertiser', 'Creator'] },
    wallet_address: String,
    social_links: Object,
    createdAt: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
    advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    product_info: Object,
    target_criteria: Object,
    budget_limit: Number,
    status: { type: String, default: 'Draft' },
    createdAt: { type: Date, default: Date.now }
});

const autoBidSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    current_bid: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const contractSchema = new mongoose.Schema({
    autoBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutoBid' },
    advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    base_payout: Number,
    audit_criteria: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const auditReportSchema = new mongoose.Schema({
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    content_score: Number,
    reach_verified: Number,
    passed: Boolean,
    createdAt: { type: Date, default: Date.now }
});

const x402SettlementSchema = new mongoose.Schema({
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    total_paid: Number,
    tx_hash: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const agentLogSchema = new mongoose.Schema({
    action: String,
    timestamp: { type: Date, default: Date.now }
});

// --- Models (with caching to avoid recompilation) ---
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
export const AutoBid = mongoose.models.AutoBid || mongoose.model('AutoBid', autoBidSchema);
export const Contract = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
export const AuditReport = mongoose.models.AuditReport || mongoose.model('AuditReport', auditReportSchema);
export const X402Settlement = mongoose.models.X402Settlement || mongoose.model('X402Settlement', x402SettlementSchema);
export const AgentLog = mongoose.models.AgentLog || mongoose.model('AgentLog', agentLogSchema);
