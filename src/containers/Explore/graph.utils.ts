import { edgeColors } from '../../theme/colors'

/**
 * Aspects that indicate identity equivalence.
 * These are used for visual merging of nodes that represent the same entity.
 *
 * Supports both:
 * - Legacy: relation="same_as" (claim.claim="SAME_AS")
 * - New: relation="related_to" with aspect="relationship:same-as"
 */
const IDENTITY_EQUIVALENT_ASPECTS = ['relationship:same-as'] as const

/**
 * Check if an edge represents an identity-equivalent relationship.
 * This is the single source of truth for what edges should cause node merging.
 *
 * @param edge - Cytoscape edge object with data.relation and optionally data.raw.aspect or data.aspect
 */
const isIdentityEquivalentEdge = (edge: any): boolean => {
  const relation = edge.data?.relation?.toLowerCase()

  // Legacy: direct SAME_AS claim type
  if (relation === 'same_as') {
    return true
  }

  // New: RELATED_TO with identity-equivalent aspect
  if (relation === 'related_to') {
    // Check for aspect in edge data (may be in raw claim data or directly on edge)
    const aspect = edge.data?.raw?.aspect || edge.data?.aspect
    if (aspect && IDENTITY_EQUIVALENT_ASPECTS.includes(aspect as any)) {
      return true
    }
  }

  return false
}

// Edge styles configuration using theme colors
const edgeStylesByClaimType: any = {
  is_vouched_for: { color: edgeColors.is_vouched_for, style: 'solid', width: 4, arrow: 'triangle' },
  rated: { color: edgeColors.rated, style: 'solid', width: 3, arrow: 'chevron' },
  funds_for_purpose: { color: edgeColors.funds_for_purpose, style: 'dashed', width: 2, arrow: 'vee' },
  same_as: { color: edgeColors.same_as, style: 'dashed', width: 2, arrow: 'none' },
  validated: { color: edgeColors.validated, style: 'solid', width: 5, arrow: 'triangle' },
  verified: { color: edgeColors.verified, style: 'solid', width: 4, arrow: 'triangle' },
  impact: { color: edgeColors.impact, style: 'solid', width: 4, arrow: 'triangle-tee' },
  agree: { color: edgeColors.agree, style: 'solid', width: 3, arrow: 'circle' },

  // Structural edges (new claims-as-nodes model)
  subject: { color: '#999999', style: 'dashed', width: 1, arrow: 'triangle' },
  object: { color: '#999999', style: 'dashed', width: 1, arrow: 'triangle' },
  source: { color: '#BBBBBB', style: 'dashed', width: 1, arrow: 'triangle' },

  default: { color: edgeColors.default, style: 'solid', width: 2, arrow: 'triangle' }
}

const isValidUrl = (urlString: string) => {
  var inputElement = document.createElement('input')
  inputElement.type = 'url'
  inputElement.value = urlString

  if (!inputElement.checkValidity()) {
    return false
  } else {
    return true
  }
}

const getLabel = (uri: any) => {
  if (isValidUrl(uri)) {
    if (uri.hostname === 'trustclaims.whatscookin.us') {
      return decodeURIComponent(uri.pathname.split('/').pop())
    }
    return `Host:\n${uri.origin}\n\n Path:\n${uri.pathname}`
  } else {
    return uri
  }
}

const parseClaims = (claims: any) => {
  const elements: any[] = []

  claims.forEach((claim: any) => {
    // adding subject node
    if (claim.subject) {
      let uri: any
      if (isValidUrl(claim.subject)) uri = new URL(claim.subject)
      else uri = claim.subject

      const label = getLabel(uri)

      elements.push({
        data: {
          id: claim.subject,
          label: label
        }
      })
    }

    // adding object node
    if (claim.object) {
      let uri: any
      if (isValidUrl(claim.object)) uri = new URL(claim.object)
      else uri = claim.object

      const label = getLabel(uri)

      elements.push({
        data: {
          id: claim.object,
          label: label
        }
      })
    }
    // adding edge between subject and object
    if (claim.subject && claim.object)
      elements.push({
        data: {
          id: claim.id,
          source: claim.subject,
          target: claim.object,
          relation: claim.claim,
          aspect: claim.aspect // Include aspect for identity-equivalent detection
        }
      })
  })
  return elements
}

