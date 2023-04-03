const getLabel = (uri: any) => {
  if (uri.hostname === "trustclaims.whatscookin.us") {
    return decodeURIComponent(uri.pathname.split("/").pop());
  }
  return `Host:\n${uri.origin}\n\n Path:\n${uri.pathname}`;
};

const parseClaims = (claims: any) => {
  const elements: any[] = [];

  claims.forEach((claim: any) => {
    // adding subject node
    if (claim.subject) {
      const uri = claim.subject; //new URL(claim.subject);
      const label = uri; //getLabel(uri);

      elements.push({
        data: {
          id: claim.subject,
          label: label,
        },
      });
    }


    // adding object node
    if (claim.object) {
      const uri = claim.object; // new URL(claim.object);
      const label = uri; // getLabel(uri);

      elements.push({
        data: {
          id: claim.object,
          label: label,
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
