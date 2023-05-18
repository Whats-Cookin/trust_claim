import { ceramic, composeClient } from './ceramic_client.js'

const CREATE_LINKED_CLAIM_MUTATION = `
  mutation CreateNewClaim($i:CreateLinkedClaimInput!) {
    createLinkedClaim(input: $i) {
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

  if (!composeClient) {
    console.log('Compose client connection unavailable')
    return { status: 500 }
  }

  const { subject, claim, object, statement, aspect, howKnown, sourceURI, effectiveDate, confidence, stars } = payload

  const variables = {
    "i": {
       "content": {
          "subjectID": subject,
          "claim": claim,
          "object": object,
          "rating": { "stars": stars},
          "source": { "sourceID": sourceURI},
          "sharing": {
            "respondAt": null,
            "intendedAudience": null
          }, 
          "statement": statement,
          "confidence": confidence,
          "subjectType": null,
          "effectiveDate": effectiveDate,
          "howKnown": howKnown,
          "aspect": aspect
        }
     }
  }

  const response = await composeClient.executeQuery(CREATE_LINKED_CLAIM_MUTATION, variables)

  if (response.errors) {
    console.error(response.errors)
    return { status: 500 }
  }

  return { status: 201 }
}

export { PublishClaim }
