# 🤖 Matcha LangGraph Agents

Autonomous AI agents for negotiation and x402 payment settlement.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEGOTIATION AGENT                             │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   analyze    │───▶│   creator    │───▶│  advertiser  │       │
│  │    offer     │    │  decision    │    │  decision    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                             │                    │               │
│                             ▼                    ▼               │
│                      ┌──────────────┐    ┌──────────────┐       │
│                      │    check     │    │    save      │       │
│                      │ termination  │───▶│   to DB      │       │
│                      └──────────────┘    └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PAYMENT AGENT                               │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │    audit     │───▶│  calculate   │───▶│   prepare    │       │
│  │   content    │    │   payment    │    │    x402      │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                             │                    │               │
│                             ▼                    ▼               │
│                      ┌──────────────┐    ┌──────────────┐       │
│                      │   execute    │───▶│    save      │       │
│                      │   transfer   │    │  settlement  │       │
│                      └──────────────┘    └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Setup

### 1. Create Virtual Environment

```bash
cd agents
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file in the `agents` directory:

```env
# LLM API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# MongoDB
MONGODB_URI=mongodb+srv://...

# x402 Protocol (for payments)
X402_WALLET_ADDRESS=0x...
X402_PRIVATE_KEY=0x...
X402_NETWORK=base-sepolia  # or 'base' for mainnet
```

### 4. Run the Server

```bash
python server.py
```

Server will start at `http://localhost:8000`

## API Endpoints

### Negotiation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/negotiate` | Start autonomous negotiation |
| `POST` | `/negotiate/step` | Execute single negotiation step |
| `GET` | `/negotiations/{contract_id}` | Get negotiation history |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/audit` | Audit content without payment |
| `POST` | `/settle` | Audit + execute x402 payment |
| `GET` | `/settlement/{contract_id}` | Get settlement details |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/agent-logs/{entity_id}` | Get agent activity logs |
| `GET` | `/graph/negotiation` | Negotiation graph structure |
| `GET` | `/graph/payment` | Payment graph structure |

## Usage Examples

### Start Negotiation

```python
import httpx

response = httpx.post("http://localhost:8000/negotiate", json={
    "contract_id": "contract-001",
    "creator_id": "creator-001",
    "advertiser_id": "advertiser-001",
    "campaign_id": "campaign-001",
    "initial_offer": {
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
    "creator_profile": {
        "name": "Sarah Creator",
        "followers": 125000,
        "engagement_rate": 4.5,
        "niche": "Lifestyle & Beauty",
        "past_deals": 15,
        "min_rate": 600,
        "fit_score": 89
    },
    "advertiser_requirements": {
        "campaign_name": "Summer Beauty Launch",
        "budget_per_creator": 800,
        "deliverables": "1 reel + stories",
        "niche": "Beauty",
        "deadline": "2 weeks"
    },
    "max_rounds": 5
})

print(response.json())
```

### Audit Content (No Payment)

```python
response = httpx.post("http://localhost:8000/audit", json={
    "contract_id": "contract-001",
    "contract_terms": {
        "base_payment": 500,
        "bonus_tiers": [
            {"tier": 1, "bonus": 100},
            {"tier": 2, "bonus": 200}
        ],
        "deliverables": "1 Instagram reel featuring product",
        "brand_guidelines": "Family-friendly content"
    },
    "content_submission": {
        "content_url": "https://instagram.com/reel/ABC123",
        "caption": "Loving this new product! #ad",
        "platform": "Instagram"
    }
})

print(response.json())
# {
#   "audit_result": {"content_score": 85, "tier_achieved": 2, ...},
#   "payment_breakdown": {"base": 500, "bonus": 200, "total": 700},
#   "recommended_payment": 700
# }
```

### Execute Settlement

```python
response = httpx.post("http://localhost:8000/settle", json={
    "contract_id": "contract-001",
    "contract_terms": {
        "base_payment": 500,
        "bonus_tiers": [...],
        "creator_wallet_address": "0x1234...",
        "payment_token": "USDC"
    },
    "content_submission": {
        "content_url": "https://instagram.com/reel/ABC123",
        ...
    }
})

print(response.json())
# {
#   "status": "completed",
#   "transaction_hash": "0xabc...",
#   "payment_breakdown": {...}
# }
```

## LangGraph Concepts

### State Management

Each agent maintains a typed state dictionary that flows through the graph:

```python
class NegotiationState(TypedDict):
    contract_id: str
    status: Literal["pending", "negotiating", "accepted", "rejected"]
    current_offer: dict
    counter_offer: dict
    messages: List[dict]
    round_number: int
    # ...
```

### Conditional Edges

The graph uses conditional routing based on agent decisions:

```python
workflow.add_conditional_edges(
    "creator_decision",
    route_after_creator,  # Returns "accept" | "counter" | "reject"
    {
        "advertiser_decision": "advertiser_decision",
        "save_and_end": "save_and_end"
    }
)
```

### Persistence

All state changes are persisted to MongoDB:
- `negotiations` collection for negotiation history
- `x402settlements` collection for payment records
- `agentlogs` collection for audit trail

## x402 Protocol

The payment agent uses the x402 HTTP payment protocol to settle payments on Base blockchain:

1. **Audit**: AI evaluates content quality and brand safety
2. **Calculate**: Determine payment tier based on score
3. **Prepare**: Build x402 payment request
4. **Execute**: Send ERC-20 token transfer on-chain
5. **Verify**: Wait for transaction confirmation
6. **Record**: Save settlement to MongoDB

### Supported Tokens

| Token | Network | Address |
|-------|---------|---------|
| USDC | Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| USDC | Base Sepolia | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| EURC | Base | `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42` |
| cbBTC | Base | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` |

## Testing

Run the agents locally for testing:

```bash
# Test negotiation agent
python negotiation_agent.py

# Test payment agent
python payment_agent.py

# Run full server
python server.py
```

## License

MIT License
