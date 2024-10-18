import cytoscape from 'cytoscape'
import { Theme } from '@mui/material'
import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label'

cytoscape.use(cytoscapeNodeHtmlLabel)

const truncateLabel = (label: string, maxLength: number) => {
  if (label.length <= maxLength) {
    return label
  }
  return label.slice(0, maxLength) + '.....'
}

const cyConfig = (containerRef: any, theme: Theme, layoutName: string, layoutOptions: object) => {
  return {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      {
        selector: 'node',
        style: {
          height: 60,
          width: 180,
          shape: 'roundrectangle',
          backgroundOpacity: 0,
          borderOpacity: 0,
          'background-color': theme.palette.darkinputtext
        }
      },
      {
        selector: 'node[entType="CLAIM"]',
        style: {
          shape: 'square'
        }
      },
      {
        selector: 'edge',
        style: {
          width: 3,
          fontSize: 16,
          targetArrowShape: 'triangle-cross',
          lineColor: theme.palette.stars,
          targetArrowColor: theme.palette.stars,
          curveStyle: 'bezier',
          color: theme.palette.stars,
          controlPointWeights: '0.5 0.2 0.8',
          textRotation: 'autorotate',
          content: 'data(relation)',
          'line-cap': 'round',
          'source-endpoint': 'outside-to-node',
          'target-endpoint': 'outside-to-node',
          'control-point-weights': '0.5 0.2 0.8'
        }
      }
    ],
    layout: {
      name: layoutName,
      ...layoutOptions,
      animate: true,
      animationDuration: 1000
    },
    ready: function (this: cytoscape.Core) {
      const cy = this
      cy.nodeHtmlLabel([
        {
          query: 'node',
          halign: 'center',
          valign: 'center',
          valignBox: 'center',
          halignBox: 'center',
          cssClass: 'custom-node',
          tpl: (data: any) => `
            <div class="custom-node-container">
              ${data.image ? `<div class="node-icon" style="background-image: url(${data.image})"></div>` : ''}
              <div class="node-label">${truncateLabel(data.label, 40)}</div>
            </div>
          `
        }
      ])
    }
  }
}

export default cyConfig
