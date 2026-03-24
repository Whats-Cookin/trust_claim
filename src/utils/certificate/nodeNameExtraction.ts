/**
 * Node name extraction utilities
 * Handles extracting proper names from nodes when backend naming is incomplete
 */

import { extractProfileName } from '../string.utils'

export interface NodeData {
  id: number
  nodeUri: string
  name: string
  entType: string
  descrip?: string
}

/**
 * Extract a proper display name from a node
 * Handles cases where backend hasn't properly resolved names yet
 */
export function extractNodeName(node: NodeData | undefined, statement?: string): string {
  if (!node) return ''

  // If name looks like a URL (backend hasn't resolved it yet)
  if (node.name && (node.name.startsWith('http') || node.name.includes('://'))) {
    // Try to extract from statement for person nodes
    if (node.entType === 'PERSON' && statement) {
      // Extract person name from statement
      const patterns = [
        /This is to certify that ([A-Z][a-z]+ [A-Z][a-z]+)/,
        /We certify that ([A-Z][a-z]+ [A-Z][a-z]+)/,
        /([A-Z][a-z]+ [A-Z][a-z]+) has been/,
        /([A-Z][a-z]+ [A-Z][a-z]+) has worked/,
        /([A-Z][a-z]+ [A-Z][a-z]+) is hereby/
      ]

      for (const pattern of patterns) {
        const match = statement.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }
    }

    // Try to extract from URL for profile links
    if (node.nodeUri.includes('linkedin.com/in/')) {
      const handle = extractProfileName(node.nodeUri)
      // Capitalize properly
      if (handle) {
        return handle
          .split(/[-_]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      }
    }

    // For organization nodes, try to extract from statement
    if (node.entType === 'ORGANIZATION' && statement) {
      // Look for company names in statement
      const patterns = [
        /worked (?:with|at|for) ([A-Z][A-Za-z0-9\s&]+?)(?:\s+as\s+|\.|,)/,
        /Issued by:\s*([A-Z][A-Za-z0-9\s&]+?)(?:\.|$)/,
        /employed (?:by|at) ([A-Z][A-Za-z0-9\s&]+?)(?:\s+as\s+|\.|,)/
      ]

      for (const pattern of patterns) {
        const match = statement.match(pattern)
        if (match && match[1]) {
          return match[1].trim()
        }
      }
    }

    // Fallback: try to extract from the URL
    return extractProfileName(node.nodeUri) || node.nodeUri
  }

  // If name doesn't look like a URL, use it
  return node.name
}

/**
 * Find the issuer/source organization name
 * Looks for it in nodes data or extracts from statement
 */
export function extractIssuerName(
  nodes: NodeData[] | undefined,
  sourceURI: string | undefined,
  statement: string | undefined
): string {
  // Try to find the source node
  if (nodes && sourceURI) {
    const sourceNode = nodes.find(n => n.nodeUri === sourceURI)
    if (sourceNode) {
      const name = extractNodeName(sourceNode, statement)
      // Don't return if it's still a URL or the wrong LinkedIn URL
      if (!name.includes('://') && !name.includes('linkedin.com')) {
        return name
      }
    }
  }

  // Extract from statement as fallback
  if (statement) {
    // Look for "Issued by: X" pattern
    const issuedByMatch = statement.match(/Issued by:\s*([^.\n]+)/i)
    if (issuedByMatch && issuedByMatch[1]) {
      return issuedByMatch[1].trim()
    }

    // Look for company in work statements
    const workMatch = statement.match(/worked (?:with|at|for) ([A-Z][A-Za-z0-9\s&]+?)(?:\s+as\s+|\.|,)/)
    if (workMatch && workMatch[1]) {
      return workMatch[1].trim()
    }
  }

  return ''
}

/**
 * Extract person name from nodes or statement
 */
export function extractPersonName(
  nodes: NodeData[] | undefined,
  subjectURI: string | undefined,
  statement: string | undefined,
  subjectName?: string
): string {
  // Use provided subject_name if it's not a URL
  if (subjectName && !subjectName.includes('://')) {
    return subjectName
  }

  // Try to find the subject node
  if (nodes && subjectURI) {
    const subjectNode = nodes.find(n => n.nodeUri === subjectURI)
    if (subjectNode) {
      const name = extractNodeName(subjectNode, statement)
      // Don't return if it's still a URL
      if (!name.includes('://')) {
        return name
      }
    }
  }

  // Extract from statement as fallback
  if (statement) {
    const patterns = [
      /This is to certify that ([A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+)/,
      /We certify that ([A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+)/,
      /([A-Z][a-z]+ (?:[A-Z][a-z]+ )?[A-Z][a-z]+) has (?:been|worked|completed)/
    ]

    for (const pattern of patterns) {
      const match = statement.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
  }

  // Last resort: extract from subject URI if it's a profile
  if (subjectURI && subjectURI.includes('linkedin.com/in/')) {
    const handle = extractProfileName(subjectURI)
    if (handle) {
      return handle
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }
  }

  return 'Certificate Holder'
}
