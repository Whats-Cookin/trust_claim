import { useEffect, useRef, useState } from 'react'
import styles from './styles'
import IHomeProps from './types'
import Cytoscape from 'cytoscape'
import cyConfig from './cyConfig'
import * as api from '../../api'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, useMediaQuery, useTheme, Fab, Tooltip } from '@mui/material'
import GraphinfButton from './GraphInfButton'
import { parseMultipleNodes, parseSingleNode, mergeSameAsNodes } from './graph.utils'
import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label'
import './CustomNodeStyles.css'
import GraphDetailModal from '../../components/GraphDetailModal'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

// Toggle SAME_AS node merging (set to false to see all nodes separately)
const MERGE_SAME_AS_NODES = true

// Register the extension only once
if (typeof cytoscapeNodeHtmlLabel === 'function' && !(Cytoscape as any)._nodeHtmlLabelRegistered) {
  Cytoscape.use(cytoscapeNodeHtmlLabel)
  ;(Cytoscape as any)._nodeHtmlLabelRegistered = true
}

const Explore = (homeProps: IHomeProps) => {
  const { nodeId } = useParams<{ nodeId: string }>()
  const theme = useTheme()
  const { setLoading, setSnackbarMessage, toggleSnackbar, isDarkMode } = homeProps
  const ref = useRef<any>(null)
  const cyRef = useRef<Cytoscape.Core | null>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalType, setModalType] = useState<'node' | 'edge'>('node')
  const [modalData, setModalData] = useState<any>(null)
  const [startNode, setStartNode] = useState<any>(null)
  const [endNode, setEndNode] = useState<any>(null)
  const [cy, setCy] = useState<Cytoscape.Core>()
  const page = useRef(1)
  const isMediumUp = useMediaQuery(theme.breakpoints.up('md'))

  const navigate = useNavigate()

  const layoutName = isMediumUp ? 'circle' : 'breadthfirst'
  const layoutOptions = {
    directed: !isMediumUp,
    fit: true,
    spacingFactor: isMediumUp ? 1 : 1.1,
    padding: isMediumUp ? 150 : 0
  }

  const handleFitToScreen = () => {
    if (cy && cy.elements().length > 0) {
      cy.fit(cy.elements(), 50)

      // Apply same zoom constraints as initial load
      const nodeCount = cy.nodes().length
      if (nodeCount <= 3 && cy.zoom() > 1) {
        cy.zoom(1)
        cy.center()
      } else if (cy.zoom() > 1.5) {
        cy.zoom(1.5)
        cy.center()
      }
    }
  }

  const runCy = (cyInstance: Cytoscape.Core | undefined, shouldFit: boolean = false) => {
    if (!cyInstance) return
    const layout = cyInstance.layout({
      name: layoutName,
      ...layoutOptions
    })
    layout.run()

    // Only fit to viewport on initial load or when explicitly requested
    if (shouldFit) {
      const nodeCount = cyInstance.nodes().length

      // For small graphs, don't zoom in too much
      if (nodeCount <= 3) {
        cyInstance.zoom(1) // Keep at default zoom
        cyInstance.center() // Just center the graph
      } else {
        // For larger graphs, fit but with constraints
        cyInstance.fit(cyInstance.elements(), 50)

        // Limit max zoom to prevent giant nodes
        if (cyInstance.zoom() > 1.5) {
          cyInstance.zoom(1.5)
          cyInstance.center()
        }
      }
    } else {
      // When not auto-fitting, check if new nodes are outside viewport
      const extent = cyInstance.extent()
      const elements = cyInstance.elements()
      let needsAdjustment = false

      // Check if any nodes are outside the current viewport
      elements.nodes().forEach((node: any) => {
        const pos = node.position()
        if (pos.x < extent.x1 || pos.x > extent.x2 || pos.y < extent.y1 || pos.y > extent.y2) {
          needsAdjustment = true
        }
      })

      // If nodes are outside viewport, zoom out just enough to include them
      if (needsAdjustment) {
        const currentZoom = cyInstance.zoom()
        cyInstance.fit(elements, 100) // Fit with padding

        // But try to preserve some of the current zoom if possible
        const newZoom = cyInstance.zoom()
        if (newZoom < currentZoom * 0.7) {
          // Only zoom out to 70% of current zoom at most per expansion
          cyInstance.zoom(currentZoom * 0.7)
          cyInstance.center()
        }
      }
    }
  }

  const fetchRelatedClaims = async (id: string, page: number) => {
    setLoading(true)
    try {
      // Use node endpoint like main does
      const res = await api.getNode(id, page, 5)
      if (res.data) {
        let newNodes: any[] = []
        let newEdges: any[] = []
        // Two-level deduplication strategy:
        // 1. First level: dedupe within the API response (existingNodeIds/existingEdgeIds)
        // 2. Second level: dedupe against the Cytoscape graph (currentGraphNodeIds/currentGraphEdgeIds)
        // This is necessary because the API doesn't know what's already in the graph
        const existingNodeIds = new Set<string>()
        const existingEdgeIds = new Set<string>()
        parseSingleNode(newNodes, newEdges, res.data, existingNodeIds, existingEdgeIds)
        if (!cy) return

        // Check current node count before adding
        const currentNodeCount = cy.nodes().length
        if (currentNodeCount >= 30) {
          setSnackbarMessage('Graph size limit reached. Please start a new exploration.')
          toggleSnackbar(true)
          return
        }

        // IMPORTANT: Filter out nodes that already exist in the graph FIRST
        // before limiting, otherwise we might keep duplicates and discard unique nodes
        const currentGraphNodeIds = new Set(cy.nodes().map((n: any) => n.id()))
        console.log('[fetchRelatedClaims] Current graph has', currentGraphNodeIds.size, 'nodes')
        console.log('[fetchRelatedClaims] API returned', newNodes.length, 'nodes to consider')
        let actuallyNewNodes = newNodes.filter((node: any) => !currentGraphNodeIds.has(node.data.id))
        console.log('[fetchRelatedClaims] After deduplication:', actuallyNewNodes.length, 'new nodes to add')

        // Now limit the actually new nodes
        const maxNodesToAdd = Math.min(5, 30 - currentNodeCount)
        if (actuallyNewNodes.length > maxNodesToAdd) {
          actuallyNewNodes = actuallyNewNodes.slice(0, maxNodesToAdd)
        }

        // Filter out edges that already exist in the graph and only include edges connecting to valid nodes
        const currentGraphEdgeIds = new Set(cy.edges().map((e: any) => e.id()))
        // Note: edges use database IDs for source/target, not URIs
        const allNodeIds = new Set([...currentGraphNodeIds, ...actuallyNewNodes.map((n: any) => n.data.id)])

        // Count existing edges between each pair of nodes to limit clutter
        const edgeCountByPair = new Map<string, number>()
        cy.edges().forEach((e: any) => {
          const key = `${e.data('source')}-${e.data('target')}`
          edgeCountByPair.set(key, (edgeCountByPair.get(key) || 0) + 1)
        })

        // Only include edges that:
        // 1. Connect to at least one node in the graph (existing or new)
        // 2. Don't already exist in the graph (by edge ID)
        // 3. Don't exceed max 2 edges between same node pair
        const actuallyNewEdges = newEdges.filter((edge: any) => {
          const sourceInGraph = allNodeIds.has(edge.data.source)
          const targetInGraph = allNodeIds.has(edge.data.target)
          const edgeAlreadyExists = currentGraphEdgeIds.has(edge.data.id)

          // Must connect to at least one node in graph
          if (!sourceInGraph && !targetInGraph) return false

          // Must not already exist
          if (edgeAlreadyExists) return false

          // Check edge count limit between this pair
          const pairKey = `${edge.data.source}-${edge.data.target}`
          const currentCount = edgeCountByPair.get(pairKey) || 0
          if (currentCount >= 2) {
            console.log('[fetchRelatedClaims] Skipping edge - max 2 edges between nodes:', pairKey)
            return false
          }

          return true
        })

        // Only add and re-layout if we have truly new elements to add
        if (actuallyNewNodes.length > 0 || actuallyNewEdges.length > 0) {
          console.log('[fetchRelatedClaims] Adding to graph:', {
            nodes: actuallyNewNodes.length,
            edges: actuallyNewEdges.length
          })
          console.log(
            '[fetchRelatedClaims] New node IDs being added:',
            actuallyNewNodes.map((n: any) => ({ id: n.data.id, uri: n.data.uri }))
          )
          cy.add({ nodes: actuallyNewNodes, edges: actuallyNewEdges } as any)
          console.log('[fetchRelatedClaims] Graph now has', cy.nodes().length, 'total nodes')
          runCy(cy, false) // Re-layout with new nodes
        } else {
          setSnackbarMessage('No new connections found')
          toggleSnackbar(true)
        }
      } else {
        setSnackbarMessage('No results found')
        toggleSnackbar(true)
      }
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
      console.error('Graph rendering error: ', err)
      console.trace()
    } finally {
      setLoading(false)
    }
  }

  const handleNodeClick = async (event: any) => {
    const originalEvent = event.originalEvent
    event.preventDefault()
    if (originalEvent) {
      // Get full cytoscape node data (includes aliases, isMerged, etc.)
      const fullNodeData = event.target.data()
      const nodeId = fullNodeData?.id

      if (fullNodeData && nodeId) {
        // Shift+click: navigate to Add Claim page
        if (originalEvent.shiftKey) {
          const nodeUri = fullNodeData.nodeUri || fullNodeData.uri || ''
          const nodeName = fullNodeData.label || fullNodeData.name || ''
          const isClaimNode = fullNodeData.entType === 'CLAIM' || fullNodeData.entityType === 'CLAIM'
          if (isClaimNode) {
            window.location.href = `/validate?subject=${encodeURIComponent(nodeUri)}`
          } else {
            window.location.href = `/claim?subject=${encodeURIComponent(nodeUri)}&name=${encodeURIComponent(nodeName)}`
          }
          return
        }
        // Ctrl/Cmd+click: Show node details modal
        if (originalEvent.ctrlKey || originalEvent.metaKey) {
          setModalData(fullNodeData)
          setModalType('node')
          setModalOpen(true)
        } else {
          // Regular left click: Expand the graph
          fetchRelatedClaims(nodeId, page.current)
        }
      }
    }
  }

  const handleEdgeClick = (event: any) => {
    event.preventDefault()
    const edgeData = event?.target?.data('raw')

    if (edgeData) {
      setModalData(edgeData)
      setStartNode(edgeData.startNode)
      setEndNode(edgeData.endNode)
      setModalType('edge')
      setModalOpen(true)
    }
  }

  const handleMouseOver = (event: any) => {
    const container = event?.cy?.container()
    if (container) {
      container.style.cursor = 'pointer'
    }
  }

  const handleMouseOut = (event: any) => {
    const container = event?.cy?.container()
    if (container) {
      container.style.cursor = 'default'
    }
  }

  const handleMouseRightClick = (event: any) => {
    event.preventDefault()
    event.stopPropagation()
    const element = event.target
    // Get full cytoscape data (includes aliases, isMerged for merged nodes)
    const data = element.data()

    if (element.isNode() && data) {
      // Show node details modal on right-click
      setModalData(data)
      setModalType('node')
      setModalOpen(true)
    } else if (element.isEdge() && data) {
      // Show edge details modal on right-click
      setModalData(data)
      setStartNode(data.startNode)
      setEndNode(data.endNode)
      setModalType('edge')
      setModalOpen(true)
    }
  }

  // New function to center graph on any node (not just claims)
  const centerGraphOnNode = async (nodeId: string) => {
    if (!nodeId || !cy) return

    console.log('Centering graph on node:', nodeId)
    console.log('Modal data:', modalData)

    setLoading(true)
    try {
      // Clear existing graph
      cy.elements().remove()

      // Check if this is a CLAIM node - if so, we can use the graph endpoint
      if (modalData && (modalData.entType === 'CLAIM' || modalData.entityType === 'CLAIM')) {
        // For claim nodes, use the graph endpoint which gives a better 2-hop view
        const claimRes = await api.getGraph(nodeId)
        let { nodes, edges } = parseMultipleNodes(claimRes.data.nodes || claimRes.data)

        // Merge SAME_AS connected nodes for cleaner visualization
        ;({ nodes, edges } = mergeSameAsNodes(nodes, edges, MERGE_SAME_AS_NODES))

        // Limit to reasonable size
        let limitedNodes = nodes
        let limitedEdges = edges
        if (nodes.length > 15) {
          limitedNodes = nodes.slice(0, 15)
          const nodeIds = new Set(limitedNodes.map((n: any) => n.data.id))
          limitedEdges = edges.filter((edge: any) => nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target))
        }

        cy.add({ nodes: limitedNodes, edges: limitedEdges } as any)
      } else {
        // For other nodes, fetch the node and its neighbors
        const nodeRes = await api.getNode(nodeId, 1, 10)

        if (nodeRes.data) {
          let allNodes: any[] = []
          let allEdges: any[] = []
          const existingNodeIds = new Set<string>()
          const existingEdgeIds = new Set<string>()

          // Parse the central node and its neighbors
          parseSingleNode(allNodes, allEdges, nodeRes.data, existingNodeIds, existingEdgeIds)

          cy.add({ nodes: allNodes, edges: allEdges } as any)
        }
      }

      // Run layout and fit
      runCy(cy, true)
    } catch (err: any) {
      console.error('Failed to center graph on node:', err)
      setSnackbarMessage('Failed to load graph for this node')
      toggleSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const initializeGraph = async (claimId: string, isRetry: boolean = false) => {
    if (!claimId || claimId === 'undefined') {
      console.error('Invalid claim ID:', claimId)
      setSnackbarMessage('Invalid claim ID')
      toggleSnackbar(true)
      return
    }

    setLoading(true)
    try {
      // Use claim ID directly - backend expects numeric ID
      console.log('Fetching graph for claim ID:', claimId)
      const claimRes = await api.getGraph(claimId)
      console.log('Graph API response:', claimRes.data)

      if (!cy) {
        console.error('Cytoscape instance not initialized')
        return
      }

      cy.elements().remove() // Clear any existing elements

      let { nodes, edges } = parseMultipleNodes(claimRes.data.nodes || claimRes.data)
      console.log('Parsed nodes:', nodes.length, 'edges:', edges.length)

      // Merge SAME_AS connected nodes for cleaner visualization
      ;({ nodes, edges } = mergeSameAsNodes(nodes, edges, MERGE_SAME_AS_NODES))

      // Check if graph is empty and this is not a retry
      if (nodes.length === 0 && !isRetry) {
        setSnackbarMessage('Graph is being generated...')
        toggleSnackbar(true)

        // Retry once after 30 seconds
        setTimeout(() => {
          console.log('Retrying graph fetch after 30 seconds...')
          initializeGraph(claimId, true)
        }, 30000)

        setLoading(false)
        return
      }

      // Limit initial nodes to 7
      let limitedNodes = nodes
      let limitedEdges = edges
      if (nodes.length > 7) {
        // Keep the central node and closest 6 nodes
        limitedNodes = nodes.slice(0, 7)
        const nodeIds = new Set(limitedNodes.map((n: any) => n.data.id))
        limitedEdges = edges.filter((edge: any) => nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target))
      }

      cy.add({ nodes: limitedNodes, edges: limitedEdges } as any)
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message || 'Failed to load graph')
      console.error('Graph rendering error: ', err)
      console.trace()
    } finally {
      setLoading(false)
      runCy(cy, true) // Fit on initial load
    }
  }

  useEffect(() => {
    if (cy) {
      cy.on('tap', 'node', handleNodeClick)
      cy.on('tap', 'edge', handleEdgeClick)
      cy.on('cxttap', 'node,edge', handleMouseRightClick)
      cy.on('mouseover', 'edge,node', handleMouseOver)
      cy.on('mouseout', 'edge,node', handleMouseOut)
      return () => {
        if (!cy) return
        cy.off('tap', 'node', handleNodeClick)
        cy.off('tap', 'edge', handleEdgeClick)
        cy.off('cxttap', 'node,edge', handleMouseRightClick)
        cy.off('mouseover', 'edge,node', handleMouseOver)
        cy.off('mouseout', 'edge,node', handleMouseOut)
      }
    }
  }, [cy])

  // Replace the removed useEffect with this one
  useEffect(() => {
    if (nodeId && cy) {
      initializeGraph(nodeId)
    }
  }, [nodeId, cy])

  useEffect(() => {
    if (!cyRef.current && ref.current) {
      try {
        console.log('Initializing Cytoscape...')
        const newCy = Cytoscape(cyConfig(ref.current, theme, layoutName, layoutOptions))
        setCy(newCy)
        cyRef.current = newCy
        console.log('Cytoscape initialized successfully')
      } catch (err) {
        console.error('Failed to initialize Cytoscape:', err)
      }
    }
  }, [theme, layoutName, layoutOptions])

  useEffect(() => {
    document.addEventListener('contextmenu', event => event.preventDefault())
    return () => {
      document.removeEventListener('contextmenu', event => event.preventDefault())
    }
  }, [])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [modalOpen])

  return (
    <>
      <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
        <Box ref={ref} sx={styles.cy} />
        <GraphDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          data={modalData}
          startNode={startNode}
          endNode={endNode}
          onCenterNode={nodeId => {
            // Load a fresh graph centered on this node
            centerGraphOnNode(nodeId)
          }}
        />
      </Box>
      <GraphinfButton />
      <Tooltip title='Fit to Screen' placement='left'>
        <Fab
          color='primary'
          size='small'
          onClick={handleFitToScreen}
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          <CenterFocusStrongIcon />
        </Fab>
      </Tooltip>
    </>
  )
}

export default Explore
