import { ceramic, composeClient } from './ceramic_client.js'

const CREATE_LINKED_CLAIM_MUTATION = `
  mutation CreateNewClaim($i:CreateLinkedClaimInput!) {
    createLinkedClaim(input: $i) {
      document {
        id
        claim
        object
        statement
        subjectID
        confidence
        subjectType
        effectiveDate
        amt {
            value
            unit
            howMeasured
        }
        source {
            howKnown
            sourceID
        }
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
  amt: number
}

interface Content {
  subjectID: string
  subjectType?: string
  subjectName?: string
  claim: string
  effectiveDate?: string
  statement?: string
  object?: string
  rating?: {
    aspect?: string
    stars?: number
    score?: number
  }
  source?: {
    sourceID?: string
    howKnown?: string
    dateObserved?: string
    digestMultibase?: string
    author?: string
    curator?: string
  }
  amt?: {
    value?: number
    unit?: string
    howMeasured?: string
  }
  confidence?: number
  sharing?: {
    intendedAudience?: string
    respondAt?: string
  }
}

const PublishClaim = async (payload: LinkedClaimPayload): Promise<any> => {
  if (!composeClient) {
    console.log('Compose client connection unavailable')
    return { status: 500 }
  }

  let { subject, claim, object, statement, aspect, howKnown, sourceURI, effectiveDate, confidence, stars, amt } =
    payload

  if (howKnown) {
    howKnown = howKnown.toUpperCase()
    // todo check against allowed enum list
  }

  if (!subject || !claim) {
    console.log('Subject and claim are required!')
    return { status: 422 }
  }

  let edate = '2023-05-19'
  if (effectiveDate) {
    edate = effectiveDate.substring(0, 10)
  }

  const variables: { i: { content: Content } } = {
    i: {
      content: {
        subjectID: subject,
        claim: claim,
        effectiveDate: edate
      }
    }
  }

  if (stars) {
    variables['i']['content']['rating'] = {
      aspect: aspect || 'unknown',
      stars: stars || 0,
      score: stars / 5.0
    }
  }

  if (amt) {
    variables['i']['content']['amt'] = {
      value: amt,
      unit: 'USD'
    }
  }

  if (sourceURI) {
    variables['i']['content']['source'] = {
      sourceID: sourceURI,
      howKnown: howKnown || 'OTHER'
    }
  }
  /*          "sharing": {
            "respondAt": 'https://live.linkedtrust.us/',
            "intendedAudience": '' 
          }, 
        //"subjectType": 'THING',
*/
  if (statement) {
    variables['i']['content']['statement'] = statement
  }
  if (confidence) {
    variables['i']['content']['confidence'] = confidence
  }
  console.log('about to execute query on ' + JSON.stringify(variables))
  const response = await composeClient.executeQuery(CREATE_LINKED_CLAIM_MUTATION, variables)

  console.log('Response from composeclient: ' + JSON.stringify(response))
  return response
}

export { PublishClaim }
