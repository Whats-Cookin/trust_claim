const cyConfig = (containerRef: any) => {
  return {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    highlightDegree: 2,
    highlightOpacity: 0.2,
    linkHighlightBehavior: true,
    maxZoom: 8,
    minZoom: 0.1,
    initialZoom: null,
    nodeHighlightBehavior: true,
    automaticRearrangeAfterDropNode: true,
    collapsible: true,
    directed: true,
    style: [
      {
        selector: "node",
        style: {
          backgroundImage:
            "https://vignette.wikia.nocookie.net/logopedia/images/f/fc/Amazon.com_Favicon_2.svg/revision/latest/scale-to-width-down/280?cb=20160808095346",
          backgroundWidth: "300px",
          backgroundHeight: "300px",
          backgroundOpacity: .5,
          height: 300,
          width: 300,
          shape: "round-rectangle",
          color: "#800000",
          focusAnimationDuration: 0.75,
          focusZoom: 1,
          freezeAllDragEvents: false,
          fontWeight: "bold",
          fontSize: 20,
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
          fontSize: 20,
          targetArrowShape: "triangle",
          lineColor: "#006400",
          targetArrowColor: "#006400",
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
