const mongoose = require('mongoose');

// --- A. Entry & Onboarding ---

const snsAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['TikTok', 'Instagram', 'YouTube', 'X'], required: true },
  handle: String,
  connectionStatus: { type: String, enum: ['Connected', 'Disconnected'], default: 'Connected' },
  authMeta: mongoose.Schema.Types.Mixed // Mock token data
});

const agentConfigSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  rules: {
    auto_bid_max: Number,
    preferences: mongoose.Schema.Types.Mixed, // JSON
    tone: String
  },
  memory_state: String // context_embeddings placeholder
});

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: String,
  network: { type: String, default: 'Base' },
  balance: Number
});

const sharedMemorySchema = new mongoose.Schema({
  entityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }, // User or Agent ID
  performance_embedding: [Number], // Vector (was contract_history_embedding)
  reliability_score: Number,
  visibility_rules: mongoose.Schema.Types.Mixed // JSON: "Who can see what" (was privacy_masks)
});

const agentLogSchema = new mongoose.Schema({
  sharedMemoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shared_Memory' },
  action: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['Advertiser', 'Creator'], required: true },
  name: String,
  email: String,
  onboarding_status: { type: String, enum: ['Pending', 'Complete'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

// --- B & C. Campaign & Bidding ---

const campaignSchema = new mongoose.Schema({
  advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  product_info: mongoose.Schema.Types.Mixed, // JSON
  budget_limit: Number,
  status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

// Was Proposal, now AutoBid based on new diagram
const autoBidSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  current_bid: Number,
  status: { type: String, enum: ['Negotiating', 'Accepted', 'Cancelled', 'Proposed'], default: 'Proposed' },
  createdAt: { type: Date, default: Date.now }
});

// --- D. Negotiation & Contract ---

const negotiationLogSchema = new mongoose.Schema({
  autoBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutoBid', required: true }, // Updated ref
  round_history: [{
    round: Number,
    price: Number,
    concessions: String,
    reasoning: String,
    timestamp: { type: Date, default: Date.now }
  }],
  agent_logic_summary: String
});

const contractSchema = new mongoose.Schema({
  autoBidId: { type: mongoose.Schema.Types.ObjectId, ref: 'AutoBid', unique: true }, // Updated ref
  advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Smart Contract Properties - Updated
  base_payout: Number, // was base_amount
  conditional_tiers: mongoose.Schema.Types.Mixed, // JSON: Bonus rules (was reward_tiers)
  audit_criteria: String,

  status: { type: String, enum: ['Draft', 'Signed', 'Active', 'Auditing', 'Settled', 'Completed', 'Terminated'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now }
});

// --- E & F. Content & Audit ---

const shipmentSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  trackingCode: String,
  status: { type: String, enum: ['Processing', 'Shipped', 'Delivered'], default: 'Processing' },
  shippedAt: Date,
  deliveredAt: Date
});

const contentSubmissionSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  content_url: String,
  submitted_at: { type: Date, default: Date.now }
});

const auditReportSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentSubmission', unique: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }, // Direct link usually helpful
  video_fingerprint: String, // hash

  // Updated fields
  content_score: Number, // 0.0 to 1.0 (was performance_score)
  tier_achieved: Number, // 0, 1, or 2 (was tier_reached object)
  reasoning_log: String, // AI reasoning for reward (was reasoning)

  generatedAt: { type: Date, default: Date.now }
});

// --- G. Payment ---

const x402SettlementSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  auditReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit_Report' }, // Link to audit trigger

  // x402 specific
  x402_handshake_header: String,
  status: { type: String, enum: ['Waiting', 'Escrowed', 'Released', 'Settled'], default: 'Waiting' },
  stablecoin_hash: String,

  // Settlement details - Updated
  total_paid: Number, // Base + Bonus (was final_calculated_payout)
  receipt_hash: String, // Blockchain record (was stablecoin_receipt)

  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const SNSAccount = mongoose.model('SNS_Account', snsAccountSchema);
const AgentConfig = mongoose.model('Agent_Config', agentConfigSchema);
const Wallet = mongoose.model('Wallet', walletSchema);
const SharedMemory = mongoose.model('Shared_Memory', sharedMemorySchema);
const AgentLog = mongoose.model('Agent_Log', agentLogSchema);

const Campaign = mongoose.model('Campaign', campaignSchema);
const AutoBid = mongoose.model('AutoBid', autoBidSchema); // formerly Proposal

const NegotiationLog = mongoose.model('Negotiation_Log', negotiationLogSchema);
const Contract = mongoose.model('Contract', contractSchema);
const Shipment = mongoose.model('Shipment', shipmentSchema);

const ContentSubmission = mongoose.model('Content_Submission', contentSubmissionSchema);
const AuditReport = mongoose.model('Audit_Report', auditReportSchema);
const X402Settlement = mongoose.model('X402_Settlement', x402SettlementSchema); // Formerly X402Transaction

module.exports = {
  User, SNSAccount, AgentConfig, Wallet, SharedMemory, AgentLog,
  Campaign, AutoBid,
  NegotiationLog, Contract, Shipment,
  ContentSubmission, AuditReport, X402Settlement
};
