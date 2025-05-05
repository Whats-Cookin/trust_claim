import cytoscape from 'cytoscape'
import { Theme } from '@mui/material'
import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label'

cytoscape.use(cytoscapeNodeHtmlLabel)
const truncateLabel = (label: string, maxLength: number) => {
  if (!label) return ''
  return label.length <= maxLength ? label : `${label.slice(0, maxLength)}...`
}

const getInitials = (label: string) => {
  if (!label) return '?'
  const cleanLabel = label.trim()
  return cleanLabel.length >= 2 ? cleanLabel.slice(0, 2).toUpperCase() : cleanLabel.toUpperCase()
}

const getNodeStyles = () =>
  [
    {
      selector: 'node',
      style: {
        height: 150,
        width: 150,
        shape: 'roundrectangle',
        'background-opacity': 0,
        'border-opacity': 0
      }
    },
    {
      selector: 'node[entType="CLAIM"]',
      style: {
        shape: 'ellipse',
        height: 80,
        'background-opacity': 0
      }
    }
  ] as any

const getEdgeStyles = (theme: Theme) =>
  [
    {
      selector: 'edge',
      style: {
        width: 3,
        'font-size': 14,
        'target-arrow-shape': 'triangle',
        'line-color': theme.palette.stars,
        'target-arrow-color': theme.palette.stars,
        'curve-style': 'bezier',
        color: theme.palette.stars,
        'text-rotation': 'autorotate',
        label: 'data(relation)',
        'line-cap': 'round',
        'source-endpoint': 'outside-to-node',
        'target-endpoint': 'outside-to-node',
        'text-margin-y': 0,
        'text-margin-x': 0,
        'text-halign': 'center',
        'text-valign': 'center',
        'edge-text-rotation': 'autorotate',
        'text-events': 'yes',
        'text-background-color': theme.palette.background.default,
        'text-background-opacity': 0.9,
        'text-background-padding': 3
      }
    }
  ] as any

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
          fontSize: 14,
          targetArrowShape: 'triangle-cross',
          lineColor: theme.palette.stars,
          targetArrowColor: theme.palette.stars,
          curveStyle: 'bezier',
          color: theme.palette.stars,
          controlPointWeights: '0.5 0.2 0.8',
          textRotation: 'autorotate',
          textMarginX: 30,
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
