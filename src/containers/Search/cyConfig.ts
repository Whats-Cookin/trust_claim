import elements from "./mockElements";

const cyConfig = (containerRef: any) => ({
  elements: elements,
  container: containerRef || undefined,
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
      },
    },
  ],
  layout: {
    name: "circle",
  },
});

export default cyConfig;
