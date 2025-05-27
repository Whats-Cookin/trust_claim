// API Types matching new backend
export interface Claim {
  claim_id: number
  subject: string
  claim: string
  object?: string
  statement?: string
  issuerId: string
  sourceURI: string
  howKnown: string
  confidence?: number
  stars?: number
  score?: number  // New field (was rating)
  amt?: number    // New field (was amount)
  unit?: string
  aspect?: string
  effectiveDate: string
  createdDate: string
  subject_entity_type?: string
  issuer_entity_type?: string
  source_entity_type?: string
  link?: string
  name?: string
  source_link?: string
  source_name?: string
  source_thumbnail?: string
  how_known?: string
  images?: Array<{
    url: string
    caption?: string
    metadata?: any
  }>
}

export interface FeedResponse {
  claims: Claim[]
  nextPage?: string
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
