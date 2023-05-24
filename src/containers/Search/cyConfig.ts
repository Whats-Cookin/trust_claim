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
          borderColor: '#006400',
          borderWidth: '10px',
          borderOpacity: 0.5,
          'background-color': '#009688',
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: 26,
          textHalign: 'center',
          textValign: 'center',
          textWrap: 'wrap',
          textMaxWidth: 100,
          textOverflowWrap: 'break-Word',
          content: 'data(label)'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 6,
          fontSize: 20,
          targetArrowShape: 'round-rectangle',
          lineColor: '#006400',
          targetArrowColor: '#006400',
          curveStyle: 'bezier',
          lineStyle: 'unbundled-bezier',
          controlPointDistances: ' 20px 30px 40px',
          controlPointWeights: '0.5 0.2 0.8',
          textRotation: 'autorotate',
          textMarginX: 30,
          textBackgroundColor: '#0074d9',
          content: 'data(relation)'
        }
      },
      {
        selector: ':selected',
        style: {
          backgroundColor: '#0092d9',
          borderColor: '#0074d9',
          borderWidth: 3,
          borderOpacity: 0.5
        }
      },

      {
        selector: ':hover',
        style: {
          cursor: 'pointer'
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
