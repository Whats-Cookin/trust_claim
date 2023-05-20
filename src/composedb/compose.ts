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

interface Content {
  subjectID: string;
  subjectType?: string;
  subjectName?: string;
  claim: string;
  effectiveDate?: string;
  statement?: string;
  object?: string;
  rating?: {
    aspect?: string;
    stars?: number;
    score?: number;
  };
  source?: {
    sourceID?: string;
    howKnown?: string;
    dateObserved?: string;
    digestMultibase?: string;
    author?: string;
    curator?: string; 
  };
  amt?: {
    value?: number,
    unit?: string,
    howMeasured?: string
  };
  confidence?: number;
  sharing?: {
    intendedAudience?: string;
    respondAt?: string;
  }
}

const PublishClaim = async (payload: LinkedClaimPayload): Promise<any> => {

  if (!composeClient) {
    console.log('Compose client connection unavailable')
    return { status: 500 }
  }

  const { subject, claim, object, statement, aspect, howKnown, sourceURI, effectiveDate, confidence, stars } = payload

  if (! subject || ! claim) {
     console.log('Subject and claim are required!')
     return { status: 422 }
  }

  let edate = '2023-05-19'
  if (effectiveDate) {
    edate = effectiveDate.substring(0, 10)
  }

  const variables: { i: { content: Content } } = {
    "i": {
       "content": {
          "subjectID": subject,
          "claim": claim,
          "effectiveDate": edate
       }
    }
  }
  
  if (stars) {
     variables['i']['content']['rating'] = {
             "aspect": aspect || 'unknown',
             "stars": stars || 0, 
             "score": stars/5.0
     }
  }

  if (sourceURI) {
    variables['i']['content']['source'] = {
             "sourceID": sourceURI,
             "howKnown": howKnown || 'OTHER'
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


  const response = await composeClient.executeQuery(CREATE_LINKED_CLAIM_MUTATION, variables)

  if (response.errors) {
    console.error(response.errors)
    return { status: 500 }
  }

  return { status: 201 }
}

export { PublishClaim }
