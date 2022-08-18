const cyConfig = (containerRef: any, elements: object[]) => {
  return {
    elements,
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      {
        selector: "node",
        style: {
          height: 300,
          width: 300,
          shape: "cicle",
          "border-radius": "10%",
          "border-color": "#000",
          "border-width": 3,
          "border-opacity": 0.5,
          "background-color": "#0074d9",
          color: "#fff",
          "font-weight": "semi-bold",
          "text-halign": "center",
          "text-valign": "center",
          "text-wrap": "wrap",
          "text-max-width": 100,
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
          "text-rotation": "autorotate",
          "text-margin-x": 30,
          "text-background-color": "#0074d9",
          content: "data(relation)",
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
      name: "breadthfirst",
      directed: true,
      padding: 10,
    },
  };
};

export default cyConfig;
