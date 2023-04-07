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

const parseNodes = (claims: any) => {
  const nodes: any[] = []
  const edges: any[] = []

  console.log("claims",claims);
  

  claims.forEach((claim: any) => {
    // adding subject node
    if (claim.name && claim.nodeUri) {
      let uri: any
      if (isValidUrl(claim.nodeUri)) uri = new URL(claim.nodeUri)
      else uri = claim.nodeUri

      const label = getLabel(uri)

      nodes.push({
        data: {
          id: claim.subject,
          label: label
        }
      })
    }

    // adding edge between subject and object
    if (claim.edgesFrom)
      edges.push(claim.edgesFrom.map((e: any) =>({
        data: {
          id: e.id,
          source: e.startNodeId,
          target: e.endNodeId,
          relation: e.label,
          claimId:e.claimId
        }
      })))

  })
  return {nodes,edges}
}

export { parseClaims, parseNodes }