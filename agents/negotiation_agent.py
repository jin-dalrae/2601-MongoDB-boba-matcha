"""
Matcha Negotiation Agent
LangGraph-based autonomous negotiation between creators and advertisers
"""

import os
from typing import Literal
from datetime import datetime
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

from state import NegotiationState, NegotiationTerms

load_dotenv()


# ============================================
# LLM CONFIGURATION
# ============================================

def get_llm(model: str = "gpt-4o"):
    """Get configured LLM based on available API keys"""
    if os.getenv("ANTHROPIC_API_KEY"):
        return ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0.7)
    elif os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(model=model, temperature=0.7)
    else:
        raise ValueError("No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY")


# ============================================
# NEGOTIATION PROMPTS
# ============================================

CREATOR_AGENT_PROMPT = """You are an AI agent representing a content creator in a brand deal negotiation.

CREATOR PROFILE:
- Name: {creator_name}
- Followers: {followers}
- Engagement Rate: {engagement_rate}%
- Niche: {niche}
- Past Brand Deals: {past_deals}
- Minimum Rate: ${min_rate}/post

CURRENT OFFER FROM ADVERTISER:
{current_offer}

NEGOTIATION HISTORY:
{history}

Your goal is to secure the best possible deal for your creator while maintaining a positive relationship.
Consider:
1. Is the offer at or above market rate for this creator's metrics?
2. Are the deliverables reasonable given the timeline?
3. Are there any concerning clauses (exclusivity, usage rights)?

Respond with your decision and reasoning in JSON format:
{{
    "decision": "accept" | "counter" | "reject",
    "reasoning": "Your detailed reasoning",
    "counter_offer": {{
        "base_payment": number,
        "deliverables": "string",
        "deadline_days": number,
        "usage_rights": "standard" | "extended" | "perpetual",
        "exclusivity": boolean,
        "bonus_tiers": []
    }} // Only if decision is "counter"
}}
"""

ADVERTISER_AGENT_PROMPT = """You are an AI agent representing an advertiser in a brand deal negotiation.

CAMPAIGN REQUIREMENTS:
- Campaign: {campaign_name}
- Budget Per Creator: ${budget_per_creator}
- Required Deliverables: {required_deliverables}
- Target Niche: {target_niche}
- Deadline: {deadline}

CREATOR BEING NEGOTIATED WITH:
- Name: {creator_name}
- Followers: {followers}
- Fit Score: {fit_score}%

CREATOR'S COUNTER-OFFER:
{counter_offer}

NEGOTIATION HISTORY:
{history}

Your goal is to secure a fair deal within budget while ensuring quality deliverables.
Consider:
1. Is the creator's ask within the campaign budget?
2. Is this creator's audience worth a premium?
3. Can we get better value elsewhere?

Respond with your decision and reasoning in JSON format:
{{
    "decision": "accept" | "counter" | "reject",
    "reasoning": "Your detailed reasoning",
    "counter_offer": {{
        "base_payment": number,
        "deliverables": "string",
        "deadline_days": number,
        "usage_rights": "standard" | "extended" | "perpetual",
        "exclusivity": boolean,
        "bonus_tiers": []
    }} // Only if decision is "counter"
}}
"""


# ============================================
# GRAPH NODES
# ============================================

def analyze_offer(state: NegotiationState) -> NegotiationState:
    """Analyze the current offer and determine if it's within acceptable range"""
    
    current_offer = state.get("current_offer", {})
    creator_profile = state.get("creator_profile", {})
    market_data = state.get("market_data", {})
    
    # Calculate market rate based on creator metrics
    followers = creator_profile.get("followers", 10000)
    engagement = creator_profile.get("engagement_rate", 3.0)
    
    # Simple market rate calculation (in production, use ML model)
    base_rate = (followers / 1000) * 10  # $10 per 1K followers
    engagement_multiplier = 1 + (engagement - 3) * 0.1  # Bonus for above-average engagement
    market_rate = base_rate * engagement_multiplier
    
    offer_amount = current_offer.get("base_payment", 0)
    
    state["market_data"] = {
        **market_data,
        "calculated_market_rate": market_rate,
        "offer_vs_market": offer_amount / market_rate if market_rate > 0 else 0
    }
    
    return state


