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

const parseNodes = (data: any) => {
  const nodes: any[] = []
  const edges: any[] = []

  data.forEach((node: any) => {
    // adding subject node
    parseNode(nodes, edges, node)
  })
  return { nodes, edges }
}


const getNodeLabel = (node: any ) => {
  let uri = node.nodeUri
  // could do this - if we used a trustclaims uri separate the path part
  // not important - just here for reference from before
  /*if (isValidUrl(uri)) {
    let uriObj = new URL(node.nodeUri)
    if (uriObj.hostname === 'trustclaims.whatscookin.us') {
      let decodedUri = decodeURIComponent(uri.pathname.split('/').pop())
      uri = decodedUri.pathname
    }
  }
  */
  // WANT THIS or something like it: 
  // `<b>{node.name}</b><br/><i><small>{uri}</small></i><br/>`
  // + thumbnail if available
  return node.name || node.nodeUri
}


const parseNode = (nodes: {}[], edges: {}[], node: any) => {
  // adding subject node
  if (node.name && node.nodeUri) {

    const label = getNodeLabel(node)

    nodes.push({
      data: {
        id: node.id,
        label,
        raw: node
      }
    })
  }

  // adding edge between subject and object
  if (node.edgesFrom) {
    node.edgesFrom.map((e: any) => {
      if (nodes.indexOf((n: any) => n.id === e.endNode.id.toString()) > -1) return

      const label = getNodeLabel(e.endNode)
      nodes.push({
        data: {
          id: e.endNode.id.toString(),
          label,
          raw: e.endNode
        }
      })
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

      const label = getNodeLabel(e.startNode)
      nodes.push({
        data: {
          id: e.startNode.id.toString(),
          label,
          raw: e.startNode
        }
      })
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

export { parseClaims, parseNodes, parseNode }
