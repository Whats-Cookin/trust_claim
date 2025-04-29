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

const cyConfig = (containerRef: HTMLElement | null, theme: Theme, layoutName: string, layoutOptions: object) => {
  const config: cytoscape.CytoscapeOptions = {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [...getNodeStyles(), ...getEdgeStyles(theme)],
    layout: {
      name: layoutName,
      ...layoutOptions
    }
  }

  const instance = cytoscape(config)

  // Add HTML labels after initialization
  instance.ready(() => {
    instance.nodeHtmlLabel([
      {
        query: 'node',
        halign: 'center',
        valign: 'center',
        valignBox: 'center',
        halignBox: 'center',
        cssClass: 'custom-node-container',
        tpl: (data: any) => `
          <div class="custom-node-container">
            ${
              data.image
                ? `<div class="node-icon" style="background-image: url(${data.image})"></div>`
                : `<div class="node-placeholder">${getInitials(data.label || data.id)}</div>`
            }
            <div class="node-label">${truncateLabel(data.label || data.id, 40)}</div>
          </div>
        `
      }
    ])
  })

  return instance
}

export default cyConfig