const parseMultipleNodes = (data: any) => {
  const nodes: any[] = []
  const edges: any[] = []
  const existingNodeIds = new Set<string>()
  const existingEdgeIds = new Set<string>()

  // The backend returns an array of nodes with embedded edges
  if (Array.isArray(data)) {
    console.log('[parseMultipleNodes] Backend returned array of', data.length, 'nodes')

    // FIRST PASS: Add all backend nodes first (these are the primary nodes)
    // This ensures they come first in the list and won't be cut off when limiting
    data.forEach((node: any, idx: number) => {
      if (node.name && node.nodeUri) {
        const nodeId = node.id.toString()
        if (!existingNodeIds.has(nodeId)) {
          const nodeData = getNodeData(node)
          if (nodeData) {
            console.log(`[parseMultipleNodes] Adding primary node ${idx + 1}/${data.length}:`, {
              id: nodeId,
              uri: node.nodeUri,
              label: nodeData.data.label
            })
            nodes.push(nodeData)
            existingNodeIds.add(nodeId)
          }
        }
      }
    })

    // SECOND PASS: Process edges and add discovered nodes
    data.forEach((node: any) => {
      // Process edgesFrom - add discovered endNodes
      if (node.edgesFrom) {
        node.edgesFrom.forEach((e: any) => {
          if (e.endNode && !existingNodeIds.has(e.endNode.id.toString())) {
            const nodeData = getNodeData(e.endNode)
            if (nodeData) {
              nodes.push(nodeData)
              existingNodeIds.add(e.endNode.id.toString())
            }
          }
        })
      }

      // Process edgesTo - add discovered startNodes
      if (node.edgesTo) {
        node.edgesTo.forEach((e: any) => {
          if (e.startNode && !existingNodeIds.has(e.startNode.id.toString())) {
            const nodeData = getNodeData(e.startNode)
            if (nodeData) {
              nodes.push(nodeData)
              existingNodeIds.add(e.startNode.id.toString())
            }
          }
        })
      }
    })

    // THIRD PASS: Add all edges
    data.forEach((node: any) => {
      if (node.edgesFrom) {
        node.edgesFrom.forEach((e: any) => {
          const edgeId = e.id.toString()
          if (!existingEdgeIds.has(edgeId)) {
            const edgeLabel = e.label || ''
            const edgeStyle = edgeStylesByClaimType[edgeLabel] || edgeStylesByClaimType.default
            edges.push({
              data: {
                id: edgeId,
                source: e.startNodeId.toString(),
                target: e.endNodeId.toString(),
                relation: edgeLabel,
                label: edgeLabel,
                raw: { ...e, startNode: e.startNode || node },
                color: edgeStyle.color,
                width: edgeStyle.width,
                arrow: edgeStyle.arrow,
                lineStyle: edgeStyle.style
              }
            })
            existingEdgeIds.add(edgeId)
          }
        })
      }

      if (node.edgesTo) {
        node.edgesTo.forEach((e: any) => {
          const edgeId = e.id.toString()
          if (!existingEdgeIds.has(edgeId)) {
            const edgeLabel = e.label || ''
            const edgeStyle = edgeStylesByClaimType[edgeLabel] || edgeStylesByClaimType.default
            edges.push({
              data: {
                id: edgeId,
                source: e.startNodeId.toString(),
                target: e.endNodeId.toString(),
                relation: edgeLabel,
                label: edgeLabel,
                raw: { ...e, endNode: e.endNode || node },
                color: edgeStyle.color,
                width: edgeStyle.width,
                arrow: edgeStyle.arrow,
                lineStyle: edgeStyle.style
              }
            })
            existingEdgeIds.add(edgeId)
          }
        })
      }
    })
  } else if (data && typeof data === 'object') {
    // Single node with edges
    console.log('[parseMultipleNodes] Backend returned single node')
    parseSingleNode(nodes, edges, data, existingNodeIds, existingEdgeIds)
  }

  console.log(`[parseMultipleNodes] FINAL: Created ${nodes.length} nodes, ${edges.length} edges`)
  return { nodes, edges }
}

const getNodeData = (node: any) => {
  // Use the nodeUri from the database - don't fall back to ID
  let uri = node.nodeUri
  let label = node.displayName || node.name || uri

  // Handle empty or invalid labels
  if (!label || label === '' || label === 'Not Acceptable!' || label === 'Not Acceptable') {
    // Try to extract a meaningful label from the URI
    if (uri) {
      if (uri.includes('://')) {
        // Extract domain from URL
        try {
          const url = new URL(uri)
          label = url.hostname || url.pathname.split('/').pop() || uri
        } catch {
          label = uri.split('/').pop() || uri
        }
      } else {
        label = uri.split('/').pop() || uri
      }
    } else {
      label = 'Unknown'
    }
  }

  let imageUrl = ''
  if (node.image) {
    imageUrl = node.image.replace(/\?.+$/, '')
  } else if (node.thumbnail) {
    imageUrl = node.thumbnail.replace(/\?.+$/, '')
  }

  const nodeData = {
    data: {
      id: node.id.toString(),
      label: label,
      raw: node,
      image: imageUrl,
      thumbnail: node.thumbnail,
      entType: node.entType || node.entityType || 'OTHER',
      entityType: node.entityType || node.entType || 'OTHER',
      entityData: node.entityData,
      confidence: node.confidence,
      stars: node.stars,
      claim: node.claim, // Include claim type for proper coloring
      amt: node.amt, // Include amount for impact nodes
      uri: uri,
      nodeUri: uri // Also include as nodeUri for backward compatibility
    }
  }
  return nodeData
}

