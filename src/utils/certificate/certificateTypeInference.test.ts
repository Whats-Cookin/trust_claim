/**
 * Tests for Certificate Type Inference
 */

import {
  inferCertificateType,
  extractCertificationTopic,
  CertificateType,
  CertificateInferenceInput
} from './certificateTypeInference'

describe('inferCertificateType', () => {
  describe('Skill Validation Detection', () => {
    it('should detect skill validation for quality:technical with person subject', () => {
      const input: CertificateInferenceInput = {
        aspect: 'quality:technical',
        subjectType: 'PERSON'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.SKILL_VALIDATION)
      expect(result.subtitle).toBe('SKILL VALIDATION')
      expect(result.verbPhrase).toBe('has demonstrated expertise in')
    })

    it('should detect skill validation for quality:technical even without explicit person type', () => {
      const input: CertificateInferenceInput = {
        aspect: 'quality:technical'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.SKILL_VALIDATION)
    })
  })

  describe('Employment Detection', () => {
    it('should detect employment from RATED claim with work statement', () => {
      const input: CertificateInferenceInput = {
        claim: 'RATED',
        statement: 'This is to certify that Aml Ahmed has worked with Al Ahram Company as a Software Engineer.'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.EMPLOYMENT)
      expect(result.subtitle).toBe('OF EMPLOYMENT VERIFICATION')
    })

    it('should detect employment from statement alone', () => {
      const input: CertificateInferenceInput = {
        statement: 'John Doe worked at TechCorp as Senior Developer'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.EMPLOYMENT)
    })
  })

  describe('Identity Verification', () => {
    it('should detect identity verification from aspect', () => {
      const input: CertificateInferenceInput = {
        aspect: 'identity:verified'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.IDENTITY_VERIFICATION)
      expect(result.subtitle).toBe('OF IDENTITY VERIFICATION')
    })
  })

  describe('Achievement Detection', () => {
    it('should detect achievement from aspect', () => {
      const input: CertificateInferenceInput = {
        aspect: 'achievement:completed'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.ACHIEVEMENT)
    })

    it('should detect achievement from statement', () => {
      const input: CertificateInferenceInput = {
        statement: 'Jane has achieved the Advanced Certification in Data Science'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.ACHIEVEMENT)
    })
  })

  describe('Endorsement Detection', () => {
    it('should detect endorsement from claim type', () => {
      const input: CertificateInferenceInput = {
        claim: 'ENDORSES'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.ENDORSEMENT)
      expect(result.subtitle).toBe('OF ENDORSEMENT')
    })
  })

  describe('Generic Fallback', () => {
    it('should return generic certificate for unknown patterns', () => {
      const input: CertificateInferenceInput = {
        statement: 'Some random text'
      }

      const result = inferCertificateType(input)

      expect(result.type).toBe(CertificateType.GENERIC)
      expect(result.subtitle).toBe('OF ATTESTATION')
    })

    it('should handle empty input', () => {
      const result = inferCertificateType({})

      expect(result.type).toBe(CertificateType.GENERIC)
    })
  })
})

describe('extractCertificationTopic', () => {
  describe('Employment Role Extraction', () => {
    it('should extract role from employment statement', () => {
      const statement = 'This is to certify that Aml Ahmed has worked with Al Ahram Company as a Software Engineer.'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('Software Engineer')
    })

    it('should extract role with article', () => {
      const statement = 'worked at TechCorp as an Engineering Manager during 2020'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('Engineering Manager')
    })
  })

  describe('Skill Extraction', () => {
    it('should extract skill from expertise statement', () => {
      const statement = 'demonstrated expertise in Machine Learning and AI'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('Machine Learning and AI')
    })

    it('should extract from demonstrated skills pattern', () => {
      const statement = 'demonstrated strong technical skills in cloud architecture'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('strong technical')
    })
  })

  describe('Achievement Extraction', () => {
    it('should extract achievement', () => {
      const statement = 'successfully completed Advanced Python Programming Course'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('Advanced Python Programming Course')
    })

    it('should extract earned certification', () => {
      const statement = 'earned AWS Solutions Architect Certification'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('AWS Solutions Architect Certification')
    })
  })

  describe('Aspect Fallback', () => {
    it('should use aspect when no statement provided', () => {
      const topic = extractCertificationTopic(null, 'quality:technical_excellence')

      expect(topic).toBe('Technical Excellence')
    })

    it('should format aspect properly', () => {
      const topic = extractCertificationTopic(undefined, 'skill:data_analysis')

      expect(topic).toBe('Data Analysis')
    })
  })

  describe('Edge Cases', () => {
    it('should handle statement with no matching pattern', () => {
      const statement = 'This person is great!'
      const aspect = 'quality:excellence'

      const topic = extractCertificationTopic(statement, aspect)

      expect(topic).toBe('Excellence')
    })

    it('should handle null/undefined gracefully', () => {
      const topic = extractCertificationTopic(null, null)

      expect(topic).toBe('Professional Certification')
    })

    it('should clean up captured text properly', () => {
      const statement = 'worked at Company as a Senior Developer. During her time there'

      const topic = extractCertificationTopic(statement)

      expect(topic).toBe('Senior Developer')
    })
  })
})
