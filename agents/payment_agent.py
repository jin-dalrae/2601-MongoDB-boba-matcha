"""
Matcha Payment Agent
LangGraph-based x402 protocol payment settlement
"""

import os
import json
import httpx
from typing import Literal, Optional
from datetime import datetime
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from web3 import Web3
from eth_account import Account

from state import PaymentState, AuditResult

load_dotenv()


# ============================================
# x402 PROTOCOL CONSTANTS
# ============================================

X402_TOKENS = {
    "USDC": {
        "base": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "decimals": 6
    },
    "EURC": {
        "base": "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
        "base-sepolia": "0x",  # Not available on testnet
        "decimals": 6
    },
    "cbBTC": {
        "base": "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
        "base-sepolia": "0x",  # Not available on testnet
        "decimals": 8
    }
}

BASE_RPC_URLS = {
    "base": "https://mainnet.base.org",
    "base-sepolia": "https://sepolia.base.org"
}

# ERC20 ABI for transfers
ERC20_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
]


# ============================================
# LLM FOR AUDIT
# ============================================

def get_llm():
    """Get configured LLM"""
    if os.getenv("ANTHROPIC_API_KEY"):
        return ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0.3)
    elif os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(model="gpt-4o", temperature=0.3)
    else:
        raise ValueError("No LLM API key configured")


AUDIT_PROMPT = """You are a content auditor for brand deals. Analyze the submitted content against the contract requirements.

CONTRACT TERMS:
{contract_terms}

CONTENT SUBMISSION:
- URL: {content_url}
- Caption: {caption}
- Submitted: {submitted_at}
- Platform: {platform}

Evaluate the content on these criteria:
1. **Brand Safety** (0-100): Is the content appropriate for the brand?
2. **Deliverables Met** (Yes/No): Does it match the agreed deliverables?
3. **Quality Score** (0-100): Production quality, engagement potential
4. **Authenticity** (0-100): Does it feel genuine, not overly promotional?

Based on the scores, determine the bonus tier:
- Tier 0: Score < 60 (Base payment only)
- Tier 1: Score 60-79 (Base + Tier 1 bonus)
- Tier 2: Score 80-89 (Base + Tier 2 bonus)
- Tier 3: Score 90+ (Base + Tier 3 bonus)

Respond in JSON format:
{{
    "brand_safety_score": number,
    "deliverables_met": boolean,
    "quality_score": number,
    "authenticity_score": number,
    "overall_score": number,
    "tier_achieved": number,
    "reasoning": "Detailed explanation"
}}
"""


# ============================================
# GRAPH NODES
# ============================================

def audit_content(state: PaymentState) -> PaymentState:
    """AI-powered content audit"""
    
    llm = get_llm()
    
    contract_terms = state.get("contract_terms", {})
    content_submission = state.get("content_submission", {})
    
    prompt = AUDIT_PROMPT.format(
        contract_terms=json.dumps(contract_terms, indent=2),
        content_url=content_submission.get("content_url", "N/A"),
        caption=content_submission.get("caption", "N/A"),
        submitted_at=content_submission.get("submitted_at", "N/A"),
        platform=content_submission.get("platform", "Instagram")
    )
    
    response = llm.invoke([
        SystemMessage(content="You are an objective content auditor."),
        HumanMessage(content=prompt)
    ])
    
    # Parse response
    try:
        content = response.content
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        audit_data = json.loads(content[json_start:json_end])
    except:
        audit_data = {
            "brand_safety_score": 70,
            "deliverables_met": True,
            "quality_score": 70,
            "authenticity_score": 70,
            "overall_score": 70,
            "tier_achieved": 1,
            "reasoning": "Default audit due to parsing error"
        }
    
    state["audit_result"] = {
        "content_score": audit_data.get("overall_score", 70),
        "tier_achieved": audit_data.get("tier_achieved", 1),
        "brand_safety": audit_data.get("brand_safety_score", 0) >= 60,
        "deliverables_met": audit_data.get("deliverables_met", True),
        "reasoning": audit_data.get("reasoning", ""),
        "detailed_scores": {
            "brand_safety": audit_data.get("brand_safety_score"),
            "quality": audit_data.get("quality_score"),
            "authenticity": audit_data.get("authenticity_score")
        }
    }
    
    state["status"] = "calculating"
    
    return state