const parseSingleNode = (
  nodes: {}[],
  edges: {}[],
  node: any,
  existingNodeIds: Set<string>,
  existingEdgeIds: Set<string>
) => {
  // adding subject node
  if (node.name && node.nodeUri) {
    const nodeId = node.id.toString()
    if (!existingNodeIds.has(nodeId)) {
      const nodeData = getNodeData(node)
      if (nodeData) {
        console.log('[parseSingleNode] Adding main node:', {
          id: nodeId,
          uri: node.nodeUri,
          label: nodeData.data.label
        })
        nodes.push(nodeData)
        existingNodeIds.add(nodeId)
      }
    } else {
      console.log('[parseSingleNode] Skipping duplicate main node:', { id: nodeId, uri: node.nodeUri })
    }
  }

  // adding edges from this node
  if (node.edgesFrom) {
    node.edgesFrom.forEach((e: any) => {
      if (e.endNode && !existingNodeIds.has(e.endNode.id.toString())) {
        const nodeData = getNodeData(e.endNode)
        if (nodeData) {
          console.log('[parseSingleNode] Adding endNode from edge:', {
            id: e.endNode.id.toString(),
            uri: e.endNode.nodeUri,
            label: nodeData.data.label
          })
          nodes.push(nodeData)
          existingNodeIds.add(e.endNode.id.toString())
        }
      } else if (e.endNode) {
        console.log('[parseSingleNode] Skipping duplicate endNode:', {
          id: e.endNode.id.toString(),
          uri: e.endNode.nodeUri
        })
      }
    })

    node.edgesFrom.forEach((e: any) => {
      const edgeId = e.id.toString()
      // Skip if this edge already exists
      if (existingEdgeIds.has(edgeId)) {
        return
      }

      // Edges are structural relationships: subject, object, source
      const edgeLabel = e.label || ''
      const edgeStyle = edgeStylesByClaimType[edgeLabel] || edgeStylesByClaimType.default

      edges.push({
        data: {
          id: edgeId,
          source: e.startNodeId.toString(),
          target: e.endNodeId.toString(),
          relation: edgeLabel,
          label: edgeLabel,
          raw: {
            ...e,
            // For edgesFrom, the current node IS the startNode (backend omits it to save data)
            startNode: e.startNode || node
          },
          color: edgeStyle.color,
          width: edgeStyle.width,
          arrow: edgeStyle.arrow,
          lineStyle: edgeStyle.style
        }
      })
      existingEdgeIds.add(edgeId)
    })
  }

  // adding edges to this node
  if (node.edgesTo) {
    node.edgesTo.forEach((e: any) => {
      if (e.startNode && !existingNodeIds.has(e.startNode.id.toString())) {
        const nodeData = getNodeData(e.startNode)
        if (nodeData) {
          console.log('[parseSingleNode] Adding startNode from edge:', {
            id: e.startNode.id.toString(),
            uri: e.startNode.nodeUri,
            label: nodeData.data.label
          })
          nodes.push(nodeData)
          existingNodeIds.add(e.startNode.id.toString())
        }
      } else if (e.startNode) {
        console.log('[parseSingleNode] Skipping duplicate startNode:', {
          id: e.startNode.id.toString(),
          uri: e.startNode.nodeUri
        })
      }
    })

    node.edgesTo.forEach((e: any) => {
      const edgeId = e.id.toString()
      // Skip if this edge already exists
      if (existingEdgeIds.has(edgeId)) {
        return
      }

      // Edges are structural relationships: subject, object, source
      const edgeLabel = e.label || ''
      const edgeStyle = edgeStylesByClaimType[edgeLabel] || edgeStylesByClaimType.default

      edges.push({
        data: {
          id: edgeId,
          source: e.startNodeId.toString(),
          target: e.endNodeId.toString(),
          relation: edgeLabel,
          label: edgeLabel,
          raw: {
            ...e,
            // For edgesTo, the current node IS the endNode (backend omits it to save data)
            endNode: e.endNode || node
          },
          color: edgeStyle.color,
          width: edgeStyle.width,
          arrow: edgeStyle.arrow,
          lineStyle: edgeStyle.style
        }
      })
      existingEdgeIds.add(edgeId)
    })
  }

  return { nodes, edges }
}

