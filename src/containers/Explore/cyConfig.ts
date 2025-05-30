import cytoscape from 'cytoscape'
import { Theme } from '@mui/material'
import { nodeColors, edgeColors, primaryColors } from '../../theme/colors'

const truncateLabel = (label: string, maxLength: number) => {
  if (label.length <= maxLength) {
    return label
  }
  return label.slice(0, maxLength) + '...'
}

// Get color for rating nodes (red to green gradient)
const getRatingColor = (stars: number | undefined) => {
  if (!stars && stars !== 0) return nodeColors.default
  const colors = [
    primaryColors.red,     // 0-1 stars
    '#FF8C42',            // 1-2 stars (orange)
    primaryColors.amber,   // 2-3 stars
    '#7CB518',            // 3-4 stars (yellow-green)
    primaryColors.green    // 4-5 stars
  ]
  return colors[Math.floor(stars)] || nodeColors.default
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
    minZoom: 0.1,
    maxZoom: 2,
    wheelSensitivity: 0.2,
    style: [
      {
        selector: 'node',
        style: {
          height: 80,
          width: 80,
          shape: 'ellipse',
          'background-color': 'transparent',
          'background-opacity': 0,
          'border-width': 0,
          'overlay-opacity': 0.1,
          'overlay-color': '#000',
          'overlay-padding': 4
        }
      },
      // Different shapes for different entity types
      {
        selector: 'node[entType="CLAIM"]',
        style: {
          shape: 'roundrectangle',
          width: 140,
          height: 70
        }
      },
      {
        selector: 'node[entityType="CLAIM"]',
        style: {
          shape: 'roundrectangle',
          width: 140,
          height: 70
        }
      },
      {
        selector: 'node[entType="PERSON"]',
        style: {
          shape: 'ellipse',
          width: 90,
          height: 90
        }
      },
      {
        selector: 'node[entityType="PERSON"]',
        style: {
          shape: 'ellipse',
          width: 90,
          height: 90
        }
      },
      {
        selector: 'node[entType="ORGANIZATION"]',
        style: {
          shape: 'ellipse',
          width: 100,
          height: 80
        }
      },
      {
        selector: 'node[entityType="ORGANIZATION"]',
        style: {
          shape: 'ellipse',
          width: 100,
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
      try {
        cy.nodeHtmlLabel([
        {
          query: 'node',
          halign: 'center',
          valign: 'center',
          valignBox: 'center',
          halignBox: 'center',
          cssClass: 'custom-node',
          tpl: (data: any) => {
            const entType = data.entType || data.entityType || 'UNKNOWN'
            const isClaim = entType === 'CLAIM'
            const hasImage = data.image || data.thumbnail
            const isRating = data.claim === 'rated' || data.stars !== undefined
            
            // Get color based on entity type or rating
            let bgColor: string = nodeColors.default
            if (isRating && data.stars !== undefined) {
              bgColor = getRatingColor(data.stars)
            } else if (isClaim) {
              if (data.claim === 'impact' || data.label?.toLowerCase().includes('impact')) {
                bgColor = '#065F46' // Dark green for impact claims
              } else {
                bgColor = nodeColors.claim
              }
            } else if (entType === 'PERSON') {
              bgColor = '#C2410C' // Dark burnt orange
            } else if (entType.toLowerCase() in nodeColors) {
              bgColor = nodeColors[entType.toLowerCase() as keyof typeof nodeColors]
            }
            
            const nodeTypeClass = isClaim ? 'node-claim' : 
                                entType === 'PERSON' ? 'node-person' : 
                                entType === 'ORGANIZATION' ? 'node-organization' : ''
            
            if (hasImage) {
              // For nodes with images, show circular image with label below
              return `
                <div class="custom-node-container ${nodeTypeClass} node-with-image">
                  <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <div class="node-image-circle" style="background-image: url(${data.image || data.thumbnail})"></div>
                    <div class="node-label-below">${truncateLabel(data.label, 30)}</div>
                  </div>
                </div>
              `
            } else {
              // For nodes without images, use colored shape
              return `
                <div class="custom-node-container ${nodeTypeClass}" 
                     style="background-color: ${bgColor};">
                  <div class="node-label">${truncateLabel(data.label, 40)}</div>
                  ${data.stars !== undefined ? `<div class="node-stars">${'★'.repeat(data.stars)}${'☆'.repeat(5-data.stars)}</div>` : ''}
                </div>
              `
            }
          }
        }
      ])
      } catch (err) {
        console.error('Error initializing nodeHtmlLabel:', err)
      }
    }
  }
}

export default cyConfig
