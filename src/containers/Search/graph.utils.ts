const parseClaims = (claims: any) => {
  const elements: any[] = [];

  claims.forEach((claim: any) => {
    // adding subject node
    if (claim.subject) {
      const uri = new URL(claim.subject);
      elements.push({
        data: {
          id: claim.subject,
          label: `Host:\n${uri.origin}\n\n Path:\n${uri.pathname}`,
        },
      });
    }
    // adding object node
    if (claim.object) {
      const uri = new URL(claim.object);
      elements.push({
        data: {
          id: claim.object,
          label: `Host:\n${uri.origin}\n\n Path:\n${uri.pathname}`,
        },
      });
    }
    // adding edge between subject and object
    if (claim.subject && claim.object)
      elements.push({
        data: {
          id: claim.id,
          source: claim.subject,
          target: claim.object,
          relation: claim.claim,
        },
      });
  });
  return elements;
};

export { parseClaims };
