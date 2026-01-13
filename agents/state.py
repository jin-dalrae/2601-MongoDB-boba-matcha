"""
Matcha Agent State Definitions
Shared state schemas for LangGraph agents
"""

from typing import TypedDict, List, Optional, Literal, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ============================================
# NEGOTIATION AGENT STATE
# ============================================

class NegotiationTerms(BaseModel):
    """Terms being negotiated"""
    base_payment: float = Field(description="Base payment amount in USD")
    deliverables: str = Field(description="Content deliverables description")
    deadline_days: int = Field(description="Days until deadline")
    usage_rights: str = Field(default="standard", description="Usage rights level")
    exclusivity: bool = Field(default=False, description="Exclusivity clause")
    bonus_tiers: List[dict] = Field(default_factory=list, description="Performance bonus tiers")


class NegotiationMessage(BaseModel):
    """A single message in negotiation history"""
    role: Literal["creator", "advertiser", "system"]
    content: str
    terms: Optional[NegotiationTerms] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class NegotiationState(TypedDict):
    """State for the negotiation agent graph"""
    # Identifiers
    contract_id: str
    creator_id: str
    advertiser_id: str
    campaign_id: str
    
    # Current negotiation state
    status: Literal["pending", "negotiating", "accepted", "rejected", "expired"]
    current_offer: Optional[dict]
    counter_offer: Optional[dict]
    
    # Negotiation history
    messages: List[dict]
    round_number: int
    max_rounds: int
    
    # Agent context
    creator_profile: dict
    advertiser_requirements: dict
    market_data: dict
    
    # Decision outputs
    should_accept: bool
    should_counter: bool
    reasoning: str
    final_terms: Optional[dict]
    
    # Metadata
    error: Optional[str]


# ============================================
# PAYMENT AGENT STATE
# ============================================

class PaymentDetails(BaseModel):
    """Payment details for x402 settlement"""
    amount: float = Field(description="Payment amount in USD")
    token: Literal["USDC", "EURC", "cbBTC"] = Field(default="USDC")
    recipient_address: str = Field(description="Recipient wallet address")
    sender_address: str = Field(description="Sender wallet address")
    network: Literal["base", "base-sepolia"] = Field(default="base")


class AuditResult(BaseModel):
    """Content audit result that determines payment"""
    content_score: float = Field(ge=0, le=100, description="Content quality score 0-100")
    tier_achieved: int = Field(ge=0, le=3, description="Bonus tier achieved")
    brand_safety: bool = Field(description="Content is brand safe")
    deliverables_met: bool = Field(description="All deliverables were met")
    reasoning: str = Field(description="Audit reasoning")


class PaymentState(TypedDict):
    """State for the payment agent graph"""
    # Identifiers
    contract_id: str
    settlement_id: Optional[str]
    
    # Contract context
    contract_terms: dict
    content_submission: dict
    audit_result: Optional[dict]
    
    # Payment calculation
    base_payment: float
    bonus_payment: float
    total_payment: float
    payment_breakdown: dict
    
    # x402 Transaction
    payment_details: Optional[dict]
    transaction_hash: Optional[str]
    receipt: Optional[dict]
    
    # Status
    status: Literal["pending_audit", "calculating", "ready_to_pay", "processing", "completed", "failed"]
    error: Optional[str]
    
    # Metadata
    created_at: str
    completed_at: Optional[str]


# ============================================
# SHARED MEMORY STATE
# ============================================

class AgentMemory(BaseModel):
    """Persistent memory for agent learning"""
    entity_id: str
    entity_type: Literal["creator", "advertiser"]
    
    # Negotiation preferences learned over time
    preferred_payment_range: tuple = Field(default=(0, 0))
    typical_deliverables: List[str] = Field(default_factory=list)
    negotiation_style: Literal["aggressive", "moderate", "flexible"] = Field(default="moderate")
    
    # Historical performance
    past_negotiations: int = 0
    successful_deals: int = 0
    average_settlement_time: float = 0.0
    reliability_score: float = 0.5
    
    # Embeddings for matching
    performance_embedding: List[float] = Field(default_factory=list)
