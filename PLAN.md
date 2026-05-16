# Fix Plan — known issues in the consolidated codebase

Two pre-existing bugs found while landing the `rearrange` rewrite into `main`
(2026-05-15). Neither is applied yet — this file is the plan to fix them.

Context: `main` now is the consolidated architecture (single `frontend/` SPA +
Express `server/` + Python `agents/`). The Node x402 settlement endpoint
(`POST /api/payments/execute`, commit `eff0192`) is already in and verified.

---

## Fix 1 — Mongoose `ref` / model-name mismatch (`server/models.js`)

**Problem.** Three schema `ref:` strings don't match the names the models are
actually registered under, so `.populate()` throws
`Schema hasn't been registered for model "..."`:

| Schema field | declared `ref:` | registered model | line |
|---|---|---|---|
| `negotiationLogSchema.autoBidId` | `'AutoBid'` | `mongoose.model('Auto_Bid', …)` | ~75 |
| `contractSchema.autoBidId` | `'AutoBid'` | `mongoose.model('Auto_Bid', …)` | ~87 |
| `auditReportSchema.submissionId` | `'ContentSubmission'` | `mongoose.model('Content_Submission', …)` | ~117 |

Impact: every `.populate('autoBidId')` / `.populate('autoBidId.campaignId')`
500s. That hits `contractController.js`
(`getContractsByCreator`, `getContractsByAdvertiser`, `getContract`,
`getActiveContracts`, `getContractsWith…`) and `advertiserController.js`
(lines ~196, ~226) — core creator/advertiser flows.

**Fix.** Change the three `ref:` strings to the registered model names:
`'AutoBid'` → `'Auto_Bid'` (2 places), `'ContentSubmission'` →
`'Content_Submission'` (1 place).

**Do NOT** rename the models instead. Mongoose derives the collection name
from the model name; the seeded data already lives in `auto_bids` /
`content_submissions`. Renaming the models would silently repoint queries to
empty collections.

**Verify.** With the server running against the seeded DB:
`GET /api/contracts/creator/:creatorId` returns 200 with `autoBidId` (and
nested `campaignId`) populated, instead of a 500.

---

## Fix 2 — Python payment agent writes a shape the Node layer can't read

**File.** `agents/payment_agent.py` → `save_settlement()` (and the contract
status update next to it).

**Problem.** The agent persists settlements where nothing else can see them:

- Collection: inserts into `db.x402settlements`; the Mongoose
  `X402_Settlement` model reads `x402_settlements` (with underscore).
- Fields: writes snake_case (`contract_id`, `transaction_hash`,
  `payment_breakdown`); the Node side reads camelCase
  (`contractId` as ObjectId, `stablecoin_hash`, `total_paid`).
- Contract status: sets `status: "completed"`; the settlement loop and Node
  controllers expect `"Settled"` (`completed` is also not what
  `getActiveContracts` filters on).
- Agent log: writes `db.agentlogs`; the Mongoose `Agent_Log` model →
  `agent_logs`.

Net effect: a settlement run by the Python `/settle` agent never surfaces in
the Node-served UI even though it succeeded.

**Fix.**

1. In `server/models.js`, add `'Failed'` to the `x402SettlementSchema.status`
   enum (currently `['Waiting','Escrowed','Released','Settled']`) so the
   agent's failure path is schema-valid.
2. In `save_settlement()`:
   - Insert into `db.x402_settlements`.
   - Write fields matching the Mongoose schema:
     `contractId` = `ObjectId(state["contract_id"])`,
     `auditReportId` = `None` (agent audits in-process, no persisted report),
     `x402_handshake_header` = a string (e.g. `"X402-1.0-Payment-Required"`),
     `status` = `"Settled"` on success else `"Failed"`,
     `stablecoin_hash` = `state.get("transaction_hash")`,
     `total_paid` = `state.get("total_payment")`,
     `receipt_hash` = a string,
     `createdAt` = `datetime.now()`.
     Keep the extra detail fields (`audit_result`, `payment_breakdown`,
     `receipt`, `error`, `completed_at`) — harmless extras.
   - Change the contract update to `{"$set": {"status": "Settled", …}}`.
   - Log to `db.agent_logs` with a `timestamp` field.

**Verify.** `pymongo` is not installed in the local env, so:
- Code review against the Mongoose `X402_Settlement` schema.
- A Node script that inserts the corrected doc shape into `x402_settlements`
  and confirms `paymentController` / `contractController` read it back.
- When the Python env is set up: run the agent `/settle`, then
  `GET /api/payments` and confirm the settlement appears in `history`.

---

## Order

Fix 1 first (one-line-ish, unblocks core flows, easy to verify live), then
Fix 2 (depends on the enum addition; verify via Node read since `pymongo`
is unavailable locally).
