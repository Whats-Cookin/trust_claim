import { Stylesheet, CytoscapeOptions, BaseLayoutOptions } from 'cytoscape'

const cyConfig = (containerRef: any): CytoscapeOptions => {
  const styles: Stylesheet[] = [
    {
      selector: 'node',
      style: {
        shape: 'round-rectangle',
        // 'background-color': '#3E5348',
        color: '#ecf0f1',
        label: 'data(label)',
        'font-weight': 'bold',
        'text-halign': 'center',
        'text-valign': 'center',
        'text-wrap': 'wrap',
        'font-size': '15px',
        'border-width': '2px',
        'border-color': '#3E5348',
        'padding-left': '10px',
        'padding-right': '10px',
        'padding-top': '10px',
        'padding-bottom': '10px',
        backgroundColor: '#009688',
        content: 'data(label)'
      }
    },
    {
      selector: 'edge',
      style: {
        width: 4,
        'line-style': 'dashed',
        'line-color': '#009688',
        'curve-style': 'taxi',
        'line-dash-pattern': [10, 10],
        'line-cap': 'round',
        'font-size': '25px',
        'text-rotation': 'autorotate',
        'text-margin-y': 30,
        'text-margin-x': 30,
        'source-endpoint': 'outside-to-node',
        'target-endpoint': 'outside-to-node',
        'target-arrow-shape': 'triangle-cross',
        color: '#009688',
        'target-arrow-color': '#009688',
        'control-point-weights': '0.5 0.2 0.8',
        content: 'data(relation)'
      }
    }
  ]

  const layoutOptions: BaseLayoutOptions = {
    name: 'breadthfirst',
    // fit: true,
    // directed: true,
    // padding: 10,
    // circle: false,
    // grid: true,
    // spacingFactor: 1.75,
    // boundingBox: undefined,
    // avoidOverlap: true,
    // nodeDimensionsIncludeLabels: false,
    // roots: undefined,
    // depthSort: undefined,
    // animate: false,
    // animationDuration: 500,
    // animationEasing: undefined,

    ready: undefined,
    stop: undefined,
    transform: function (node, position) {
      return position
    }
  }

  return {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: styles,
    layout: layoutOptions,
    wheelSensitivity: 0.2,
    minZoom: 0.1,
    maxZoom: 2,
    userZoomingEnabled: true,
    userPanningEnabled: true
  }
}

export default cyConfig