def calculate_payment(state: PaymentState) -> PaymentState:
    """Calculate total payment based on audit results"""
    
    contract_terms = state.get("contract_terms", {})
    audit_result = state.get("audit_result", {})
    
    base_payment = contract_terms.get("base_payment", 0)
    bonus_tiers = contract_terms.get("bonus_tiers", [])
    tier_achieved = audit_result.get("tier_achieved", 0)
    
    # Calculate bonus
    bonus_payment = 0
    if tier_achieved > 0 and bonus_tiers:
        for tier in bonus_tiers:
            tier_num = tier.get("tier", 0)
            if tier_num <= tier_achieved:
                bonus_payment = max(bonus_payment, tier.get("bonus", 0))
    
    # Check if deliverables were met
    if not audit_result.get("deliverables_met", False):
        # Partial payment for unmet deliverables
        base_payment = base_payment * 0.5
        bonus_payment = 0
    
    total_payment = base_payment + bonus_payment
    
    state["base_payment"] = base_payment
    state["bonus_payment"] = bonus_payment
    state["total_payment"] = total_payment
    state["payment_breakdown"] = {
        "base": base_payment,
        "bonus": bonus_payment,
        "tier": tier_achieved,
        "total": total_payment,
        "deliverables_met": audit_result.get("deliverables_met", False)
    }
    
    state["status"] = "ready_to_pay"
    
    return state


def prepare_x402_payment(state: PaymentState) -> PaymentState:
    """Prepare x402 payment details"""
    
    contract_terms = state.get("contract_terms", {})
    total_payment = state.get("total_payment", 0)
    
    # Get recipient address from contract
    recipient = contract_terms.get("creator_wallet_address")
    if not recipient:
        state["error"] = "Creator wallet address not found in contract"
        state["status"] = "failed"
        return state
    
    # Get sender (advertiser) address
    sender = os.getenv("X402_WALLET_ADDRESS")
    if not sender:
        state["error"] = "X402_WALLET_ADDRESS not configured"
        state["status"] = "failed"
        return state
    
    # Determine token and network
    token = contract_terms.get("payment_token", "USDC")
    network = os.getenv("X402_NETWORK", "base-sepolia")
    
    state["payment_details"] = {
        "amount": total_payment,
        "token": token,
        "recipient_address": recipient,
        "sender_address": sender,
        "network": network,
        "token_address": X402_TOKENS.get(token, {}).get(network),
        "decimals": X402_TOKENS.get(token, {}).get("decimals", 6)
    }
    
    state["status"] = "processing"
    
    return state


