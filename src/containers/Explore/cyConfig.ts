import cytoscape from 'cytoscape'
import { Theme } from '@mui/material'
import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label'
import { nodeColors, edgeColors } from '../../theme/colors'

cytoscape.use(cytoscapeNodeHtmlLabel)

const truncateLabel = (label: string, maxLength: number) => {
  if (label.length <= maxLength) {
    return label
  }
  return label.slice(0, maxLength) + '.....'
}

// Edge styles configuration using theme colors
const edgeStylesByClaimType: any = {
  is_vouched_for: { color: edgeColors.is_vouched_for, style: 'solid', width: 4, arrow: 'triangle' },
  rated: { color: edgeColors.rated, style: 'solid', width: 3, arrow: 'chevron' },
  funds_for_purpose: { color: edgeColors.funds_for_purpose, style: 'dashed', width: 2, arrow: 'vee' },
  same_as: { color: edgeColors.same_as, style: 'dashed', width: 2, arrow: 'none' },
  validated: { color: edgeColors.validated, style: 'solid', width: 5, arrow: 'triangle' },
  verified: { color: edgeColors.verified, style: 'solid', width: 4, arrow: 'triangle' },
  impact: { color: edgeColors.impact, style: 'solid', width: 4, arrow: 'triangle-tee' },
  agree: { color: edgeColors.agree, style: 'solid', width: 3, arrow: 'circle' },
  default: { color: edgeColors.default, style: 'solid', width: 2, arrow: 'triangle' }
}

const cyConfig = (containerRef: any, theme: Theme, layoutName: string, layoutOptions: object): any => {
  return {
    container: containerRef || undefined,
    boxSelectionEnabled: false,
    autounselectify: true,
    minZoom: 0.1,  // Allow zooming out quite far for large graphs
    maxZoom: 2,
    wheelSensitivity: 0.2,
    style: [
      {
        selector: 'node',
        style: {
          height: 80,
          width: 80,
          shape: 'ellipse',
          backgroundOpacity: 0,
          borderOpacity: 0,
          'background-color': theme.palette.darkinputtext,
          'overlay-opacity': 0.1,
          'overlay-color': '#000',
          'overlay-padding': 4
        }
      },
      // Claims are squares, everything else is circles/ellipses
      {
        selector: 'node[entType="CLAIM"]',
        style: {
          shape: 'roundrectangle',
          width: 160,
          height: 80
        }
      },
      // Base edge style
      {
        selector: 'edge',
        style: {
          width: 'data(width)' as any,
          fontSize: 12,
          targetArrowShape: 'data(arrow)' as any,
          lineColor: 'data(color)' as any,
          targetArrowColor: 'data(color)' as any,
          lineStyle: 'data(lineStyle)' as any,
          curveStyle: 'bezier',
          color: 'data(color)' as any,
          textRotation: 'autorotate',
          textMarginY: -10,
          content: 'data(relation)',
          'text-background-color': theme.palette.background.default,
          'text-background-opacity': 0.8,
          'text-background-padding': 2,
          'text-background-shape': 'roundrectangle',
          'line-cap': 'round' as 'round',
          'source-endpoint': 'outside-to-node',
          'target-endpoint': 'outside-to-node',
          'arrow-scale': 1.5
        }
      },
      // Hover states
      {
        selector: 'node:active',
        style: {
          'overlay-opacity': 0.2
        }
      },
      {
        selector: 'edge:active',
        style: {
          width: 6,
          'arrow-scale': 2
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
          tpl: (data: any) => {
            const entType = data.entType || 'UNKNOWN'
            const isClaim = entType === 'CLAIM'
            
            // Get color based on entity type
            let bgColor = nodeColors.default
            if (isClaim) {
              bgColor = nodeColors.claim
            } else if (entType.toLowerCase() in nodeColors) {
              bgColor = nodeColors[entType.toLowerCase() as keyof typeof nodeColors]
            }
            
            const hasImage = data.image || data.thumbnail
            
            return `
              <div class="custom-node-container ${isClaim ? 'node-claim' : ''}" 
                   style="background-color: ${bgColor}; border-color: ${bgColor}">
                ${hasImage ? `<div class="node-icon" style="background-image: url(${data.image || data.thumbnail})"></div>` : ''}
                <div class="node-label">${truncateLabel(data.label, 40)}</div>
                ${data.stars ? `<div class="node-stars">${'★'.repeat(data.stars)}${'☆'.repeat(5-data.stars)}</div>` : ''}
                ${data.confidence ? `<div class="node-confidence">${Math.round(data.confidence * 100)}%</div>` : ''}
              </div>
            `
          }
        }
      ])
    }
  }
}

export default cyConfig
