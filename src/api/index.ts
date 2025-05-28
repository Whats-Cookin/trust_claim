// IMPORTANT API DESIGN NOTES - READ THIS FIRST!
// =============================================
//
// ID vs URI Usage:
// ----------------
// 1. **ALWAYS USE NUMERIC IDs** for all main API endpoints
//    - /api/graph/{id} - Use claim ID (number), NOT URI
//    - /api/claims/{id} - Use claim ID (number), NOT URI
//    - /api/reports/claim/{id} - Use claim ID (number), NOT URI
//
// 2. **URIs are only used at the database level** for Claims
//    - Claims have subject/object as URIs for linked data semantics
//    - But the API should work with numeric IDs for simplicity
//
// 3. **Nodes and Edges already have numeric IDs**
//    - Always reference them by their ID field
//    - The nodeUri is just data, not the primary identifier
//
// THIS HAS BROKEN TWICE - DON'T USE URIs IN API PATHS!
// =====================================================

import axios from '../axiosInstance'
import type {
  Claim,
  FeedResponse,
  GraphResponse,
  Credential,
  ValidationRequest,
  ClaimReportResponse,
  EntityReport
} from './types'

// Claims API - USE NUMERIC IDs
export const createClaim = (data: any) => 
  axios.post<{ claim: Claim }>('/api/claims', data)

export const getClaim = (id: string | number) => 
  axios.get<{ claim: Claim }>(`/api/claims/${id}`)

export const getClaimsBySubject = (uri: string) => 
  axios.get<{ claims: Claim[] }>(`/api/claims/subject/${encodeURIComponent(uri)}`)

// Feed API
export const getFeed = (params?: {
  limit?: number
  search?: string
  page?: number
}) => axios.get<FeedResponse>('/api/feed', { 
  params,
  timeout: 60000 
})

export const getFeedByEntity = (entityType: string, params?: {
  limit?: number
  nextPage?: string
}) => axios.get<FeedResponse>(`/api/feed/entity/${entityType}`, { params })

export const getTrending = (limit: number = 10) => 
  axios.get<{ topics: Array<{ topic: string; count: number; trend: string }> }>('/api/feed/trending', { params: { limit } })

// Graph API - USE NUMERIC IDs
export const getGraph = (claimId: string | number) => {
  // ALWAYS use numeric ID, not URI!
  return axios.get<GraphResponse>(`/api/graph/${claimId}`)
}

export const getNodeNeighbors = (nodeId: string | number, page: number = 1, limit: number = 5) => 
  axios.get<GraphResponse>(`/api/graph/node/${nodeId}/neighbors`, {
    params: { page, limit }
  })

// Reports API - USE NUMERIC IDs
export const getClaimReport = (claimId: string | number) => 
  axios.get<ClaimReportResponse>(`/api/reports/claim/${claimId}`)

export const submitValidation = (claimId: string | number, validation: ValidationRequest) => 
  axios.post<{ message: string; validationId: number }>(`/api/reports/claim/${claimId}/validate`, validation)

export const getEntityReport = (uri: string) => 
  axios.get<EntityReport>(`/api/reports/entity/${encodeURIComponent(uri)}`)

// Credentials API
export const submitCredential = (credential: any) => 
  axios.post<{ message: string; claimId: number; credentialUri: string }>('/api/credentials', credential)

export const getCredential = (uri: string) => 
  axios.get<{ credential: Credential }>(`/api/credentials/${encodeURIComponent(uri)}`)
