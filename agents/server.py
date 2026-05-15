"""
Matcha Agent API Server
FastAPI server exposing LangGraph agents as REST endpoints
"""

import os
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from negotiation_agent import NegotiationAgent
from payment_agent import PaymentAgent

load_dotenv()

# ============================================
# FASTAPI APP
# ============================================

app = FastAPI(
    title="Matcha Agent API",
    description="LangGraph-powered autonomous agents for creator-advertiser negotiations and x402 payments",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
negotiation_agent = NegotiationAgent()
payment_agent = PaymentAgent()


# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class NegotiationRequest(BaseModel):
    contract_id: str = Field(description="Contract ID to negotiate")
    creator_id: str = Field(description="Creator's user ID")
    advertiser_id: str = Field(description="Advertiser's user ID")
    campaign_id: str = Field(description="Campaign ID")
    initial_offer: Dict[str, Any] = Field(description="Initial offer terms")
    creator_profile: Dict[str, Any] = Field(description="Creator profile data")
    advertiser_requirements: Dict[str, Any] = Field(description="Advertiser requirements")
    max_rounds: int = Field(default=5, description="Maximum negotiation rounds")


class NegotiationResponse(BaseModel):
    contract_id: str
    status: str
    round_number: int
    final_terms: Optional[Dict[str, Any]]
    reasoning: str
    messages: list


class PaymentRequest(BaseModel):
    contract_id: str = Field(description="Contract ID for settlement")
    contract_terms: Dict[str, Any] = Field(description="Contract terms including payment details")
    content_submission: Dict[str, Any] = Field(description="Submitted content details")


class AuditOnlyRequest(BaseModel):
    contract_id: str
    contract_terms: Dict[str, Any]
    content_submission: Dict[str, Any]


class PaymentResponse(BaseModel):
    contract_id: str
    settlement_id: Optional[str]
    status: str
    audit_result: Optional[Dict[str, Any]]
    payment_breakdown: Optional[Dict[str, Any]]
    transaction_hash: Optional[str]
    error: Optional[str]


class AuditResponse(BaseModel):
    audit_result: Dict[str, Any]
    payment_breakdown: Dict[str, Any]
    recommended_payment: float


class HealthResponse(BaseModel):
    status: str
    agents: Dict[str, str]
    timestamp: str


# ============================================
# ENDPOINTS
# ============================================

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        agents={
            "negotiation": "ready",
            "payment": "ready"
        },
        timestamp=datetime.now().isoformat()
    )