def execute_x402_transfer(state: PaymentState) -> PaymentState:
    """Execute the actual x402 token transfer on blockchain"""
    
    payment_details = state.get("payment_details", {})
    
    if not payment_details:
        state["error"] = "Payment details not prepared"
        state["status"] = "failed"
        return state
    
    # Get private key
    private_key = os.getenv("X402_PRIVATE_KEY")
    if not private_key:
        state["error"] = "X402_PRIVATE_KEY not configured"
        state["status"] = "failed"
        return state
    
    try:
        network = payment_details.get("network", "base-sepolia")
        rpc_url = BASE_RPC_URLS.get(network)
        
        # Connect to network
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            state["error"] = f"Failed to connect to {network}"
            state["status"] = "failed"
            return state
        
        # Get account
        account = Account.from_key(private_key)
        
        # Get token contract
        token_address = payment_details.get("token_address")
        if not token_address:
            state["error"] = "Token address not found"
            state["status"] = "failed"
            return state
        
        token_contract = w3.eth.contract(
            address=Web3.to_checksum_address(token_address),
            abi=ERC20_ABI
        )
        
        # Calculate amount with decimals
        decimals = payment_details.get("decimals", 6)
        amount = int(payment_details["amount"] * (10 ** decimals))
        
        recipient = Web3.to_checksum_address(payment_details["recipient_address"])
        
        # Build transaction
        nonce = w3.eth.get_transaction_count(account.address)
        
        tx = token_contract.functions.transfer(
            recipient,
            amount
        ).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 100000,
            'gasPrice': w3.eth.gas_price,
            'chainId': w3.eth.chain_id
        })
        
        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        state["transaction_hash"] = tx_hash.hex()
        state["receipt"] = {
            "block_number": receipt.blockNumber,
            "gas_used": receipt.gasUsed,
            "status": "success" if receipt.status == 1 else "failed"
        }
        
        if receipt.status == 1:
            state["status"] = "completed"
            state["completed_at"] = datetime.now().isoformat()
        else:
            state["status"] = "failed"
            state["error"] = "Transaction reverted"
        
    except Exception as e:
        state["error"] = f"Transfer error: {str(e)}"
        state["status"] = "failed"
    
    return state


def save_settlement(state: PaymentState) -> PaymentState:
    """Save settlement record to MongoDB"""
    from pymongo import MongoClient
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        state["error"] = "MongoDB URI not configured"
        return state
    
    try:
        client = MongoClient(mongo_uri)
        db = client.matcha
        
        # Create settlement record
        settlement = {
            "contract_id": state["contract_id"],
            "audit_result": state.get("audit_result"),
            "payment_breakdown": state.get("payment_breakdown"),
            "total_paid": state.get("total_payment"),
            "transaction_hash": state.get("transaction_hash"),
            "receipt": state.get("receipt"),
            "status": state["status"],
            "created_at": state.get("created_at"),
            "completed_at": state.get("completed_at"),
            "error": state.get("error")
        }
        
        result = db.x402settlements.insert_one(settlement)
        state["settlement_id"] = str(result.inserted_id)
        
        # Update contract status
        if state["status"] == "completed":
            from bson import ObjectId
            db.contracts.update_one(
                {"_id": ObjectId(state["contract_id"])},
                {"$set": {"status": "completed", "settled_at": datetime.now()}}
            )
        
        # Log agent action
        db.agentlogs.insert_one({
            "contract_id": state["contract_id"],
            "action": "X402_SETTLEMENT",
            "details": {
                "status": state["status"],
                "amount": state.get("total_payment"),
                "tx_hash": state.get("transaction_hash"),
                "error": state.get("error")
            },
            "created_at": datetime.now()
        })
        
        client.close()
        
    except Exception as e:
        state["error"] = f"MongoDB error: {str(e)}"
    
    return state


# ============================================
# CONDITIONAL EDGES
# ============================================

def route_after_audit(state: PaymentState) -> Literal["calculate_payment", "save_settlement"]:
    """Route based on audit result"""
    audit = state.get("audit_result", {})
    
    # If brand safety failed, don't pay
    if not audit.get("brand_safety", True):
        state["status"] = "failed"
        state["error"] = "Content failed brand safety check"
        return "save_settlement"
    
    return "calculate_payment"


def route_after_prepare(state: PaymentState) -> Literal["execute_x402_transfer", "save_settlement"]:
    """Route based on payment preparation"""
    if state.get("error") or state["status"] == "failed":
        return "save_settlement"
    return "execute_x402_transfer"


# ============================================
# BUILD PAYMENT GRAPH
# ============================================

