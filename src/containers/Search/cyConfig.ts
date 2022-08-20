const cyConfig = (containerRef: any) => {
  return {
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
          borderRadius: "10%",
          borderColor: "#000",
          borderWidth: 3,
          borderOpacity: 0.5,
          backgroundColor: "#0074d9",
          color: "#fff",
          fontWeight: "semi-bold",
          textHalign: "center",
          textValign: "center",
          textWrap: "wrap",
          textMaxWidth: 100,
          textOverflowWrap: "breakWord",
          content: "data(label)",
        },
      },
      {
        selector: "edge",
        style: {
          width: 6,
          targetArrowShape: "triangle",
          lineColor: "#0074d9",
          targetArrowColor: "#0074d9",
          curveStyle: "bezier",
          lineStyle: "unbundled-bezier",
          controlPointDistances: " 20px 30px 40px",
          controlPointWeights: "0.5 0.2 0.8",
          textRotation: "autorotate",
          textMarginX: 30,
          textBackgroundColor: "#0074d9",
          content: "data(relation)",
        },
      },
      {
        selector: ":selected",
        style: {
          backgroundColor: "#0092d9",
          borderColor: "#0074d9",
          borderWidth: 3,
          borderOpacity: 0.5,
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
