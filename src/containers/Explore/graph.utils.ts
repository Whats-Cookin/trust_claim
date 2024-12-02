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

  console.log('About to parse each node from ' + JSON.stringify(data))
  data.forEach((node: any) => {
    // adding subject node
    console.log('Parsing node ' + JSON.stringify(node))
    parseSingleNode(nodes, edges, node)
  })
  console.log('FINALLY returning nodes ' + JSON.stringify(nodes) + ' and EDGES ' + JSON.stringify(edges))
  return { nodes, edges }
}

const getNodeData = (node: any) => {
  let uri = node.nodeUri
  let label = node.name || uri
  if (label === 'Not Acceptable!' || label === 'Not Acceptable') {
    console.log('Node name is ' + node.name)
    label = ''
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
      image: imageUrl
    }
  }
  return nodeData
}

const parseSingleNode = (nodes: {}[], edges: {}[], node: any) => {
  console.log('IN single node node is ' + JSON.stringify(node))
  // adding subject node
  if (node.name && node.nodeUri) {
    const nodeData = getNodeData(node)
    if (nodeData) {
      nodes.push(nodeData)
    }
  }

  // adding edge between subject and object
  if (node.edgesFrom) {
    node.edgesFrom.map((e: any) => {
      if (nodes.indexOf((n: any) => n.id === e.endNode.id.toString()) > -1) return

      if (e.endNode) {
        const nodeData = getNodeData(e.endNode)
        if (nodeData) {
          nodes.push(nodeData)
        }
      }
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
      if (nodeData) {
        nodes.push(nodeData)
      }
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

  console.log('Returning Nodes ' + JSON.stringify(nodes) + ' and edges ' + JSON.stringify(edges))
  return { nodes, edges }
}

export { parseClaims, parseMultipleNodes, parseSingleNode }
