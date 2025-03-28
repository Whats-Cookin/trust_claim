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
    },
    {
      selector: 'node[entType="CREDENTIAL"]',
      style: {
        shape: 'roundrectangle',
        height: 120,
        width: 120,
        'background-opacity': 0
      }
    },
    {
      selector: 'node[entType="VALIDATION"]',
      style: {
        shape: 'diamond',
        height: 100,
        width: 100,
        'background-opacity': 0
      }
    },
    {
      selector: 'node[entType="AUTHOR"]',
      style: {
        shape: 'ellipse',
        height: 120,
        width: 120,
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
        query: 'node[entType="CLAIM"]',
        halign: 'center',
        valign: 'center',
        valignBox: 'center',
        halignBox: 'center',
        cssClass: 'custom-node-claim',
        tpl: (data: any) => `
          <div class="custom-node-container claim-node">
            ${
              data.image
                ? `<div class="node-icon" style="background-image: url(${data.image})"></div>`
                : `<div class="node-placeholder claim-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>`
            }
            <div class="node-label">${truncateLabel(data.label, 40)}</div>
          </div>
        `
      },
      {
        query: 'node[entType="AUTHOR"]',
        halign: 'center',
        valign: 'center',
        valignBox: 'center',
        halignBox: 'center',
        cssClass: 'custom-node-author',
        tpl: (data: any) => `
          <div class="custom-node-container author-node">
            ${
              data.image
                ? `<div class="node-icon" style="background-image: url(${data.image})"></div>`
                : `<div class="node-placeholder author-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>`
            }
            <div class="node-label">${truncateLabel(data.label, 40)}</div>
          </div>
        `
      },
      {
        query: 'node[entType="CREDENTIAL"]',
        halign: 'center',
        valign: 'center',
        valignBox: 'center',
        halignBox: 'center',
        cssClass: 'custom-node-cred',
        tpl: (data: any) => `
          <div class="custom-node-container cred-node">
            ${
              data.image
                ? `<div class="node-icon" style="background-image: url(${data.image})"></div>`
                : `<div class="node-placeholder cred-placeholder">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-medal-icon lucide-medal"><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/></svg>
                   </div>`
            }
            <div class="node-label">${truncateLabel(data.label, 40)}</div>
          </div>
        `
      },
      {
        query: 'node[entType="VALIDATION"]',
        halign: 'center',
        valign: 'center',
        valignBox: 'center',
        halignBox: 'center',
        cssClass: 'custom-node-validation',
        tpl: (data: any) => `
          <div class="custom-node-container validation-node">
            ${
              data.image
                ? `<div class="node-icon" style="background-image: url(${data.image})"></div>`
                : `<div class="node-placeholder validation-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check-icon lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>`
            }
            <div class="node-label">${truncateLabel(data.label, 40)}</div>
          </div>
        `
      }
    ])
  })

  return instance
}

export default cyConfig
