/**
 * Certificate Type Inference Utility
 *
 * This module provides functions to infer certificate types based on claim data.
 * Encapsulated and testable, designed to evolve as more certificate types are added.
 */

export enum CertificateType {
  SKILL_VALIDATION = 'SKILL_VALIDATION',
  EMPLOYMENT = 'EMPLOYMENT',
  ACHIEVEMENT = 'ACHIEVEMENT',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  QUALITY_RATING = 'QUALITY_RATING',
  ENDORSEMENT = 'ENDORSEMENT',
  OWNERSHIP = 'OWNERSHIP',
  PARTICIPATION = 'PARTICIPATION',
  GENERIC = 'GENERIC'
}

export interface CertificateTypeInfo {
  type: CertificateType
  title: string
  subtitle: string
  verbPhrase: string // e.g., "has been validated in", "has achieved", "is certified as"
}

export interface CertificateInferenceInput {
  aspect?: string | null
  claim?: string | null
  statement?: string | null
  subjectType?: string | null // from node entType
  sourceType?: string | null // from source node entType
}

/**
 * Main function to infer certificate type and display information
 */
export function inferCertificateType(input: CertificateInferenceInput): CertificateTypeInfo {
  const { aspect, claim, statement, subjectType, sourceType } = input

  // Parse aspect if available
  if (aspect) {
    const [category, subcategory] = aspect.split(':').map(s => s?.toLowerCase())

    // Quality:technical with person subject = skill validation
    if (category === 'quality' && subcategory === 'technical' && (!subjectType || subjectType === 'PERSON')) {
      return {
        type: CertificateType.SKILL_VALIDATION,
        title: 'Certificate',
        subtitle: 'SKILL VALIDATION',
        verbPhrase: 'has demonstrated expertise in'
      }
    }

    // Identity verification
    if (category === 'identity') {
      return {
        type: CertificateType.IDENTITY_VERIFICATION,
        title: 'Certificate',
        subtitle: 'OF IDENTITY VERIFICATION',
        verbPhrase: 'has been verified as'
      }
    }

    // Quality rating (non-technical)
    if (category === 'quality' && subcategory !== 'technical') {
      return {
        type: CertificateType.QUALITY_RATING,
        title: 'Certificate',
        subtitle: 'OF QUALITY ASSURANCE',
        verbPhrase: 'has been rated for'
      }
    }

    // Achievement
    if (category === 'achievement' || category === 'completion') {
      return {
        type: CertificateType.ACHIEVEMENT,
        title: 'Certificate',
        subtitle: 'OF ACHIEVEMENT',
        verbPhrase: 'has successfully completed'
      }
    }

    // Ownership
    if (category === 'ownership' || category === 'rights') {
      return {
        type: CertificateType.OWNERSHIP,
        title: 'Certificate',
        subtitle: 'OF OWNERSHIP',
        verbPhrase: 'is certified owner of'
      }
    }
  }

  // Check claim type
  if (claim) {
    const claimUpper = claim.toUpperCase()

    if (claimUpper === 'ENDORSES') {
      return {
        type: CertificateType.ENDORSEMENT,
        title: 'Certificate',
        subtitle: 'OF ENDORSEMENT',
        verbPhrase: 'has been endorsed for'
      }
    }

    if (claimUpper === 'RATED') {
      // Check if employment context from statement
      if (statement && /worked (with|at|for)/i.test(statement)) {
        return {
          type: CertificateType.EMPLOYMENT,
          title: 'Certificate',
          subtitle: 'OF EMPLOYMENT VERIFICATION',
          verbPhrase: 'has been verified as'
        }
      }

      return {
        type: CertificateType.QUALITY_RATING,
        title: 'Certificate',
        subtitle: 'OF RATING',
        verbPhrase: 'has been rated for'
      }
    }

    if (claimUpper === 'VALIDATES') {
      return {
        type: CertificateType.GENERIC,
        title: 'Certificate',
        subtitle: 'OF VALIDATION',
        verbPhrase: 'has been validated for'
      }
    }
  }

  // Employment detection from statement
  if (statement) {
    if (/worked (with|at|for)|employed|position|role as/i.test(statement)) {
      return {
        type: CertificateType.EMPLOYMENT,
        title: 'Certificate',
        subtitle: 'OF EMPLOYMENT VERIFICATION',
        verbPhrase: 'has been employed as'
      }
    }

    if (/participated|attended|completed|finished/i.test(statement)) {
      return {
        type: CertificateType.PARTICIPATION,
        title: 'Certificate',
        subtitle: 'OF PARTICIPATION',
        verbPhrase: 'has participated in'
      }
    }

    if (/achieved|earned|awarded/i.test(statement)) {
      return {
        type: CertificateType.ACHIEVEMENT,
        title: 'Certificate',
        subtitle: 'OF ACHIEVEMENT',
        verbPhrase: 'has achieved'
      }
    }
  }

  // Default fallback
  return {
    type: CertificateType.GENERIC,
    title: 'Certificate',
    subtitle: 'OF ATTESTATION',
    verbPhrase: 'has been attested for'
  }
}

/**
 * Extract the certification subject/topic from statement
 * This is WHAT is being certified, not WHO
 */
export function extractCertificationTopic(statement: string | null | undefined, aspect?: string | null): string {
  if (!statement) {
    // Fallback to aspect if no statement
    if (aspect) {
      const parts = aspect.split(':')
      const topic = parts[parts.length - 1]
      return topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }
    return 'Professional Certification'
  }

  // Try to extract role/position/skill from statement
  const patterns = [
    // Employment patterns
    /worked (?:with|at|for) .+? as (?:a |an )?(.+?)(?:\.|,|$)/i,
    /position (?:of|as) (?:a |an )?(.+?)(?:\.|,|$)/i,
    /role (?:of|as) (?:a |an )?(.+?)(?:\.|,|$)/i,

    // Skill/expertise patterns
    /expertise in (.+?)(?:\.|,|$)/i,
    /skilled in (.+?)(?:\.|,|$)/i,
    /proficient in (.+?)(?:\.|,|$)/i,
    /demonstrated (.+?) skills/i,

    // Achievement patterns
    /completed (.+?)(?:\.|,|$)/i,
    /achieved (.+?)(?:\.|,|$)/i,
    /earned (.+?)(?:\.|,|$)/i,
    /certified (?:in|as) (.+?)(?:\.|,|$)/i,

    // Validation patterns
    /validated (?:for|in|as) (.+?)(?:\.|,|$)/i,
    /verified (?:for|in|as) (.+?)(?:\.|,|$)/i
  ]

  for (const pattern of patterns) {
    const match = statement.match(pattern)
    if (match && match[1]) {
      // Clean up the extracted topic
      let topic = match[1].trim()

      // Remove trailing phrases like "During her time"
      topic = topic.replace(/[\.\s]*(?:During|While|Throughout).*/i, '')

      // Remove possessives that might have been captured
      topic = topic.replace(/\s+(his|her|their|our)\s+/gi, ' ')

      return topic.trim()
    }
  }

  // If no pattern matched but we have aspect
  if (aspect) {
    const parts = aspect.split(':')
    const topic = parts[parts.length - 1]
    return topic.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  // Generic fallback
  return 'Professional Excellence'
}
