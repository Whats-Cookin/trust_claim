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

// Node colors by EntityType
const nodeColors = {
  PERSON: { bg: '#10B981', border: '#065F46' },
  ORGANIZATION: { bg: '#6366F1', border: '#4338CA' },
  CLAIM: { bg: '#8B5CF6', border: '#6D28D9' },
  IMPACT: { bg: '#F59E0B', border: '#D97706' },
  EVENT: { bg: '#EF4444', border: '#DC2626' },
  DOCUMENT: { bg: '#6B7280', border: '#4B5563' },
  PRODUCT: { bg: '#14B8A6', border: '#0D9488' },
  PLACE: { bg: '#EC4899', border: '#DB2777' },
  UNKNOWN: { bg: '#9CA3AF', border: '#6B7280' },
  OTHER: { bg: '#9CA3AF', border: '#6B7280' }
}

// Edge styles by claim type
const edgeStylesByClaimType = {
  is_vouched_for: { color: '#10B981', style: 'solid', width: 4, arrow: 'triangle' },
  rated: { color: '#3B82F6', style: 'solid', width: 3, arrow: 'chevron' },
  funds_for_purpose: { color: '#F59E0B', style: 'dashed', width: 2, arrow: 'vee' },
  same_as: { color: '#6B7280', style: 'dashed', width: 2, arrow: 'none' },
  validated: { color: '#059669', style: 'solid', width: 5, arrow: 'triangle' },
  verified: { color: '#059669', style: 'solid', width: 4, arrow: 'triangle' },
  impact: { color: '#F59E0B', style: 'solid', width: 4, arrow: 'triangle-tee' },
  agree: { color: '#10B981', style: 'solid', width: 3, arrow: 'circle' },
  default: { color: '#9CA3AF', style: 'solid', width: 2, arrow: 'triangle' }
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
          height: 60,
          width: 180,
          shape: 'roundrectangle',
          backgroundOpacity: 0,
          borderOpacity: 0,
          'background-color': theme.palette.darkinputtext,
          'overlay-opacity': 0.1,
          'overlay-color': '#000',
          'overlay-padding': 4
        }
      },
      // EntityType-specific node styles
      {
        selector: 'node[entType="PERSON"]',
        style: {
          shape: 'ellipse',
          width: 80,
          height: 80
        }
      },
      {
        selector: 'node[entType="ORGANIZATION"]',
        style: {
          shape: 'hexagon',
          width: 100,
          height: 100
        }
      },
      {
        selector: 'node[entType="CLAIM"]',
        style: {
          shape: 'roundrectangle',
          width: 200,
          height: 80
        }
      },
      {
        selector: 'node[entType="IMPACT"]',
        style: {
          shape: 'star',
          width: 90,
          height: 90
        }
      },
      {
        selector: 'node[entType="EVENT"]',
        style: {
          shape: 'diamond',
          width: 100,
          height: 100
        }
      },
      {
        selector: 'node[entType="DOCUMENT"]',
        style: {
          shape: 'rectangle',
          width: 160,
          height: 60
        }
      },
      {
        selector: 'node[entType="PRODUCT"]',
        style: {
          shape: 'roundrectangle',
          width: 140,
          height: 70
        }
      },
      {
        selector: 'node[entType="PLACE"]',
        style: {
          shape: 'round-triangle',
          width: 80,
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
            const colors = nodeColors[entType as keyof typeof nodeColors] || nodeColors.UNKNOWN
            const hasImage = data.image || data.thumbnail
            
            return `
              <div class="custom-node-container node-${entType.toLowerCase()}" 
                   style="background-color: ${colors.bg}; border-color: ${colors.border}">
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
