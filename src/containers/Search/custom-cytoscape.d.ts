// src/types/custom-cytoscape.d.ts

import cytoscape from 'cytoscape'

declare module 'cytoscape' {
  interface Core {
    nodeHtmlLabel: (options: any[]) => void
  }
}
