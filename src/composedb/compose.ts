import { gql } from 'graphql-tag';
import { useCeramicContext} from "./ceramic_context.js";

// @ts-ignore
import { definition } from './__generated__/trustclaims.js'

const CREATE_LINKED_CLAIM_MUTATION = gql`
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
    $subjectName: String
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
          subjectName: $subjectName
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
  subjectName: string;
  claim: string;
  object: string;
  statement: string;
  aspect: string;
  howKnown: string;
  sourceURI: string;
  effectiveDate: string;
  confidence: number;
  stars: number;
};

const PublishClaim = async (payload: LinkedClaimPayload): Promise<any> => {

  const {ceramic, composeClient} = useCeramicContext();

  if (! composeClient) {
     console.log("Compose client connection unavailable");
     return {'status':500};
  }

  const {
    subject,
    subjectName,
    claim,
    object,
    statement,
    aspect,
    howKnown,
    sourceURI,
    effectiveDate,
    confidence,
    stars,
  } = payload;

  const rating = {
    stars,
  };

  const claimSource = {
    sourceID: sourceURI,
  };

  const sharing = {
    respondAt: null,
    intendedAudience: null,
  };

  const variables = {
    claim,
    object,
    rating,
    source: claimSource,
    sharing,
    statement,
    subjectID: subject,
    confidence,
    subjectName,
    subjectType: null,
    effectiveDate,
  };
  const response = await composeClient.execute(CREATE_LINKED_CLAIM_MUTATION, variables);

  if (response.errors) {
    console.error(response.errors);
    return {'status': 500};
  }

  return {'status':201};

};



export { PublishClaim };
