const isValidUrl = (urlString: string) => {
  let inputElement = document.createElement('input')
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

  data.forEach((node: any) => {
    // adding subject node
    parseSingleNode(nodes, edges, node)
  })
  return { nodes, edges }
}

const getNodeData = (node: any) => {
  let uri = node.nodeUri
  // could do this - if we used a trustclaims uri separate the path part
  // not important - just here for reference from before
  /*if (isValidUrl(uri)) {
    let uriObj = new URL(node.nodeUri)
    if (uriObj.hostname === 'trustclaims.whatscookin.us') {
      let decodedUri = decodeURIComponent(uri.pathname.split('/').pop())
      uri = decodedUri.pathname
    }
  }*/

  interface NodeData {
    data: {
      id: string
      label: string
      raw: any
    }
    style?: {
      [key: string]: any
    }
  }
  let label = node.name || uri
  if (label == 'Not Acceptable!' || label == 'Not Acceptable') {
    console.log('Node name is ' + node.name)
    label = ''
  }

  const nodeData: NodeData = {
    data: {
      id: node.id.toString(),
      label: label,
      raw: node
    }
  }
  if (node.entType === 'CLAIM') {
    nodeData.style = {
      shape: 'square'
    }
  } else {
    nodeData.style = {
      shape: 'circle'
    }
  }

  if (node.image) {
    nodeData.style = {
      'background-image': [node.image.replace(/\?.+$/, '')],
      'background-fit': 'cover cover',
      'background-image-opacity': 1.0
    }
  } else if (node.thumbnail) {
    nodeData.style = {
      'background-image': [node.thumbnail.replace(/\?.+$/, '')],
      'background-fit': 'cover cover',
      'background-image-opacity': 0.4
    }
  }
  return nodeData
}

const parseSingleNode = (nodes: {}[], edges: {}[], node: any) => {
  // adding subject node
  if (node.name && node.nodeUri) {
    const nodeData = getNodeData(node)

    nodes.push(nodeData)
  }

  // adding edge between subject and object
  if (node.edgesFrom) {
    node.edgesFrom.map((e: any) => {
      if (nodes.indexOf((n: any) => n.id === e.endNode.id.toString()) > -1) return

      const nodeData = getNodeData(e.endNode)
      nodes.push(nodeData)
    })

    edges.push(
      ...node.edgesFrom.map((e: any) => ({
        data: {
          id: e.id,
          source: e.startNodeId,
          target: e.endNodeId,
          relation: e.label,
          raw: e
        }
      }))
    )
  }

  if (node.edgesTo) {
    node.edgesTo.map((e: any) => {
      if (nodes.indexOf((n: any) => n.id === e.startNode.id.toString()) > -1) return

      const nodeData = getNodeData(e.startNode)
      nodes.push(nodeData)
    })

    edges.push(
      ...node.edgesTo.map((e: any) => ({
        data: {
          id: e.id,
          source: e.endNodeId,
          target: e.startNodeId,
          relation: e.label,
          raw: e
        }
      }))
    )
  }

  return { nodes, edges }
}

export { parseClaims, parseMultipleNodes, parseSingleNode }
