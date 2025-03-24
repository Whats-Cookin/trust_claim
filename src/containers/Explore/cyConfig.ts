import cytoscape from 'cytoscape'
import { Theme } from '@mui/material'
import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label'

cytoscape.use(cytoscapeNodeHtmlLabel)
const truncateLabel = (label: string, maxLength: number) =>
  label.length <= maxLength ? label : `${label.slice(0, maxLength)}...`

const getInitials = (label: string) => {
  const cleanLabel = label.trim()
  return cleanLabel.length >= 2 ? cleanLabel.slice(0, 2).toUpperCase() : cleanLabel.toUpperCase()
}

const getNodeStyles = () => [
  {
    selector: 'node',
    style: {
      height: '150',
      width: '150',
      shape: 'roundrectangle',
      backgroundOpacity: 0,
      borderOpacity: 0
    }
  },
  {
    selector: 'node[entType="CLAIM"]',
    style: {
      shape: 'ellipse',
      height: 80,
      backgroundOpacity: 0
    }
  }
]

const getEdgeStyles = (theme: Theme) => [
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
      textRotation: 'autorotate',
      textMarginX: 30,
      content: 'data(relation)',
      'line-cap': 'round',
      'source-endpoint': 'outside-to-node',
      'target-endpoint': 'outside-to-node'
    }
  }
]

const cyConfig = (containerRef: HTMLElement | null, theme: Theme, layoutName: string, layoutOptions: object) => ({
  container: containerRef || undefined,
  boxSelectionEnabled: false,
  autounselectify: true,
  style: [...getNodeStyles(), ...getEdgeStyles(theme)],
  layout: {
    name: layoutName,
    ...layoutOptions
  },
  ready: function (this: cytoscape.Core) {
    this.nodeHtmlLabel([
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
                : `<div class="node-placeholder">${getInitials(data.label)}</div>`
            }
            <div class="node-label">${truncateLabel(data.label, 40)}</div>
          </div>
        `
      }
    ])
  }
})

export default cyConfig
