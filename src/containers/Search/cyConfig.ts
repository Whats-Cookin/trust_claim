import { minWidth } from "@mui/system"


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
          width: '160px',
          height: '57rem',
          borderRadius: '30px',
          backgroundImage: 'data(image)',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '10px',
          textHalign: 'center',
          textValign: 'center',
          content: 'data(label)'
        }
      },
      {
        selector: 'edge',
        style: {
          width: "4",
          fontSize: '8',
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
