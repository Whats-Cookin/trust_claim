/**
 * Generate appropriate claim statements based on credential type/schema
 */

interface CredentialData {
  name?: string;
  type?: string | string[];
  issuer?: any;
  credentialSubject?: any;
  [key: string]: any;
}

/**
 * Generate statement for OpenBadges v3 credentials
 */
function generateOpenBadgesStatement(credential: CredentialData): string {
  const achievement = credential.credentialSubject?.achievement;
  const recipientName = credential.credentialSubject?.name;
  
  if (achievement) {
    const achievementName = achievement.name || 'achievement';
    const issuerName = typeof credential.issuer === 'string' 
      ? credential.issuer 
      : credential.issuer?.name || 'the issuer';
    
    let statement = `Earned ${achievementName} from ${issuerName}`;
    
    // Add description if available
    if (achievement.description) {
      statement += `. ${achievement.description}`;
    }
    
    // Add skills if present
    const skills = credential.credentialSubject?.skills;
    if (skills && skills.length > 0) {
      const skillNames = skills.map((s: any) => s.name || s).join(', ');
      statement += ` Demonstrated skills: ${skillNames}.`;
    }
    
    return statement;
  }
  
  // Fallback to generic
  return generateGenericStatement(credential);
}

/**
 * Generate statement for Blockcerts credentials
 * For now, falls back to generic
 */
function generateBlockcertsStatement(credential: CredentialData): string {
  // TODO: Add Blockcerts-specific handling when needed
  // For now, use generic
  return generateGenericStatement(credential);
}

/**
 * Generate statement for Hypercerts
 * For now, falls back to generic
 */
function generateHypercertStatement(credential: CredentialData): string {
  // TODO: Add Hypercert-specific handling when needed
  // Look for impact claims, project contributions, etc.
  return generateGenericStatement(credential);
}

/**
 * Generate generic statement for any credential
 */
function generateGenericStatement(credential: CredentialData): string {
  // Try to extract a meaningful name
  const name = credential.name || 
               credential.credentialSubject?.name ||
               credential.credentialSubject?.achievement?.name ||
               extractTypeString(credential.type) ||
               'credential';
  
  const issuerName = typeof credential.issuer === 'string'
    ? credential.issuer
    : credential.issuer?.name || credential.issuer?.id || 'issuer';
  
  return `Has credential: ${name} from ${issuerName}`;
}

/**
 * Extract a meaningful type string from credential type field
 */
function extractTypeString(type: string | string[] | undefined): string {
  if (!type) return 'Credential';
  
  const types = Array.isArray(type) ? type : [type];
  // Filter out generic W3C type
  const meaningfulType = types.find(t => t !== 'VerifiableCredential');
  return meaningfulType || 'Credential';
}

/**
 * Main function to generate credential statement based on schema
 */
export function generateCredentialStatement(
  credential: CredentialData, 
  schema?: string
): string {
  // Determine schema if not provided
  const credentialSchema = schema || detectSchema(credential);
  
  switch (credentialSchema) {
    case 'OpenBadges':
    case 'OpenBadgeCredential':
      return generateOpenBadgesStatement(credential);
      
    case 'Blockcerts':
    case 'BlockcertsCredential':
      return generateBlockcertsStatement(credential);
      
    case 'Hypercert':
      return generateHypercertStatement(credential);
      
    default:
      return generateGenericStatement(credential);
  }
}

/**
 * Try to detect schema from credential structure
 */
function detectSchema(credential: CredentialData): string {
  // Check types
  const types = Array.isArray(credential.type) ? credential.type : [credential.type];
  if (types.includes('OpenBadgeCredential')) return 'OpenBadges';
  if (types.includes('BlockcertsCredential')) return 'Blockcerts';
  
  // Check for OpenBadges structure
  if (credential.credentialSubject?.achievement) return 'OpenBadges';
  
  // Default
  return 'VerifiableCredential';
}

/**
 * Get a short description of what claiming means for this credential type
 */
export function getClaimDescription(schema?: string): string {
  switch (schema) {
    case 'OpenBadges':
    case 'OpenBadgeCredential':
      return 'This will add your achievement to your LinkedTrust profile where it can be verified by others.';
      
    case 'Blockcerts':
    case 'BlockcertsCredential':
      return 'This will add your blockchain-verified credential to your LinkedTrust profile.';
      
    case 'Hypercert':
      return 'This will add your impact contribution to your LinkedTrust profile.';
      
    default:
      return 'This will add the credential to your LinkedTrust profile where it can be verified by others.';
  }
}