def creator_decision(state: NegotiationState) -> NegotiationState:
    """Creator's AI agent makes a decision on the current offer"""
    
    llm = get_llm()
    
    creator_profile = state.get("creator_profile", {})
    current_offer = state.get("current_offer", {})
    messages = state.get("messages", [])
    
    # Format history
    history = "\n".join([
        f"[Round {i+1}] {m['role']}: {m['content']}"
        for i, m in enumerate(messages[-6:])  # Last 6 messages
    ])
    
    prompt = CREATOR_AGENT_PROMPT.format(
        creator_name=creator_profile.get("name", "Creator"),
        followers=creator_profile.get("followers", 0),
        engagement_rate=creator_profile.get("engagement_rate", 0),
        niche=creator_profile.get("niche", "General"),
        past_deals=creator_profile.get("past_deals", 0),
        min_rate=creator_profile.get("min_rate", 100),
        current_offer=str(current_offer),
        history=history or "No previous messages"
    )
    
    response = llm.invoke([
        SystemMessage(content="You are negotiating on behalf of a content creator."),
        HumanMessage(content=prompt)
    ])
    
    # Parse response (in production, use structured output)
    import json
    try:
        # Extract JSON from response
        content = response.content
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        decision_data = json.loads(content[json_start:json_end])
    except:
        decision_data = {"decision": "counter", "reasoning": "Failed to parse, requesting clarification"}
    
    # Update state
    state["messages"].append({
        "role": "creator",
        "content": decision_data.get("reasoning", ""),
        "timestamp": datetime.now().isoformat()
    })
    
    if decision_data["decision"] == "accept":
        state["should_accept"] = True
        state["final_terms"] = current_offer
        state["status"] = "accepted"
    elif decision_data["decision"] == "reject":
        state["status"] = "rejected"
        state["reasoning"] = decision_data.get("reasoning", "")
    else:
        state["should_counter"] = True
        state["counter_offer"] = decision_data.get("counter_offer", current_offer)
    
    state["reasoning"] = decision_data.get("reasoning", "")
    state["round_number"] = state.get("round_number", 0) + 1
    
    return state


def advertiser_decision(state: NegotiationState) -> NegotiationState:
    """Advertiser's AI agent makes a decision on the counter-offer"""
    
    llm = get_llm()
    
    advertiser_requirements = state.get("advertiser_requirements", {})
    creator_profile = state.get("creator_profile", {})
    counter_offer = state.get("counter_offer", {})
    messages = state.get("messages", [])
    
    # Format history
    history = "\n".join([
        f"[Round {i+1}] {m['role']}: {m['content']}"
        for i, m in enumerate(messages[-6:])
    ])
    
    prompt = ADVERTISER_AGENT_PROMPT.format(
        campaign_name=advertiser_requirements.get("campaign_name", "Campaign"),
        budget_per_creator=advertiser_requirements.get("budget_per_creator", 1000),
        required_deliverables=advertiser_requirements.get("deliverables", "1 post"),
        target_niche=advertiser_requirements.get("niche", "General"),
        deadline=advertiser_requirements.get("deadline", "2 weeks"),
        creator_name=creator_profile.get("name", "Creator"),
        followers=creator_profile.get("followers", 0),
        fit_score=creator_profile.get("fit_score", 50),
        counter_offer=str(counter_offer),
        history=history or "No previous messages"
    )
    
    response = llm.invoke([
        SystemMessage(content="You are negotiating on behalf of an advertiser."),
        HumanMessage(content=prompt)
    ])
    
    # Parse response
    import json
    try:
        content = response.content
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        decision_data = json.loads(content[json_start:json_end])
    except:
        decision_data = {"decision": "counter", "reasoning": "Failed to parse, proposing middle ground"}
    
    # Update state
    state["messages"].append({
        "role": "advertiser",
        "content": decision_data.get("reasoning", ""),
        "timestamp": datetime.now().isoformat()
    })
    
    if decision_data["decision"] == "accept":
        state["should_accept"] = True
        state["final_terms"] = counter_offer
        state["status"] = "accepted"
    elif decision_data["decision"] == "reject":
        state["status"] = "rejected"
        state["reasoning"] = decision_data.get("reasoning", "")
    else:
        state["should_counter"] = True
        state["current_offer"] = decision_data.get("counter_offer", counter_offer)
    
    state["reasoning"] = decision_data.get("reasoning", "")
    state["round_number"] = state.get("round_number", 0) + 1
    
    return state


def check_termination(state: NegotiationState) -> NegotiationState:
    """Check if negotiation should terminate"""
    
    round_num = state.get("round_number", 0)
    max_rounds = state.get("max_rounds", 5)
    
    if round_num >= max_rounds and state["status"] == "negotiating":
        state["status"] = "expired"
        state["reasoning"] = f"Negotiation expired after {max_rounds} rounds without agreement"
    
    return state


