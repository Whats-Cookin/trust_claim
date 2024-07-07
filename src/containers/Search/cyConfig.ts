

const cyConfig = (containerRef: any) => {
  return {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      {
        selector: 'node',
        style: {
          backgroundColor: '#4C726F',
          width: '900rem',
          height: '300rem',
          borderRadius: '30px',
          backgroundImage: 'data(image)',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '50.2rem',
          textHalign: 'center',
          textValign: 'center',
          content: 'data(label)'
        }
      },
      {
        selector: 'edge',
        style: {
          width: "10.5rem",
          fontSize: '50rem',
          targetArrowShape: 'triangle-cross',
          lineColor: 'theme.footerText',
          targetArrowColor: 'theme.footerText',
          controlPointWeights: '0.5 0.2 0.8',
          textRotation: 'autoroute',
          curveStyle: 'bezier',
          textMarginX: 30,
          color: 'theme.footerText',
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
