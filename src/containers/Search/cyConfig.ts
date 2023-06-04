const cyConfig = (containerRef: any) => {
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
          shape: 'round',
          borderRadius: '10%',
          borderColor: '#00695f',
          borderWidth: '10px',
          borderOpacity: 0.5,
          backgroundColor: '#009688',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 25,
          textHalign: 'center',
          textValign: 'center',
          textWrap: 'wrap',
          textMaxWidth: 100,
          textOverflowWrap: 'breakWord',
          content: 'data(label)'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 6,
          fontSize: 20,
          targetArrowShape: 'triangle-cross',
          lineColor: '#006400',
          targetArrowColor: '#006400',
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