@app.post("/negotiate", response_model=NegotiationResponse)
async def start_negotiation(request: NegotiationRequest):
    """
    Start an autonomous negotiation between creator and advertiser agents.
    
    The agents will negotiate back and forth until:
    - Agreement is reached
    - One party rejects
    - Max rounds is reached
    """
    try:
        result = negotiation_agent.start_negotiation(
            contract_id=request.contract_id,
            creator_id=request.creator_id,
            advertiser_id=request.advertiser_id,
            campaign_id=request.campaign_id,
            initial_offer=request.initial_offer,
            creator_profile=request.creator_profile,
            advertiser_requirements=request.advertiser_requirements,
            max_rounds=request.max_rounds
        )
        
        return NegotiationResponse(
            contract_id=result["contract_id"],
            status=result["status"],
            round_number=result["round_number"],
            final_terms=result.get("final_terms"),
            reasoning=result.get("reasoning", ""),
            messages=result.get("messages", [])
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Negotiation failed: {str(e)}")


@app.post("/negotiate/step")
async def negotiation_step(state: Dict[str, Any]):
    """
    Execute a single step in an ongoing negotiation.
    
    Use this for more granular control over the negotiation process.
    """
    try:
        result = negotiation_agent.resume_negotiation(state)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Negotiation step failed: {str(e)}")


@app.post("/audit", response_model=AuditResponse)
async def audit_content(request: AuditOnlyRequest):
    """
    Audit submitted content without executing payment.
    
    Returns:
    - AI-generated audit scores
    - Payment breakdown (base + bonus)
    - Recommended total payment
    """
    try:
        result = payment_agent.audit_only(
            contract_id=request.contract_id,
            contract_terms=request.contract_terms,
            content_submission=request.content_submission
        )
        
        return AuditResponse(
            audit_result=result["audit_result"],
            payment_breakdown=result["payment_breakdown"],
            recommended_payment=result["recommended_payment"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")


@app.post("/settle", response_model=PaymentResponse)
async def settle_payment(request: PaymentRequest, background_tasks: BackgroundTasks):
    """
    Process content submission and execute x402 payment.
    
    Flow:
    1. AI audits the content
    2. Calculate payment based on tier achieved
    3. Execute x402 transfer on Base blockchain
    4. Record settlement in MongoDB
    """
    try:
        result = payment_agent.process_settlement(
            contract_id=request.contract_id,
            contract_terms=request.contract_terms,
            content_submission=request.content_submission
        )
        
        return PaymentResponse(
            contract_id=result["contract_id"],
            settlement_id=result.get("settlement_id"),
            status=result["status"],
            audit_result=result.get("audit_result"),
            payment_breakdown=result.get("payment_breakdown"),
            transaction_hash=result.get("transaction_hash"),
            error=result.get("error")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Settlement failed: {str(e)}")


@app.get("/settlement/{contract_id}")
async def get_settlement(contract_id: str):
    """Get settlement details for a contract"""
    from pymongo import MongoClient
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise HTTPException(status_code=500, detail="MongoDB not configured")
    
    try:
        client = MongoClient(mongo_uri)
        db = client.matcha
        
        settlement = db.x402settlements.find_one({"contract_id": contract_id})
        client.close()
        
        if not settlement:
            raise HTTPException(status_code=404, detail="Settlement not found")
        
        settlement["_id"] = str(settlement["_id"])
        return settlement
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/negotiations/{contract_id}")
async def get_negotiation(contract_id: str):
    """Get negotiation history for a contract"""
    from pymongo import MongoClient
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise HTTPException(status_code=500, detail="MongoDB not configured")
    
    try:
        client = MongoClient(mongo_uri)
        db = client.matcha
        
        negotiation = db.negotiations.find_one({"contract_id": contract_id})
        client.close()
        
        if not negotiation:
            raise HTTPException(status_code=404, detail="Negotiation not found")
        
        negotiation["_id"] = str(negotiation["_id"])
        return negotiation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agent-logs/{entity_id}")
async def get_agent_logs(entity_id: str, limit: int = 20):
    """Get agent activity logs for an entity"""
    from pymongo import MongoClient
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise HTTPException(status_code=500, detail="MongoDB not configured")
    
    try:
        client = MongoClient(mongo_uri)
        db = client.matcha
        
        logs = list(db.agentlogs.find(
            {"$or": [
                {"contract_id": entity_id},
                {"creator_id": entity_id},
                {"advertiser_id": entity_id}
            ]}
        ).sort("created_at", -1).limit(limit))
        
        client.close()
        
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return {"logs": logs}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# VISUALIZATION ENDPOINT (for debugging)
# ============================================

@app.get("/graph/negotiation")
async def get_negotiation_graph():
    """Get the negotiation graph structure for visualization"""
    return {
        "nodes": [
            {"id": "analyze_offer", "type": "process"},
            {"id": "creator_decision", "type": "ai"},
            {"id": "advertiser_decision", "type": "ai"},
            {"id": "check_termination", "type": "condition"},
            {"id": "save_and_end", "type": "io"}
        ],
        "edges": [
            {"from": "START", "to": "analyze_offer"},
            {"from": "analyze_offer", "to": "creator_decision"},
            {"from": "creator_decision", "to": "advertiser_decision", "condition": "counter"},
            {"from": "creator_decision", "to": "save_and_end", "condition": "accept/reject"},
            {"from": "advertiser_decision", "to": "check_termination", "condition": "counter"},
            {"from": "advertiser_decision", "to": "save_and_end", "condition": "accept/reject"},
            {"from": "check_termination", "to": "creator_decision", "condition": "continue"},
            {"from": "check_termination", "to": "save_and_end", "condition": "expired"},
            {"from": "save_and_end", "to": "END"}
        ]
    }


@app.get("/graph/payment")
async def get_payment_graph():
    """Get the payment graph structure for visualization"""
    return {
        "nodes": [
            {"id": "audit_content", "type": "ai"},
            {"id": "calculate_payment", "type": "process"},
            {"id": "prepare_x402_payment", "type": "process"},
            {"id": "execute_x402_transfer", "type": "blockchain"},
            {"id": "save_settlement", "type": "io"}
        ],
        "edges": [
            {"from": "START", "to": "audit_content"},
            {"from": "audit_content", "to": "calculate_payment", "condition": "brand_safe"},
            {"from": "audit_content", "to": "save_settlement", "condition": "brand_unsafe"},
            {"from": "calculate_payment", "to": "prepare_x402_payment"},
            {"from": "prepare_x402_payment", "to": "execute_x402_transfer", "condition": "ready"},
            {"from": "prepare_x402_payment", "to": "save_settlement", "condition": "error"},
            {"from": "execute_x402_transfer", "to": "save_settlement"},
            {"from": "save_settlement", "to": "END"}
        ]
    }


# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("AGENT_PORT", 8000))
    
    print(f"""
    🍵 Matcha Agent Server
    ========================
    
    Negotiation Agent: Ready
    Payment Agent: Ready
    
    API Docs: http://localhost:{port}/docs
    """)
    
    uvicorn.run(app, host="0.0.0.0", port=port)
