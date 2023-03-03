import "./init"
import { DIDSession } from 'did-session'
import type { AuthMethod } from '@didtools/cacao'
import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from "@composedb/types";


// @ts-ignore
import { definition } from './__generate__/trustclaims.js'

const client = new ComposeClient({ ceramic: 'http://localhost:7007', definition: definition as RuntimeCompositeDefinition})

const LoadSession = async(authMethod?: AuthMethod):Promise<DIDSession | undefined> => {
  const sessionStr = localStorage.getItem('didsession')
  let session

  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr)
  }

  if (authMethod && (!session || (session.hasSession && session.isExpired))) {
    session = await DIDSession.authorize(authMethod, { resources: client.resources })
    client.setDID(session.did)
    localStorage.setItem('didsession', session.serialize())
  }

  return session
}


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
    $subjectName: String
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
          subjectName: $subjectName
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
        subjectName
        subjectType
        effectiveDate
      }
    }
  }
`;

type LinkedClaimPayload = {
  subject: string;
  claim: string;
  object: string;
  qualifier: string;
  aspect: string;
  howKnown: string;
  source: string;
  effectiveDate: string;
  confidence: number;
  reviewRating: number;
};

const PublishClaim = async (session: any, payload: LinkedClaimPayload): Promise<boolean> => {
  const {
    subject,
    claim,
    object,
    qualifier,
    aspect,
    howKnown,
    source,
    effectiveDate,
    confidence,
    reviewRating,
  } = payload;

  const rating = {
    reviewRating,
  };

  const claimSource = {
    url: source,
  };

  const sharing = {
    qualifier,
    aspect,
    howKnown,
  };

  const variables = {
    claim,
    object,
    rating,
    source: claimSource,
    sharing,
    statement: null,
    subjectID: subject,
    confidence,
    subjectName: null,
    subjectType: null,
    effectiveDate,
  };

  const response = await client.executeQuery(CREATE_LINKED_CLAIM_MUTATION, variables);

  if (response.errors) {
    console.error(response.errors);
    return false;
  }

  return true;

};

export { client, LoadSession, PublishClaim };