/**
 * Merges nodes connected by SAME_AS edges into single visual nodes.
 * The merged node contains aliases array with all original node data for inspection.
 *
 * @param nodes - Array of cytoscape node objects
 * @param edges - Array of cytoscape edge objects
 * @param enabled - Toggle to enable/disable merging (default: true)
 * @returns Object with merged nodes and edges
 */
const mergeSameAsNodes = (nodes: any[], edges: any[], enabled: boolean = true): { nodes: any[]; edges: any[] } => {
  if (!enabled || nodes.length === 0) {
    return { nodes, edges }
  }

  // Find identity-equivalent edges (SAME_AS or RELATED_TO with same-as aspect)
  const sameAsEdges = edges.filter(isIdentityEquivalentEdge)

  if (sameAsEdges.length === 0) {
    return { nodes, edges }
  }

  // Union-find data structure
  const parent = new Map<string, string>()

  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id)
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)!))
    }
    return parent.get(id)!
  }

  const union = (a: string, b: string) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) {
      // Prefer lower ID as canonical (stable ordering)
      if (rootA < rootB) {
        parent.set(rootB, rootA)
      } else {
        parent.set(rootA, rootB)
      }
    }
  }

  // Union all SAME_AS connected nodes
  sameAsEdges.forEach(edge => {
    union(edge.data.source, edge.data.target)
  })

  // Group nodes by canonical representative
  const nodeGroups = new Map<string, any[]>()
  nodes.forEach(node => {
    const canonical = find(node.data.id)
    if (!nodeGroups.has(canonical)) {
      nodeGroups.set(canonical, [])
    }
    nodeGroups.get(canonical)!.push(node)
  })

  // Create merged nodes
  const mergedNodes = Array.from(nodeGroups.entries()).map(([canonicalId, group]) => {
    // Use canonical node as primary, fallback to first
    const primary = group.find(n => n.data.id === canonicalId) || group[0]

    if (group.length === 1) {
      return primary
    }

    // Collect aliases (all nodes in group)
    const aliases = group.map(n => ({
      id: n.data.id,
      uri: n.data.uri || n.data.nodeUri,
      label: n.data.label,
      entType: n.data.entType,
      raw: n.data.raw
    }))

    // Pick best label (prefer shorter, non-URL labels)
    const bestLabel =
      group
        .map(n => n.data.label)
        .sort((a, b) => {
          const aIsUrl = a?.includes('://') || a?.includes('/')
          const bIsUrl = b?.includes('://') || b?.includes('/')
          if (aIsUrl && !bIsUrl) return 1
          if (!aIsUrl && bIsUrl) return -1
          return (a?.length || 999) - (b?.length || 999)
        })[0] || primary.data.label

    return {
      ...primary,
      data: {
        ...primary.data,
        label: bestLabel,
        aliases,
        isMerged: true,
        mergedCount: group.length
      }
    }
  })

  // Build node ID to canonical ID mapping
  const idToCanonical = new Map<string, string>()
  nodes.forEach(node => {
    idToCanonical.set(node.data.id, find(node.data.id))
  })

  // Rewrite edges and filter out identity-equivalent edges
  const seenEdges = new Set<string>()
  const mergedEdges = edges
    .filter(e => !isIdentityEquivalentEdge(e))
    .map(edge => {
      const newSource = idToCanonical.get(edge.data.source) || edge.data.source
      const newTarget = idToCanonical.get(edge.data.target) || edge.data.target
      return {
        ...edge,
        data: {
          ...edge.data,
          source: newSource,
          target: newTarget,
          originalSource: edge.data.source,
          originalTarget: edge.data.target
        }
      }
    })
    // Remove self-loops
    .filter(e => e.data.source !== e.data.target)
    // Dedupe edges that became identical
    .filter(edge => {
      const key = `${edge.data.source}-${edge.data.target}-${edge.data.relation}`
      if (seenEdges.has(key)) return false
      seenEdges.add(key)
      return true
    })

  console.log(
    `mergeSameAsNodes: ${nodes.length} -> ${mergedNodes.length} nodes, ${edges.length} -> ${mergedEdges.length} edges`
  )

  return { nodes: mergedNodes, edges: mergedEdges }
}

export { parseClaims, parseMultipleNodes, parseSingleNode, mergeSameAsNodes }
