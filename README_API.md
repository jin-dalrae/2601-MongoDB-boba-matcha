# API Server Documentation

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run server
   # or
   npm run dev
   ```

   Server will run on `http://localhost:3001`

3. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

## API Endpoints

### Base URL
`http://localhost:3001/api`

### Users

- `GET /api/users/:id` - Get user by ID
- `GET /api/users/role/:role` - Get users by role (Advertiser or Creator)
- `GET /api/users/:id/profile` - Get user profile with related data (wallet, config, etc.)
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

### Campaigns

- `GET /api/campaigns/advertiser/:advertiserId` - Get all campaigns for an advertiser
- `GET /api/campaigns/active` - Get all active campaigns (for creator discovery)
- `GET /api/campaigns/:id` - Get single campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign

### Deals (AutoBids)

- `GET /api/deals/creator/:creatorId` - Get all deals for a creator
- `GET /api/deals/creator/:creatorId/status/:status` - Get deals by creator and status
- `GET /api/deals/campaign/:campaignId` - Get all deals for a campaign (shortlist)
- `GET /api/deals/:id` - Get single deal with negotiation history
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal (for negotiations)

### Contracts

- `GET /api/contracts/creator/:creatorId` - Get all contracts for a creator
- `GET /api/contracts/advertiser/:advertiserId` - Get all contracts for an advertiser
- `GET /api/contracts/active?creatorId=xxx` - Get active contracts (optional creatorId filter)
- `GET /api/contracts/:id` - Get contract with full details (submission, audit, settlement)
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract

### Health

- `GET /api/health` - Health check endpoint

## Frontend Integration

The API service utilities are located in `frontend/src/services/api.js`.

To use in your React components:

```javascript
import { campaignAPI, dealAPI, contractAPI } from '../services/api';

// Example: Fetch active campaigns
const campaigns = await campaignAPI.getActiveCampaigns();

// Example: Fetch deals for a creator
const deals = await dealAPI.getDealsByCreator(userId);
```

## Environment Variables

Make sure your `.env` file contains:
```
MONGODB_URI=mongodb+srv://...
```

For the frontend to connect, you can optionally set:
```
VITE_API_URL=http://localhost:3001/api
```

## Notes

- All endpoints return JSON
- Error responses include an `error` field with the error message
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Include `Content-Type: application/json` header for POST/PUT requests


