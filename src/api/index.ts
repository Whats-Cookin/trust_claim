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

// NO TRANSFORMATIONS - We use the proper data structure from the backend

// Claims API
export const createClaim = (data: any) => 
  axios.post<{ claim: Claim }>('/api/claims', data)

export const getClaim = (id: string) => 
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

// Graph API
export const getGraph = (uri?: string) => {
  if (uri) {
    return axios.get<GraphResponse>(`/api/graph/${encodeURIComponent(uri)}`)
  }
  return axios.get<GraphResponse>('/api/graph')
}

export const getNodeNeighbors = (nodeId: string, page: number = 1, limit: number = 5) => 
  axios.get<GraphResponse>(`/api/graph/node/${nodeId}/neighbors`, {
    params: { page, limit }
  })

// Reports API
export const getClaimReport = (claimId: string) => 
  axios.get<ClaimReportResponse>(`/api/reports/claim/${claimId}`)

export const submitValidation = (claimId: string, validation: ValidationRequest) => 
  axios.post<{ message: string; validationId: number }>(`/api/reports/claim/${claimId}/validate`, validation)

export const getEntityReport = (uri: string) => 
  axios.get<EntityReport>(`/api/reports/entity/${encodeURIComponent(uri)}`)

// Credentials API
export const submitCredential = (credential: any) => 
  axios.post<{ message: string; claimId: number; credentialUri: string }>('/api/credentials', credential)

export const getCredential = (uri: string) => 
  axios.get<{ credential: Credential }>(`/api/credentials/${encodeURIComponent(uri)}`)

// NO LEGACY ENDPOINTS - We use the proper API structure
