# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the React/TypeScript frontend for LinkedTrust, an implementation of the LinkedClaims standard for creating cryptographically-signed, verifiable digital claims that form a "web of trust". The frontend connects to the backend API at `https://live.linkedtrust.us/api/` (or locally at `http://localhost:9000`).

## Critical Development Commands

```bash
# Install dependencies
yarn

# Run development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Check code formatting
yarn lint

# Fix formatting issues
yarn format

# Find dead code
yarn find-deadcode
```

## Environment Variables

Required `.env` file in root:
```bash
VITE_GITHUB_CLIENT_ID=[...]
VITE_BACKEND_BASE_URL=http://localhost:9000  # or https://dev.linkedtrust.us for remote
VITE_CERAMIC_URL='http://13.56.165.66/'  # or https://ceramic.linkedtrust.us/
VITE_DID_PRIVATE_KEY='...'  # Optional for DID operations
```

## Architecture & Key Design Decisions

### API Design - CRITICAL
**ALWAYS USE NUMERIC IDs in API paths, NOT URIs**. This has broken multiple times:
- `/api/graph/{id}` - Use claim ID (number)
- `/api/claims/{id}` - Use claim ID (number)  
- `/api/reports/claim/{id}` - Use claim ID (number)
- URIs are only used at the database level for linked data semantics

### Core Features & Structure

1. **Main Routes**:
   - `/feed` - Default landing, shows claim feed
   - `/explore` - Interactive graph visualization
   - `/claim/:id` - Individual claim details
   - `/login`, `/register` - Authentication flows

2. **Key Components**:
   - `containers/Explore/` - Graph visualization with Cytoscape.js
   - `containers/feedOfClaim/` - Main feed display
   - `components/Form/` - Claim creation forms
   - `components/ClaimReport/` - Claim validation/reporting

3. **Authentication**:
   - Google OAuth via `@react-oauth/google`
   - Web3 wallet authentication support
   - Auth state managed via `utils/authUtils.ts`

4. **Graph Visualization**:
   - Uses Cytoscape.js with custom node HTML labels
   - Configuration in `containers/Explore/cyConfig.ts`
   - Node expansion via `/api/node/{nodeId}/expand`

5. **State Management**:
   - React hooks (no Redux)
   - Theme context for dark/light mode
   - Local state for forms and UI

## Backend API Integration

Base URL configured via `VITE_BACKEND_BASE_URL`. Main endpoints:

- `POST /api/claims` - Create new claim
- `GET /api/claims/{id}` - Get claim by numeric ID
- `GET /api/feed` - Get paginated feed
- `GET /api/graph/{claimId}` - Get graph data for visualization
- `POST /api/reports/claim/{id}/validate` - Submit validation
- `POST /api/credentials` - Submit verifiable credential

All API calls go through `axiosInstance/index.ts` which handles auth headers.

## Testing Approach

- Uses Vitest with React Testing Library
- Test files alongside components as `*.test.tsx`
- Run with `yarn test` for coverage report
- Mock axios calls via `axios-mock-adapter`

## Deployment

Production deployment to `dev.linkedtrust.us`:
```bash
ssh -i [key] ubuntu@68.183.144.184
nvm use 20
cd /data/trust_claim
git pull
yarn && yarn build
cp -r dist/* /var/www/trust_claim/
```

Jenkins CI/CD configured for develop branch at http://68.183.144.184:8080/job/Trustclaim_frontend/

## LinkedClaims Standard

This implements the LinkedClaims specification where:
- Claims must have a subject (URI)
- Claims must be cryptographically signed
- Claims can reference other claims
- Claims form a trust network for credibility assessment

The frontend focuses on visualizing these claim relationships and enabling users to create, validate, and explore the trust network.

## Important UX Design Decisions

### HowKnown Enum Usage
**DO NOT suggest using all 11 backend enum values in the validation UI**. The validation flow intentionally uses a simplified subset that makes sense for users:
- For validation: First-hand, Second-hand, Web document, Direct benefit
- For rejection: Maps to appropriate howKnown values with clear user-facing text
- Rejection reasons should properly map to FIRST_HAND, SECOND_HAND, or WEB_DOCUMENT
- "Not relevant/spam" should set claim type to "spam" with FIRST_HAND

The full enum exists for data flexibility but showing all options (like BLOCKCHAIN, SIGNED_DOCUMENT, etc.) would confuse users and harm the experience.