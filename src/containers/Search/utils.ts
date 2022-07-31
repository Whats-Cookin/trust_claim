const getEdges = (claims: any) => {
  const edges: any[] = [];

  claims.forEach((claimx: any) => {
    claims.forEach((claimy: any) => {
      if (
        claimx.subject === claimy.object &&
        claimx.subject !== claimy.subject
      ) {
        const edge = {
          data: {
            source: claimx.id,
            target: claimy.id,
          },
        };
        edges.push(edge);
      } else if (
        claimx.issuerId === claimy.subject &&
        claimx.issuerId !== claimy.issuerId
      ) {
        const edge = {
          data: {
            source: claimx.id,
            target: claimy.id,
          },
        };
        edges.push(edge);
      }
    });
  });
  return edges;
};

const getNodes = (claims: any) => {
  const nodes: any[] = [];

  claims.forEach((claim: any) => {
    const node = {
      data: { id: claim.id, label: claim.subject },
    };
    nodes.push(node);
  });

  return nodes;
};

export { getEdges };
