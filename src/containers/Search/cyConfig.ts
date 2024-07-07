const cyConfig = (containerRef: any, theme: any) => {
  return {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      {
        selector: 'node',
        style: {
          height: 300,
          width: 300,
          borderColor: theme.palette.primary.main,
          borderWidth: '10px',
          borderOpacity: 0.5,
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.text.primary,
          fontWeight: 'bold',
          fontSize: 25,
          textHalign: 'center',
          textValign: 'center',
          textWrap: 'wrap',
          textMaxWidth: 100,
          content: 'data(label)'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 6,
          fontSize: 20,
          targetArrowShape: 'triangle-cross',
          lineColor: theme.palette.text.secondary,
          targetArrowColor: theme.palette.success.main,
          curveStyle: 'bezier',
          controlPointWeights: '0.5 0.2 0.8',
          textRotation: 'autorotate',
          textMarginX: 30,
          content: 'data(relation)'
        }
      }
    ],
    layout: {
      name: 'breadthfirst',
      directed: true,
      padding: 10
    }
  }
}

export default cyConfig