def build_payment_graph():
    """Build the LangGraph for payment workflow"""
    
    workflow = StateGraph(PaymentState)
    
    # Add nodes
    workflow.add_node("audit_content", audit_content)
    workflow.add_node("calculate_payment", calculate_payment)
    workflow.add_node("prepare_x402_payment", prepare_x402_payment)
    workflow.add_node("execute_x402_transfer", execute_x402_transfer)
    workflow.add_node("save_settlement", save_settlement)
    
    # Set entry point
    workflow.set_entry_point("audit_content")
    
    # Add edges
    workflow.add_conditional_edges(
        "audit_content",
        route_after_audit,
        {
            "calculate_payment": "calculate_payment",
            "save_settlement": "save_settlement"
        }
    )
    
    workflow.add_edge("calculate_payment", "prepare_x402_payment")
    
    workflow.add_conditional_edges(
        "prepare_x402_payment",
        route_after_prepare,
        {
            "execute_x402_transfer": "execute_x402_transfer",
            "save_settlement": "save_settlement"
        }
    )
    
    workflow.add_edge("execute_x402_transfer", "save_settlement")
    workflow.add_edge("save_settlement", END)
    
    return workflow.compile()


# ============================================
# MAIN INTERFACE
# ============================================

class PaymentAgent:
    """High-level interface for the payment agent"""
    
    def __init__(self):
        self.graph = build_payment_graph()
    
    def process_settlement(
        self,
        contract_id: str,
        contract_terms: dict,
        content_submission: dict
    ) -> PaymentState:
        """Process a content submission and initiate payment"""
        
        initial_state: PaymentState = {
            "contract_id": contract_id,
            "settlement_id": None,
            "contract_terms": contract_terms,
            "content_submission": content_submission,
            "audit_result": None,
            "base_payment": 0,
            "bonus_payment": 0,
            "total_payment": 0,
            "payment_breakdown": {},
            "payment_details": None,
            "transaction_hash": None,
            "receipt": None,
            "status": "pending_audit",
            "error": None,
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        
        # Run the graph
        final_state = self.graph.invoke(initial_state)
        
        return final_state
    
    def audit_only(
        self,
        contract_id: str,
        contract_terms: dict,
        content_submission: dict
    ) -> dict:
        """Run audit without executing payment"""
        
        state: PaymentState = {
            "contract_id": contract_id,
            "settlement_id": None,
            "contract_terms": contract_terms,
            "content_submission": content_submission,
            "audit_result": None,
            "base_payment": 0,
            "bonus_payment": 0,
            "total_payment": 0,
            "payment_breakdown": {},
            "payment_details": None,
            "transaction_hash": None,
            "receipt": None,
            "status": "pending_audit",
            "error": None,
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        
        # Just run audit
        state = audit_content(state)
        state = calculate_payment(state)
        
        return {
            "audit_result": state.get("audit_result"),
            "payment_breakdown": state.get("payment_breakdown"),
            "recommended_payment": state.get("total_payment")
        }


# ============================================
# CLI FOR TESTING
# ============================================

if __name__ == "__main__":
    agent = PaymentAgent()
    
    # Test audit
    result = agent.audit_only(
        contract_id="test-contract-001",
        contract_terms={
            "base_payment": 500,
            "bonus_tiers": [
                {"tier": 1, "bonus": 100},
                {"tier": 2, "bonus": 200},
                {"tier": 3, "bonus": 350}
            ],
            "deliverables": "1 Instagram reel featuring product, 2 story mentions",
            "brand_guidelines": "Family-friendly, no competitor mentions",
            "creator_wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
            "payment_token": "USDC"
        },
        content_submission={
            "content_url": "https://instagram.com/reel/ABC123",
            "caption": "Loving this new skincare routine! 🌿 #ad #sponsored",
            "submitted_at": datetime.now().isoformat(),
            "platform": "Instagram",
            "metrics": {
                "views": 15000,
                "likes": 1200,
                "comments": 85
            }
        }
    )
    
    print("\n=== AUDIT RESULT ===")
    print(f"Audit: {json.dumps(result['audit_result'], indent=2)}")
    print(f"Payment: {json.dumps(result['payment_breakdown'], indent=2)}")
    print(f"Recommended Payment: ${result['recommended_payment']}")
