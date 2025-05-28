// Proper entity structure
export interface Entity {
  uri: string
  name?: string
  type?: string
  image?: string
}

// Claim structure matching backend
export interface Claim {
  id: number
  subject: Entity | string  // Can be entity object or just URI
  claim: string
  object?: Entity | string  // Can be entity object or just URI
  statement?: string
  effectiveDate: string
  confidence?: number
  sourceURI?: string
  howKnown?: string
  stars?: number
  score?: number
  amt?: number
  unit?: string
  aspect?: string
  issuerId?: string
  // Keep some legacy fields during migration
  claim_id?: number  // same as id
  // Image from associated nodes (added by report endpoint)
  image?: string | null
}

export interface FeedResponse {
  entries: Claim[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface Node {
  id: string
  uri: string
  name: string
  entityType?: string
  entityData?: any
  displayName?: string
  thumbnail?: string
}

export interface Edge {
  id: string
  source: string
  target: string
  label: string
  claimId?: number
}

export interface GraphResponse {
  nodes: Node[]
  edges: Edge[]
}

export interface Credential {
  uri: string
  type: string[]
  issuer: string
  credentialSubject: any
  issuanceDate: string
  proof?: any
}

export interface ValidationRequest {
  claimId: number
  isValid: boolean
  confidence: number
  statement?: string
  evidence?: string[]
}

export interface ClaimReportResponse {
  claim: Claim
  validations: Array<{
    id: number
    isValid: boolean
    confidence: number
    statement?: string
    issuerName: string
    createdAt: string
  }>
  summary: {
    totalValidations: number
    averageConfidence: number
    consensusValid: boolean
  }
}

export interface EntityReport {
  uri: string
  entityType: string
  totalClaims: number
  trustScore: number
  claims: Claim[]
  credentials: Credential[]
  relationships: any[]
}
