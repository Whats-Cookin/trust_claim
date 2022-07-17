import elements from "./mockElements";

const cyConfig = (containerRef: any) => ({
  elements: elements(),
  container: containerRef || undefined,
  boxSelectionEnabled: false,
  autounselectify: true,
  style: [
    {
      selector: "node",
      style: {
        height: 400,
        width: 400,
        shape: "rectangle",
        "border-radius": "10%",
        "border-color": "#000",
        "border-width": 3,
        "border-opacity": 0.5,
        "background-color": "#0074d9",
        "text-color": "#0074d9",
        "text-halign": "center",
        "text-valign": "center",
        "text-wrap": "ellipsis",
        "text-max-width": 350,
        "text-overflow-wrap": "break-word",
        content: "data(label)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 6,
        "target-arrow-shape": "triangle",
        "line-color": "#0074d9",
        "target-arrow-color": "#0074d9",
        "curve-style": "bezier",
        "line-style": "unbundled-bezier",
        "control-point-distances": " 20px 30px 40px",
        "control-point-weights": "0.5 0.2 0.8",
      },
    },
    {
      selector: ":selected",
      style: {
        "background-color": "#0092d9",
        "border-color": "#0074d9",
        "border-width": 3,
        "border-opacity": 0.5,
      },
    },

    {
      selector: ":hover",
      style: {
        cursor: "pointer",
      },
    },
  ],

  layout: {
    // name: 'breadthfirst',
    // directed: true,
    // padding: 10
    // name:"cose",
    // name: "random",
    name: "circle",
  },
});

export default cyConfig;
