# LinkedTrust Frontend - Post API Update

## Recent Changes (Updated Today)

This frontend has been updated to work with the new LinkedClaims backend API.

### Key Changes Made:

1. **New API Service Layer**
   - `/src/api/index.ts` - All API calls
   - `/src/api/types.ts` - TypeScript types

2. **Field Name Changes**
   - `rating` → `score`
   - `amount` → `amt`

3. **API Endpoint Changes**
   - `/api/claim/v2` → `/api/claims`
   - `/api/claims/v3` → `/api/feed`
   - `/api/claim/:id` → `/api/claims/:id`
   - `/api/report/:id` → `/api/reports/claim/:id`

4. **Entity System**
   - `/src/types/entities.ts` - Entity types and helpers
   - `/src/components/EntityBadge/` - Entity type badges

5. **Enhanced Node Data**
   - Nodes now include `entityType` and `entityData`
   - Graph utils updated to handle enhanced nodes

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Testing the Updates

1. **Feed**: Should load with new API endpoint
2. **Create Claim**: Should work with score/amt fields
3. **Graph**: Should display enhanced nodes with entity data
4. **Reports**: Should show claim details and validations

## Environment Variables

Make sure `.env` has:
```
VITE_BACKEND_BASE_URL=https://dev.linkedtrust.us
```

## New Features Available

- Entity type badges throughout the UI
- Enhanced graph nodes with entity information
- New report endpoints with validation support
- Credential submission capability (endpoint ready)

## Next Developer Tasks

1. Add entity filtering to feed UI
2. Style graph nodes based on entity type
3. Create credential submission form
4. Add entity report pages
5. Implement trending topics display

## Architecture Notes

The codebase has been cleaned up with:
- Centralized API service
- Proper TypeScript types
- Consistent error handling
- Field name transformations handled in API layer

All old endpoints are mapped in the API service for backward compatibility during transition.
