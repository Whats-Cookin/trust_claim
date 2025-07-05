import cytoscape from 'cytoscape'
import { Theme } from '@mui/material'
import { nodeColors, edgeColors, primaryColors } from '../../theme/colors'

const truncateLabel = (label: string, maxLength: number) => {
  if (label.length <= maxLength) {
    return label
  }
  return label.slice(0, maxLength) + '...'
}

// Centralized color picker function
export const getNodeColor = (data: any): string => {
  const entType = data.entType || data.entityType || 'UNKNOWN'
  const isRating = data.claim === 'rated' || data.stars !== undefined
  const isImpact = data.claim === 'impact' || data.label?.toLowerCase().includes('impact')

  // Rating nodes - vivid green to red gradient
  if (isRating && data.stars !== undefined) {
    const colors = [
      '#DC2626', // Vivid red for 0-1 stars
      '#F87171', // Light red for 1-2 stars
      '#FCD34D', // Yellow for 2-3 stars
      '#84CC16', // Light green for 3-4 stars
      '#22C55E' // Vivid green for 4-5 stars
    ]
    return colors[Math.floor(data.stars)] || '#6B7280'
  }

  // Impact nodes - purple gradient based on amount
  if (isImpact) {
    // If we have an amount, use darker purple for larger impacts
    if (data.amt !== undefined && data.amt !== null) {
      const amt = parseFloat(data.amt)
      if (amt >= 1000000) return '#581C87' // Purple-900 for 1M+
      if (amt >= 100000) return '#6B21A8' // Purple-800 for 100K+
      if (amt >= 10000) return '#7C3AED' // Purple-700 for 10K+
      if (amt >= 1000) return '#8B5CF6' // Purple-600 for 1K+
      return '#A78BFA' // Purple-400 for smaller amounts
    }
    // Default purple for impact without amount
    return '#7C3AED'
  }

  // Entity type colors - professional palette
  switch (entType) {
    case 'PERSON':
      return '#52525B' // Gray-600 with slight purple tint
    case 'ORGANIZATION':
      return '#3F3F46' // Gray-700 with slight blue tint
    case 'CLAIM':
      return '#6B7280' // Neutral gray for claims
    case 'EVENT':
      return '#991B1B' // Dark red
    case 'PRODUCT':
      return '#065F46' // Dark teal
    case 'PLACE':
      return '#831843' // Dark pink
    default:
      return '#4B5563' // Default gray
  }
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
          textMarginY: -15,
          content: 'data(relation)',
          'text-background-color': '#ffffff',
          'text-background-opacity': 0.9,
          'text-background-padding': 4,
          'text-background-shape': 'roundrectangle',
          'text-border-color': 'data(color)' as any,
          'text-border-width': 1,
          'text-border-opacity': 0.3,
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

              // Get color based on entity type or rating - using centralized color picker
              const bgColor = getNodeColor(data)

              const nodeTypeClass = isClaim
                ? 'node-claim'
                : entType === 'PERSON'
                ? 'node-person'
                : entType === 'ORGANIZATION'
                ? 'node-organization'
                : ''

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
                const shapeStyle = isClaim
                  ? `width: 140px; height: 70px; border-radius: 8px; background-color: ${bgColor};`
                  : `width: 80px; height: 80px; border-radius: 50%; background-color: ${bgColor};`

                return `
                <div class="custom-node-container ${nodeTypeClass}" 
                     style="${shapeStyle} display: flex; align-items: center; justify-content: center; flex-direction: column;">
                  <div class="node-label" style="color: #ffffff; padding: 8px; text-align: center;">${truncateLabel(
                    data.label,
                    isClaim ? 40 : 20
                  )}</div>
                  ${
                    data.stars !== undefined
                      ? `<div class="node-stars">${'★'.repeat(data.stars)}${'☆'.repeat(5 - data.stars)}</div>`
                      : ''
                  }
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
