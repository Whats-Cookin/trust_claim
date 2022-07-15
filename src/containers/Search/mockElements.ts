const elements = [
  { data: { id: "Golda", label: "Node 1" } },
  { data: { id: "Nishant", label: "Node 2" } },
  { data: { id: "Sami", label: "Node 3" } },

  {
    data: {
      source: "Golda",
      target: "Nishant",
      label: "Edge from Node1 to Node2",
    },
  },
  {
    data: {
      source: "Golda",
      target: "Sami",
      label: "Edge from Node1 to Node3",
    },
  },
];

export default elements;
