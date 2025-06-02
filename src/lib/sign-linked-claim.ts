/**
 * sign-linked-claim - Frontend Version
 * 
 * Browser implementation with DID/Ethereum signing support.
 * Reference implementation for the LinkedClaims specification.
 * 
 * @package sign-linked-claim
 * @version 0.1.0
 */

export interface LinkedClaim {
  // Core claim triple
  subject: string;
  claim: string;
  object?: string;
  
  // Optional fields that are part of the signed content
  statement?: string;
  effectiveDate?: string | Date;
  sourceURI?: string;
  howKnown?: string;
  confidence?: number; // The signer's confidence at time of signing (0-1)
  
  // Ratings/measurements (included in signature)
  aspect?: string;
  stars?: number;
  score?: number;
  amt?: number;
  unit?: string;
}

export interface LinkedClaimProof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue?: string;
  
  // Additional context
  authenticationMethod?: string;
  ethereumAddress?: string;
}

/**
 * Creates a canonical JSON representation of a claim for signing.
 * This ensures consistent serialization across implementations.
 */
export function canonicalizeClaim(claim: LinkedClaim): string {
  // Create canonical object with only defined values
  const canonical: any = {};
  
  // Always include core triple
  canonical.subject = claim.subject;
  canonical.claim = claim.claim;
  if (claim.object !== undefined) canonical.object = claim.object;
  
  // Optional content fields (alphabetical order for consistency)
  if (claim.amt !== undefined) canonical.amt = claim.amt;
  if (claim.aspect !== undefined) canonical.aspect = claim.aspect;
  if (claim.confidence !== undefined) canonical.confidence = claim.confidence;
  if (claim.effectiveDate !== undefined) {
    canonical.effectiveDate = claim.effectiveDate instanceof Date 
      ? claim.effectiveDate.toISOString() 
      : claim.effectiveDate;
  }
  if (claim.howKnown !== undefined) canonical.howKnown = claim.howKnown;
  if (claim.score !== undefined) canonical.score = claim.score;
  if (claim.sourceURI !== undefined) canonical.sourceURI = claim.sourceURI;
  if (claim.stars !== undefined) canonical.stars = claim.stars;
  if (claim.statement !== undefined) canonical.statement = claim.statement;
  if (claim.unit !== undefined) canonical.unit = claim.unit;
  
  // Return deterministic JSON (sorted keys, no extra spaces)
  return JSON.stringify(canonical, Object.keys(canonical).sort());
}

/**
 * DID/Ethereum signing preparation
 */
export interface DIDSigningContext {
  signerDID?: string;
  signerAddress: string;
  timestamp?: string;
}

export function prepareDIDSigning(
  claim: LinkedClaim,
  context: DIDSigningContext
): { message: string; proof: Omit<LinkedClaimProof, 'proofValue'> } {
  // For Ethereum signing, we use a simpler message format
  const canonicalClaim = JSON.parse(canonicalizeClaim(claim));
  
  const message = JSON.stringify({
    ...canonicalClaim,
    timestamp: context.timestamp || new Date().toISOString(),
    signer: context.signerAddress
  });
  
  const proof: Omit<LinkedClaimProof, 'proofValue'> = {
    type: 'EthereumEip712Signature2021',
    created: new Date().toISOString(),
    verificationMethod: context.signerDID || `did:pkh:eip155:1:${context.signerAddress}`,
    proofPurpose: 'assertionMethod',
    ethereumAddress: context.signerAddress
  };
  
  return { message, proof };
}

/**
 * Convert raw claim data to LinkedClaim format
 */
export function toLinkedClaim(rawClaim: any): LinkedClaim {
  const claim: LinkedClaim = {
    subject: rawClaim.subject,
    claim: rawClaim.claim,
    object: rawClaim.object
  };
  
  // Add optional fields if present
  if (rawClaim.statement) claim.statement = rawClaim.statement;
  if (rawClaim.effectiveDate) claim.effectiveDate = rawClaim.effectiveDate;
  if (rawClaim.sourceURI) claim.sourceURI = rawClaim.sourceURI;
  if (rawClaim.howKnown) claim.howKnown = rawClaim.howKnown;
  if (rawClaim.confidence !== undefined) claim.confidence = rawClaim.confidence;
  if (rawClaim.aspect) claim.aspect = rawClaim.aspect;
  if (rawClaim.stars !== undefined) claim.stars = rawClaim.stars;
  if (rawClaim.score !== undefined) claim.score = rawClaim.score;
  if (rawClaim.amt !== undefined) claim.amt = rawClaim.amt;
  if (rawClaim.unit) claim.unit = rawClaim.unit;
  
  return claim;
}

/**
 * Extract issuerId from a proof
 */
export function getIssuerFromProof(proof: LinkedClaimProof): string {
  // For DIDs, the verificationMethod is the issuer
  if (proof.verificationMethod.startsWith('did:')) {
    return proof.verificationMethod.split('#')[0]; // Remove key fragment
  }
  
  // For Ethereum addresses
  if (proof.ethereumAddress) {
    return `did:pkh:eip155:1:${proof.ethereumAddress}`;
  }
  
  // For server keys, the server is the issuer (on behalf of a user)
  if (proof.authenticationMethod && (proof as any).authenticatedUser) {
    return (proof as any).authenticatedUser;
  }
  
  return proof.verificationMethod;
}
