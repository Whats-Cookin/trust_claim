import { useCeramicContext } from './ceramic_context.js'

const CREATE_LINKED_CLAIM_MUTATION = `

  mutation (
    $claim: String!
    $object: String
    $rating: LinkedClaimNormalizedRating
    $source: LinkedClaimClaimSource
    $sharing: LinkedClaimSharing
    $statement: String
    $subjectID: String!
    $confidence: Float
    $subjectType: LinkedClaimSubjectType
    $effectiveDate: Date
  ) {
    createLinkedClaim(
      input: {
        content: {
          claim: $claim
          object: $object
          rating: $rating
          source: $source
          sharing: $sharing
          statement: $statement
          subjectID: $subjectID
          confidence: $confidence
          subjectType: $subjectType
          effectiveDate: $effectiveDate
        }
      }
    ) {
      document {
        id
        amt
        claim
        object
        rating
        source
        sharing
        statement
        subjectID
        confidence
        subjectType
        effectiveDate
      }
    }
  }
`

type LinkedClaimPayload = {
  subject: string
  claim: string
  object: string
  statement: string
  aspect: string
  howKnown: string
  sourceURI: string
  effectiveDate: string
  confidence: number
  stars: number
}

const PublishClaim = async (payload: LinkedClaimPayload): Promise<any> => {
  const { ceramic, composeClient } = useCeramicContext()

  if (!composeClient) {
    console.log('Compose client connection unavailable')
    return { status: 500 }
  }

  const { subject, claim, object, statement, aspect, howKnown, sourceURI, effectiveDate, confidence, stars } = payload

  const rating = {
    stars
  }

  const claimSource = {
    sourceID: sourceURI
  }

  const sharing = {
    respondAt: null,
    intendedAudience: null
  }

  const variables = {
    claim,
    object,
    rating,
    source: claimSource,
    sharing,
    statement,
    subjectID: subject,
    confidence,
    subjectType: null,
    effectiveDate
  }
  const response = await composeClient.executeQuery(CREATE_LINKED_CLAIM_MUTATION, variables)

  if (response.errors) {
    console.error(response.errors)
    return { status: 500 }
  }

  return { status: 201 }
}

export { PublishClaim }
