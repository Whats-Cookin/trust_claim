import allClaims from "./allClaims";

const getNodes = () => {
  const nodes: any[] = [];

  allClaims.forEach((claim) => {
    const node = {
      data: { id: claim.id, label: claim.subject },
    };
    nodes.push(node);
  });

  return nodes;
};

const getEdges = () => {
  const edges: any[] = [];

  allClaims.forEach((claimx) => {
    allClaims.forEach((claimy) => {
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

const elements = () => {
  const edges = getEdges();
  const nodes = getNodes();
  const elements = [...edges, ...nodes];
  return elements;
  // return [
  //   { data: { id: "Golda", label: "Node 1" } },
  //   { data: { id: "Nishant", label: "Node 2" } },
  //   { data: { id: "Sami", label: "Node 3" } },

  //   {
  //     data: {
  //       source: "Golda",
  //       target: "Nishant",
  //       label: "Edge from Node1 to Node2",
  //     },
  //   },
  //   {
  //     data: {
  //       source: "Golda",
  //       target: "Sami",
  //       label: "Edge from Node1 to Node3",
  //     },
  //   },
  // ];
};

export default elements;
