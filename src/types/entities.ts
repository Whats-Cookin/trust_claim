// Entity type enum matching backend
export enum EntityType {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
  CREDENTIAL = 'CREDENTIAL',
  ARTICLE = 'ARTICLE',
  CLAIM = 'CLAIM',
  IMPACT = 'IMPACT',
  PLACE = 'PLACE',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER'
}

// Entity metadata for UI display
export const EntityMetadata: Record<EntityType, {
  label: string
  color: string
  icon?: string
  description: string
}> = {
  [EntityType.PERSON]: {
    label: 'Person',
    color: '#4CAF50',
    icon: 'person',
    description: 'Individual or personal account'
  },
  [EntityType.ORGANIZATION]: {
    label: 'Organization',
    color: '#2196F3',
    icon: 'business',
    description: 'Company, institution, or group'
  },
  [EntityType.CREDENTIAL]: {
    label: 'Credential',
    color: '#FF9800',
    icon: 'verified',
    description: 'Verifiable credential or certificate'
  },
  [EntityType.ARTICLE]: {
    label: 'Article',
    color: '#9C27B0',
    icon: 'article',
    description: 'Written content or publication'
  },
  [EntityType.CLAIM]: {
    label: 'Claim',
    color: '#00BCD4',
    icon: 'fact_check',
    description: 'Assertion or statement'
  },
  [EntityType.IMPACT]: {
    label: 'Impact',
    color: '#8BC34A',
    icon: 'trending_up',
    description: 'Measurable outcome or effect'
  },
  [EntityType.PLACE]: {
    label: 'Place',
    color: '#795548',
    icon: 'place',
    description: 'Physical or virtual location'
  },
  [EntityType.PRODUCT]: {
    label: 'Product',
    color: '#E91E63',
    icon: 'inventory',
    description: 'Physical or digital product'
  },
  [EntityType.SERVICE]: {
    label: 'Service',
    color: '#3F51B5',
    icon: 'miscellaneous_services',
    description: 'Service offering'
  },
  [EntityType.OTHER]: {
    label: 'Other',
    color: '#607D8B',
    icon: 'category',
    description: 'Uncategorized entity'
  }
}

// Helper functions
export const getEntityColor = (type: EntityType): string => {
  return EntityMetadata[type]?.color || EntityMetadata[EntityType.OTHER].color
}

export const getEntityLabel = (type: EntityType): string => {
  return EntityMetadata[type]?.label || EntityMetadata[EntityType.OTHER].label
}

// Enhanced node type with entity information
export interface EnhancedNode {
  id: string
  uri: string
  name: string
  entityType: EntityType
  entityData?: any
  displayName: string
  thumbnail?: string
}
