import { edgeColors } from '../../theme/colors'

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
          relation: claim.claim
        }
      })
  })
  return elements
}

const parseMultipleNodes = (data: any) => {
  const nodes: any[] = []
  const edges: any[] = []

  // The backend returns an array of nodes with embedded edges
  if (Array.isArray(data)) {
    console.log('Parsing array of nodes:', data.length)
    data.forEach((node: any) => {
      parseSingleNode(nodes, edges, node)
    })
  } else if (data && typeof data === 'object') {
    // Single node with edges
    console.log('Parsing single node')
    parseSingleNode(nodes, edges, data)
  }

  console.log('Parsed nodes:', nodes.length, 'edges:', edges.length)
  return { nodes, edges }
}

const getNodeData = (node: any) => {
  // Handle both old and new node structures
  let uri = node.nodeUri || node.uri || node.id
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

const parseSingleNode = (nodes: {}[], edges: {}[], node: any) => {
  // adding subject node
  if (node.name && node.nodeUri) {
    const nodeData = getNodeData(node)
    if (nodeData) {
      nodes.push(nodeData)
    }
  }

  // Check for node duplication to prevent duplicate nodes
  const existingNodeIds = new Set(nodes.map((n: any) => n.data.id))

  // adding edges from this node
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

    edges.push(
      ...node.edgesFrom.map((e: any) => {
        const claimType = e.label || e.claim?.claim || ''
        const edgeStyle = edgeStylesByClaimType[claimType] || edgeStylesByClaimType.default

        return {
          data: {
            id: e.id.toString(),
            source: e.startNodeId.toString(),
            target: e.endNodeId.toString(),
            relation: claimType,
            raw: e,
            color: edgeStyle.color,
            width: edgeStyle.width,
            arrow: edgeStyle.arrow,
            lineStyle: edgeStyle.style
          }
        }
      })
    )
  }

  // adding edges to this node
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

    edges.push(
      ...node.edgesTo.map((e: any) => {
        const claimType = e.label || e.claim?.claim || ''
        const edgeStyle = edgeStylesByClaimType[claimType] || edgeStylesByClaimType.default

        return {
          data: {
            id: e.id.toString(),
            source: e.startNodeId.toString(),
            target: e.endNodeId.toString(),
            relation: claimType,
            raw: e,
            color: edgeStyle.color,
            width: edgeStyle.width,
            arrow: edgeStyle.arrow,
            lineStyle: edgeStyle.style
          }
        }
      })
    )
  }

  return { nodes, edges }
}

export { parseClaims, parseMultipleNodes, parseSingleNode }