def save_to_mongodb(state: NegotiationState) -> NegotiationState:
    """Save negotiation state to MongoDB"""
    from pymongo import MongoClient
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        state["error"] = "MongoDB URI not configured"
        return state
    
    try:
        client = MongoClient(mongo_uri)
        db = client.matcha
        
        # Update or insert negotiation record
        db.negotiations.update_one(
            {"contract_id": state["contract_id"]},
            {
                "$set": {
                    "status": state["status"],
                    "final_terms": state.get("final_terms"),
                    "messages": state["messages"],
                    "round_number": state["round_number"],
                    "updated_at": datetime.now()
                }
            },
            upsert=True
        )
        
        # Log agent action
        db.agentlogs.insert_one({
            "contract_id": state["contract_id"],
            "action": "NEGOTIATION_UPDATE",
            "details": {
                "status": state["status"],
                "round": state["round_number"],
                "reasoning": state.get("reasoning", "")
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

def route_after_creator(state: NegotiationState) -> Literal["advertiser_decision", "save_and_end"]:
    """Route after creator decision"""
    if state.get("should_accept") or state["status"] in ["accepted", "rejected"]:
        return "save_and_end"
    return "advertiser_decision"


def route_after_advertiser(state: NegotiationState) -> Literal["check_termination", "save_and_end"]:
    """Route after advertiser decision"""
    if state.get("should_accept") or state["status"] in ["accepted", "rejected"]:
        return "save_and_end"
    return "check_termination"


def route_after_check(state: NegotiationState) -> Literal["creator_decision", "save_and_end"]:
    """Route after termination check"""
    if state["status"] in ["accepted", "rejected", "expired"]:
        return "save_and_end"
    # Reset flags for next round
    state["should_accept"] = False
    state["should_counter"] = False
    return "creator_decision"


# ============================================
# BUILD NEGOTIATION GRAPH
# ============================================

def build_negotiation_graph():
    """Build the LangGraph for negotiation workflow"""
    
    workflow = StateGraph(NegotiationState)
    
    # Add nodes
    workflow.add_node("analyze_offer", analyze_offer)
    workflow.add_node("creator_decision", creator_decision)
    workflow.add_node("advertiser_decision", advertiser_decision)
    workflow.add_node("check_termination", check_termination)
    workflow.add_node("save_and_end", save_to_mongodb)
    
    # Set entry point
    workflow.set_entry_point("analyze_offer")
    
    # Add edges
    workflow.add_edge("analyze_offer", "creator_decision")
    
    workflow.add_conditional_edges(
        "creator_decision",
        route_after_creator,
        {
            "advertiser_decision": "advertiser_decision",
            "save_and_end": "save_and_end"
        }
    )
    
    workflow.add_conditional_edges(
        "advertiser_decision",
        route_after_advertiser,
        {
            "check_termination": "check_termination",
            "save_and_end": "save_and_end"
        }
    )
    
    workflow.add_conditional_edges(
        "check_termination",
        route_after_check,
        {
            "creator_decision": "creator_decision",
            "save_and_end": "save_and_end"
        }
    )
    
    workflow.add_edge("save_and_end", END)
    
    return workflow.compile()


# ============================================
# MAIN INTERFACE
# ============================================

class NegotiationAgent:
    """High-level interface for the negotiation agent"""
    
    def __init__(self):
        self.graph = build_negotiation_graph()
    
    def start_negotiation(
        self,
        contract_id: str,
        creator_id: str,
        advertiser_id: str,
        campaign_id: str,
        initial_offer: dict,
        creator_profile: dict,
        advertiser_requirements: dict,
        max_rounds: int = 5
    ) -> NegotiationState:
        """Start a new negotiation"""
        
        initial_state: NegotiationState = {
            "contract_id": contract_id,
            "creator_id": creator_id,
            "advertiser_id": advertiser_id,
            "campaign_id": campaign_id,
            "status": "negotiating",
            "current_offer": initial_offer,
            "counter_offer": None,
            "messages": [{
                "role": "system",
                "content": f"Negotiation started for contract {contract_id}",
                "timestamp": datetime.now().isoformat()
            }],
            "round_number": 0,
            "max_rounds": max_rounds,
            "creator_profile": creator_profile,
            "advertiser_requirements": advertiser_requirements,
            "market_data": {},
            "should_accept": False,
            "should_counter": False,
            "reasoning": "",
            "final_terms": None,
            "error": None
        }
        
        # Run the graph
        final_state = self.graph.invoke(initial_state)
        
        return final_state
    
    def resume_negotiation(self, state: NegotiationState) -> NegotiationState:
        """Resume an existing negotiation from a saved state"""
        return self.graph.invoke(state)


# ============================================
# CLI FOR TESTING
# ============================================

if __name__ == "__main__":
    agent = NegotiationAgent()
    
    # Test negotiation
    result = agent.start_negotiation(
        contract_id="test-contract-001",
        creator_id="creator-001",
        advertiser_id="advertiser-001",
        campaign_id="campaign-001",
        initial_offer={
            "base_payment": 500,
            "deliverables": "1 Instagram reel + 2 stories",
            "deadline_days": 14,
            "usage_rights": "standard",
            "exclusivity": False,
            "bonus_tiers": [
                {"threshold": 10000, "bonus": 100},
                {"threshold": 50000, "bonus": 250}
            ]
        },
        creator_profile={
            "name": "Sarah Creator",
            "followers": 125000,
            "engagement_rate": 4.5,
            "niche": "Lifestyle & Beauty",
            "past_deals": 15,
            "min_rate": 600,
            "fit_score": 89
        },
        advertiser_requirements={
            "campaign_name": "Summer Beauty Launch",
            "budget_per_creator": 800,
            "deliverables": "1 reel + stories",
            "niche": "Beauty",
            "deadline": "2 weeks"
        }
    )
    
    print("\n=== NEGOTIATION RESULT ===")
    print(f"Status: {result['status']}")
    print(f"Rounds: {result['round_number']}")
    print(f"Final Terms: {result.get('final_terms')}")
    print(f"Reasoning: {result['reasoning']}")
